
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { getCompany, getCompanies, upsertCompanyDraft, finalizeCompany, CompanyData } from '@/lib/data/companies';

export interface Company extends CompanyData {}

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
      const data = await getCompany(companyId);
      setCompany(data);
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
      const data = await getCompanies(searchQuery);
      setCompanies(data);
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
    const id = await upsertCompanyDraft(payload);
    return { success: true, id };
  } catch (error) {
    console.error('Error creating company:', error);
    throw error;
  }
};

export const updateCompany = async (id: string, payload: Partial<Company>) => {
  try {
    await upsertCompanyDraft(payload, id);
    return { success: true };
  } catch (error) {
    console.error('Error updating company:', error);
    throw error;
  }
};

// Hook for managing company selection via URL params
export const useCompanySelection = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const selectedCompanyId = searchParams.get('company');
  
  const selectCompany = (companyId: string | null) => {
    if (companyId) {
      setSearchParams({ company: companyId });
    } else {
      setSearchParams({});
    }
  };
  
  const clearSelection = () => {
    setSearchParams({});
  };
  
  return {
    selectedCompanyId,
    selectCompany,
    clearSelection
  };
};
