import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useDocumentUpload } from '@/hooks/useDocumentUpload';
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
  onDocumentDeleted: (deletedId: string) => void;
}

// UploadFile interface now imported from useDocumentUpload hook

const CategoryUploadSection = ({ 
  category, 
  documents, 
  dealId, 
  onUploadComplete,
  onDocumentDeleted 
}: CategoryUploadSectionProps) => {
  const [showUploadArea, setShowUploadArea] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  
  const documentUpload = useDocumentUpload({
    dealId,
    category: category.key,
    onUploadComplete: () => {
      onUploadComplete();
      setShowUploadArea(false);
    },
    onUploadError: (error) => {
      console.error('Upload error:', error);
    }
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const remainingSlots = category.maxFiles - documents.length - documentUpload.files.length;
    
    if (remainingSlots <= 0) {
      toast({
        title: "Upload limit reached",
        description: `Maximum ${category.maxFiles} files allowed for ${category.label}`,
        variant: "destructive",
      });
      return;
    }

    const filesToAdd = acceptedFiles.slice(0, remainingSlots);
    documentUpload.addFiles(filesToAdd);
  }, [category.maxFiles, documents.length, documentUpload.files.length, category.label, toast, documentUpload]);

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

  const handleUpload = async () => {
    await documentUpload.upload();
  };

  const checkFileExists = async (filePath: string): Promise<boolean> => {
    try {
      // For files stored directly in bucket root with folder structure
      // filePath format: "dealId/category/timestamp-filename.ext"
      const pathParts = filePath.split('/');
      if (pathParts.length < 2) return false;
      
      // Get the folder path and filename
      const fileName = pathParts[pathParts.length - 1];
      const folderPath = pathParts.slice(0, -1).join('/');
      
      const { data, error } = await supabase.storage
        .from('deal-documents')
        .list(folderPath, {
          limit: 100,
          search: fileName
        });
      
      if (error) {
        console.error('Storage list error:', error);
        return false;
      }
      
      return data && data.some(file => file.name === fileName);
    } catch (error) {
      console.error('Error checking file existence:', error);
      return false;
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      // First check if file exists in storage
      const fileExists = await checkFileExists(document.file_path);
      
      if (!fileExists) {
        toast({
          title: "File Not Found",
          description: `${document.name} is not available in storage. The file may have been moved or deleted.`,
          variant: "destructive",
        });
        return;
      }

      // Generate signed URL for secure download
      const { data: signedUrl, error } = await supabase.storage
        .from('deal-documents')
        .createSignedUrl(document.file_path, 300); // 5 minutes

      if (error) {
        console.error('Signed URL error:', error);
        throw new Error(`Failed to generate download link: ${error.message}`);
      }

      if (!signedUrl?.signedUrl) {
        throw new Error('No signed URL returned');
      }

      // Download the file
      const response = await fetch(signedUrl.signedUrl);
      if (!response.ok) {
        throw new Error(`Download failed with status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.name;
      link.style.display = 'none';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: `${document.name} downloaded successfully`,
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (document: Document) => {
    setDocumentToDelete(document);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!documentToDelete) return;
    
    setIsDeleting(true);
    console.log('🗑️ Attempting to delete document:', documentToDelete.id, documentToDelete.name);
    
    try {
      // First, delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentToDelete.id);

      if (dbError) {
        console.error('❌ Database delete error:', dbError);
        throw new Error(`Database deletion failed: ${dbError.message}`);
      }

      // Then, try to delete from storage (don't fail if file doesn't exist)
      try {
        const { error: storageError } = await supabase.storage
          .from('deal-documents')
          .remove([documentToDelete.file_path]);
        
        if (storageError) {
          console.warn('⚠️ Storage delete warning:', storageError);
          // Don't throw here - database deletion succeeded
        } else {
          console.log('✅ File deleted from storage:', documentToDelete.file_path);
        }
      } catch (storageErr) {
        console.warn('⚠️ Storage cleanup failed (non-critical):', storageErr);
      }

      console.log('✅ Document deleted successfully:', documentToDelete.id);
      
      toast({
        title: "Success",
        description: `${documentToDelete.name} deleted successfully`,
      });

      // Close dialog and clear state
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
      
      // Trigger parent refresh
      onDocumentDeleted(documentToDelete.id);
      
    } catch (error) {
      console.error('❌ Error deleting document:', error);
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : 'Failed to delete document',
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
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
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs px-1 py-0">Complete</Badge>;
      case 'missing':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs px-1 py-0">Missing</Badge>;
      case 'optional':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs px-1 py-0">Optional</Badge>;
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
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className="w-4 h-4 text-primary" />
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm text-foreground">
                {category.label}
              </CardTitle>
              {category.required && (
                <Badge variant="outline" className="text-xs bg-red-500/20 text-red-400 border-red-500/30 px-1 py-0">
                  Required
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <Button
              size="sm"
              onClick={() => setShowUploadArea(!showUploadArea)}
              variant={showUploadArea ? "secondary" : "outline"}
              className="h-7 px-2 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              Upload
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 pb-3 space-y-3">
        {/* Existing Documents */}
        {documents.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">
              {documents.length}/{category.maxFiles} files uploaded
              {documents.length > category.maxFiles && (
                <span className="text-red-400 ml-2">⚠️ Exceeds limit - delete {documents.length - category.maxFiles} file{documents.length - category.maxFiles > 1 ? 's' : ''}</span>
              )}
            </h4>
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-2 bg-muted/30 rounded text-xs">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <File className="w-3 h-3 text-primary flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">{doc.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{doc.file_size ? formatFileSize(doc.file_size) : 'Unknown'}</span>
                      <span>{formatDate(doc.created_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(doc)}
                    className="h-6 w-6 p-0"
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(doc)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-6 w-6 p-0"
                    title={`Delete ${doc.name}`}
                    disabled={isDeleting}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Compact Upload Area */}
        {showUploadArea && (
          <div className="space-y-3 border-t border-border pt-3">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded p-3 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-5 h-5 text-primary mx-auto mb-1" />
              {isDragActive ? (
                <p className="text-sm text-foreground">Drop files here...</p>
              ) : (
                <div>
                  <p className="text-sm text-foreground mb-1">
                    Drop files or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Max {category.maxFiles} • PDF, Word, Excel
                  </p>
                </div>
              )}
            </div>

            {/* Compact Upload Queue */}
            {documentUpload.files.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground">Files to Upload</h4>
                {documentUpload.files.map((uploadFile) => (
                  <div key={uploadFile.id} className="flex items-center justify-between p-2 bg-muted/30 rounded text-xs">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {getStatusIcon(uploadFile.status)}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground truncate">{uploadFile.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(uploadFile.file.size)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {uploadFile.status === 'uploading' && (
                        <div className="w-16">
                          <Progress value={uploadFile.progress} className="h-1" />
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => documentUpload.removeFile(uploadFile.id)}
                        disabled={uploadFile.status === 'uploading'}
                        className="h-6 w-6 p-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      documentUpload.clearFiles();
                      setShowUploadArea(false);
                    }}
                    disabled={documentUpload.isUploading}
                    className="h-7 px-2 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleUpload}
                    disabled={documentUpload.isUploading || documentUpload.files.filter(f => f.status === 'pending').length === 0}
                    className="h-7 px-2 text-xs"
                  >
                    {documentUpload.isUploading ? 'Uploading...' : `Upload ${documentUpload.files.filter(f => f.status === 'pending').length}`}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Compact Empty State */}
        {documents.length === 0 && !showUploadArea && (
          <div className="text-center py-3 border border-dashed border-border rounded text-xs">
            <File className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
            <p className="text-muted-foreground mb-2">
              {category.required ? 'Required documents missing' : 'No documents uploaded'}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUploadArea(true)}
              className="h-6 px-2 text-xs"
            >
              Upload Files
            </Button>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Document</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <strong>{documentToDelete?.name}</strong>?
                <br /><br />
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Size: {documentToDelete?.file_size ? formatFileSize(documentToDelete.file_size) : 'Unknown'}</div>
                  <div>Uploaded: {documentToDelete ? formatDate(documentToDelete.created_at) : ''}</div>
                </div>
                <br />
                This action cannot be undone and will permanently remove the file from storage.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                {isDeleting ? 'Deleting...' : 'Delete Document'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default CategoryUploadSection;
