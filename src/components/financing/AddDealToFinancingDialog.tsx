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
import { Search, Building2, DollarSign, Loader2 } from 'lucide-react';
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
  const [selectedLenderId, setSelectedLenderId] = useState<string>('');
  const [financingType, setFinancingType] = useState<FinancingType>('sba_7a');
  const [loanAmount, setLoanAmount] = useState('');
  
  const { data: lenders = [] } = useLenders();
  const createApplication = useCreateFinancingApplication();
  
  // Fetch deals that aren't already in financing
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
  
  const handleSubmit = async () => {
    if (!selectedDealId) {
      toast.error('Please select a deal');
      return;
    }
    
    try {
      await createApplication.mutateAsync({
        deal_id: selectedDealId,
        lender_id: selectedLenderId || null,
        financing_type: financingType,
        loan_amount: loanAmount ? parseFloat(loanAmount) : null,
        stage: 'pre_qualification',
      });
      
      toast.success('Deal added to financing tracker');
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to add deal to financing');
    }
  };
  
  const resetForm = () => {
    setSearch('');
    setSelectedDealId(null);
    setSelectedLenderId('');
    setFinancingType('sba_7a');
    setLoanAmount('');
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#D4AF37]" />
            Add Deal to Financing
          </DialogTitle>
          <DialogDescription>
            Select a deal to track in the financing module. You can add lender details later.
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
            
            {/* Deal List */}
            <div className="max-h-48 overflow-y-auto border border-border rounded-lg divide-y divide-border">
              {dealsLoading ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                  Loading deals...
                </div>
              ) : availableDeals.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No deals found
                </div>
              ) : (
                availableDeals.map(deal => (
                  <button
                    key={deal.id}
                    onClick={() => setSelectedDealId(deal.id)}
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
              {/* Financing Type */}
              <div className="space-y-2">
                <Label>Financing Type</Label>
                <Select value={financingType} onValueChange={(v) => setFinancingType(v as FinancingType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
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
                <Select value={selectedLenderId} onValueChange={setSelectedLenderId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select lender or add later" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Add lender later</SelectItem>
                    {lenders.map(lender => (
                      <SelectItem key={lender.id} value={lender.id}>
                        {lender.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Loan Amount (Optional) */}
              <div className="space-y-2">
                <Label>Loan Amount (Optional)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 500000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedDealId || createApplication.isPending}
            className="bg-[#D4AF37] hover:bg-[#B4941F] text-black"
          >
            {createApplication.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Adding...
              </>
            ) : (
              'Add to Financing'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
