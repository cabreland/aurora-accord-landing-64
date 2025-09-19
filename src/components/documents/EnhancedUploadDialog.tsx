import React, { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Shield,
  DollarSign,
  Scale,
  FileText,
  Users,
  Clock,
  Plus
} from 'lucide-react';
import { formatFileSize } from '@/lib/utils';

interface EnhancedUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
  selectedDealId: string;
  selectedCategory?: string;
}

interface UploadFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  category: string;
  id: string;
}

const UPLOAD_CATEGORIES = {
  cim: {
    label: 'CIM',
    fullLabel: 'Confidential Information Memorandum',
    icon: Shield,
    description: 'Comprehensive business overview document',
    acceptedTypes: '.pdf,.doc,.docx',
    maxFiles: 1,
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  },
  financials: {
    label: 'Financials',
    fullLabel: 'Financial Statements',
    icon: DollarSign,
    description: 'P&L, balance sheets, cash flow statements',
    acceptedTypes: '.pdf,.xlsx,.xls,.doc,.docx',
    maxFiles: 10,
    color: 'bg-green-500/20 text-green-400 border-green-500/30'
  },
  legal: {
    label: 'Legal',
    fullLabel: 'Legal Documentation',
    icon: Scale,
    description: 'Contracts, agreements, IP documents',
    acceptedTypes: '.pdf,.doc,.docx',
    maxFiles: 20,
    color: 'bg-red-500/20 text-red-400 border-red-500/30'
  },
  due_diligence: {
    label: 'Due Diligence',
    fullLabel: 'Due Diligence Package',
    icon: FileText,
    description: 'Customer lists, operational details',
    acceptedTypes: '.pdf,.xlsx,.xls,.doc,.docx,.csv',
    maxFiles: 15,
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  },
  nda: {
    label: 'NDA',
    fullLabel: 'Non-Disclosure Agreement',
    icon: Shield,
    description: 'NDA templates and signed agreements',
    acceptedTypes: '.pdf,.doc,.docx',
    maxFiles: 5,
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
  },
  buyer_notes: {
    label: 'Buyer Info',
    fullLabel: 'Buyer Information',
    icon: Users,
    description: 'Buyer profiles and communication records',
    acceptedTypes: '.pdf,.doc,.docx,.txt',
    maxFiles: 10,
    color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
  },
  other: {
    label: 'Other',
    fullLabel: 'Additional Documents',
    icon: FileText,
    description: 'Supporting materials and misc files',
    acceptedTypes: '.pdf,.doc,.docx,.xlsx,.xls,.txt,.jpg,.png',
    maxFiles: 20,
    color: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }
};

