import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface InvestorSubmission {
  id: string;
  user_id: string;
  full_name: string | null;
  company_name: string | null;
  phone_number: string | null;
  linkedin_url: string | null;
  owns_business: boolean | null;
  business_type: string | null;
  annual_revenue: string | null;
  annual_profit: string | null;
  acquisition_goal: string | null;
  ideal_business_types: string[] | null;
  industries_of_interest: string[] | null;
  preferred_tech_stacks: string[] | null;
  ttm_revenue_min: number | null;
  ttm_revenue_max: number | null;
  ttm_profit_min: number | null;
  ttm_profit_max: number | null;
  asking_price_min: number | null;
  asking_price_max: number | null;
  profit_multiple_min: number | null;
  profit_multiple_max: number | null;
  referral_source: string | null;
  referral_other_details: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    email: string;
    role: string;
    created_at: string;
  };
}

interface SubmissionStats {
  total: number;
  completed: number;
  skipped: number;
  completionRate: number;
  topGoals: { goal: string; count: number }[];
  topReferrals: { source: string; count: number }[];
}

export const useInvestorSubmissions = () => {
  const [submissions, setSubmissions] = useState<InvestorSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SubmissionStats>({
    total: 0,
    completed: 0,
    skipped: 0,
    completionRate: 0,
    topGoals: [],
    topReferrals: []
  });

  const fetchSubmissions = async (filters: {
    searchQuery?: string;
    acquisitionGoal?: string;
    referralSource?: string;
    businessOwner?: 'all' | 'yes' | 'no';
  } = {}) => {
    try {
      setLoading(true);

      let query = supabase
        .from('onboarding_responses')
        .select(`
          *,
          profiles:user_id (
            email,
            role,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.searchQuery) {
        query = query.or(`full_name.ilike.%${filters.searchQuery}%,company_name.ilike.%${filters.searchQuery}%`);
      }

      if (filters.acquisitionGoal && filters.acquisitionGoal !== 'all') {
        query = query.eq('acquisition_goal', filters.acquisitionGoal as any);
      }

      if (filters.referralSource && filters.referralSource !== 'all') {
        query = query.eq('referral_source', filters.referralSource as any);
      }

      if (filters.businessOwner === 'yes') {
        query = query.eq('owns_business', true);
      } else if (filters.businessOwner === 'no') {
        query = query.eq('owns_business', false);
      }

      const { data, error } = await query;

      if (error) throw error;

      setSubmissions(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: InvestorSubmission[]) => {
    const total = data.length;
    const completed = data.filter(s => s.completed_at).length;
    const skipped = total - completed;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    // Top acquisition goals
    const goalCounts = data.reduce((acc, s) => {
      if (s.acquisition_goal) {
        acc[s.acquisition_goal] = (acc[s.acquisition_goal] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topGoals = Object.entries(goalCounts)
      .map(([goal, count]) => ({ goal, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top referral sources
    const referralCounts = data.reduce((acc, s) => {
      if (s.referral_source) {
        acc[s.referral_source] = (acc[s.referral_source] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topReferrals = Object.entries(referralCounts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setStats({
      total,
      completed,
      skipped,
      completionRate,
      topGoals,
      topReferrals
    });
  };

  const exportToCSV = (data: InvestorSubmission[]) => {
    const headers = [
      'Name', 'Company', 'Email', 'Phone', 'LinkedIn',
      'Owns Business', 'Business Type', 'Annual Revenue', 'Annual Profit',
      'Acquisition Goal', 'Ideal Business Types', 'Industries',
      'Tech Stacks', 'TTM Revenue Min', 'TTM Revenue Max',
      'Asking Price Min', 'Asking Price Max', 'Referral Source',
      'Completed At', 'Created At'
    ];

    const rows = data.map(s => [
      s.full_name || '',
      s.company_name || '',
      s.profiles?.email || '',
      s.phone_number || '',
      s.linkedin_url || '',
      s.owns_business ? 'Yes' : 'No',
      s.business_type || '',
      s.annual_revenue || '',
      s.annual_profit || '',
      s.acquisition_goal || '',
      (s.ideal_business_types || []).join('; '),
      (s.industries_of_interest || []).join('; '),
      (s.preferred_tech_stacks || []).join('; '),
      s.ttm_revenue_min || '',
      s.ttm_revenue_max || '',
      s.asking_price_min || '',
      s.asking_price_max || '',
      s.referral_source || '',
      s.completed_at || '',
      s.created_at || ''
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `investor-submissions-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToJSON = (data: InvestorSubmission[]) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `investor-submissions-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  return {
    submissions,
    loading,
    stats,
    fetchSubmissions,
    exportToCSV,
    exportToJSON
  };
};
