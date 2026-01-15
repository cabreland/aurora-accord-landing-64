import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DocumentStats {
  totalDocs: number;
  activeDeals: number;
  totalSizeGB: string;
}

interface RecentDocument {
  id: string;
  name: string;
  file_size: number | null;
  file_type: string | null;
  created_at: string;
  tag: string;
  deal_id: string;
  deals: { company_name: string; industry: string | null } | null;
}

interface CategoryCount {
  tag: string;
  count: number;
}

interface DealWithDocs {
  id: string;
  company_name: string;
  industry: string | null;
  location: string | null;
  title: string;
  documentCount: number;
  categories: CategoryCount[];
  lastUpdated: string | null;
}

interface Deal {
  id: string;
  company_name: string;
  title: string;
}

export function useDocumentLibrary() {
  const [stats, setStats] = useState<DocumentStats>({
    totalDocs: 0,
    activeDeals: 0,
    totalSizeGB: '0'
  });
  const [recentDocs, setRecentDocs] = useState<RecentDocument[]>([]);
  const [dealsWithDocs, setDealsWithDocs] = useState<DealWithDocs[]>([]);
  const [allDeals, setAllDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDealId, setSelectedDealId] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchLibraryData();
  }, []);

  const fetchLibraryData = async () => {
    setIsLoading(true);
    try {
      // Fetch all deals for filter dropdown
      const { data: deals } = await supabase
        .from('deals')
        .select('id, company_name, title')
        .order('company_name');
      
      setAllDeals(deals || []);

      // Fetch total document count
      const { count: totalCount } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true });

      // Fetch deals with documents count
      const { data: dealsData } = await supabase
        .from('deals')
        .select('id, company_name, industry, location, title')
        .order('updated_at', { ascending: false });

      // Fetch all documents for size calculation and grouping
      const { data: allDocs } = await supabase
        .from('documents')
        .select('id, deal_id, file_size, tag, created_at');

      // Calculate total size
      const totalBytes = allDocs?.reduce((sum, doc) => sum + (doc.file_size || 0), 0) || 0;
      const totalSizeGB = (totalBytes / (1024 * 1024 * 1024)).toFixed(2);

      // Get unique deals with documents
      const dealDocMap = new Map<string, { docs: typeof allDocs; lastUpdated: string }>();
      allDocs?.forEach(doc => {
        if (!dealDocMap.has(doc.deal_id)) {
          dealDocMap.set(doc.deal_id, { docs: [], lastUpdated: doc.created_at });
        }
        const entry = dealDocMap.get(doc.deal_id)!;
        entry.docs.push(doc);
        if (new Date(doc.created_at) > new Date(entry.lastUpdated)) {
          entry.lastUpdated = doc.created_at;
        }
      });

      // Build deals with documents data
      const dealsWithDocsData: DealWithDocs[] = [];
      dealsData?.forEach(deal => {
        const docData = dealDocMap.get(deal.id);
        if (docData && docData.docs.length > 0) {
          // Count by category
          const categoryMap = new Map<string, number>();
          docData.docs.forEach(doc => {
            categoryMap.set(doc.tag, (categoryMap.get(doc.tag) || 0) + 1);
          });
          
          const categories: CategoryCount[] = Array.from(categoryMap.entries())
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count);

          dealsWithDocsData.push({
            ...deal,
            documentCount: docData.docs.length,
            categories,
            lastUpdated: docData.lastUpdated
          });
        }
      });

      // Sort by document count
      dealsWithDocsData.sort((a, b) => b.documentCount - a.documentCount);

      setStats({
        totalDocs: totalCount || 0,
        activeDeals: dealDocMap.size,
        totalSizeGB
      });

      setDealsWithDocs(dealsWithDocsData);

      // Fetch recent documents
      const { data: recentDocsData } = await supabase
        .from('documents')
        .select(`
          id,
          name,
          file_size,
          file_type,
          created_at,
          tag,
          deal_id,
          deals (company_name, industry)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentDocs(recentDocsData as RecentDocument[] || []);

    } catch (error) {
      console.error('Error fetching document library data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter recent documents
  const filteredRecentDocs = useMemo(() => {
    return recentDocs.filter(doc => {
      if (searchQuery && !doc.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (selectedDealId !== 'all' && doc.deal_id !== selectedDealId) {
        return false;
      }
      if (selectedCategory !== 'all' && doc.tag !== selectedCategory) {
        return false;
      }
      if (selectedType !== 'all') {
        const type = doc.file_type?.toLowerCase() || '';
        if (selectedType === 'pdf' && !type.includes('pdf')) return false;
        if (selectedType === 'excel' && !type.includes('excel') && !type.includes('spreadsheet') && !type.includes('xls')) return false;
        if (selectedType === 'word' && !type.includes('word') && !type.includes('doc')) return false;
        if (selectedType === 'image' && !type.includes('image') && !type.includes('png') && !type.includes('jpg')) return false;
      }
      return true;
    });
  }, [recentDocs, searchQuery, selectedDealId, selectedCategory, selectedType]);

  // Filter deals with docs
  const filteredDealsWithDocs = useMemo(() => {
    if (selectedDealId !== 'all') {
      return dealsWithDocs.filter(deal => deal.id === selectedDealId);
    }
    return dealsWithDocs;
  }, [dealsWithDocs, selectedDealId]);

  const hasActiveFilters = searchQuery !== '' || 
    selectedDealId !== 'all' || 
    selectedType !== 'all' || 
    selectedCategory !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDealId('all');
    setSelectedType('all');
    setSelectedCategory('all');
  };

  return {
    stats,
    recentDocs: filteredRecentDocs,
    dealsWithDocs: filteredDealsWithDocs,
    allDeals,
    isLoading,
    refresh: fetchLibraryData,
    // Filters
    searchQuery,
    setSearchQuery,
    selectedDealId,
    setSelectedDealId,
    selectedType,
    setSelectedType,
    selectedCategory,
    setSelectedCategory,
    hasActiveFilters,
    clearFilters
  };
}
