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

const DealManager = ({ 
  onDealSelect, 
  canCreate = true, 
  canEdit = true, 
  canDelete = false 
}: DealManagerProps) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const { toast } = useToast();

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

  if (isLoading) {
    return (
      <Card className="bg-card border-[#D4AF37]/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Loading deals...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-card border-[#D4AF37]/30">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-foreground">Deal Management</CardTitle>
            {canCreate && (
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-[#D4AF37] hover:bg-[#F4E4BC] text-[#0A0F0F] font-bold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Deal
              </Button>
            )}
          </div>
          
          {/* Search and Filter Controls */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search deals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background border-[#D4AF37]/30 focus:border-[#D4AF37]"
              />
            </div>
            
            <div className="flex gap-4">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-40 bg-background border-[#D4AF37]/30">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {uniqueIndustries.length > 0 && (
                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger className="w-40 bg-background border-[#D4AF37]/30">
                    <SelectValue placeholder="Industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    {uniqueIndustries.map((industry) => (
                      <SelectItem key={industry} value={industry!}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredDeals.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {deals.length === 0 ? 'No deals created yet' : 'No deals match your search'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 p-6">
              {filteredDeals.map((deal) => (
                <Card 
                  key={deal.id} 
                  className="bg-background border-[#D4AF37]/20 hover:border-[#D4AF37]/40 transition-colors cursor-pointer"
                  onClick={() => onDealSelect?.(deal)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">{deal.title}</h3>
                            <p className="text-sm text-muted-foreground font-medium">{deal.company_name}</p>
                          </div>
                          <Badge variant="outline" className={getStatusColor(deal.status)}>
                            {getStatusLabel(deal.status)}
                          </Badge>
                        </div>

                        {deal.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {deal.description}
                          </p>
                        )}

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {deal.industry && (
                            <div className="flex items-center gap-2 text-sm">
                              <Building2 className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">{deal.industry}</span>
                            </div>
                          )}
                          
                          {deal.location && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">{deal.location}</span>
                            </div>
                          )}
                          
                          {deal.revenue && (
                            <div className="flex items-center gap-2 text-sm">
                              <DollarSign className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">{formatCurrency(deal.revenue)}</span>
                            </div>
                          )}
                          
                          {deal.ebitda && (
                            <div className="flex items-center gap-2 text-sm">
                              <TrendingUp className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">{formatCurrency(deal.ebitda)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-end gap-2">
                        <div className="text-xs text-muted-foreground text-right">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Updated {formatDate(deal.updated_at)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingDeal(deal);
                                setIsCreateDialogOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          
                          {deal.status !== 'archived' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(deal.id, 'archived');
                              }}
                            >
                              <Archive className="w-4 h-4" />
                            </Button>
                          )}
                          
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(deal.id);
                              }}
                              className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Deal Dialog */}
      <CreateDealDialog
        isOpen={isCreateDialogOpen}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setEditingDeal(null);
        }}
        onSuccess={() => {
          fetchDeals();
          setIsCreateDialogOpen(false);
          setEditingDeal(null);
        }}
        editDeal={editingDeal}
      />
    </>
  );
};

export default DealManager;