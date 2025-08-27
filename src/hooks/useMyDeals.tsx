import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';

export interface MyDeal {
  id: string;
  title: string;
  company_name: string;
  company_id?: string;
  industry?: string;
  revenue?: string;
  ebitda?: string;
  location?: string;
  status: 'draft' | 'active' | 'archived';
  stage?: string;
  priority?: string;
  created_at: string;
  updated_at: string;
}

export type DealView = 'grid' | 'list';

interface DealFilters {
  status?: string;
  industry?: string;
  priority?: string;
  search?: string;
}

export const useMyDeals = () => {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { toast } = useToast();
  const [deals, setDeals] = useState<MyDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<DealView>('grid');
  const [filters, setFilters] = useState<DealFilters>({});

  useEffect(() => {
    if (user && profile) {
      fetchDeals();
    }
  }, [user, profile]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('deals')
        .select('*')
        .order('updated_at', { ascending: false });

      // If not admin, only show user's deals
      if (profile?.role !== 'admin') {
        query = query.eq('created_by', user?.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setDeals(data || []);
    } catch (error: any) {
      console.error('Error fetching deals:', error);
      toast({
        title: "Error",
        description: "Failed to load deals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredDeals = useMemo(() => {
    let filtered = deals;

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(deal => deal.status === filters.status);
    }

    if (filters.industry && filters.industry !== 'all') {
      filtered = filtered.filter(deal => 
        deal.industry?.toLowerCase().includes(filters.industry!.toLowerCase())
      );
    }

    if (filters.priority && filters.priority !== 'all') {
      filtered = filtered.filter(deal => deal.priority === filters.priority);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(deal =>
        deal.title.toLowerCase().includes(searchLower) ||
        deal.company_name.toLowerCase().includes(searchLower) ||
        deal.industry?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [deals, filters]);

  const updateFilters = (newFilters: Partial<DealFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  return {
    deals: filteredDeals,
    loading,
    view,
    setView,
    filters,
    updateFilters,
    clearFilters,
    refresh: fetchDeals,
    totalDeals: deals.length,
    filteredCount: filteredDeals.length
  };
};