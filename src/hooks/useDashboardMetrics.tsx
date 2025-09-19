import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DashboardMetrics {
  totalDeals: number;
  activeDeals: number;
  pendingDocuments: number;
  completionRate: number;
  storageUsed: string;
  urgentItems: number;
}

export const useDashboardMetrics = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalDeals: 0,
    activeDeals: 0,
    pendingDocuments: 0,
    completionRate: 0,
    storageUsed: '0 MB',
    urgentItems: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMetrics();
    
    // Subscribe to real-time document changes to update metrics
    const channel = supabase
      .channel('metrics-document-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents'
        },
        (payload) => {
          console.log('Document change detected for metrics:', payload);
          // Refresh metrics when documents change
          fetchMetrics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);

      // Fetch all deals
      const { data: deals, error: dealsError } = await supabase
        .from('deals')
        .select('id, status, created_at');

      if (dealsError) throw dealsError;

      // Calculate deal metrics
      const totalDeals = deals?.length || 0;
      const activeDeals = deals?.filter(deal => deal.status === 'active').length || 0;

      // Fetch all documents to calculate document metrics
      const { data: allDocuments, error: docsError } = await supabase
        .from('documents')
        .select('deal_id, tag, file_size');

      if (docsError) throw docsError;

      // Calculate storage usage
      const totalBytes = allDocuments?.reduce((sum, doc) => sum + (doc.file_size || 0), 0) || 0;
      const storageUsed = formatBytes(totalBytes);

      // Calculate completion metrics
      const requiredCategories = ['cim', 'financials', 'legal', 'due_diligence'];
      let totalRequiredCategories = 0;
      let completedCategories = 0;
      let urgentItems = 0;

      // Group documents by deal
      const documentsByDeal = allDocuments?.reduce((acc, doc) => {
        if (!acc[doc.deal_id]) acc[doc.deal_id] = [];
        acc[doc.deal_id].push(doc);
        return acc;
      }, {} as Record<string, typeof allDocuments>) || {};

      deals?.forEach(deal => {
        const dealDocs = documentsByDeal[deal.id] || [];
        const completedCategoriesForDeal = new Set(
          dealDocs.filter(doc => requiredCategories.includes(doc.tag)).map(doc => doc.tag)
        ).size;
        
        totalRequiredCategories += requiredCategories.length;
        completedCategories += completedCategoriesForDeal;
        
        // Count urgent items (missing required documents)
        const missingCategories = requiredCategories.length - completedCategoriesForDeal;
        if (missingCategories > 0 && deal.status === 'active') {
          urgentItems += missingCategories;
        }
      });

      const completionRate = totalRequiredCategories > 0 
        ? Math.round((completedCategories / totalRequiredCategories) * 100)
        : 0;

      const pendingDocuments = totalRequiredCategories - completedCategories;

      setMetrics({
        totalDeals,
        activeDeals,
        pendingDocuments: Math.max(0, pendingDocuments),
        completionRate,
        storageUsed,
        urgentItems
      });

    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard metrics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 MB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const refreshMetrics = () => {
    fetchMetrics();
  };

  return {
    metrics,
    isLoading,
    refreshMetrics
  };
};