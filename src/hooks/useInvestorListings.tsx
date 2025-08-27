import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TeaserData } from '@/lib/data/teasers';
import { toast } from 'sonner';

export type StatusFilter = 'all' | 'draft' | 'scheduled' | 'live';

interface CountsByStatus {
  all: number;
  draft: number;
  scheduled: number;
  live: number;
}

export interface ListingItem {
  id: string;
  name: string;
  industry?: string;
  location?: string;
  summary?: string;
  revenue?: string;
  ebitda?: string;
  asking_price?: string;
  stage?: string;
  priority?: string;
  fit_score?: number;
  is_draft?: boolean;
  is_published?: boolean;
  publish_at?: string;
  created_at: string;
  updated_at?: string;
}

export const useInvestorListings = (userRole: string) => {
  const [items, setItems] = useState<ListingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Fetch data based on role
  const fetchListings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (userRole === 'admin' || userRole === 'editor') {
        // Admin/Staff see all companies
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .order('updated_at', { ascending: false });

        if (error) throw error;
        setItems(data || []);
      } else {
        // Investors see only published teasers
        const { data, error } = await supabase
          .from('public_company_teasers')
          .select('*')
          .order('updated_at', { ascending: false });

        if (error) throw error;
        setItems(data || []);
      }
    } catch (err: any) {
      console.error('Error fetching listings:', err);
      setError(err.message);
      toast.error('Failed to load listings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [userRole]);

  // Filter items based on status (admin/staff only)
  const filteredItems = useMemo(() => {
    if (userRole !== 'admin' && userRole !== 'editor') {
      return items; // Investors see all published items
    }

    if (statusFilter === 'all') return items;

    return items.filter(item => {
      const now = new Date();
      const publishAt = item.publish_at ? new Date(item.publish_at) : null;

      switch (statusFilter) {
        case 'draft':
          return item.is_draft || !item.is_published;
        case 'scheduled':
          return !item.is_draft && item.is_published && publishAt && publishAt > now;
        case 'live':
          return !item.is_draft && item.is_published && (!publishAt || publishAt <= now);
        default:
          return true;
      }
    });
  }, [items, statusFilter, userRole]);

  // Calculate counts by status (admin/staff only)
  const countsByStatus = useMemo((): CountsByStatus => {
    if (userRole !== 'admin' && userRole !== 'editor') {
      return { all: items.length, draft: 0, scheduled: 0, live: items.length };
    }

    const now = new Date();
    const counts = items.reduce((acc, item) => {
      acc.all++;
      
      const publishAt = item.publish_at ? new Date(item.publish_at) : null;
      
      if (item.is_draft || !item.is_published) {
        acc.draft++;
      } else if (item.is_published && publishAt && publishAt > now) {
        acc.scheduled++;
      } else if (item.is_published && (!publishAt || publishAt <= now)) {
        acc.live++;
      }
      
      return acc;
    }, { all: 0, draft: 0, scheduled: 0, live: 0 });

    return counts;
  }, [items, userRole]);

  return {
    items: filteredItems,
    isLoading,
    error,
    countsByStatus,
    statusFilter,
    setStatusFilter,
    refresh: fetchListings,
    canFilter: userRole === 'admin' || userRole === 'editor'
  };
};