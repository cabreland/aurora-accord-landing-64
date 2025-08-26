
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  getCompaniesWithCustomFields,
  getCompaniesWithGrowth,
  getInvestorCompanyData,
  getCompanyWithCustomFields,
  getCompanyWithGrowth,
  CompanyWithCustomFields,
  CompanyWithGrowth
} from '@/lib/data/investorViews';

export const useCompaniesWithCustomFields = () => {
  const [companies, setCompanies] = useState<CompanyWithCustomFields[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const data = await getCompaniesWithCustomFields();
      setCompanies(data);
    } catch (error) {
      console.error('Error fetching companies with custom fields:', error);
      toast({
        title: "Error",
        description: "Failed to load companies with custom fields",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return {
    companies,
    loading,
    refresh: fetchCompanies,
  };
};

export const useCompaniesWithGrowth = () => {
  const [companies, setCompanies] = useState<CompanyWithGrowth[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const data = await getCompaniesWithGrowth();
      setCompanies(data);
    } catch (error) {
      console.error('Error fetching companies with growth opportunities:', error);
      toast({
        title: "Error",
        description: "Failed to load companies with growth opportunities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return {
    companies,
    loading,
    refresh: fetchCompanies,
  };
};

export const useInvestorCompanyData = (companyId?: string) => {
  const [data, setData] = useState<{
    company: CompanyWithCustomFields;
    growth_opportunities: CompanyWithGrowth['growth_opportunities'];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (companyId) {
      fetchData(companyId);
    }
  }, [companyId]);

  const fetchData = async (id: string) => {
    setLoading(true);
    try {
      const result = await getInvestorCompanyData(id);
      setData(result);
    } catch (error) {
      console.error('Error fetching investor company data:', error);
      toast({
        title: "Error",
        description: "Failed to load company data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    refetch: () => companyId && fetchData(companyId),
  };
};
