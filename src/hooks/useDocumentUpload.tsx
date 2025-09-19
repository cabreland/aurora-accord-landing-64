import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UploadFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  id: string;
  errorMessage?: string;
}

export interface UseDocumentUploadOptions {
  dealId: string;
  category: string;
  onUploadComplete?: () => void;
  onUploadError?: (error: string) => void;
}

export const useDocumentUpload = ({ 
  dealId, 
  category, 
  onUploadComplete,
  onUploadError 
}: UseDocumentUploadOptions) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const updateFileStatus = (fileId: string, updates: Partial<UploadFile>) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, ...updates } : f
    ));
  };

  const addFiles = (filesToAdd: File[]) => {
    const newFiles: UploadFile[] = filesToAdd.map(file => ({
      file,
      progress: 0,
      status: 'pending' as const,
      id: Math.random().toString(36).substr(2, 9)
    }));

    setFiles(prev => [...prev, ...newFiles]);
    return newFiles;
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const clearFiles = () => {
    setFiles([]);
  };

  const uploadSingleFile = async (uploadFile: UploadFile): Promise<boolean> => {
    try {
      updateFileStatus(uploadFile.id, { status: 'uploading', progress: 10 });

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      updateFileStatus(uploadFile.id, { progress: 20 });

      // Generate unique filename
      const fileExt = uploadFile.file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `${dealId}/${category}/${timestamp}-${uploadFile.file.name}`;

      updateFileStatus(uploadFile.id, { progress: 30 });

      // Upload to Supabase Storage with transaction-like approach
      const { data: storageData, error: storageError } = await supabase.storage
        .from('deal-documents')
        .upload(fileName, uploadFile.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (storageError) {
        console.error('Storage upload error:', storageError);
        throw new Error(`Storage upload failed: ${storageError.message}`);
      }

      updateFileStatus(uploadFile.id, { progress: 70 });

      // Save document metadata to database
      const { data: documentData, error: dbError } = await supabase
        .from('documents')
        .insert({
          deal_id: dealId,
          name: uploadFile.file.name,
          file_path: fileName,
          file_size: uploadFile.file.size,
          file_type: uploadFile.file.type || 'application/octet-stream',
          tag: category as any,
          uploaded_by: user.id
        })
        .select('id')
        .single();

      if (dbError) {
        console.error('Database insert error:', dbError);
        
        // Rollback: Delete the file from storage if database insert fails
        await supabase.storage
          .from('deal-documents')
          .remove([fileName]);
        
        throw new Error(`Database save failed: ${dbError.message}`);
      }

      updateFileStatus(uploadFile.id, { status: 'success', progress: 100 });
      
      // Log successful upload
      console.log(`Successfully uploaded document ${uploadFile.file.name} with ID ${documentData?.id}`);
      
      return true;

    } catch (error: any) {
      console.error('Upload error for file', uploadFile.file.name, ':', error);
      updateFileStatus(uploadFile.id, { 
        status: 'error', 
        errorMessage: error.message || 'Upload failed'
      });
      
      return false;
    }
  };

  const startUpload = async (): Promise<{ success: number; failed: number }> => {
    const filesToUpload = files.filter(f => f.status === 'pending');
    
    if (filesToUpload.length === 0) {
      return { success: 0, failed: 0 };
    }

    setIsUploading(true);

    let successCount = 0;
    let failedCount = 0;

    // Upload files sequentially to avoid overwhelming the server
    for (const uploadFile of filesToUpload) {
      const success = await uploadSingleFile(uploadFile);
      if (success) {
        successCount++;
      } else {
        failedCount++;
      }
    }

    setIsUploading(false);

    // Provide user feedback
    if (successCount > 0) {
      toast({
        title: "Upload Complete",
        description: `${successCount} document(s) uploaded successfully${failedCount > 0 ? `, ${failedCount} failed` : ''}.`,
        variant: failedCount > 0 ? "default" : "default"
      });

      // Small delay to ensure database consistency before notifying completion
      setTimeout(() => {
        onUploadComplete?.();
      }, 300);
    }

    if (failedCount > 0 && successCount === 0) {
      const errorMessage = `All ${failedCount} upload(s) failed`;
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive"
      });
      onUploadError?.(errorMessage);
    }

    return { success: successCount, failed: failedCount };
  };

  const retryFailedUploads = async () => {
    // Reset failed uploads to pending
    setFiles(prev => prev.map(f => 
      f.status === 'error' ? { ...f, status: 'pending' as const, progress: 0, errorMessage: undefined } : f
    ));
    
    // Upload again
    return startUpload();
  };

  return {
    addFiles,
    removeFile,
    clearFiles,
    uploadSingleFile,
    upload: startUpload,
    retryFailedUploads,
    isUploading,
    files
  };
};