import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAccessRequest } from '@/hooks/useAccessRequest';
import { AccessLevel } from '@/hooks/useCompanyNDA';

interface AccessRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  currentLevel: AccessLevel;
  onSuccess?: () => void;
}

const ACCESS_LEVEL_LABELS: Record<AccessLevel, string> = {
  public: 'Public',
  teaser: 'Teaser',
  cim: 'CIM Access',
  financials: 'Financial Access',
  full: 'Full Access'
};

export const AccessRequestDialog: React.FC<AccessRequestDialogProps> = ({
  open,
  onOpenChange,
  companyId,
  currentLevel,
  onSuccess
}) => {
  const [requestedLevel, setRequestedLevel] = useState<AccessLevel>('cim');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { submitRequest } = useAccessRequest();

  const getAvailableLevels = (): AccessLevel[] => {
    const hierarchy: AccessLevel[] = ['public', 'teaser', 'cim', 'financials', 'full'];
    const currentIndex = hierarchy.indexOf(currentLevel);
    return hierarchy.slice(currentIndex + 1);
  };

  const handleSubmit = async () => {
    if (!requestedLevel || !reason.trim()) return;

    setSubmitting(true);
    const result = await submitRequest(companyId, currentLevel, requestedLevel, reason);
    setSubmitting(false);

    if (result.success) {
      setReason('');
      setRequestedLevel('cim');
      onOpenChange(false);
      onSuccess?.();
    }
  };

  const availableLevels = getAvailableLevels();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Request Data Room Access</DialogTitle>
          <DialogDescription>
            Request higher access level to view more confidential documents
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Current Access Level</Label>
            <Badge variant="outline" className="text-sm">
              {ACCESS_LEVEL_LABELS[currentLevel]}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="requested-level">Requested Access Level</Label>
            <Select
              value={requestedLevel}
              onValueChange={(value) => setRequestedLevel(value as AccessLevel)}
            >
              <SelectTrigger id="requested-level">
                <SelectValue placeholder="Select access level" />
              </SelectTrigger>
              <SelectContent>
                {availableLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {ACCESS_LEVEL_LABELS[level]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {requestedLevel === 'cim' && 'Access to Confidential Information Memorandum'}
              {requestedLevel === 'financials' && 'Access to detailed financial statements'}
              {requestedLevel === 'full' && 'Access to all documents including legal and due diligence'}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Request</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why you need this access level..."
              rows={4}
              className="resize-none"
            />
            <p className="text-sm text-muted-foreground">
              Provide details about your interest and evaluation process
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!requestedLevel || !reason.trim() || submitting}
          >
            {submitting ? "Submitting..." : "Submit Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
