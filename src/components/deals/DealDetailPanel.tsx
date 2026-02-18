import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, MoreVertical, ExternalLink, Pencil, Archive, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { MyDeal } from '@/hooks/useMyDeals';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';
import { DealEditModal } from './DealEditModal';
import { cn } from '@/lib/utils';

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
  const navigate = useNavigate();
  const [deal, setDeal] = useState<MyDeal | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();
  const { isAdmin } = useUserProfile();

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

  const handleDelete = async () => {
    if (!deal) return;
    try {
      setDeleting(true);
      const { error } = await supabase.from('deals').delete().eq('id', deal.id);
      if (error) throw error;
      toast({ title: "Deal deleted", description: `"${deal.title}" has been permanently deleted.` });
      onClose();
      onDealUpdated();
    } catch (error: any) {
      console.error('Error deleting deal:', error);
      toast({ title: "Error", description: "Failed to delete deal. You may not have permission.", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const handleArchive = async () => {
    if (!deal) return;
    try {
      const { error } = await supabase.from('deals').update({ status: 'archived' as any }).eq('id', deal.id);
      if (error) throw error;
      toast({ title: "Deal archived", description: `"${deal.title}" has been archived.` });
      fetchDeal();
      onDealUpdated();
    } catch (error: any) {
      console.error('Error archiving deal:', error);
      toast({ title: "Error", description: "Failed to archive deal.", variant: "destructive" });
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

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-0 bg-card border border-border shadow-xl">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : !deal ? (
          <div className="p-6">
            <p className="text-muted-foreground">Deal not found</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <DialogHeader className="p-6 pb-4 border-b border-border bg-secondary/30">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <DialogTitle className="text-xl font-semibold text-foreground">
                    {deal.title}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    {deal.company_name}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusVariant(deal.status)} className="capitalize">
                      {deal.status}
                    </Badge>
                    {deal.priority && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "capitalize",
                          deal.priority === 'high' && "border-destructive/50 text-destructive bg-destructive/5",
                          deal.priority === 'medium' && "border-warning/50 text-warning bg-warning/5",
                          deal.priority === 'low' && "border-muted-foreground/50 text-muted-foreground"
                        )}
                      >
                        {deal.priority} priority
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/deals/${deal.id}`)}
                    title="Open Deal Workspace"
                    className="hover:bg-primary/10 hover:text-primary"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="hover:bg-muted">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => setShowEditModal(true)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit Deal
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleArchive}>
                        <Archive className="w-4 h-4 mr-2" />
                        Archive Deal
                      </DropdownMenuItem>
                      {isAdmin() && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setShowDeleteConfirm(true)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Deal
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </DialogHeader>

            {/* Content */}
            <div className="flex-1 overflow-auto bg-card">
              <Tabs defaultValue="overview" className="w-full">
                <div className="px-6 pt-4 bg-secondary/20">
                  <TabsList className="grid w-full grid-cols-2 bg-muted">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-card">Overview</TabsTrigger>
                    <TabsTrigger value="documents" className="data-[state=active]:bg-card">
                      <FileText className="w-4 h-4 mr-1" />
                      Docs
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="p-6 pt-4">
                  <TabsContent value="overview" className="space-y-4 mt-0">
                    {/* Key Metrics */}
                    <Card className="border border-border shadow-sm">
                      <CardHeader className="pb-3 border-b border-border/50 bg-secondary/20">
                        <CardTitle className="text-sm font-medium text-foreground">Key Metrics</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-4">
                        {deal.revenue && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Revenue</span>
                            <span className="text-sm font-semibold text-foreground">{deal.revenue}</span>
                          </div>
                        )}
                        {deal.ebitda && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">EBITDA</span>
                            <span className="text-sm font-semibold text-foreground">{deal.ebitda}</span>
                          </div>
                        )}
                        {deal.industry && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Industry</span>
                            <span className="text-sm font-semibold text-foreground">{deal.industry}</span>
                          </div>
                        )}
                        {deal.location && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Location</span>
                            <span className="text-sm font-semibold text-foreground">{deal.location}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Deal Information */}
                    <Card className="border border-border shadow-sm">
                      <CardHeader className="pb-3 border-b border-border/50 bg-secondary/20">
                        <CardTitle className="text-sm font-medium text-foreground">Deal Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Created</span>
                          <span className="text-sm font-semibold text-foreground">
                            {new Date(deal.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Last Updated</span>
                          <span className="text-sm font-semibold text-foreground">
                            {new Date(deal.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                        {(deal as any).current_stage && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Stage</span>
                            <span className="text-sm font-semibold text-foreground">{(deal as any).current_stage}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="space-y-2 pt-2">
                      <Button
                        className="w-full"
                        onClick={() => setShowEditModal(true)}
                      >
                        Edit Deal
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          onClose();
                          navigate(`/deals/${deal.id}`);
                        }}
                      >
                        Open Deal Workspace
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="documents" className="space-y-4 mt-0">
                    <div className="space-y-3">
                      <Button
                        className="w-full"
                        onClick={() => {
                          onClose();
                          navigate(`/deals/${deal.id}?tab=data-room`);
                        }}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Open Data Room
                      </Button>

                      <div className="text-center text-sm text-muted-foreground">
                        Click above to access the full document management interface for this deal
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </>
        )}

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

        {/* Delete Confirmation */}
        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this deal?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete <strong>{deal?.title}</strong> and all associated data. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? 'Deleting...' : 'Yes, delete deal'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
};
