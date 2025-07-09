import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Building2, MapPin, DollarSign, Archive, Edit, Trash2 } from 'lucide-react';
import CreateDealDialog from './CreateDealDialog';

interface Deal {
  id: string;
  title: string;
  description: string;
  company_name: string;
  industry: string;
  revenue: string;
  ebitda: string;
  location: string;
  status: 'active' | 'archived' | 'draft';
  created_at: string;
}

const DealsList = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDeals = async () => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeals(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching deals",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'archived':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  const handleArchiveDeal = async (dealId: string) => {
    try {
      const { error } = await supabase
        .from('deals')
        .update({ status: 'archived' })
        .eq('id', dealId);

      if (error) throw error;

      toast({
        title: "Deal archived",
        description: "The deal has been archived successfully.",
      });

      fetchDeals();
    } catch (error: any) {
      toast({
        title: "Error archiving deal",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-[#0A0F0F] border-[#D4AF37]/30 animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-[#1A1F2E] rounded mb-4"></div>
              <div className="h-4 bg-[#1A1F2E] rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-[#1A1F2E] rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#FAFAFA]">Deals Management</h1>
          <p className="text-[#F4E4BC] mt-2">Create and manage your investment opportunities</p>
        </div>
        {/* Create Deal button will be handled elsewhere */}
      </div>

      <div className="grid gap-6">
        {deals.length === 0 ? (
          <Card className="bg-[#0A0F0F] border-[#D4AF37]/30">
            <CardContent className="p-12 text-center">
              <Building2 className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#FAFAFA] mb-2">No deals yet</h3>
              <p className="text-[#F4E4BC] mb-6">Get started by creating your first investment opportunity.</p>
              {/* Create Deal button will be handled elsewhere */}
            </CardContent>
          </Card>
        ) : (
          deals.map((deal) => (
            <Card key={deal.id} className="bg-[#0A0F0F] border-[#D4AF37]/30 hover:bg-[#0F1415] transition-colors">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-[#FAFAFA] mb-2">{deal.title}</CardTitle>
                    <CardDescription className="text-[#F4E4BC]">
                      {deal.description || 'No description provided'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(deal.status)}>
                      {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-[#F4E4BC] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleArchiveDeal(deal.id)}
                        className="text-[#F4E4BC] hover:text-yellow-400 hover:bg-yellow-400/10"
                      >
                        <Archive className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#D4AF37]" />
                    <div>
                      <p className="text-sm text-[#F4E4BC]/70">Company</p>
                      <p className="text-[#FAFAFA] font-medium">{deal.company_name}</p>
                    </div>
                  </div>
                  
                  {deal.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#D4AF37]" />
                      <div>
                        <p className="text-sm text-[#F4E4BC]/70">Location</p>
                        <p className="text-[#FAFAFA] font-medium">{deal.location}</p>
                      </div>
                    </div>
                  )}
                  
                  {deal.revenue && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-[#D4AF37]" />
                      <div>
                        <p className="text-sm text-[#F4E4BC]/70">Revenue</p>
                        <p className="text-[#FAFAFA] font-medium">{deal.revenue}</p>
                      </div>
                    </div>
                  )}
                  
                  {deal.industry && (
                    <div>
                      <p className="text-sm text-[#F4E4BC]/70">Industry</p>
                      <Badge variant="outline" className="border-[#D4AF37]/30 text-[#F4E4BC]">
                        {deal.industry}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default DealsList;