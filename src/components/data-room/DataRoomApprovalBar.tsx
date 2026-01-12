import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { DataRoomFolder, DataRoomDocument } from '@/hooks/useDataRoom';

interface DataRoomApprovalBarProps {
  dealId: string;
  deal: {
    approval_status?: string | null;
    submitted_for_review_at?: string | null;
    created_by?: string;
  };
  folders: DataRoomFolder[];
  documents: DataRoomDocument[];
  ownerName?: string;
  onRefresh: () => void;
}

export const DataRoomApprovalBar: React.FC<DataRoomApprovalBarProps> = ({
  dealId,
  deal,
  folders,
  documents,
  ownerName = 'Broker',
  onRefresh,
}) => {
  const { toast } = useToast();
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [revisionNotes, setRevisionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate folder completion
  const getFolderDocumentCount = (folderId: string) => {
    return documents.filter((d) => d.folder_id === folderId).length;
  };

  const completedFolders = folders.filter(f => getFolderDocumentCount(f.id) > 0).length;
  const totalFolders = folders.length;
  const completionPercent = totalFolders > 0 ? Math.round((completedFolders / totalFolders) * 100) : 0;

  const handleApproveDataRoom = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('deals')
        .update({
          approval_status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user.id,
          approval_notes: approvalNotes || null,
        })
        .eq('id', dealId);

      if (error) throw error;

      toast({
        title: 'Data room approved!',
        description: 'The data room is now live and accessible to buyers.',
      });
      setShowApprovalModal(false);
      setApprovalNotes('');
      onRefresh();
    } catch (error) {
      console.error('Failed to approve:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve data room',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestRevisions = async () => {
    if (!revisionNotes.trim()) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('deals')
        .update({
          approval_status: 'needs_revision',
          revision_requested_at: new Date().toISOString(),
          revision_notes: revisionNotes,
        })
        .eq('id', dealId);

      if (error) throw error;

      toast({
        title: 'Revision request sent',
        description: 'The broker will be notified of the required changes.',
      });
      setShowRevisionModal(false);
      setRevisionNotes('');
      onRefresh();
    } catch (error) {
      console.error('Failed to request revisions:', error);
      toast({
        title: 'Error',
        description: 'Failed to send revision request',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Only show for under_review status
  if (deal.approval_status !== 'under_review') {
    return null;
  }

  return (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Review Status */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-blue-900">
                Pending Your Approval
              </p>
              <p className="text-xs text-blue-700">
                Submitted by {ownerName}
                {deal.submitted_for_review_at && (
                  <> on {format(new Date(deal.submitted_for_review_at), 'MMM d, yyyy')}</>
                )}
              </p>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowRevisionModal(true)}
              className="gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Request Revisions
            </Button>
            
            <Button
              onClick={() => setShowApprovalModal(true)}
              className="gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve & Go Live
            </Button>
          </div>
        </div>

        {/* Completion Checklist */}
        <div className="mt-4 bg-white border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-foreground">
              Review Checklist
            </p>
            <Badge variant="outline" className="text-xs">
              {completedFolders} of {totalFolders} folders ({completionPercent}%)
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {folders.map(folder => {
              const docCount = getFolderDocumentCount(folder.id);
              const hasDocuments = docCount > 0;
              
              return (
                <div 
                  key={folder.id}
                  className="flex items-center gap-2 text-sm"
                >
                  {hasDocuments ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  )}
                  <span className={cn(
                    "truncate flex-1",
                    hasDocuments ? "text-foreground" : "text-orange-600"
                  )}>
                    {folder.name}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    ({docCount})
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Data Room & Go Live</DialogTitle>
            <DialogDescription>
              This will mark the data room as approved and make it available for buyer access based on NDA tiers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-900 mb-1">
                    Ready to Go Live
                  </p>
                  <p className="text-xs text-green-700">
                    {completedFolders} of {totalFolders} folders complete ({completionPercent}%)
                  </p>
                </div>
              </div>
            </div>
            {/* Optional notes */}
            <div>
              <Label htmlFor="approval-notes">Admin Notes (Optional)</Label>
              <Textarea
                id="approval-notes"
                placeholder="Add any notes about this approval..."
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleApproveDataRoom}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmitting ? 'Approving...' : 'Approve & Go Live'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Revisions Modal */}
      <Dialog open={showRevisionModal} onOpenChange={setShowRevisionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Revisions</DialogTitle>
            <DialogDescription>
              Send this data room back to the broker for corrections or additional documents.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="revision-notes">What needs to be fixed? *</Label>
              <Textarea
                id="revision-notes"
                placeholder="Be specific about what needs revision..."
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                rows={5}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                This message will be sent to the deal owner.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRevisionModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRequestRevisions}
              disabled={!revisionNotes.trim() || isSubmitting}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isSubmitting ? 'Sending...' : 'Send Revision Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
