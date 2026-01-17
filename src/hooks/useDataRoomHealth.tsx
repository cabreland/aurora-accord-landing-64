import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DataRoomHealthMetrics {
  totalFolders: number;
  requiredFolders: number;
  foldersWithDocuments: number;
  requiredFoldersWithDocuments: number;
  totalDocuments: number;
  healthPercentage: number;
  isComplete: boolean;
}

export const useDataRoomHealth = (dealId: string) => {
  // Fetch folders
  const { data: folders = [], isLoading: foldersLoading } = useQuery({
    queryKey: ['data-room-folders', dealId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('data_room_folders')
        .select('id, name, is_required, is_not_applicable')
        .eq('deal_id', dealId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!dealId
  });

  // Fetch documents
  const { data: documents = [], isLoading: documentsLoading } = useQuery({
    queryKey: ['data-room-documents', dealId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('data_room_documents')
        .select('id, folder_id')
        .eq('deal_id', dealId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!dealId
  });

  // Calculate health metrics
  const metrics = useMemo((): DataRoomHealthMetrics => {
    // Exclude N/A folders from all calculations
    const activeFolders = folders.filter(f => !f.is_not_applicable);
    const totalFolders = activeFolders.length;
    const requiredFolders = activeFolders.filter(f => f.is_required);
    const requiredFolderCount = requiredFolders.length;
    
    // Get folder IDs that have at least 1 document
    const folderIdsWithDocs = new Set(documents.map(d => d.folder_id).filter(Boolean));
    
    const foldersWithDocuments = activeFolders.filter(f => folderIdsWithDocs.has(f.id)).length;
    const requiredFoldersWithDocuments = requiredFolders.filter(f => folderIdsWithDocs.has(f.id)).length;
    
    // Health is based on required folders completion, or all folders if none are required
    const denominator = requiredFolderCount > 0 ? requiredFolderCount : totalFolders;
    const numerator = requiredFolderCount > 0 ? requiredFoldersWithDocuments : foldersWithDocuments;
    
    const healthPercentage = denominator > 0 
      ? Math.round((numerator / denominator) * 100)
      : 0;
    
    return {
      totalFolders,
      requiredFolders: requiredFolderCount,
      foldersWithDocuments,
      requiredFoldersWithDocuments,
      totalDocuments: documents.length,
      healthPercentage,
      isComplete: healthPercentage === 100
    };
  }, [folders, documents]);

  return {
    ...metrics,
    isLoading: foldersLoading || documentsLoading
  };
};
