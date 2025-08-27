import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useNDA = (companyId?: string) => {
  const [hasAcceptedNDA, setHasAcceptedNDA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [requireNDA, setRequireNDA] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (companyId) {
      checkNdaStatus();
      fetchNdaRequirement();
    }
  }, [companyId]);

  const fetchNdaRequirement = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'legal_nda.require_nda')
        .maybeSingle();
      
      if (error) throw error;
      
      // Handle different possible value types from Supabase Json type
      if (data?.value) {
        if (typeof data.value === 'boolean') {
          setRequireNDA(data.value);
        } else if (typeof data.value === 'object' && data.value !== null) {
          setRequireNDA((data.value as any).require_nda ?? true);
        } else {
          setRequireNDA(true);
        }
      } else {
        setRequireNDA(true);
      }
    } catch (error) {
      console.error('Error fetching NDA requirement:', error);
      setRequireNDA(true); // Default to requiring NDA
    }
  };

  const checkNdaStatus = async () => {
    if (!companyId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('company_nda_acceptances')
        .select('id')
        .eq('company_id', companyId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .maybeSingle();
      
      if (error) throw error;
      setHasAcceptedNDA(!!data);
    } catch (error) {
      console.error('Error checking NDA status:', error);
    } finally {
      setLoading(false);
    }
  };

  const acceptNDA = async (): Promise<boolean> => {
    if (!companyId || accepting) return false;
    
    setAccepting(true);
    try {
      const { data, error } = await supabase.rpc('accept_company_nda', {
        p_company_id: companyId
      });
      
      if (error) throw error;
      
      const result = data as { success: boolean; error?: string; message?: string };
      
      if (result.success) {
        setHasAcceptedNDA(true);
        toast({
          title: "Success",
          description: result.message || "NDA accepted successfully",
        });
        return true;
      } else {
        throw new Error(result.error || 'Failed to accept NDA');
      }
    } catch (error) {
      console.error('Error accepting NDA:', error);
      toast({
        title: "Error",
        description: "Failed to accept NDA. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setAccepting(false);
    }
  };

  return {
    hasAcceptedNDA,
    requireNDA,
    loading,
    accepting,
    acceptNDA,
    refetch: checkNdaStatus
  };
};