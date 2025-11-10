import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import { AccessLevel } from './useCompanyNDA';

export const useAccessRequest = () => {
  const { user } = useAuth();
  
  const submitRequest = async (
    companyId: string,
    currentLevel: AccessLevel,
    requestedLevel: AccessLevel,
    reason: string
  ) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to request access",
        variant: "destructive"
      });
      return { success: false };
    }

    try {
      const { error } = await supabase.from('access_requests').insert({
        user_id: user.id,
        company_id: companyId,
        current_level: currentLevel,
        requested_level: requestedLevel,
        reason
      });
      
      if (error) throw error;
      
      toast({
        title: "Request Submitted",
        description: "We'll review your request and notify you soon."
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Error submitting access request:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit request",
        variant: "destructive"
      });
      return { success: false };
    }
  };
  
  return { submitRequest };
};
