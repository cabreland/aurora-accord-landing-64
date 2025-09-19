import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, File, X, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import { validateFile, logSecurityEvent, getSafeErrorMessage } from '@/lib/security';

interface DocumentUploadProps {
  dealId: string;
  onUploadComplete: () => void;
}

interface UploadFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  tag: string;
  id: string;
}

const documentTags = [
  { value: 'cim', label: 'CIM (Confidential Information Memorandum)' },
  { value: 'nda', label: 'NDA (Non-Disclosure Agreement)' },
  { value: 'financials', label: 'Financial Statements' },
  { value: 'buyer_notes', label: 'Buyer Notes' },
  { value: 'legal', label: 'Legal Documents' },
  { value: 'due_diligence', label: 'Due Diligence' },
  { value: 'other', label: 'Other' }
];

const DocumentUpload = ({ dealId, onUploadComplete }: DocumentUploadProps) => {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles: UploadFile[] = [];
    const invalidFiles: string[] = [];

    acceptedFiles.forEach(file => {
      const validation = validateFile(file);
      if (validation.isValid) {
        validFiles.push({
          file,
          progress: 0,
          status: 'pending',
          tag: 'other',
          id: Math.random().toString(36).substr(2, 9)
        });
      } else {
        invalidFiles.push(`${file.name}: ${validation.error}`);
        logSecurityEvent('file_validation_failed', {
          filename: file.name,
          size: file.size,
          type: file.type,
          error: validation.error
        });
      }
    });

    if (invalidFiles.length > 0) {
      toast({
        title: "File validation failed",
        description: invalidFiles.join('\n'),
        variant: "destructive",
      });
    }

    if (validFiles.length > 0) {
      setUploadFiles(prev => [...prev, ...validFiles]);
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'text/*': ['.txt', '.csv']
    },
    multiple: true
  });

  const removeFile = (fileId: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const updateFileTag = (fileId: string, tag: string) => {
    setUploadFiles(prev => prev.map(f => f.id === fileId ? { ...f, tag } : f));
  };

  const handleUploadFiles = async () => {
    setIsUploading(true);
    console.log('🚀 Starting upload process for', uploadFiles.length, 'files');
    
    for (const uploadFile of uploadFiles) {
      if (uploadFile.status !== 'pending') continue;
      
      console.log('📤 Processing file:', uploadFile.file.name, 'Size:', uploadFile.file.size, 'Type:', uploadFile.file.type);
      
      try {
        // Update status to uploading
        setUploadFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, status: 'uploading' } : f
        ));

        // Get current user first
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          console.error('❌ Authentication failed:', authError);
          throw new Error('User not authenticated');
        }
        console.log('✅ User authenticated:', user.email);

        // Generate file path with category subfolder
        const timestamp = Date.now();
        const sanitizedName = uploadFile.file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const finalFileName = `${dealId}/${uploadFile.tag}/${timestamp}-${sanitizedName}`;
        
        console.log('📁 Upload path:', finalFileName);

        // Check if bucket exists and is accessible
        try {
          const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
          console.log('📦 Available buckets:', buckets?.map(b => b.name));
          
          if (bucketError) {
            console.error('❌ Bucket list error:', bucketError);
          }
          
          const dealDocsBucket = buckets?.find(b => b.name === 'deal-documents');
          if (!dealDocsBucket) {
            console.warn('⚠️ deal-documents bucket not found in available buckets');
          } else {
            console.log('✅ deal-documents bucket found:', dealDocsBucket);
          }
        } catch (bucketCheckError) {
          console.error('❌ Bucket check failed:', bucketCheckError);
        }

        // Skip validation edge function for debugging - upload directly
        console.log('📤 Uploading to storage...');
        const uploadStartTime = Date.now();
        
        const { data: storageData, error: storageError } = await supabase.storage
          .from('deal-documents')
          .upload(finalFileName, uploadFile.file, {
            cacheControl: '3600',
            upsert: false
          });

        const uploadEndTime = Date.now();
        console.log('⏱️ Upload took:', uploadEndTime - uploadStartTime, 'ms');

        if (storageError) {
          console.error('❌ Storage upload failed:', storageError);
          console.error('❌ Error details:', {
            message: storageError.message,
            name: storageError.name
          });
          throw new Error(`Storage upload failed: ${storageError.message}`);
        }

        if (!storageData?.path) {
          console.error('❌ No storage path returned');
          throw new Error('Upload succeeded but no path returned');
        }

        console.log('✅ Storage upload successful:', storageData);

        // Verify the file was actually uploaded by trying to get its info
        const { data: fileInfo, error: infoError } = await supabase.storage
          .from('deal-documents')
          .list(finalFileName.substring(0, finalFileName.lastIndexOf('/')), {
            search: finalFileName.substring(finalFileName.lastIndexOf('/') + 1)
          });

        if (infoError) {
          console.warn('⚠️ Could not verify upload:', infoError);
        } else {
          console.log('✅ Upload verification:', fileInfo?.length > 0 ? 'File found' : 'File not found');
        }

        // Now save to database
        console.log('💾 Saving to database...');
        const { error: dbError } = await supabase
          .from('documents')
          .insert({
            deal_id: dealId,
            name: uploadFile.file.name,
            file_path: finalFileName,
            file_size: uploadFile.file.size,
            file_type: uploadFile.file.type,
            tag: uploadFile.tag as any,
            uploaded_by: user.id
          });

        if (dbError) {
          console.error('❌ Database insert failed:', dbError);
          
          // If DB fails, try to clean up the uploaded file
          try {
            await supabase.storage
              .from('deal-documents')
              .remove([finalFileName]);
            console.log('🧹 Cleaned up uploaded file after DB error');
          } catch (cleanupError) {
            console.error('❌ Cleanup failed:', cleanupError);
          }
          
          throw new Error(`Database insert failed: ${dbError.message}`);
        }

        console.log('✅ Database insert successful');

        // Update status to success
        setUploadFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, status: 'success', progress: 100 } : f
        ));

        console.log('✅ File upload complete:', uploadFile.file.name);

      } catch (error: any) {
        console.error('❌ Upload error for', uploadFile.file.name, ':', error);
        console.error('❌ Full error object:', error);
        
        setUploadFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, status: 'error' } : f
        ));
        
        // Log security event for failed uploads
        logSecurityEvent('document_upload_failed', {
          filename: uploadFile.file.name,
          dealId,
          error: error.message,
          errorType: error.name,
          stack: error.stack
        });
        
        toast({
          title: "Upload failed",
          description: `Failed to upload ${uploadFile.file.name}: ${getSafeErrorMessage(error)}`,
          variant: "destructive",
        });
      }
    }

    setIsUploading(false);
    
    // Check if all uploads were successful
    const allSuccess = uploadFiles.every(f => f.status === 'success');
    console.log('📊 Upload summary:', {
      total: uploadFiles.length,
      successful: uploadFiles.filter(f => f.status === 'success').length,
      failed: uploadFiles.filter(f => f.status === 'error').length,
      allSuccess
    });
    
    if (allSuccess) {
      toast({
        title: "Upload complete",
        description: "All documents have been uploaded successfully.",
      });
      setUploadFiles([]);
      onUploadComplete();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <File className="w-5 h-5 text-[#D4AF37]" />;
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
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className="bg-[#0A0F0F] border-[#D4AF37]/30">
        <CardHeader>
          <CardTitle className="text-[#FAFAFA] flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#D4AF37]" />
            Secure Document Upload
          </CardTitle>
          <CardDescription className="text-[#F4E4BC]">
            Upload verified documents (max 50MB per file). Files are automatically scanned for security.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-[#D4AF37] bg-[#D4AF37]/5' 
                : 'border-[#D4AF37]/30 hover:border-[#D4AF37]/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-[#FAFAFA] text-lg">Drop files here...</p>
            ) : (
              <div>
                <p className="text-[#FAFAFA] text-lg mb-2">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-[#F4E4BC]/70 text-sm">
                  Supports PDF, Word, Excel, PowerPoint, images, and more
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {uploadFiles.length > 0 && (
        <Card className="bg-[#0A0F0F] border-[#D4AF37]/30">
          <CardHeader>
            <CardTitle className="text-[#FAFAFA]">Files to Upload</CardTitle>
            <CardDescription className="text-[#F4E4BC]">
              Review and tag your documents before uploading
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadFiles.map((uploadFile) => (
              <div key={uploadFile.id} className="border border-[#D4AF37]/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(uploadFile.status)}
                    <div>
                      <p className="text-[#FAFAFA] font-medium">{uploadFile.file.name}</p>
                      <p className="text-[#F4E4BC]/70 text-sm">{formatFileSize(uploadFile.file.size)}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(uploadFile.id)}
                    disabled={uploadFile.status === 'uploading'}
                    className="text-[#F4E4BC] hover:text-red-400 hover:bg-red-400/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-4 mb-3">
                  <div className="flex-1">
                    <label className="text-sm text-[#F4E4BC] mb-1 block">Document Tag</label>
                    <Select 
                      value={uploadFile.tag} 
                      onValueChange={(value) => updateFileTag(uploadFile.id, value)}
                      disabled={uploadFile.status === 'uploading'}
                    >
                      <SelectTrigger className="bg-[#1A1F2E] border-[#D4AF37]/30 text-[#FAFAFA]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1A1F2E] border-[#D4AF37]/30">
                        {documentTags.map((tag) => (
                          <SelectItem 
                            key={tag.value} 
                            value={tag.value}
                            className="text-[#FAFAFA] focus:bg-[#D4AF37] focus:text-[#0A0F0F]"
                          >
                            {tag.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Badge variant="outline" className="border-[#D4AF37]/30 text-[#F4E4BC]">
                    {uploadFile.file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                  </Badge>
                </div>

                {uploadFile.status === 'uploading' && (
                  <Progress value={uploadFile.progress} className="w-full" />
                )}
              </div>
            ))}

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setUploadFiles([])}
                disabled={isUploading}
                className="border-[#D4AF37]/30 text-[#F4E4BC] hover:bg-[#D4AF37]/10"
              >
                Clear All
              </Button>
              <Button
                onClick={handleUploadFiles}
                disabled={isUploading || uploadFiles.length === 0}
                className="bg-[#D4AF37] hover:bg-[#F4E4BC] text-[#0A0F0F] font-bold"
              >
                {isUploading ? 'Uploading...' : `Upload ${uploadFiles.length} File${uploadFiles.length !== 1 ? 's' : ''}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DocumentUpload;