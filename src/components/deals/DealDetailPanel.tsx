import React, { useState, useEffect } from 'react';
import { X, FileText, Upload, MoreVertical, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { MyDeal } from '@/hooks/useMyDeals';
import { useToast } from '@/hooks/use-toast';
import { DealEditModal } from './DealEditModal';

interface DealDetailPanelProps {
  dealId: string;
  onClose: () => void;
  onDealUpdated: () => void;
}

export const DealDetailPanel: React.FC<DealDetailPanelProps> = ({
  dealId,
  onClose,
  onDealUpdated
}) => {
  const [deal, setDeal] = useState<MyDeal | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDeal();
  }, [dealId]);

  const fetchDeal = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('id', dealId)
        .single();

      if (error) throw error;
      setDeal(data as MyDeal);
    } catch (error: any) {
      console.error('Error fetching deal:', error);
      toast({
        title: "Error",
        description: "Failed to load deal details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'draft': return 'secondary';
      case 'archived': return 'outline';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="fixed right-0 top-0 h-full w-96 bg-background border-l border-border shadow-lg z-50">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
        <div className="p-4 space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="fixed right-0 top-0 h-full w-96 bg-background border-l border-border shadow-lg z-50">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Deal not found</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-background border-l border-border shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">Deal Details</h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <ExternalLink className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium text-foreground truncate" title={deal.title}>
            {deal.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {deal.company_name}
          </p>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusVariant(deal.status)}>
              {deal.status}
            </Badge>
            {deal.priority && (
              <Badge variant="outline">
                {deal.priority} priority
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <Tabs defaultValue="overview" className="w-full">
          <div className="px-4 pt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="documents">
                <FileText className="w-4 h-4 mr-1" />
                Docs
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-4">
            <TabsContent value="overview" className="space-y-4">
              {/* Key Metrics */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Key Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {deal.revenue && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Revenue</span>
                      <span className="text-sm font-medium">{deal.revenue}</span>
                    </div>
                  )}
                  {deal.ebitda && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">EBITDA</span>
                      <span className="text-sm font-medium">{deal.ebitda}</span>
                    </div>
                  )}
                  {deal.industry && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Industry</span>
                      <span className="text-sm font-medium">{deal.industry}</span>
                    </div>
                  )}
                  {deal.location && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Location</span>
                      <span className="text-sm font-medium">{deal.location}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Deal Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Deal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span className="text-sm font-medium">
                      {new Date(deal.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Last Updated</span>
                    <span className="text-sm font-medium">
                      {new Date(deal.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  {deal.stage && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Stage</span>
                      <span className="text-sm font-medium">{deal.stage}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  onClick={() => setShowEditModal(true)}
                >
                  Edit Deal
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(`/deal/${deal.id}`, '_blank')}
                >
                  View Deal Details
                </Button>
              </div>

              {/* Edit Modal */}
              {showEditModal && deal && (
                <DealEditModal
                  deal={deal}
                  open={showEditModal}
                  onClose={() => setShowEditModal(false)}
                  onSaved={() => {
                    setShowEditModal(false);
                    fetchDeal();
                    onDealUpdated();
                  }}
                />
              )}
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <div className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={() => window.open(`/documents?deal=${deal.id}`, '_blank')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Open Document Manager
                </Button>
                
                <div className="text-center text-sm text-muted-foreground">
                  Click above to access the full document management interface for this deal
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};