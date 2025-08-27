
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/investor/DashboardLayout';
import DealDetailView from '@/components/investor/DealDetailView';
import PortalHeader from '@/components/investor/PortalHeader';
import PortalTabs from '@/components/investor/PortalTabs';
import UserManagement from '@/components/admin/UserManagement';
import CompanyFilters, { CompanyStatusFilter } from '@/components/company/CompanyFilters';
import { useInvestorDeals } from '@/hooks/useInvestorDeals';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useCompanies } from '@/hooks/useCompany';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin } from 'lucide-react';

const InvestorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [statusFilter, setStatusFilter] = useState<CompanyStatusFilter>('all');
  const { onboardingCompleted, loading: onboardingLoading } = useOnboardingStatus();
  const { profile } = useUserProfile();

  useEffect(() => {
    if (!onboardingLoading && onboardingCompleted === false) {
      navigate('/onboarding');
    }
  }, [onboardingCompleted, onboardingLoading, navigate]);

  // Role-aware data fetching
  const isAdminOrEditor = profile?.role === 'admin' || profile?.role === 'editor';
  
  // For admin/editor: use companies data with filtering
  const { companies, loading: companiesLoading } = useCompanies();
  
  // For investors: use published teasers
  const {
    filteredDeals,
    selectedDeal,
    selectedDealData,
    viewMode,
    allDeals,
    loading: dealsLoading,
    handleFilterChange,
    handleDealClick,
    handleBackToDashboard,
    resetFilters,
    refresh
  } = useInvestorDeals();

  // Filter companies for admin/editor view
  const filteredCompanies = useMemo(() => {
    if (!isAdminOrEditor || statusFilter === 'all') return companies;
    
    return companies.filter(company => {
      switch (statusFilter) {
        case 'draft':
          return company.is_draft || !company.is_published;
        case 'scheduled':
          return !company.is_draft && company.is_published && company.publish_at && new Date(company.publish_at) > new Date();
        case 'live':
          return !company.is_draft && company.is_published && (!company.publish_at || new Date(company.publish_at) <= new Date());
        default:
          return true;
      }
    });
  }, [companies, statusFilter, isAdminOrEditor]);

  const getStatusBadge = (company: any) => {
    if (company.is_draft) {
      return <Badge variant="secondary" className="bg-gray-500/20 text-gray-400 text-xs">Draft</Badge>;
    }
    
    if (!company.is_published) {
      return <Badge variant="secondary" className="bg-gray-500/20 text-gray-400 text-xs">Draft</Badge>;
    }
    
    if (company.publish_at && new Date(company.publish_at) > new Date()) {
      return <Badge variant="default" className="bg-amber-500/20 text-amber-400 text-xs">Scheduled</Badge>;
    }
    
    return <Badge variant="default" className="bg-green-500/20 text-green-400 text-xs">Live</Badge>;
  };

  const handleCompanyClick = (companyId: string) => {
    navigate(`/deal/${companyId}`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement />;
      case 'deals':
      case 'documents':
      case 'dashboard':
      default:
        if (isAdminOrEditor) {
          return (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-[#FAFAFA]">Investment Opportunities</h1>
                  <p className="text-[#F4E4BC] mt-2">Manage and review investment opportunities</p>
                </div>
                <CompanyFilters
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                />
              </div>
              
              {companiesLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="bg-[#0A0F0F] border-[#D4AF37]/30 animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-6 bg-[#1A1F2E] rounded mb-4"></div>
                        <div className="h-4 bg-[#1A1F2E] rounded mb-2 w-3/4"></div>
                        <div className="h-4 bg-[#1A1F2E] rounded w-1/2"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredCompanies.map((company) => (
                    <Card 
                      key={company.id} 
                      className="bg-[#0A0F0F] border-[#D4AF37]/30 hover:bg-[#0F1415] transition-colors cursor-pointer"
                      onClick={() => handleCompanyClick(company.id!)}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-[#FAFAFA] text-lg mb-1 truncate">
                              {company.name}
                            </CardTitle>
                            {company.industry && (
                              <p className="text-[#F4E4BC]/70 text-sm truncate">{company.industry}</p>
                            )}
                          </div>
                          {getStatusBadge(company)}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center gap-4 text-sm text-[#F4E4BC]/60">
                          {company.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{company.location}</span>
                            </div>
                          )}
                          {company.stage && (
                            <Badge variant="outline" className="text-xs capitalize border-[#D4AF37]/30">
                              {company.stage}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          );
        } else {
          return (
            <div className="space-y-8">
              <PortalHeader />
              <PortalTabs
                filteredDeals={filteredDeals}
                selectedDeal={selectedDeal}
                allDeals={allDeals}
                loading={dealsLoading}
                onFilterChange={handleFilterChange}
                onDealClick={handleDealClick}
                onResetFilters={resetFilters}
                onRefresh={refresh}
              />
            </div>
          );
        }
    }
  };

  if (viewMode === 'detail' && selectedDealData) {
    return (
      <div className="min-h-screen bg-[#1C2526]">
        <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
          <DealDetailView deal={selectedDealData} onBack={handleBackToDashboard} />
        </DashboardLayout>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1C2526]">
      <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderTabContent()}
      </DashboardLayout>
    </div>
  );
};

export default InvestorDashboard;
