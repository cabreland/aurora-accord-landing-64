import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCreateFinancingApplication, useLenders, FinancingType } from '@/hooks/useFinancing';
import { useDealBuyers, useCreateBuyer, useAttachBuyerToDeal, DealBuyer } from '@/hooks/useBuyers';
import { Search, Building2, DollarSign, Loader2, UserPlus, Users } from 'lucide-react';
import { toast } from 'sonner';

interface AddDealToFinancingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddDealToFinancingDialog: React.FC<AddDealToFinancingDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [search, setSearch] = useState('');
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [selectedDealBuyerId, setSelectedDealBuyerId] = useState<string | null>(null);
  const [selectedLenderId, setSelectedLenderId] = useState<string>('');
  const [financingType, setFinancingType] = useState<FinancingType>('sba_7a');
  const [loanAmount, setLoanAmount] = useState('');

  // New buyer inline form
  const [showNewBuyer, setShowNewBuyer] = useState(false);
  const [newBuyerName, setNewBuyerName] = useState('');
  const [newBuyerEmail, setNewBuyerEmail] = useState('');
  const [newBuyerPhone, setNewBuyerPhone] = useState('');
  const [newBuyerEntity, setNewBuyerEntity] = useState('');

  const { data: lenders = [] } = useLenders();
  const createApplication = useCreateFinancingApplication();
  const { data: dealBuyers = [], isLoading: buyersLoading } = useDealBuyers(selectedDealId);
  const createBuyer = useCreateBuyer();
  const attachBuyer = useAttachBuyerToDeal();

  const { data: availableDeals = [], isLoading: dealsLoading } = useQuery({
    queryKey: ['deals-for-financing', search],
    queryFn: async () => {
      let query = supabase
        .from('deals')
        .select('id, company_name, asking_price, status, industry')
        .order('created_at', { ascending: false });
      if (search) {
        query = query.ilike('company_name', `%${search}%`);
      }
      const { data, error } = await query.limit(20);
      if (error) throw error;
      return data || [];
    },
  });

  const selectedDeal = availableDeals.find(d => d.id === selectedDealId);

  const handleCreateAndAttachBuyer = async () => {
    if (!newBuyerName.trim() || !selectedDealId) return;
    try {
      const buyer = await createBuyer.mutateAsync({
        full_name: newBuyerName.trim(),
        email: newBuyerEmail.trim() || undefined,
        phone: newBuyerPhone.trim() || undefined,
        entity_name: newBuyerEntity.trim() || undefined,
      });
      const dealBuyer = await attachBuyer.mutateAsync({
        deal_id: selectedDealId,
        buyer_id: buyer.id,
      });
      setSelectedDealBuyerId(dealBuyer.id);
      setShowNewBuyer(false);
      setNewBuyerName('');
      setNewBuyerEmail('');
      setNewBuyerPhone('');
      setNewBuyerEntity('');
      toast.success('Buyer created and attached');
    } catch {
      // errors handled by mutation hooks
    }
  };

  const handleSubmit = async () => {
    if (!selectedDealId) {
      toast.error('Please select a deal');
      return;
    }
    if (!selectedDealBuyerId) {
      toast.error('Please select or add a buyer');
      return;
    }
    try {
      await createApplication.mutateAsync({
        deal_id: selectedDealId,
        deal_buyer_id: selectedDealBuyerId,
        lender_id: selectedLenderId || null,
        financing_type: financingType,
        loan_amount: loanAmount ? parseFloat(loanAmount) : null,
        stage: 'pre_qualification',
      });
      toast.success('Deal added to financing tracker');
      onOpenChange(false);
      resetForm();
    } catch {
      toast.error('Failed to add deal to financing');
    }
  };

  const resetForm = () => {
    setSearch('');
    setSelectedDealId(null);
    setSelectedDealBuyerId(null);
    setSelectedLenderId('');
    setFinancingType('sba_7a');
    setLoanAmount('');
    setShowNewBuyer(false);
    setNewBuyerName('');
    setNewBuyerEmail('');
    setNewBuyerPhone('');
    setNewBuyerEntity('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#D4AF37]" />
            Add Deal to Financing
          </DialogTitle>
          <DialogDescription>
            Select a deal and buyer to track in the financing module.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Deal Search */}
          <div className="space-y-2">
            <Label>Select Deal</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search deals..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="max-h-48 overflow-y-auto border border-border rounded-lg divide-y divide-border">
              {dealsLoading ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                  Loading deals...
                </div>
              ) : availableDeals.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">No deals found</div>
              ) : (
                availableDeals.map(deal => (
                  <button
                    key={deal.id}
                    onClick={() => { setSelectedDealId(deal.id); setSelectedDealBuyerId(null); }}
                    className={`w-full p-3 text-left hover:bg-accent/50 transition-colors ${
                      selectedDealId === deal.id ? 'bg-accent border-l-2 border-l-primary' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{deal.company_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {deal.industry || 'No industry'} • {deal.asking_price || 'No price'}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {selectedDeal && (
            <>
              {/* Buyer Selection */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> Select Buyer
                </Label>
                {buyersLoading ? (
                  <div className="text-sm text-muted-foreground"><Loader2 className="w-3 h-3 animate-spin inline mr-1" /> Loading buyers…</div>
                ) : dealBuyers.length > 0 ? (
                  <Select
                    value={selectedDealBuyerId || 'none'}
                    onValueChange={(v) => {
                      if (v === 'new') { setShowNewBuyer(true); setSelectedDealBuyerId(null); }
                      else if (v === 'none') { setSelectedDealBuyerId(null); }
                      else { setSelectedDealBuyerId(v); setShowNewBuyer(false); }
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Select a buyer" /></SelectTrigger>
                    <SelectContent>
                      {dealBuyers.map(db => (
                        <SelectItem key={db.id} value={db.id}>
                          {db.buyer?.full_name || 'Unknown'}{db.buyer?.entity_name ? ` (${db.buyer.entity_name})` : ''}
                        </SelectItem>
                      ))}
                      <SelectItem value="new">+ Add new buyer</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No buyers attached to this deal yet.
                    <Button variant="link" size="sm" className="ml-1 p-0 h-auto" onClick={() => setShowNewBuyer(true)}>
                      Add one
                    </Button>
                  </div>
                )}

                {/* New buyer inline form */}
                {showNewBuyer && (
                  <div className="border border-border rounded-lg p-3 space-y-3 bg-muted/30">
                    <p className="text-xs font-medium flex items-center gap-1.5"><UserPlus className="w-3.5 h-3.5" /> New Buyer</p>
                    <Input placeholder="Full name *" value={newBuyerName} onChange={e => setNewBuyerName(e.target.value)} className="h-8 text-sm" />
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Email" value={newBuyerEmail} onChange={e => setNewBuyerEmail(e.target.value)} className="h-8 text-sm" />
                      <Input placeholder="Phone" value={newBuyerPhone} onChange={e => setNewBuyerPhone(e.target.value)} className="h-8 text-sm" />
                    </div>
                    <Input placeholder="Entity name" value={newBuyerEntity} onChange={e => setNewBuyerEntity(e.target.value)} className="h-8 text-sm" />
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setShowNewBuyer(false)} className="h-7 text-xs">Cancel</Button>
                      <Button size="sm" onClick={handleCreateAndAttachBuyer} disabled={!newBuyerName.trim() || createBuyer.isPending} className="h-7 text-xs">
                        {createBuyer.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                        Save & Select
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Financing Type */}
              <div className="space-y-2">
                <Label>Financing Type</Label>
                <Select value={financingType} onValueChange={(v) => setFinancingType(v as FinancingType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sba_7a">SBA 7(a)</SelectItem>
                    <SelectItem value="sba_504">SBA 504</SelectItem>
                    <SelectItem value="conventional">Conventional</SelectItem>
                    <SelectItem value="seller_financing">Seller Financing</SelectItem>
                    <SelectItem value="equity">Equity</SelectItem>
                    <SelectItem value="mezzanine">Mezzanine</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Lender (Optional) */}
              <div className="space-y-2">
                <Label>Lender (Optional)</Label>
                <Select value={selectedLenderId || 'none'} onValueChange={(v) => setSelectedLenderId(v === 'none' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="Select lender or add later" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Add lender later</SelectItem>
                    {lenders.map(lender => (
                      <SelectItem key={lender.id} value={lender.id}>{lender.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Loan Amount (Optional) */}
              <div className="space-y-2">
                <Label>Loan Amount (Optional)</Label>
                <Input type="number" placeholder="e.g., 500000" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} />
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedDealId || !selectedDealBuyerId || createApplication.isPending}
            className="bg-[#D4AF37] hover:bg-[#B4941F] text-black"
          >
            {createApplication.isPending ? (
              <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Adding...</>
            ) : (
              'Add to Financing'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
