import { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { 
  getInvestorPermissions, 
  calculateInvestorMetrics, 
  logInvestorActivity,
  InvestorPermissions 
} from '@/lib/rpc/investorDealAccess';

interface InvestorMetrics {
  totalPipeline: string;
  activeDeals: number;
  highPriorityDeals: number;
  ndaSignedDeals: number;
  accessibleDealsCount: number;
}

interface InvestorContextValue {
  permissions: InvestorPermissions | null;
  metrics: InvestorMetrics | null;
  investorInfo: {
    name: string;
    email: string;
    company?: string;
    lastActivity?: string;
  } | null;
  loading: boolean;
  refreshMetrics: () => Promise<void>;
  logActivity: (action: string, dealId?: string, metadata?: any) => Promise<void>;
}

const InvestorContext = createContext<InvestorContextValue | null>(null);

export const useInvestorContext = () => {
  const context = useContext(InvestorContext);
  if (!context) {
    throw new Error('useInvestorContext must be used within InvestorContextProvider');
  }
  return context;
};

interface InvestorContextProviderProps {
  children: React.ReactNode;
}

export const InvestorContextProvider = ({ children }: InvestorContextProviderProps) => {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const [permissions, setPermissions] = useState<InvestorPermissions | null>(null);
  const [metrics, setMetrics] = useState<InvestorMetrics | null>(null);
  const [investorInfo, setInvestorInfo] = useState<InvestorContextValue['investorInfo']>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && profile) {
      initializeInvestorContext();
    }
  }, [user, profile]);

  const initializeInvestorContext = async () => {
    if (!user?.email || !profile) return;

    try {
      setLoading(true);

      // Get investor permissions
      const investorPermissions = await getInvestorPermissions(user.email);
      setPermissions(investorPermissions);

      // Get investor info from invitation
      const { data: invitation } = await supabase
        .from('investor_invitations')
        .select('investor_name, company_name, accepted_at')
        .eq('email', user.email)
        .eq('status', 'accepted')
        .order('accepted_at', { ascending: false })
        .limit(1)
        .single();

      // Set investor info
      setInvestorInfo({
        name: invitation?.investor_name || profile.first_name + ' ' + profile.last_name || 'Investor',
        email: user.email,
        company: invitation?.company_name,
        lastActivity: invitation?.accepted_at
      });

      // Calculate metrics
      await refreshMetrics();

      // Log login activity
      await logActivity('investor_login');
    } catch (error) {
      console.error('Error initializing investor context:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshMetrics = async () => {
    if (!user?.email) return;

    try {
      const investorMetrics = await calculateInvestorMetrics(user.email);
      setMetrics(investorMetrics);
    } catch (error) {
      console.error('Error refreshing metrics:', error);
    }
  };

  const logActivity = async (action: string, dealId?: string, metadata?: any) => {
    if (!user?.email) return;

    try {
      await logInvestorActivity(user.email, action, dealId, metadata);
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const value: InvestorContextValue = {
    permissions,
    metrics,
    investorInfo,
    loading,
    refreshMetrics,
    logActivity
  };

  return (
    <InvestorContext.Provider value={value}>
      {children}
    </InvestorContext.Provider>
  );
};