const EnhancedUploadDialog = ({ 
  isOpen, 
  onClose, 
  onUploadComplete, 
  selectedDealId,
  selectedCategory 
}: EnhancedUploadDialogProps) => {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>(selectedCategory || 'cim');
  const { toast } = useToast();

  useEffect(() => {
    if (selectedCategory) {
      setActiveCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const createDropzone = (category: string) => {
    const categoryConfig = UPLOAD_CATEGORIES[category as keyof typeof UPLOAD_CATEGORIES];
    
    const onDrop = useCallback((acceptedFiles: File[]) => {
      const existingFiles = uploadFiles.filter(f => f.category === category);
      const remainingSlots = categoryConfig.maxFiles - existingFiles.length;
      
      if (remainingSlots <= 0) {
        toast({
          title: "Upload limit reached",
          description: `Maximum ${categoryConfig.maxFiles} files allowed for ${categoryConfig.label}`,
          variant: "destructive",
        });
        return;
      }

      const filesToAdd = acceptedFiles.slice(0, remainingSlots);
      const newFiles: UploadFile[] = filesToAdd.map(file => ({
        file,
        progress: 0,
        status: 'pending' as const,
        category,
        id: Math.random().toString(36).substr(2, 9)
      }));

      setUploadFiles(prev => [...prev, ...newFiles]);
    }, [category, uploadFiles]);

    return useDropzone({
      onDrop,
      accept: {
        'application/pdf': ['.pdf'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'application/vnd.ms-excel': ['.xls'],
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        'text/csv': ['.csv'],
        'text/plain': ['.txt'],
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png']
      },
      multiple: true,
      maxSize: 50 * 1024 * 1024 // 50MB
    });
  };

  const removeFile = (fileId: string) => {
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
        const fileName = `${selectedDealId}/${uploadFile.category}/${Date.now()}-${uploadFile.file.name}`;

        const { data: storageData, error: storageError } = await supabase.storage
          .from('deal-documents')
          .upload(fileName, uploadFile.file);

        if (storageError) throw storageError;

        updateFileStatus(uploadFile.id, { progress: 70 });

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Save to database
        const { error: dbError } = await supabase
          .from('documents')
          .insert({
            deal_id: selectedDealId,
            name: uploadFile.file.name,
            file_path: fileName,
            file_size: uploadFile.file.size,
            file_type: uploadFile.file.type,
            tag: uploadFile.category as any,
            uploaded_by: user.id
          });

        if (dbError) throw dbError;

        updateFileStatus(uploadFile.id, { status: 'success', progress: 100 });

      } catch (error: any) {
        console.error('Upload error:', error);
        updateFileStatus(uploadFile.id, { status: 'error' });
        toast({
          title: "Upload failed",
          description: `Failed to upload ${uploadFile.file.name}`,
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
    }
  };

  const getCategoryFiles = (category: string) => {
    return uploadFiles.filter(f => f.category === category);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'uploading':
        return <Clock className="w-4 h-4 text-yellow-400 animate-pulse" />;
      default:
        return <File className="w-4 h-4 text-primary" />;
    }
  };

  const totalPendingFiles = uploadFiles.filter(f => f.status === 'pending').length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Upload Documents by Category
          </DialogTitle>
          <DialogDescription>
            Organize your documents by category for better management and compliance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(UPLOAD_CATEGORIES).map(([key, config]) => {
              const categoryFiles = getCategoryFiles(key);
              const Icon = config.icon;
              
              return (
                <Button
                  key={key}
                  variant={activeCategory === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(key)}
                  className="relative"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {config.label}
                  {categoryFiles.length > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                      {categoryFiles.length}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>

          {/* Active Category Upload Area */}
          {Object.entries(UPLOAD_CATEGORIES).map(([key, config]) => {
            if (key !== activeCategory) return null;
            
            const dropzone = createDropzone(key);
            const categoryFiles = getCategoryFiles(key);
            const Icon = config.icon;
            
            return (
              <Card key={key} className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-lg text-foreground">{config.fullLabel}</div>
                      <div className="text-sm text-muted-foreground font-normal">
                        {config.description}
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Upload Zone */}
                  <div
                    {...dropzone.getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      dropzone.isDragActive 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <input {...dropzone.getInputProps()} />
                    <Plus className="w-8 h-8 text-primary mx-auto mb-2" />
                    {dropzone.isDragActive ? (
                      <p className="text-foreground">Drop files here...</p>
                    ) : (
                      <div>
                        <p className="text-foreground mb-1">
                          Click or drag files for {config.label}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Max {config.maxFiles} files • Accepts {config.acceptedTypes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Category Files */}
                  {categoryFiles.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-foreground">
                        Files in {config.label} ({categoryFiles.length}/{config.maxFiles})
                      </h4>
                      {categoryFiles.map((uploadFile) => (
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
                              onClick={() => removeFile(uploadFile.id)}
                              disabled={uploadFile.status === 'uploading'}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* Action Buttons */}
          {uploadFiles.length > 0 && (
            <div className="flex justify-between items-center bg-muted/30 rounded-lg p-4">
              <div className="text-sm text-muted-foreground">
                {totalPendingFiles} file{totalPendingFiles !== 1 ? 's' : ''} ready to upload
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setUploadFiles([])}
                  disabled={isUploading}
                >
                  Clear All
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={isUploading || totalPendingFiles === 0}
                >
                  {isUploading ? 'Uploading...' : `Upload ${totalPendingFiles} File${totalPendingFiles !== 1 ? 's' : ''}`}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedUploadDialog;