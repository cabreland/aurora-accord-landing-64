import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DataRoomCategory {
  id: string;
  index_number: number;
  name: string;
  description: string | null;
  icon: string | null;
  sort_order: number | null;
  is_active: boolean;
}

export interface DataRoomFolder {
  id: string;
  deal_id: string;
  category_id: string;
  parent_folder_id: string | null;
  name: string;
  index_number: string;
  description: string | null;
  is_required: boolean;
  sort_order: number | null;
  category?: DataRoomCategory;
}

export interface DataRoomDocument {
  id: string;
  deal_id: string;
  folder_id: string | null;
  file_name: string;
  file_path: string;
  file_url: string | null;
  file_size: number | null;
  file_type: string | null;
  mime_type: string | null;
  index_number: string | null;
  status: string;
  uploaded_by: string | null;
  reviewed_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  version: number;
  metadata: unknown;
  created_at: string;
  updated_at: string;
}

export interface DataRoomTemplate {
  id: string;
  name: string;
  description: string | null;
  folder_structure: unknown;
  is_active: boolean;
}

interface UseDataRoomOptions {
  dealId?: string;
}

export function useDataRoom({ dealId }: UseDataRoomOptions = {}) {
  const [categories, setCategories] = useState<DataRoomCategory[]>([]);
  const [folders, setFolders] = useState<DataRoomFolder[]>([]);
  const [documents, setDocuments] = useState<DataRoomDocument[]>([]);
  const [templates, setTemplates] = useState<DataRoomTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    const { data, error } = await supabase
      .from('data_room_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
    return data || [];
  }, []);

  const fetchFolders = useCallback(async () => {
    if (!dealId) return [];

    const { data, error } = await supabase
      .from('data_room_folders')
      .select(`
        *,
        category:data_room_categories(*)
      `)
      .eq('deal_id', dealId)
      .order('sort_order');

    if (error) {
      console.error('Error fetching folders:', error);
      return [];
    }
    return data || [];
  }, [dealId]);

  const fetchDocuments = useCallback(async () => {
    if (!dealId) return [];

    const { data, error } = await supabase
      .from('data_room_documents')
      .select('*')
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
    return data || [];
  }, [dealId]);

  const fetchTemplates = useCallback(async () => {
    const { data, error } = await supabase
      .from('data_room_templates')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
    return data || [];
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [categoriesData, foldersData, documentsData, templatesData] = await Promise.all([
        fetchCategories(),
        fetchFolders(),
        fetchDocuments(),
        fetchTemplates(),
      ]);

      setCategories(categoriesData);
      setFolders(foldersData);
      setDocuments(documentsData);
      setTemplates(templatesData);
    } catch (err) {
      console.error('Error loading data room:', err);
      setError('Failed to load data room');
    } finally {
      setLoading(false);
    }
  }, [fetchCategories, fetchFolders, fetchDocuments, fetchTemplates]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const applyTemplate = async (templateName: string) => {
    if (!dealId) {
      toast.error('No deal selected');
      return false;
    }

    try {
      const { error } = await supabase.rpc('create_data_room_from_template', {
        p_deal_id: dealId,
        p_template_name: templateName,
      });

      if (error) throw error;

      toast.success('Template applied successfully');
      await loadData();
      return true;
    } catch (err) {
      console.error('Error applying template:', err);
      toast.error('Failed to apply template');
      return false;
    }
  };

  const uploadDocument = async (
    file: File,
    folderId: string | null,
    indexNumber?: string
  ) => {
    if (!dealId) {
      toast.error('No deal selected');
      return null;
    }

    try {
      // Upload file to storage
      const filePath = `${dealId}/${folderId || 'root'}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('data-room-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('data-room-documents')
        .getPublicUrl(filePath);

      // Create document record
      const { data: user } = await supabase.auth.getUser();
      const { data: doc, error: insertError } = await supabase
        .from('data_room_documents')
        .insert({
          deal_id: dealId,
          folder_id: folderId,
          file_name: file.name,
          file_path: filePath,
          file_url: urlData?.publicUrl,
          file_size: file.size,
          file_type: file.name.split('.').pop()?.toLowerCase(),
          mime_type: file.type,
          index_number: indexNumber,
          uploaded_by: user?.user?.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast.success('Document uploaded');
      await loadData();
      return doc;
    } catch (err) {
      console.error('Error uploading document:', err);
      toast.error('Failed to upload document');
      return null;
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      // Get document info for storage path
      const { data: doc } = await supabase
        .from('data_room_documents')
        .select('file_path')
        .eq('id', documentId)
        .single();

      if (doc?.file_path) {
        // Delete from storage
        await supabase.storage
          .from('data-room-documents')
          .remove([doc.file_path]);
      }

      // Delete record
      const { error } = await supabase
        .from('data_room_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      toast.success('Document deleted');
      await loadData();
      return true;
    } catch (err) {
      console.error('Error deleting document:', err);
      toast.error('Failed to delete document');
      return false;
    }
  };

  const updateDocumentStatus = async (
    documentId: string,
    status: 'approved' | 'rejected',
    rejectionReason?: string
  ) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('data_room_documents')
        .update({
          status,
          reviewed_by: user?.user?.id,
          approved_at: status === 'approved' ? new Date().toISOString() : null,
          rejection_reason: status === 'rejected' ? rejectionReason : null,
        })
        .eq('id', documentId);

      if (error) throw error;

      toast.success(`Document ${status}`);
      await loadData();
      return true;
    } catch (err) {
      console.error('Error updating document status:', err);
      toast.error('Failed to update document status');
      return false;
    }
  };

  // Group folders by category
  const foldersByCategory = categories.map((category) => ({
    category,
    folders: folders.filter((f) => f.category_id === category.id),
    documentCount: documents.filter((d) =>
      folders.filter((f) => f.category_id === category.id).some((f) => f.id === d.folder_id)
    ).length,
  }));

  return {
    categories,
    folders,
    documents,
    templates,
    foldersByCategory,
    loading,
    error,
    refresh: loadData,
    applyTemplate,
    uploadDocument,
    deleteDocument,
    updateDocumentStatus,
  };
}
