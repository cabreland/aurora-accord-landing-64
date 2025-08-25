
import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, File, X, CheckCircle, AlertCircle, Shield } from 'lucide-react';

interface UploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
  selectedDealId?: string;
}

interface UploadFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  tag: string;
  dealId: string;
  id: string;
}

const documentTags = [
  { value: 'cim', label: 'CIM' },
  { value: 'nda', label: 'NDA' },
  { value: 'financials', label: 'Financials' },
  { value: 'buyer_notes', label: 'Buyer Notes' },
  { value: 'legal', label: 'Legal' },
  { value: 'due_diligence', label: 'Due Diligence' },
  { value: 'other', label: 'Other' }
];

const UploadDialog = ({ isOpen, onClose, onUploadComplete, selectedDealId = '' }: UploadDialogProps) => {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [deals, setDeals] = useState<any[]>([]);
  const { toast } = useToast();

  React.useEffect(() => {
    if (isOpen) {
      fetchDeals();
    }
  }, [isOpen]);

  const fetchDeals = async () => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('id, title, company_name')
        .order('title');

      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending' as const,
      tag: 'other',
      dealId: selectedDealId || '',
      id: Math.random().toString(36).substr(2, 9)
    }));

    setUploadFiles(prev => [...prev, ...newFiles]);
  }, [selectedDealId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    multiple: true,
    maxSize: 50 * 1024 * 1024 // 50MB
  });

  const updateFile = (fileId: string, updates: Partial<UploadFile>) => {
    setUploadFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, ...updates } : f
    ));
  };

  const removeFile = (fileId: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleUpload = async () => {
    const filesToUpload = uploadFiles.filter(f => f.status === 'pending');
    if (filesToUpload.length === 0) return;

    setIsUploading(true);

    for (const uploadFile of filesToUpload) {
      if (!uploadFile.dealId) {
        updateFile(uploadFile.id, { status: 'error' });
        toast({
          title: "Error",
          description: `Please select a deal for ${uploadFile.file.name}`,
          variant: "destructive",
        });
        continue;
      }

      try {
        updateFile(uploadFile.id, { status: 'uploading', progress: 10 });

        const fileExt = uploadFile.file.name.split('.').pop();
        const fileName = `${uploadFile.dealId}/${Date.now()}-${uploadFile.file.name}`;

        // Upload to Supabase Storage
        const { data: storageData, error: storageError } = await supabase.storage
          .from('deal-documents')
          .upload(fileName, uploadFile.file);

        if (storageError) throw storageError;

        updateFile(uploadFile.id, { progress: 70 });

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Save to database
        const { error: dbError } = await supabase
          .from('documents')
          .insert({
            deal_id: uploadFile.dealId,
            name: uploadFile.file.name,
            file_path: fileName,
            file_size: uploadFile.file.size,
            file_type: uploadFile.file.type,
            tag: uploadFile.tag as any,
            uploaded_by: user.id
          });

        if (dbError) throw dbError;

        updateFile(uploadFile.id, { status: 'success', progress: 100 });

      } catch (error: any) {
        console.error('Upload error:', error);
        updateFile(uploadFile.id, { status: 'error' });
        toast({
          title: "Upload failed",
          description: `Failed to upload ${uploadFile.file.name}`,
          variant: "destructive",
        });
      }
    }

    setIsUploading(false);
    
    const allSuccess = uploadFiles.every(f => f.status === 'success');
    if (allSuccess) {
      toast({
        title: "Upload complete",
        description: "All documents uploaded successfully.",
      });
      onUploadComplete();
      setUploadFiles([]);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <File className="w-5 h-5 text-primary" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Upload Documents
          </DialogTitle>
          <DialogDescription>
            Upload documents to deals. Files are automatically scanned and secured.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Area */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-foreground text-lg">Drop files here...</p>
            ) : (
              <div>
                <p className="text-foreground text-lg mb-2">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-muted-foreground text-sm">
                  Supports PDF, Word, Excel, PowerPoint, and images (max 50MB each)
                </p>
              </div>
            )}
          </div>

          {/* File List */}
          {uploadFiles.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Files to Upload</h4>
              {uploadFiles.map((uploadFile) => (
                <div key={uploadFile.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(uploadFile.status)}
                      <div>
                        <p className="font-medium text-foreground">{uploadFile.file.name}</p>
                        <p className="text-sm text-muted-foreground">{formatFileSize(uploadFile.file.size)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(uploadFile.id)}
                      disabled={uploadFile.status === 'uploading'}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Deal</label>
                      <Select 
                        value={uploadFile.dealId} 
                        onValueChange={(value) => updateFile(uploadFile.id, { dealId: value })}
                        disabled={uploadFile.status === 'uploading'}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select deal" />
                        </SelectTrigger>
                        <SelectContent>
                          {deals.map((deal) => (
                            <SelectItem key={deal.id} value={deal.id}>
                              {deal.title} - {deal.company_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Document Type</label>
                      <Select 
                        value={uploadFile.tag} 
                        onValueChange={(value) => updateFile(uploadFile.id, { tag: value })}
                        disabled={uploadFile.status === 'uploading'}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {documentTags.map((tag) => (
                            <SelectItem key={tag.value} value={tag.value}>
                              {tag.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {uploadFile.status === 'uploading' && (
                    <Progress value={uploadFile.progress} className="w-full" />
                  )}
                </div>
              ))}

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setUploadFiles([])}
                  disabled={isUploading}
                >
                  Clear All
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={isUploading || uploadFiles.length === 0}
                >
                  {isUploading ? 'Uploading...' : `Upload ${uploadFiles.length} File${uploadFiles.length !== 1 ? 's' : ''}`}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDialog;
