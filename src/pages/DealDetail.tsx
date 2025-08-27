import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/investor/DashboardLayout';
import NDAGate from '@/components/company/NDAGate';
import DocumentList from '@/components/documents/DocumentList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, MapPin, DollarSign, TrendingUp, ArrowLeft, FileText } from 'lucide-react';
import { useCompany } from '@/hooks/useCompany';
import { useNDA } from '@/hooks/useNDA';
import { useQueryClient } from '@tanstack/react-query';

const DealDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { company, loading: companyLoading } = useCompany(id);
  const { hasAcceptedNDA, requireNDA, loading: ndaLoading } = useNDA(id);

  const handleNDAAccepted = () => {
    // Invalidate queries after NDA acceptance
    if (id) {
      queryClient.invalidateQueries({ queryKey: ['company-docs', id] });
      queryClient.invalidateQueries({ queryKey: ['company', id] });
    }
    setRefreshTrigger(prev => prev + 1);
  };

  const handleBack = () => {
    navigate('/investor-portal');
  };

  const formatCurrency = (value: string | null) => {
    if (!value) return 'Not disclosed';
    return value.startsWith('$') ? value : `$${value}`;
  };

  const getAccessLevel = () => {
    if (!requireNDA) return 'Full Access';
    if (hasAcceptedNDA) return 'NDA Accepted';
    return 'Teaser Only';
  };

  const canViewDocuments = !requireNDA || hasAcceptedNDA;

  if (companyLoading || ndaLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-[#FAFAFA]">Loading deal details...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!company) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={handleBack} className="text-[#F4E4BC]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Portal
            </Button>
          </div>
          <Card className="bg-[#0A0F0F] border-[#D4AF37]/30">
            <CardContent className="p-8 text-center">
              <Building2 className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#FAFAFA] mb-2">Deal Not Found</h3>
              <p className="text-[#F4E4BC]/60">
                The requested deal could not be found or you don't have access to it.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={handleBack} className="text-[#F4E4BC]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Portal
            </Button>
          </div>
          <Badge className="bg-[#D4AF37]/20 text-[#D4AF37]">
            {getAccessLevel()}
          </Badge>
        </div>

        {/* Company Overview */}
        <Card className="bg-[#0A0F0F] border-[#D4AF37]/30">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl text-[#FAFAFA] mb-2">{company.name}</CardTitle>
                <p className="text-[#F4E4BC]/70">{company.summary}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {company.industry && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#D4AF37]" />
                  <div>
                    <p className="text-sm text-[#F4E4BC]/70">Industry</p>
                    <p className="text-[#FAFAFA] font-medium">{company.industry}</p>
                  </div>
                </div>
              )}
              
              {company.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#D4AF37]" />
                  <div>
                    <p className="text-sm text-[#F4E4BC]/70">Location</p>
                    <p className="text-[#FAFAFA] font-medium">{company.location}</p>
                  </div>
                </div>
              )}
              
              {company.revenue && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#D4AF37]" />
                  <div>
                    <p className="text-sm text-[#F4E4BC]/70">Revenue</p>
                    <p className="text-[#FAFAFA] font-medium">{formatCurrency(company.revenue)}</p>
                  </div>
                </div>
              )}
              
              {company.ebitda && (
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
                  <div>
                    <p className="text-sm text-[#F4E4BC]/70">EBITDA</p>
                    <p className="text-[#FAFAFA] font-medium">{formatCurrency(company.ebitda)}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* NDA Gated Content */}
        <NDAGate 
          companyId={id!} 
          companyName={company.name}
          onNDAAccepted={handleNDAAccepted}
        >
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-[#2A2F3A] border border-[#D4AF37]/20">
              <TabsTrigger 
                value="overview" 
                className="text-[#F4E4BC] data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0A0F0F]"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="documents" 
                className="text-[#F4E4BC] data-[state=active]:bg-[#D4AF37] data-[state=active]:text-[#0A0F0F]"
              >
                Documents
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card className="bg-[#0A0F0F] border-[#D4AF37]/30">
                <CardHeader>
                  <CardTitle className="text-[#FAFAFA]">Company Highlights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {company.highlights && company.highlights.length > 0 ? (
                    <div>
                      <h4 className="font-medium text-[#FAFAFA] mb-2">Key Highlights</h4>
                      <ul className="space-y-1">
                        {company.highlights.map((highlight, index) => (
                          <li key={index} className="text-[#F4E4BC]/80">• {highlight}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-[#F4E4BC]/60">No highlights available</p>
                  )}
                  
                  {company.risks && company.risks.length > 0 && (
                    <div>
                      <h4 className="font-medium text-[#FAFAFA] mb-2">Key Considerations</h4>
                      <ul className="space-y-1">
                        {company.risks.map((risk, index) => (
                          <li key={index} className="text-[#F4E4BC]/80">• {risk}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              <Card className="bg-[#0A0F0F] border-[#D4AF37]/30">
                <CardHeader>
                  <CardTitle className="text-[#FAFAFA] flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Documents
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {canViewDocuments ? (
                    <DocumentList
                      dealId={id!}
                      companyId={id!}
                      canDownload={true}
                      canDelete={false}
                      refreshTrigger={refreshTrigger}
                    />
                  ) : (
                    <div className="p-8 text-center">
                      <FileText className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-[#FAFAFA] mb-2">
                        Documents Protected
                      </h3>
                      <p className="text-[#F4E4BC]/60">
                        Accept the NDA above to access confidential documents.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </NDAGate>
      </div>
    </DashboardLayout>
  );
};

export default DealDetailPage;