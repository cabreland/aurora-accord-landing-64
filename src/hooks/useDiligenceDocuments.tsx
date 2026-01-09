import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface DiligenceDocument {
  id: string;
  request_id: string;
  file_name: string;
  file_size: number | null;
  file_type: string | null;
  storage_path: string;
  uploaded_by: string;
  created_at: string;
}

export const useDiligenceDocuments = (requestId: string) => {
  return useQuery({
    queryKey: ['diligence-documents', requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('diligence_documents')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as DiligenceDocument[];
    },
    enabled: !!requestId
  });
};

export const useUploadDiligenceDocument = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ 
      requestId, 
      file 
    }: { 
      requestId: string; 
      file: File;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Get request details for notification
      const { data: request } = await supabase
        .from('diligence_requests')
        .select('title, assignee_id, deal_id, created_by')
        .eq('id', requestId)
        .single();
      
      // Generate a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${requestId}/${Date.now()}-${file.name}`;
      
      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('diligence-documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) throw uploadError;
      
      // Create database record
      const { data, error: dbError } = await supabase
        .from('diligence_documents')
        .insert({
          request_id: requestId,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          storage_path: fileName,
          uploaded_by: user.id
        })
        .select()
        .single();
      
      if (dbError) {
        // Clean up uploaded file if db insert fails
        await supabase.storage
          .from('diligence-documents')
          .remove([fileName]);
        throw dbError;
      }
      
      // Create notification for assignee
      if (request?.assignee_id && request.assignee_id !== user.id) {
        // Get uploader's name
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', user.id)
          .single();
        
        const uploaderName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Someone' : 'Someone';
        
        await supabase.from('diligence_notifications').insert({
          user_id: request.assignee_id,
          request_id: requestId,
          deal_id: request.deal_id,
          type: 'document',
          title: 'Document Uploaded',
          message: `${uploaderName} uploaded "${file.name}" to "${request.title}"`
        });
      }
      
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['diligence-documents', variables.requestId] });
      queryClient.invalidateQueries({ queryKey: ['diligence-request-counts'] });
      queryClient.invalidateQueries({ queryKey: ['diligence-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['diligence-notifications-unread-count'] });
      toast.success('Document uploaded successfully');
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast.error('Failed to upload document');
    }
  });
};

export const useDeleteDiligenceDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      documentId, 
      storagePath,
      requestId 
    }: { 
      documentId: string; 
      storagePath: string;
      requestId: string;
    }) => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('diligence-documents')
        .remove([storagePath]);
      
      if (storageError) {
        console.warn('Storage delete warning:', storageError);
        // Continue with db delete even if storage fails
      }
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('diligence_documents')
        .delete()
        .eq('id', documentId);
      
      if (dbError) throw dbError;
      
      return { documentId, requestId };
    },
    onSuccess: (variables) => {
      queryClient.invalidateQueries({ queryKey: ['diligence-documents', variables.requestId] });
      toast.success('Document deleted');
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast.error('Failed to delete document');
    }
  });
};

export const useDownloadDiligenceDocument = () => {
  return useMutation({
    mutationFn: async ({ storagePath, fileName }: { storagePath: string; fileName: string }) => {
      const { data, error } = await supabase.storage
        .from('diligence-documents')
        .download(storagePath);
      
      if (error) throw error;
      
      // Create download link
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return true;
    },
    onError: (error) => {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  });
};

// Format file size for display
export const formatFileSize = (bytes: number | null): string => {
  if (!bytes) return 'Unknown size';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
