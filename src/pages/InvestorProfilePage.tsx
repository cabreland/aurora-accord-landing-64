import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import InvestorPortalLayout from '@/layouts/InvestorPortalLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Loader2, LayoutGrid, Target, Heart, DollarSign, Clock, Settings } from 'lucide-react';
import { ProfileHeader } from '@/components/investor/profile/ProfileHeader';
import { OverviewTab } from '@/components/investor/profile/OverviewTab';
import { InvestmentCriteriaTab } from '@/components/investor/profile/InvestmentCriteriaTab';
import { DealPreferencesTab } from '@/components/investor/profile/DealPreferencesTab';
import { FundingDetailsTab } from '@/components/investor/profile/FundingDetailsTab';
import { ActivityHistoryTab } from '@/components/investor/profile/ActivityHistoryTab';
import { SettingsTab } from '@/components/investor/profile/SettingsTab';
import { useInvestorProfileData } from '@/hooks/useInvestorProfileData';
import { useInvestorProfileStats } from '@/hooks/useInvestorProfileStats';
import { useAuth } from '@/hooks/useAuth';

const InvestorProfilePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const { profileData, loading, saving, updateProfile, completionPercentage, refetch } = useInvestorProfileData();
  const { stats, activities, loading: statsLoading } = useInvestorProfileStats();
  const { user } = useAuth();

  // Sync URL param with tab state
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'overview') {
      searchParams.delete('tab');
    } else {
      searchParams.set('tab', tab);
    }
    setSearchParams(searchParams);
  };

  // Sync profile picture URL from profileData
  React.useEffect(() => {
    if (profileData.profilePictureUrl !== undefined) {
      setProfilePictureUrl(profileData.profilePictureUrl || null);
    }
  }, [profileData.profilePictureUrl]);

  const handleEditClick = () => {
    setActiveTab('investment-criteria');
  };

  const handlePictureUpdated = (newUrl: string | null) => {
    setProfilePictureUrl(newUrl);
  };

  if (loading) {
    return (
      <InvestorPortalLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--primary))]" />
        </div>
      </InvestorPortalLayout>
    );
  }

  return (
    <InvestorPortalLayout>
      <div className="min-h-screen bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          {/* Profile Header Card */}
          <Card className="bg-card border-border mb-6 overflow-hidden">
            <ProfileHeader
              fullName={profileData.fullName}
              buyerType={profileData.buyerType}
              memberSince={profileData.createdAt}
              profilePictureUrl={profilePictureUrl}
              userId={user?.id}
              onEditClick={handleEditClick}
              onPictureUpdated={handlePictureUpdated}
            />
          </Card>

          {/* Tabs Navigation */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="bg-card border border-border p-1 w-full flex-wrap h-auto gap-1">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-[hsl(var(--primary-foreground))] flex-1 min-w-[120px]"
              >
                <LayoutGrid className="w-4 h-4 mr-2 hidden sm:inline" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="investment-criteria"
                className="data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-[hsl(var(--primary-foreground))] flex-1 min-w-[120px]"
              >
                <Target className="w-4 h-4 mr-2 hidden sm:inline" />
                Investment
              </TabsTrigger>
              <TabsTrigger 
                value="deal-preferences"
                className="data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-[hsl(var(--primary-foreground))] flex-1 min-w-[120px]"
              >
                <Heart className="w-4 h-4 mr-2 hidden sm:inline" />
                Preferences
              </TabsTrigger>
              <TabsTrigger 
                value="funding-details"
                className="data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-[hsl(var(--primary-foreground))] flex-1 min-w-[120px]"
              >
                <DollarSign className="w-4 h-4 mr-2 hidden sm:inline" />
                Funding
              </TabsTrigger>
              <TabsTrigger 
                value="activity"
                className="data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-[hsl(var(--primary-foreground))] flex-1 min-w-[120px]"
              >
                <Clock className="w-4 h-4 mr-2 hidden sm:inline" />
                Activity
              </TabsTrigger>
              <TabsTrigger 
                value="settings"
                className="data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-[hsl(var(--primary-foreground))] flex-1 min-w-[120px]"
              >
                <Settings className="w-4 h-4 mr-2 hidden sm:inline" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <OverviewTab 
                stats={stats}
                activities={activities}
                profileData={profileData}
                completionPercentage={completionPercentage}
                onEditClick={handleEditClick}
              />
            </TabsContent>

            <TabsContent value="investment-criteria" className="mt-6">
              <InvestmentCriteriaTab 
                profileData={profileData}
                onUpdate={updateProfile}
                saving={saving}
              />
            </TabsContent>

            <TabsContent value="deal-preferences" className="mt-6">
              <DealPreferencesTab 
                profileData={profileData}
                onUpdate={updateProfile}
                saving={saving}
              />
            </TabsContent>

            <TabsContent value="funding-details" className="mt-6">
              <FundingDetailsTab 
                profileData={profileData}
                onUpdate={updateProfile}
                saving={saving}
              />
            </TabsContent>

            <TabsContent value="activity" className="mt-6">
              <ActivityHistoryTab 
                activities={activities}
                loading={statsLoading}
              />
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <SettingsTab profileData={profileData} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </InvestorPortalLayout>
  );
};

export default InvestorProfilePage;
