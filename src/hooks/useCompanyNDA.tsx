import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export type AccessLevel = 'public' | 'teaser' | 'cim' | 'financials' | 'full';

export const useCompanyNDA = (companyId?: string) => {
  const [hasAcceptedNDA, setHasAcceptedNDA] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const checkNDA = async () => {
    if (!user || !companyId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('company_nda_acceptances')
        .select('id')
        .eq('user_id', user.id)
        .eq('company_id', companyId)
        .maybeSingle();

      if (error) throw error;
      
      setHasAcceptedNDA(!!data);
    } catch (error) {
      console.error('Error checking NDA status:', error);
      setHasAcceptedNDA(false);
    } finally {
      setLoading(false);
    }
  };
  
  const acceptNDA = async () => {
    if (!companyId) {
      toast({
        title: "Error",
        description: "Company ID is required",
        variant: "destructive"
      });
      return { success: false };
    }

    try {
      const { data, error } = await supabase.rpc('accept_company_nda', {
        p_company_id: companyId
      });

      if (error) throw error;
      
      const result = data as { success: boolean; error?: string; message?: string };
      
      if (result?.success) {
        await checkNDA();
        toast({
          title: "NDA Accepted",
          description: "You now have access to additional documents"
        });
        return { success: true };
      }
      
      return { success: false };
    } catch (error: any) {
      console.error('Error accepting NDA:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to accept NDA",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  useEffect(() => {
    checkNDA();
  }, [user, companyId]);
  
  return { 
    hasAcceptedNDA, 
    loading, 
    acceptNDA, 
    refetch: checkNDA 
  };
};
