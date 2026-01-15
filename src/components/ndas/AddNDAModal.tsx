import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, FileText } from 'lucide-react';

interface AddNDAModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddNDAModal({ open, onOpenChange, onSuccess }: AddNDAModalProps) {
  const [signerName, setSignerName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [signerCompany, setSignerCompany] = useState('');
  const [ndaType, setNdaType] = useState<'mutual' | 'deal_specific'>('mutual');
  const [selectedDeal, setSelectedDeal] = useState('');
  const [accessTier, setAccessTier] = useState('1');
  const [signedDate, setSignedDate] = useState(new Date().toISOString().split('T')[0]);
  const [expirationDate, setExpirationDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 60);
    return date.toISOString().split('T')[0];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get available deals/companies
  const { data: companies } = useQuery({
    queryKey: ['companies-for-nda'],
    queryFn: async () => {
      const { data } = await supabase
        .from('companies')
        .select('id, name')
        .eq('is_published', true)
        .order('name');
      return data || [];
    }
  });

  const resetForm = () => {
    setSignerName('');
    setSignerEmail('');
    setSignerCompany('');
    setNdaType('mutual');
    setSelectedDeal('');
    setAccessTier('1');
    setSignedDate(new Date().toISOString().split('T')[0]);
    const date = new Date();
    date.setDate(date.getDate() + 60);
    setExpirationDate(date.toISOString().split('T')[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signerName || !signerEmail) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (ndaType === 'deal_specific' && !selectedDeal) {
      toast.error('Please select a deal');
      return;
    }

    setIsSubmitting(true);

    try {
      // We need to get or create a user for this NDA
      // For now, we'll create the record with the signer info
      const { error } = await supabase
        .from('company_nda_acceptances')
        .insert({
          // Note: user_id would need to be linked to an actual user
          // For manual NDA entry, we might need a different approach
          user_id: (await supabase.auth.getUser()).data.user?.id || '',
          company_id: ndaType === 'deal_specific' ? selectedDeal : companies?.[0]?.id || '',
          signer_name: signerName,
          signer_email: signerEmail,
          signer_company: signerCompany || null,
          signature: signerName, // Use name as signature for manual entry
          accepted_at: new Date(signedDate).toISOString(),
          expires_at: new Date(expirationDate).toISOString(),
          status: 'active',
          nda_content: `Manually recorded NDA for ${signerName}`
        });

      if (error) throw error;

      toast.success('NDA added successfully');
      resetForm();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding NDA:', error);
      toast.error('Failed to add NDA');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Add New NDA
          </DialogTitle>
          <DialogDescription>
            Record a new signed NDA and grant buyer access
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Signer Information */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Signer Information</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input 
                  id="name"
                  placeholder="John Smith"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input 
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={signerEmail}
                  onChange={(e) => setSignerEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company (Optional)</Label>
              <Input 
                id="company"
                placeholder="Acme Capital LLC"
                value={signerCompany}
                onChange={(e) => setSignerCompany(e.target.value)}
              />
            </div>
          </div>

          {/* NDA Type */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">NDA Type</Label>
            <RadioGroup value={ndaType} onValueChange={(val) => setNdaType(val as 'mutual' | 'deal_specific')}>
              <div className="space-y-3">
                <div className={`flex items-start space-x-3 p-4 border rounded-lg transition-colors ${ndaType === 'mutual' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <RadioGroupItem value="mutual" id="mutual" />
                  <label htmlFor="mutual" className="cursor-pointer flex-1">
                    <div className="font-medium">Mutual NDA (Portfolio Access)</div>
                    <div className="text-sm text-muted-foreground">
                      Access to all portfolio deals (anonymous CIMs) - Layer 1
                    </div>
                  </label>
                </div>
                <div className={`flex items-start space-x-3 p-4 border rounded-lg transition-colors ${ndaType === 'deal_specific' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  <RadioGroupItem value="deal_specific" id="deal-specific" />
                  <label htmlFor="deal-specific" className="cursor-pointer flex-1">
                    <div className="font-medium">Deal-Specific NDA</div>
                    <div className="text-sm text-muted-foreground">
                      Access to specific deal's data room - Layer 2/3
                    </div>
                  </label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Deal Selection (if deal-specific) */}
          {ndaType === 'deal_specific' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deal">Select Deal *</Label>
                <Select value={selectedDeal} onValueChange={setSelectedDeal}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a deal" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies?.map(company => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tier">Access Tier</Label>
                <Select value={accessTier} onValueChange={setAccessTier}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose access level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">
                      Layer 2 - Data Room (No LOI Folders)
                    </SelectItem>
                    <SelectItem value="3">
                      Layer 3 - Full Access (Requires LOI + Deposit)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="signed">Signed Date *</Label>
              <Input 
                id="signed"
                type="date"
                value={signedDate}
                onChange={(e) => setSignedDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expires">Expiration Date *</Label>
              <Input 
                id="expires"
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Default: 60 days from signed date
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add NDA
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
