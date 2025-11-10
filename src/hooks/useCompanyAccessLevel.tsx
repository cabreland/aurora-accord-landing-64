import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { AccessLevel } from './useCompanyNDA';

export const useCompanyAccessLevel = (companyId?: string) => {
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('public');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const fetchAccessLevel = async () => {
    if (!user || !companyId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('get_user_access_level', {
        p_user_id: user.id,
        p_company_id: companyId
      });

      if (error) throw error;
      
      setAccessLevel((data as AccessLevel) || 'public');
    } catch (error) {
      console.error('Error fetching access level:', error);
      setAccessLevel('public');
    } finally {
      setLoading(false);
    }
  };
  
  const canAccess = (requiredLevel: AccessLevel): boolean => {
    const hierarchy: AccessLevel[] = ['public', 'teaser', 'cim', 'financials', 'full'];
    return hierarchy.indexOf(accessLevel) >= hierarchy.indexOf(requiredLevel);
  };

  useEffect(() => {
    fetchAccessLevel();
  }, [user, companyId]);
  
  return { 
    accessLevel, 
    loading, 
    canAccess, 
    refetch: fetchAccessLevel 
  };
};
