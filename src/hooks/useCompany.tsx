
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Company {
  id: string;
  name: string;
  industry: string;
  location: string;
  summary: string;
  stage: string;
  priority: string;
  fit_score: number;
  owner_id: string;
  revenue: string;
  ebitda: string;
  asking_price: string;
  highlights: string[];
  risks: string[];
  passcode: string;
  is_draft: boolean;
  created_at: string;
  updated_at: string;
}

export const useCompany = (id?: string) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchCompany(id);
    }
  }, [id]);

  const fetchCompany = async (companyId: string) => {
    setLoading(true);
    try {
      // TODO: Implement actual API call
      console.log('Fetching company:', companyId);
      // Mock data for now
      setCompany({
        id: companyId,
        name: 'Sample Company',
        industry: 'Technology',
        location: 'San Francisco, CA',
        summary: 'A sample company',
        stage: 'active',
        priority: 'high',
        fit_score: 85,
        owner_id: 'current-user',
        revenue: '1000000',
        ebitda: '200000',
        asking_price: '5000000',
        highlights: ['Strong team', 'Growing market'],
        risks: ['Competition', 'Market volatility'],
        passcode: '',
        is_draft: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error fetching company:', error);
      toast({
        title: "Error",
        description: "Failed to load company details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    company,
    loading,
    refetch: () => id && fetchCompany(id),
  };
};

export const useCompanies = (query?: string) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCompanies(query);
  }, [query]);

  const fetchCompanies = async (searchQuery?: string) => {
    setLoading(true);
    try {
      // TODO: Implement actual API call
      console.log('Fetching companies with query:', searchQuery);
      // Mock data for now
      setCompanies([]);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: "Error",
        description: "Failed to load companies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    companies,
    loading,
    refetch: () => fetchCompanies(query),
  };
};

export const createCompany = async (payload: Partial<Company>) => {
  try {
    // TODO: Implement actual API call
    console.log('Creating company:', payload);
    return { success: true, id: `company-${Date.now()}` };
  } catch (error) {
    console.error('Error creating company:', error);
    throw error;
  }
};

export const updateCompany = async (id: string, payload: Partial<Company>) => {
  try {
    // TODO: Implement actual API call
    console.log('Updating company:', id, payload);
    return { success: true };
  } catch (error) {
    console.error('Error updating company:', error);
    throw error;
  }
};
