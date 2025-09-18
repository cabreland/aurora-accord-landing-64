import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface InvitationDetails {
  id: string;
  email: string;
  invitation_code: string;
  status: string;
  access_type: string;
  deal_id?: string;
  deal_ids?: any;
  portfolio_access: boolean;
  master_nda_signed: boolean;
  expires_at: string;
  investor_name?: string;
  company_name?: string;
  notes?: string;
  invited_by_name?: string;
  deal_title?: string;
  deal_company_name?: string;
}

export const useInvitationValidation = () => {
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateInvitation = useCallback(async (invitationCode: string) => {
    if (!invitationCode?.trim()) {
      setError('No invitation code provided');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Query the invitation
      const { data, error: queryError } = await supabase
        .from('investor_invitations')
        .select('*')
        .eq('invitation_code', invitationCode.trim())
        .maybeSingle();

      if (queryError) {
        console.error('Database error:', queryError);
        setError('Failed to validate invitation');
        return;
      }

      if (!data) {
        setError('Invalid invitation code');
        return;
      }

      // Check if invitation has expired
      const expiryDate = new Date(data.expires_at);
      const now = new Date();
      
      if (expiryDate < now) {
        setError('This invitation has expired');
        return;
      }

      // Get related profile data
      let invitedByName: string | undefined;
      if (data.invited_by) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', data.invited_by)
          .maybeSingle();
        
        if (profileData) {
          invitedByName = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim();
        }
      }

      // Get related deal data if applicable
      let dealTitle: string | undefined;
      let dealCompanyName: string | undefined;
      if (data.deal_id) {
        const { data: dealData } = await supabase
          .from('deals')
          .select('title, company_name')
          .eq('id', data.deal_id)
          .maybeSingle();
        
        if (dealData) {
          dealTitle = dealData.title;
          dealCompanyName = dealData.company_name;
        }
      }

      // Format the invitation data
      const invitationDetails: InvitationDetails = {
        ...data,
        invited_by_name: invitedByName,
        deal_title: dealTitle,
        deal_company_name: dealCompanyName,
      };

      setInvitation(invitationDetails);
    } catch (err) {
      console.error('Error validating invitation:', err);
      setError('An unexpected error occurred while validating your invitation');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    invitation,
    loading,
    error,
    validateInvitation,
  };
};