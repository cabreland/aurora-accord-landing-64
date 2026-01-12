import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, FileText, FolderOpen, ArrowRight } from 'lucide-react';

interface DealSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealId: string;
  dealName: string;
  industry?: string;
  askingPrice?: string;
  createdDueDiligence: boolean;
  createdDataRoom: boolean;
}

export const DealSuccessModal: React.FC<DealSuccessModalProps> = ({
  open,
  onOpenChange,
  dealId,
  dealName,
  industry,
  askingPrice,
  createdDueDiligence,
  createdDataRoom
}) => {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            Deal Created Successfully!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Deal Info */}
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="font-semibold text-green-900 dark:text-green-100 mb-2">{dealName}</p>
            {(industry || askingPrice) && (
              <p className="text-sm text-green-700 dark:text-green-300">
                {[industry, askingPrice].filter(Boolean).join(' • ')}
              </p>
            )}
          </div>

          {/* What was created */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">What was created:</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Deal record
              </div>
              {createdDueDiligence && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Due Diligence Tracker (10 categories, 50+ requests)
                </div>
              )}
              {createdDataRoom && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Data Room (11 folders, ready for uploads)
                </div>
              )}
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <p className="text-xs font-semibold text-foreground mb-1">Next Steps:</p>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              {createdDataRoom && <li>Upload documents to data room folders</li>}
              {createdDueDiligence && <li>Begin tracking seller responses to requests</li>}
              <li>Submit data room for approval when 80%+ complete</li>
              <li>Start buyer outreach after approval</li>
            </ol>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleNavigate(`/deals`)}
            className="w-full sm:w-auto"
          >
            Back to Deals
          </Button>
          
          {createdDueDiligence && (
            <Button 
              variant="outline"
              onClick={() => handleNavigate(`/dashboard/diligence-tracker/${dealId}`)}
              className="w-full sm:w-auto"
            >
              <FileText className="w-4 h-4 mr-2" />
              Open Diligence Tracker
            </Button>
          )}
          
          {createdDataRoom && (
            <Button 
              variant="outline"
              onClick={() => handleNavigate(`/data-room/${dealId}`)}
              className="w-full sm:w-auto"
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              Open Data Room
            </Button>
          )}
          
          <Button 
            onClick={() => handleNavigate(`/deals/${dealId}`)}
            className="w-full sm:w-auto"
          >
            View Deal
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
