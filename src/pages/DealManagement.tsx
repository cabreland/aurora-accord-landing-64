import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CreateDealDialog from './CreateDealDialog';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Archive, 
  Trash2, 
  Building2,
  MapPin,
  DollarSign,
  TrendingUp,
  Calendar
} from 'lucide-react';
import CompanyWizard from '@/components/company/CompanyWizard';
import { useUserProfile } from '@/hooks/useUserProfile';

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

interface DealManagerProps {
  onDealSelect?: (deal: Deal) => void;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

const statusOptions = [
  { value: 'all', label: 'All Deals' },
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' }
];

const DealManagement = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const { toast } = useToast();
  const [isCompanyWizardOpen, setIsCompanyWizardOpen] = useState(false);
  const { canManageUsers } = useUserProfile();

  useEffect(() => {
    fetchDeals();
  }, []);

  useEffect(() => {
    filterDeals();
  }, [deals, searchTerm, selectedStatus, selectedIndustry]);

  const fetchDeals = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
      toast({
        title: "Error",
        description: "Failed to load deals",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterDeals = () => {
    let filtered = deals.filter(deal => {
      const matchesSearch = 
        deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (deal.description && deal.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = selectedStatus === 'all' || deal.status === selectedStatus;
      const matchesIndustry = selectedIndustry === 'all' || deal.industry === selectedIndustry;
      
      return matchesSearch && matchesStatus && matchesIndustry;
    });

    setFilteredDeals(filtered);
  };

  const handleStatusChange = async (dealId: string, newStatus: Deal['status']) => {
    try {
      const { error } = await supabase
        .from('deals')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', dealId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Deal ${newStatus === 'archived' ? 'archived' : 'updated'} successfully`,
      });

      fetchDeals();
    } catch (error) {
      console.error('Error updating deal status:', error);
      toast({
        title: "Error",
        description: "Failed to update deal status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (dealId: string) => {
    if (!canDelete) return;

    try {
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', dealId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Deal deleted successfully",
      });

      fetchDeals();
    } catch (error) {
      console.error('Error deleting deal:', error);
      toast({
        title: "Error",
        description: "Failed to delete deal",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: Deal['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'archived':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusLabel = (status: Deal['status']) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatCurrency = (value: string | null) => {
    if (!value) return 'N/A';
    return value.startsWith('$') ? value : `$${value}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const uniqueIndustries = Array.from(new Set(deals.map(deal => deal.industry).filter(Boolean)));

  const handleCompanyWizardSuccess = (companyId: string) => {
    // Redirect to deal detail page or refresh deals list
    console.log('Company created:', companyId);
    setRefreshDocuments(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
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
            <TabsTrigger value="upload" className="flex items-center gap-2" disabled={!selectedDeal}>
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2" disabled={!selectedDeal}>
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Documents</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2" disabled={!selectedDeal}>
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deals" className="space-y-6">
            <DealManager
              onDealSelect={handleDealSelect}
              canCreate={true}
              canEdit={true}
              canDelete={true}
            />
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            {selectedDeal ? (
              <div className="space-y-6">
                <Card className="bg-card border-[#D4AF37]/30">
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
              <Card className="bg-card border-[#D4AF37]/30">
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Please select a deal first to upload documents
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            {selectedDeal ? (
              <div className="space-y-6">
                <Card className="bg-card border-[#D4AF37]/30">
                  <CardHeader>
                    <CardTitle className="text-foreground">
                      Documents for {selectedDeal.company_name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DocumentList
                      dealId={selectedDeal.id}
                      canDownload={true}
                      canDelete={true}
                      key={refreshDocuments}
                    />
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="bg-card border-[#D4AF37]/30">
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Please select a deal first to view documents
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            {selectedDeal ? (
              <div className="space-y-6">
                <Card className="bg-card border-[#D4AF37]/30">
                  <CardHeader>
                    <CardTitle className="text-foreground">
                      Deal Settings for {selectedDeal.company_name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border border-[#D4AF37]/20 rounded-lg">
                        <h3 className="font-medium text-foreground mb-2">Access Control</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Manage user permissions for this deal
                        </p>
                        <div className="text-sm text-muted-foreground">
                          Access control management will be available soon.
                        </div>
                      </div>
                      
                      <div className="p-4 border border-[#D4AF37]/20 rounded-lg">
                        <h3 className="font-medium text-foreground mb-2">Document Sections</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Create restricted sections with admin-only access
                        </p>
                        <div className="text-sm text-muted-foreground">
                          Document sections will be available soon.
                        </div>
                      </div>
                      
                      <div className="p-4 border border-[#D4AF37]/20 rounded-lg">
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
              <Card className="bg-card border-[#D4AF37]/30">
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Please select a deal first to view settings
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
  );
};

export default DealManagement;
