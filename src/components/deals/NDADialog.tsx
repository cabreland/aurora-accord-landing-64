import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCompanyNDA } from '@/hooks/useCompanyNDA';

interface NDADialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  companyName?: string;
  onSuccess?: () => void;
}

export const NDADialog: React.FC<NDADialogProps> = ({
  open,
  onOpenChange,
  companyId,
  companyName = "this company",
  onSuccess
}) => {
  const [agreed, setAgreed] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const { acceptNDA } = useCompanyNDA(companyId);

  const handleAccept = async () => {
    setAccepting(true);
    const result = await acceptNDA();
    setAccepting(false);
    
    if (result.success) {
      setAgreed(false);
      onOpenChange(false);
      onSuccess?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Non-Disclosure Agreement</DialogTitle>
          <DialogDescription>
            Please review and accept the NDA to access confidential documents for {companyName}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[400px] w-full rounded border p-4">
          <div className="space-y-4 text-sm">
            <h3 className="font-semibold text-lg">CONFIDENTIAL INFORMATION MEMORANDUM</h3>
            
            <p>
              This Non-Disclosure Agreement ("Agreement") is entered into as of the date of acceptance
              by and between the undersigned recipient ("Recipient") and the disclosing party ("Discloser").
            </p>

            <h4 className="font-semibold mt-4">1. Definition of Confidential Information</h4>
            <p>
              "Confidential Information" means all information, whether written or oral, disclosed by
              Discloser to Recipient, including but not limited to business plans, financial information,
              customer lists, technical data, trade secrets, and any other proprietary information
              relating to {companyName}.
            </p>

            <h4 className="font-semibold mt-4">2. Obligations of Recipient</h4>
            <p>
              Recipient agrees to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Hold and maintain the Confidential Information in strict confidence</li>
              <li>Not disclose the Confidential Information to any third parties</li>
              <li>Use the Confidential Information solely for evaluation purposes</li>
              <li>Protect the Confidential Information with the same degree of care used for own confidential information</li>
            </ul>

            <h4 className="font-semibold mt-4">3. Term</h4>
            <p>
              This Agreement shall remain in effect for a period of three (3) years from the date
              of acceptance, unless terminated earlier by mutual written agreement.
            </p>

            <h4 className="font-semibold mt-4">4. Return of Materials</h4>
            <p>
              Upon request by Discloser, Recipient shall promptly return or destroy all Confidential
              Information and certify in writing that all such materials have been returned or destroyed.
            </p>

            <h4 className="font-semibold mt-4">5. No License</h4>
            <p>
              Nothing in this Agreement grants Recipient any rights or licenses to use the Confidential
              Information except as expressly set forth herein.
            </p>

            <h4 className="font-semibold mt-4">6. Governing Law</h4>
            <p>
              This Agreement shall be governed by and construed in accordance with the laws of the
              applicable jurisdiction, without regard to its conflict of law provisions.
            </p>
          </div>
        </ScrollArea>

        <div className="flex items-start space-x-3 rounded-lg border p-4">
          <Checkbox
            id="nda-agree"
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked as boolean)}
          />
          <div className="space-y-1">
            <Label
              htmlFor="nda-agree"
              className="text-sm font-medium leading-none cursor-pointer"
            >
              I have read and agree to the terms of this Non-Disclosure Agreement
            </Label>
            <p className="text-sm text-muted-foreground">
              By checking this box, you are entering into a legally binding agreement
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={accepting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!agreed || accepting}
          >
            {accepting ? "Accepting..." : "Accept & Sign NDA"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
