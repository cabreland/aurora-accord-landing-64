
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Building2 } from 'lucide-react';
import CompanyWizard from '@/components/company/CompanyWizard';
import CompanyList from '@/components/company/CompanyList';
import CompanyDetailView from '@/components/company/CompanyDetailView';
import DashboardLayout from '@/components/investor/DashboardLayout';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useNavigate } from 'react-router-dom';
import { useCompanies, useCompany, useCompanySelection } from '@/hooks/useCompany';
import { useQueryClient } from '@tanstack/react-query';


const DealManagement = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isCompanyWizardOpen, setIsCompanyWizardOpen] = useState(false);
  const { profile, canManageUsers } = useUserProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Company selection and data fetching
  const { selectedCompanyId, selectCompany, clearSelection } = useCompanySelection();
  const { companies, loading: companiesLoading, refetch: refetchCompanies } = useCompanies();
  const { company: selectedCompany, loading: companyLoading } = useCompany(selectedCompanyId || undefined);

  // Auto-select first company if none selected and companies exist
  useEffect(() => {
    if (!selectedCompanyId && companies.length > 0 && !companiesLoading) {
      selectCompany(companies[0].id);
    }
  }, [companies, companiesLoading, selectedCompanyId, selectCompany]);

  const handleCompanySelect = (companyId: string) => {
    selectCompany(companyId);
  };

  const handleUploadComplete = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCompanyWizardSuccess = (companyId: string) => {
    console.log('Company created:', companyId);
    // Invalidate and refetch companies list
    queryClient.invalidateQueries({ queryKey: ['companies'] });
    refetchCompanies();
    setRefreshTrigger(prev => prev + 1);
    // Route to the new company
    selectCompany(companyId);
    setIsCompanyWizardOpen(false);
  };

  // Role-based permissions
  const isAdmin = profile?.role === 'admin';
  const isEditor = profile?.role === 'editor';
  const canUpload = isAdmin || isEditor;
  const canManageSettings = isAdmin || isEditor;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background space-y-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Company Management</h1>
              <p className="text-muted-foreground">
                Manage companies, upload documents, and control access
              </p>
            </div>
            
            {canManageUsers() && (
              <Button
                onClick={() => setIsCompanyWizardOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Company
              </Button>
            )}
          </div>

          {/* Master-Detail Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Master Panel - Company List */}
            <div className="lg:col-span-1">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Companies</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-4">
                    <CompanyList
                      companies={companies}
                      loading={companiesLoading}
                      selectedCompanyId={selectedCompanyId}
                      onCompanySelect={handleCompanySelect}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detail Panel - Company Details */}
            <div className="lg:col-span-2">
              {selectedCompany ? (
                <CompanyDetailView
                  company={selectedCompany}
                  onUploadComplete={handleUploadComplete}
                  refreshTrigger={refreshTrigger}
                  canUpload={canUpload}
                  canManageSettings={canManageSettings}
                />
              ) : (
                <Card className="bg-card border-border">
                  <CardContent className="p-8">
                    <div className="text-center py-12">
                      <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        Select a company to manage uploads & settings
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Choose a company from the list to view details, upload documents, and manage settings.
                      </p>
                      {canManageUsers() && companies.length === 0 && !companiesLoading && (
                        <Button
                          onClick={() => setIsCompanyWizardOpen(true)}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Company
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Company Wizard */}
          <CompanyWizard
            isOpen={isCompanyWizardOpen}
            onClose={() => setIsCompanyWizardOpen(false)}
            onSuccess={handleCompanyWizardSuccess}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DealManagement;
