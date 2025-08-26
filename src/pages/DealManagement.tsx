
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Building2, Upload, FileText, Settings } from 'lucide-react';
import DealManager from '@/components/deals/DealManager';
import DocumentUpload from '@/components/documents/DocumentUpload';
import DocumentList from '@/components/documents/DocumentList';
import CompanyWizard from '@/components/company/CompanyWizard';
import DashboardLayout from '@/components/investor/DashboardLayout';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useNavigate } from 'react-router-dom';

interface Deal {
  id: string;
  title: string;
  company_name: string;
  description: string | null;
  industry: string | null;
  location: string | null;
  revenue: string | null;
  ebitda: string | null;
  status: 'draft' | 'active' | 'archived';
  created_at: string;
  updated_at: string;
  created_by: string;
}

const DealManagement = () => {
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [refreshDocuments, setRefreshDocuments] = useState(0);
  const [isCompanyWizardOpen, setIsCompanyWizardOpen] = useState(false);
  const { canManageUsers } = useUserProfile();
  const navigate = useNavigate();

  const handleDealSelect = (deal: Deal) => {
    setSelectedDeal(deal);
  };

  const handleUploadComplete = () => {
    setRefreshDocuments(prev => prev + 1);
  };

  const handleCompanyWizardSuccess = (companyId: string) => {
    console.log('Company created:', companyId);
    setRefreshDocuments(prev => prev + 1);
    // Redirect to the deal detail page
    navigate(`/deal/${companyId}`);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background space-y-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Deal & Document Management</h1>
              <p className="text-muted-foreground">
                Manage deals, upload documents, and control access in real-time
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

          <Tabs defaultValue="deals" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
              <TabsTrigger value="deals" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span className="hidden sm:inline">Deals</span>
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Upload</span>
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Documents</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="deals" className="space-y-6">
              <DealManager
                onDealSelect={handleDealSelect}
                canCreate={canManageUsers()}
                canEdit={canManageUsers()}
                canDelete={canManageUsers()}
              />
            </TabsContent>

            <TabsContent value="upload" className="space-y-6">
              {selectedDeal ? (
                <div className="space-y-6">
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-foreground">
                        Upload Documents for {selectedDeal.company_name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DocumentUpload
                        dealId={selectedDeal.id}
                        onUploadComplete={handleUploadComplete}
                      />
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="text-center py-12">
                      <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        Select a Company First
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Please select a company from the Deals tab to upload documents, or create a new company.
                      </p>
                      {canManageUsers() && (
                        <div className="space-y-4">
                          <Button
                            onClick={() => setIsCompanyWizardOpen(true)}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Create New Company
                          </Button>
                          <p className="text-sm text-muted-foreground">
                            Or create a quick company draft below:
                          </p>
                          <div className="max-w-md mx-auto p-4 border border-border rounded-lg">
                            <h4 className="font-medium text-foreground mb-3">Quick Create Company</h4>
                            <p className="text-sm text-muted-foreground">
                              Use the "Create New Company" button above for a full company creation flow.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              {selectedDeal ? (
                <div className="space-y-6">
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-foreground flex items-center justify-between">
                        <span>Documents for {selectedDeal.company_name}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/deal/${selectedDeal.id}`)}
                          className="ml-4"
                        >
                          View Deal Details
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DocumentList
                        dealId={selectedDeal.id}
                        canDownload={true}
                        canDelete={canManageUsers()}
                        key={refreshDocuments}
                      />
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Please select a company from the Deals tab to view documents
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              {selectedDeal ? (
                <div className="space-y-6">
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-foreground">
                        Deal Settings for {selectedDeal.company_name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 border border-border rounded-lg">
                          <h3 className="font-medium text-foreground mb-2">Access Control</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Manage user permissions for this deal
                          </p>
                          <div className="text-sm text-muted-foreground">
                            Access control management will be available soon.
                          </div>
                        </div>
                        
                        <div className="p-4 border border-border rounded-lg">
                          <h3 className="font-medium text-foreground mb-2">Document Sections</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Create restricted sections with admin-only access
                          </p>
                          <div className="text-sm text-muted-foreground">
                            Document sections will be available soon.
                          </div>
                        </div>
                        
                        <div className="p-4 border border-border rounded-lg">
                          <h3 className="font-medium text-foreground mb-2">Version Control</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Configure automatic versioning and file replacement rules
                          </p>
                          <div className="text-sm text-muted-foreground">
                            Advanced version control settings will be available soon.
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="text-center py-12">
                      <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Please select a company from the Deals tab to view settings
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

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
