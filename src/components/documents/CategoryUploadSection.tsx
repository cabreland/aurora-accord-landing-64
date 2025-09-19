import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  File, 
  Download, 
  Trash2, 
  Plus,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { formatFileSize } from '@/lib/utils';

interface Document {
  id: string;
  name: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  created_at: string;
  version: number;
}

interface CategoryUploadSectionProps {
  category: {
    key: string;
    label: string;
    description: string;
    icon: React.ComponentType<any>;
    required: boolean;
    color: string;
    maxFiles: number;
  };
  documents: Document[];
  dealId: string;
  onUploadComplete: () => void;
  onDocumentDeleted: () => void;
}

interface UploadFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  id: string;
}

const CategoryUploadSection = ({ 
  category, 
  documents, 
  dealId, 
  onUploadComplete,
  onDocumentDeleted 
}: CategoryUploadSectionProps) => {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadArea, setShowUploadArea] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const remainingSlots = category.maxFiles - documents.length - uploadFiles.length;
    
    if (remainingSlots <= 0) {
      toast({
        title: "Upload limit reached",
        description: `Maximum ${category.maxFiles} files allowed for ${category.label}`,
        variant: "destructive",
      });
      return;
    }

    const filesToAdd = acceptedFiles.slice(0, remainingSlots);
    const newFiles: UploadFile[] = filesToAdd.map(file => ({
      file,
      progress: 0,
      status: 'pending' as const,
      id: Math.random().toString(36).substr(2, 9)
    }));

    setUploadFiles(prev => [...prev, ...newFiles]);
  }, [category.maxFiles, documents.length, uploadFiles.length, category.label, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    multiple: true,
    maxSize: 50 * 1024 * 1024 // 50MB
  });

  const removeUploadFile = (fileId: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const updateFileStatus = (fileId: string, updates: Partial<UploadFile>) => {
    setUploadFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, ...updates } : f
    ));
  };

  const handleUpload = async () => {
    const filesToUpload = uploadFiles.filter(f => f.status === 'pending');
    if (filesToUpload.length === 0) return;

    setIsUploading(true);

    for (const uploadFile of filesToUpload) {
      try {
        updateFileStatus(uploadFile.id, { status: 'uploading', progress: 10 });

        // Upload to Supabase Storage
        const fileExt = uploadFile.file.name.split('.').pop();
        const fileName = `${dealId}/${category.key}/${Date.now()}-${uploadFile.file.name}`;

        const { data: storageData, error: storageError } = await supabase.storage
          .from('deal-documents')
          .upload(fileName, uploadFile.file);

        if (storageError) throw storageError;

        updateFileStatus(uploadFile.id, { progress: 70 });

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Save to database - fix RLS policy issue
        const { error: dbError } = await supabase
          .from('documents')
          .insert({
            deal_id: dealId,
            name: uploadFile.file.name,
            file_path: fileName,
            file_size: uploadFile.file.size,
            file_type: uploadFile.file.type,
            tag: category.key as any,
            uploaded_by: user.id
          });

        if (dbError) throw dbError;

        updateFileStatus(uploadFile.id, { status: 'success', progress: 100 });

      } catch (error: any) {
        console.error('Upload error:', error);
        updateFileStatus(uploadFile.id, { status: 'error' });
        toast({
          title: "Upload failed",
          description: `Failed to upload ${uploadFile.file.name}: ${error.message}`,
          variant: "destructive",
        });
      }
    }

    setIsUploading(false);
    
    const successfulUploads = uploadFiles.filter(f => f.status === 'success').length;
    if (successfulUploads > 0) {
      toast({
        title: "Upload complete",
        description: `${successfulUploads} document(s) uploaded successfully.`,
      });
      onUploadComplete();
      setUploadFiles([]);
      setShowUploadArea(false);
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('deal-documents')
        .download(document.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (documentId: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document deleted successfully",
      });

      onDocumentDeleted();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'uploading':
        return <Clock className="w-4 h-4 text-yellow-400 animate-pulse" />;
      default:
        return <File className="w-4 h-4 text-primary" />;
    }
  };

  const getCategoryStatus = () => {
    if (documents.length === 0) {
      return category.required ? 'missing' : 'optional';
    }
    return 'complete';
  };

  const getStatusBadge = () => {
    const status = getCategoryStatus();
    switch (status) {
      case 'complete':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Complete</Badge>;
      case 'missing':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Missing</Badge>;
      case 'optional':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Optional</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const Icon = category.icon;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Icon className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <CardTitle className="text-base text-foreground flex items-center gap-2">
                {category.label}
                {category.required && (
                  <Badge variant="outline" className="text-xs bg-red-500/20 text-red-400 border-red-500/30">
                    Required
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {category.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <Button
              size="sm"
              onClick={() => setShowUploadArea(!showUploadArea)}
              variant={showUploadArea ? "secondary" : "outline"}
            >
              <Plus className="w-4 h-4 mr-1" />
              Upload
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        {/* Existing Documents */}
        {documents.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">
              Uploaded Documents ({documents.length}/{category.maxFiles})
            </h4>
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <File className="w-4 h-4 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">{doc.name}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{doc.file_size ? formatFileSize(doc.file_size) : 'Unknown size'}</span>
                      <span>v{doc.version}</span>
                      <span>{formatDate(doc.created_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(doc)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(doc.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Area */}
        {showUploadArea && (
          <div className="space-y-4 border-t border-border pt-4">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
              {isDragActive ? (
                <p className="text-foreground">Drop files here...</p>
              ) : (
                <div>
                  <p className="text-foreground mb-1">
                    Click or drag files for {category.label}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Max {category.maxFiles} files • PDF, Word, Excel accepted
                  </p>
                </div>
              )}
            </div>

            {/* Upload Queue */}
            {uploadFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">Files to Upload</h4>
                {uploadFiles.map((uploadFile) => (
                  <div key={uploadFile.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getStatusIcon(uploadFile.status)}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground truncate">{uploadFile.file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(uploadFile.file.size)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {uploadFile.status === 'uploading' && (
                        <div className="w-20">
                          <Progress value={uploadFile.progress} className="h-2" />
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeUploadFile(uploadFile.id)}
                        disabled={uploadFile.status === 'uploading'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setUploadFiles([]);
                      setShowUploadArea(false);
                    }}
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleUpload}
                    disabled={isUploading || uploadFiles.filter(f => f.status === 'pending').length === 0}
                  >
                    {isUploading ? 'Uploading...' : `Upload ${uploadFiles.filter(f => f.status === 'pending').length} Files`}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {documents.length === 0 && !showUploadArea && (
          <div className="text-center py-6 border-2 border-dashed border-border rounded-lg">
            <File className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {category.required ? 'Required documents missing' : 'No documents uploaded'}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUploadArea(true)}
              className="mt-2"
            >
              Click to upload
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryUploadSection;
