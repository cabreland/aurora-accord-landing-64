import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface InvestorProfileData {
  // Basic info
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  linkedinUrl: string;
  buyerType: string;
  
  // Investment criteria
  targetIndustries: string[];
  minInvestment: string;
  maxInvestment: string;
  revenueRangePreference: string;
  ebitdaRangePreference: string;
  geographicPreference: string;
  
  // Deal preferences
  primaryGoal: string;
  mustHaves: string[];
  dealBreakers: string[];
  dealBreakersText: string;
  communicationPreference: string;
  
  // Funding details
  fundingType: string;
  fundingSources: string;
  proofOfFunds: string;
  timelineToClose: string;
  preQualified: string;
  referralSource: string;
  referralDetails: string;
  
  // Meta
  createdAt: string;
  updatedAt: string;
  onboardingCompletedAt: string;
}

const defaultProfileData: InvestorProfileData = {
  fullName: '',
  email: '',
  phone: '',
  companyName: '',
  linkedinUrl: '',
  buyerType: '',
  targetIndustries: [],
  minInvestment: '',
  maxInvestment: '',
  revenueRangePreference: '',
  ebitdaRangePreference: '',
  geographicPreference: '',
  primaryGoal: '',
  mustHaves: [],
  dealBreakers: [],
  dealBreakersText: '',
  communicationPreference: '',
  fundingType: '',
  fundingSources: '',
  proofOfFunds: '',
  timelineToClose: '',
  preQualified: '',
  referralSource: '',
  referralDetails: '',
  createdAt: '',
  updatedAt: '',
  onboardingCompletedAt: '',
};

export const useInvestorProfileData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<InvestorProfileData>(defaultProfileData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfileData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch from investor_profiles table
      const { data: investorProfile, error } = await supabase
        .from('investor_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (investorProfile) {
        setProfileData({
          fullName: investorProfile.full_name || '',
          email: investorProfile.email || user.email || '',
          phone: investorProfile.phone || '',
          companyName: investorProfile.company_name || '',
          linkedinUrl: investorProfile.linkedin_url || '',
          buyerType: (investorProfile as any).buyer_type || '',
          targetIndustries: investorProfile.target_industries || [],
          minInvestment: investorProfile.min_investment || '',
          maxInvestment: investorProfile.max_investment || '',
          revenueRangePreference: investorProfile.revenue_range_preference || '',
          ebitdaRangePreference: investorProfile.ebitda_range_preference || '',
          geographicPreference: investorProfile.geographic_preference || '',
          primaryGoal: investorProfile.primary_goal || '',
          mustHaves: investorProfile.must_haves || [],
          dealBreakers: investorProfile.deal_breakers || [],
          dealBreakersText: Array.isArray(investorProfile.deal_breakers) 
            ? investorProfile.deal_breakers.join(', ') 
            : (investorProfile.deal_breakers as any) || '',
          communicationPreference: investorProfile.communication_preference || '',
          fundingType: investorProfile.funding_type || '',
          fundingSources: (investorProfile as any).funding_sources || '',
          proofOfFunds: investorProfile.pre_qualified || '',
          timelineToClose: investorProfile.timeline_to_close || '',
          preQualified: investorProfile.pre_qualified || '',
          referralSource: investorProfile.referral_source || '',
          referralDetails: investorProfile.referral_details || '',
          createdAt: investorProfile.created_at || '',
          updatedAt: investorProfile.updated_at || '',
          onboardingCompletedAt: investorProfile.onboarding_completed_at || '',
        });
      } else {
        // Set email from user if no profile exists
        setProfileData(prev => ({
          ...prev,
          email: user.email || '',
        }));
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [user?.id]);

  const updateProfile = async (updates: Partial<InvestorProfileData>) => {
    if (!user?.id) return false;

    try {
      setSaving(true);

      const dbUpdates: any = {};
      
      if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.companyName !== undefined) dbUpdates.company_name = updates.companyName;
      if (updates.linkedinUrl !== undefined) dbUpdates.linkedin_url = updates.linkedinUrl;
      if (updates.buyerType !== undefined) dbUpdates.buyer_type = updates.buyerType;
      if (updates.targetIndustries !== undefined) dbUpdates.target_industries = updates.targetIndustries;
      if (updates.minInvestment !== undefined) dbUpdates.min_investment = updates.minInvestment;
      if (updates.maxInvestment !== undefined) dbUpdates.max_investment = updates.maxInvestment;
      if (updates.revenueRangePreference !== undefined) dbUpdates.revenue_range_preference = updates.revenueRangePreference;
      if (updates.ebitdaRangePreference !== undefined) dbUpdates.ebitda_range_preference = updates.ebitdaRangePreference;
      if (updates.geographicPreference !== undefined) dbUpdates.geographic_preference = updates.geographicPreference;
      if (updates.primaryGoal !== undefined) dbUpdates.primary_goal = updates.primaryGoal;
      if (updates.mustHaves !== undefined) dbUpdates.must_haves = updates.mustHaves;
      if (updates.dealBreakersText !== undefined) dbUpdates.deal_breakers = [updates.dealBreakersText];
      if (updates.communicationPreference !== undefined) dbUpdates.communication_preference = updates.communicationPreference;
      if (updates.fundingType !== undefined) dbUpdates.funding_type = updates.fundingType;
      if (updates.fundingSources !== undefined) dbUpdates.funding_sources = updates.fundingSources;
      if (updates.proofOfFunds !== undefined) dbUpdates.pre_qualified = updates.proofOfFunds;
      if (updates.timelineToClose !== undefined) dbUpdates.timeline_to_close = updates.timelineToClose;
      if (updates.referralSource !== undefined) dbUpdates.referral_source = updates.referralSource;
      if (updates.referralDetails !== undefined) dbUpdates.referral_details = updates.referralDetails;
      
      dbUpdates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('investor_profiles')
        .update(dbUpdates)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setProfileData(prev => ({ ...prev, ...updates }));

      toast({
        title: 'Profile Updated',
        description: 'Your changes have been saved successfully.',
      });

      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const calculateCompletion = (): number => {
    let score = 0;
    const total = 100;

    // Basic info (20%)
    if (profileData.fullName) score += 7;
    if (profileData.email) score += 7;
    if (profileData.phone) score += 6;

    // Buyer type & company (10%)
    if (profileData.buyerType) score += 5;
    if (profileData.companyName || profileData.buyerType === 'individual') score += 5;

    // Investment criteria (25%)
    if (profileData.targetIndustries.length > 0) score += 7;
    if (profileData.minInvestment && profileData.maxInvestment) score += 6;
    if (profileData.revenueRangePreference) score += 4;
    if (profileData.ebitdaRangePreference) score += 4;
    if (profileData.geographicPreference) score += 4;

    // Deal preferences (20%)
    if (profileData.primaryGoal) score += 7;
    if (profileData.dealBreakersText || profileData.dealBreakers.length > 0) score += 7;
    if (profileData.communicationPreference) score += 6;

    // Funding details (15%)
    if (profileData.fundingType) score += 5;
    if (profileData.proofOfFunds) score += 5;
    if (profileData.timelineToClose) score += 5;

    // Verification (10%)
    if (profileData.linkedinUrl) score += 5;
    if (profileData.onboardingCompletedAt) score += 5;

    return Math.min(score, total);
  };

  return {
    profileData,
    loading,
    saving,
    updateProfile,
    refetch: fetchProfileData,
    completionPercentage: calculateCompletion(),
  };
};
