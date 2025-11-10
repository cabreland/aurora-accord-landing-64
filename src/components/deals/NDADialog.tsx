import React, { useState, useEffect } from 'react';
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
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCompanyNDA } from '@/hooks/useCompanyNDA';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const [signature, setSignature] = useState('');
  const [signerName, setSignerName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [signerCompany, setSignerCompany] = useState('');
  const { acceptNDA } = useCompanyNDA(companyId);

  // Auto-populate signer information from profile
  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('user_id', user.id)
        .single();
      
      if (profile) {
        const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
        setSignerName(fullName || profile.email);
        setSignerEmail(profile.email);
        setSignature(fullName || profile.email);
      }
    };
    if (open) {
      loadProfile();
    }
  }, [open]);

  const handleAccept = async () => {
    if (!signature.trim()) {
      toast.error('Please provide your signature');
      return;
    }

    setAccepting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get IP address
      let ipAddress = null;
      try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        ipAddress = data.ip;
      } catch (e) {
        console.error('Failed to get IP:', e);
      }

      // Get full NDA content
      const ndaContent = document.querySelector('.nda-content')?.textContent || '';

      const ndaRecord = {
        user_id: user.id,
        company_id: companyId,
        accepted_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days
        signature: signature.trim(),
        signer_name: signerName,
        signer_email: signerEmail,
        signer_company: signerCompany || null,
        ip_address: ipAddress,
        user_agent: navigator.userAgent,
        nda_content: ndaContent,
        status: 'active'
      };

      const { error } = await supabase
        .from('company_nda_acceptances')
        .insert(ndaRecord);

      if (error) throw error;

      toast.success('NDA signed successfully!');
      setAgreed(false);
      setSignature('');
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error signing NDA:', error);
      toast.error(error.message || 'Failed to sign NDA');
    } finally {
      setAccepting(false);
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

        {/* Signer Information */}
        <div className="bg-muted rounded-lg p-4">
          <h3 className="font-semibold mb-3">Signer Information</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Name</p>
              <p className="font-medium">{signerName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{signerEmail}</p>
            </div>
            {signerCompany && (
              <div>
                <p className="text-muted-foreground">Company</p>
                <p className="font-medium">{signerCompany}</p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground">Date</p>
              <p className="font-medium">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        
        <ScrollArea className="h-[300px] w-full rounded border p-4">
          <div className="nda-content space-y-4 text-sm">
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

        {/* Electronic Signature */}
        <div className="space-y-2">
          <Label htmlFor="signature">Electronic Signature *</Label>
          <p className="text-sm text-muted-foreground">
            Type your full legal name to sign electronically. This has the same legal effect as a handwritten signature.
          </p>
          <Input
            id="signature"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            placeholder="Type your full name"
            className="text-lg font-serif"
          />
          <p className="text-xs text-muted-foreground">
            Signed on {new Date().toLocaleString()} • IP and browser info will be recorded
          </p>
        </div>

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
            disabled={!agreed || !signature.trim() || accepting}
          >
            {accepting ? "Signing..." : "Accept & Sign NDA"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
