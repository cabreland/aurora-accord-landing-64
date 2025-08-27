import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, MapPin, DollarSign, TrendingUp, FileText, Upload, Settings } from 'lucide-react';
import DocumentUpload from '@/components/documents/DocumentUpload';
import DocumentList from '@/components/documents/DocumentList';
import PublishControls from './PublishControls';
import { Company } from '@/hooks/useCompany';

interface CompanyDetailViewProps {
  company: Company;
  onUploadComplete: () => void;
  refreshTrigger: number;
  canUpload: boolean;
  canManageSettings: boolean;
}

const CompanyDetailView: React.FC<CompanyDetailViewProps> = ({
  company,
  onUploadComplete,
  refreshTrigger,
  canUpload,
  canManageSettings
}) => {
  const getStatusBadge = (company: Company) => {
    if (company.is_draft) {
      return <Badge variant="secondary" className="bg-gray-500/20 text-gray-400">Draft</Badge>;
    }
    
    if (!company.is_published) {
      return <Badge variant="secondary" className="bg-gray-500/20 text-gray-400">Draft</Badge>;
    }
    
    if (company.publish_at && new Date(company.publish_at) > new Date()) {
      return <Badge variant="default" className="bg-amber-500/20 text-amber-400">Scheduled</Badge>;
    }
    
    return <Badge variant="default" className="bg-green-500/20 text-green-400">Live</Badge>;
  };

  const formatCurrency = (value: string | null) => {
    if (!value) return 'N/A';
    return value.startsWith('$') ? value : `$${value}`;
  };

  return (
    <div className="flex-1 space-y-6">
      {/* Company Header */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-foreground text-xl mb-2">{company.name}</CardTitle>
              <p className="text-muted-foreground">{company.summary}</p>
            </div>
            {getStatusBadge(company)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {company.industry && (
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Industry</p>
                  <p className="text-foreground font-medium">{company.industry}</p>
                </div>
              </div>
            )}
            
            {company.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>  
                  <p className="text-foreground font-medium">{company.location}</p>
                </div>
              </div>
            )}
            
            {company.revenue && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-foreground font-medium">{formatCurrency(company.revenue)}</p>
                </div>
              </div>
            )}
            
            {company.ebitda && (
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">EBITDA</p>
                  <p className="text-foreground font-medium">{formatCurrency(company.ebitda)}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          {canUpload && (
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Documents</span>
          </TabsTrigger>
          {canManageSettings && (
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Company Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {company.stage && (
                <div>
                  <h4 className="font-medium text-foreground mb-1">Deal Stage</h4>
                  <Badge variant="outline" className="capitalize">
                    {company.stage}
                  </Badge>
                </div>
              )}
              
              {company.highlights && company.highlights.length > 0 && (
                <div>
                  <h4 className="font-medium text-foreground mb-2">Key Highlights</h4>
                  <ul className="space-y-1">
                    {company.highlights.map((highlight, index) => (
                      <li key={index} className="text-muted-foreground">• {highlight}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {company.risks && company.risks.length > 0 && (
                <div>
                  <h4 className="font-medium text-foreground mb-2">Key Risks</h4>
                  <ul className="space-y-1">
                    {company.risks.map((risk, index) => (
                      <li key={index} className="text-muted-foreground">• {risk}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {canUpload && (
          <TabsContent value="upload" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Upload Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <DocumentUpload
                  dealId={company.id}
                  onUploadComplete={onUploadComplete}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="documents" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Documents</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <DocumentList
                dealId={company.id}
                canDownload={true}
                canDelete={canUpload}
                refreshTrigger={refreshTrigger}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {canManageSettings && (
          <TabsContent value="settings" className="space-y-6">
            <PublishControls 
              company={company} 
              onUpdate={() => {
                onUploadComplete(); // Trigger refresh
              }} 
            />
            
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Company Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border border-border rounded-lg">
                    <h3 className="font-medium text-foreground mb-2">Access Control</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Manage user permissions for this company
                    </p>
                    <div className="text-sm text-muted-foreground">
                      Access control management will be available soon.
                    </div>
                  </div>
                  
                  <div className="p-4 border border-border rounded-lg">
                    <h3 className="font-medium text-foreground mb-2">Publishing</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Control when this company becomes visible to investors
                    </p>
                    <div className="text-sm text-muted-foreground">
                      Publishing controls will be available soon.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default CompanyDetailView;