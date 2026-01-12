import React, { useState, useMemo } from 'react';
import { Send, Clock, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DataRoomFolder, DataRoomDocument } from '@/hooks/useDataRoom';
import { cn } from '@/lib/utils';

interface FolderWithCount extends DataRoomFolder {
  documentCount: number;
}

interface DataRoomSubmitForReviewProps {
  dealId: string;
  approvalStatus?: string | null;
  isOwner: boolean;
  folders: DataRoomFolder[];
  documents: DataRoomDocument[];
  onRefresh: () => void;
}

export const DataRoomSubmitForReview: React.FC<DataRoomSubmitForReviewProps> = ({
  dealId,
  approvalStatus,
  isOwner,
  folders,
  documents,
  onRefresh,
}) => {
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitNotes, setSubmitNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate folder document counts
  const foldersWithCounts: FolderWithCount[] = useMemo(() => {
    return folders.map(folder => ({
      ...folder,
      documentCount: documents.filter(doc => doc.folder_id === folder.id).length,
    }));
  }, [folders, documents]);

  // Calculate completion metrics
  const completedFolders = foldersWithCounts.filter(f => f.documentCount > 0).length;
  const totalFolders = foldersWithCounts.length;
  const completionPercent = totalFolders > 0 ? Math.round((completedFolders / totalFolders) * 100) : 0;

  const handleSubmitForReview = async () => {
    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('deals')
        .update({
          approval_status: 'under_review',
          submitted_for_review_at: new Date().toISOString(),
        })
        .eq('id', dealId);

      if (error) throw error;

      toast.success('Submitted for review!');
      setShowSubmitModal(false);
      setSubmitNotes('');
      onRefresh();
    } catch (error) {
      toast.error('Failed to submit for review');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render anything if not owner
  if (!isOwner) return null;

  // Show status badge if under review
  if (approvalStatus === 'under_review') {
    return (
      <Badge className="px-3 py-1.5 bg-primary/10 text-primary border-primary/30">
        <Clock className="w-3.5 h-3.5 mr-1.5" />
        Under Review
      </Badge>
    );
  }

  // Show approved badge if approved
  if (approvalStatus === 'approved' || approvalStatus === 'active') {
    return (
      <Badge className="px-3 py-1.5 bg-success/10 text-success border-success/30">
        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
        Approved
      </Badge>
    );
  }

  // Show submit button if draft or needs_revision
  if (approvalStatus === 'draft' || approvalStatus === 'needs_revision' || !approvalStatus) {
    return (
      <>
        <Button
          size="sm"
          onClick={() => setShowSubmitModal(true)}
          className="gap-2 bg-success hover:bg-success/90"
          disabled={completionPercent < 80}
          title={completionPercent < 80 ? 'Data room must be at least 80% complete' : 'Submit for admin review'}
        >
          <Send className="h-4 w-4" />
          Submit for Review
        </Button>

        <Dialog open={showSubmitModal} onOpenChange={setShowSubmitModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Submit Data Room for Review</DialogTitle>
              <DialogDescription>
                Submit this data room to admin for approval. Once approved, it will be available for buyer access.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Completion Check */}
              {completionPercent < 80 ? (
                <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-warning mb-1">
                        Incomplete Data Room
                      </p>
                      <p className="text-xs text-warning/80 mb-2">
                        Data room is only {completionPercent}% complete. Recommend at least 80% before submitting.
                      </p>
                      <p className="text-xs text-warning/80">
                        Missing folders: {foldersWithCounts.filter(f => f.documentCount === 0).length}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-success/10 border border-success/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-success mb-1">
                        Ready to Submit
                      </p>
                      <p className="text-xs text-success/80">
                        {completedFolders} of {totalFolders} folders complete ({completionPercent}%)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Checklist */}
              <div className="border border-border rounded-lg p-4 max-h-60 overflow-y-auto">
                <p className="text-sm font-semibold text-foreground mb-3">
                  Folder Completion
                </p>
                <div className="space-y-2">
                  {foldersWithCounts.map(folder => (
                    <div key={folder.id} className="flex items-center gap-2 text-sm">
                      {folder.documentCount > 0 ? (
                        <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
                      )}
                      <span className={cn(
                        folder.documentCount > 0 ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {folder.name}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {folder.documentCount} docs
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optional notes to admin */}
              <div>
                <Label htmlFor="submit-notes">Notes for Admin (Optional)</Label>
                <Textarea
                  id="submit-notes"
                  placeholder="Add any context for the reviewer..."
                  value={submitNotes}
                  onChange={(e) => setSubmitNotes(e.target.value)}
                  rows={3}
                  className="mt-1.5"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSubmitModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitForReview}
                className="bg-success hover:bg-success/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit for Review'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return null;
};
