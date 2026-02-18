import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreVertical, Building2, ArrowUpDown, Pencil, Archive, Trash2 } from 'lucide-react';
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
import { MyDeal } from '@/hooks/useMyDeals';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DealListViewProps {
  deals: MyDeal[];
  loading: boolean;
  onDealSelect: (dealId: string | null) => void;
  selectedDealId: string | null;
  onDealDeleted?: () => void;
}

export const DealListView: React.FC<DealListViewProps> = ({
  deals,
  loading,
  onDealSelect,
  selectedDealId,
  onDealDeleted,
}) => {
  const { isAdmin } = useUserProfile();
  const { toast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<MyDeal | null>(null);
  const [deleting, setDeleting] = useState(false);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'draft': return 'secondary';
      case 'archived': return 'outline';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleArchive = async (deal: MyDeal, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase.from('deals').update({ status: 'archived' as any }).eq('id', deal.id);
      if (error) throw error;
      toast({ title: "Deal archived", description: `"${deal.title}" has been archived.` });
      onDealDeleted?.();
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to archive deal.", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const { error } = await supabase.from('deals').delete().eq('id', deleteTarget.id);
      if (error) throw error;
      toast({ title: "Deal deleted", description: `"${deleteTarget.title}" has been permanently deleted.` });
      onDealDeleted?.();
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to delete deal. You may not have permission.", variant: "destructive" });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <div className="p-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border-b last:border-b-0">
                <div className="flex items-center gap-4 flex-1">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <Building2 className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No deals found</h3>
        <p className="text-muted-foreground max-w-md">
          No deals match your current filters. Try adjusting your search criteria or create a new deal.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        {/* Table Header */}
        <div className="border-b border-border bg-muted/30">
          <div className="grid grid-cols-12 gap-4 p-4 text-sm font-medium text-muted-foreground">
            <div className="col-span-3 flex items-center gap-1">
              Deal Title
              <ArrowUpDown className="w-3 h-3" />
            </div>
            <div className="col-span-2">Company</div>
            <div className="col-span-1">Industry</div>
            <div className="col-span-1">Revenue</div>
            <div className="col-span-1">EBITDA</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Priority</div>
            <div className="col-span-1">Updated</div>
            <div className="col-span-1"></div>
          </div>
        </div>

        {/* Table Body */}
        <div>
          {deals.map((deal) => (
            <div
              key={deal.id}
              className={`grid grid-cols-12 gap-4 p-4 border-b last:border-b-0 hover:bg-muted/30 cursor-pointer transition-colors ${
                selectedDealId === deal.id ? 'bg-muted/50 border-l-4 border-l-primary' : ''
              }`}
              onClick={() => onDealSelect(deal.id)}
            >
              <div className="col-span-3">
                <div className="font-medium text-foreground truncate" title={deal.company_name}>
                  {deal.company_name}
                </div>
                <div className="text-xs text-muted-foreground truncate" title={deal.title}>
                  {deal.title}
                </div>
              </div>

              <div className="col-span-2">
                <div className="text-sm text-muted-foreground truncate" title={(deal as any).deal_status || deal.status}>
                  {(deal as any).deal_status ? (
                    <span className="capitalize">{String((deal as any).deal_status).replace(/_/g, ' ')}</span>
                  ) : (
                    <span>{deal.status}</span>
                  )}
                </div>
              </div>

              <div className="col-span-1">
                <div className="text-sm text-muted-foreground truncate">
                  {deal.industry || '-'}
                </div>
              </div>

              <div className="col-span-1">
                <div className="text-sm font-medium truncate" title={deal.revenue}>
                  {deal.revenue || '-'}
                </div>
              </div>

              <div className="col-span-1">
                <div className="text-sm font-medium truncate" title={deal.ebitda}>
                  {deal.ebitda || '-'}
                </div>
              </div>

              <div className="col-span-1">
                <Badge variant={getStatusVariant(deal.status)} className="text-xs">
                  {deal.status}
                </Badge>
              </div>

              <div className="col-span-1">
                {deal.priority ? (
                  <Badge variant="outline" className={`text-xs ${getPriorityColor(deal.priority)}`}>
                    {deal.priority}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </div>

              <div className="col-span-1">
                <div className="text-xs text-muted-foreground">
                  {new Date(deal.updated_at).toLocaleDateString()}
                </div>
              </div>

              <div className="col-span-1 flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDealSelect(deal.id); }}>
                      <Pencil className="w-4 h-4 mr-2" />
                      View / Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => handleArchive(deal, e)}>
                      <Archive className="w-4 h-4 mr-2" />
                      Archive Deal
                    </DropdownMenuItem>
                    {isAdmin() && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(deal); }}
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
          ))}
        </div>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this deal?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteTarget?.title}</strong> and all associated data. This action cannot be undone.
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
    </div>
  );
};
