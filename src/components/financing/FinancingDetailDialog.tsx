import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  FinancingApplication,
  FinancingStage,
  FinancingType,
  FINANCING_STAGE_LABELS,
  FINANCING_TYPE_LABELS,
  useLenders,
  useUpdateFinancingApplication,
  useDeleteFinancingApplication,
} from '@/hooks/useFinancing';

interface FinancingDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: FinancingApplication | null;
}

const ALL_STAGES: FinancingStage[] = [
  'pre_qualification', 'application_submitted', 'under_review',
  'additional_docs_requested', 'conditional_approval', 'final_approval',
  'closing', 'funded', 'declined', 'withdrawn',
];

const ALL_TYPES: FinancingType[] = [
  'sba_7a', 'sba_504', 'conventional', 'seller_financing',
  'mezzanine', 'equity', 'bridge', 'line_of_credit', 'other',
];

export const FinancingDetailDialog: React.FC<FinancingDetailDialogProps> = ({
  open, onOpenChange, application,
}) => {
  const { data: lenders = [] } = useLenders();
  const updateMutation = useUpdateFinancingApplication();
  const deleteMutation = useDeleteFinancingApplication();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form state
  const [stage, setStage] = useState<FinancingStage>('pre_qualification');
  const [financingType, setFinancingType] = useState<FinancingType>('conventional');
  const [lenderId, setLenderId] = useState<string | null>(null);
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState('normal');
  const [submittedAt, setSubmittedAt] = useState<Date | undefined>();
  const [approvedAt, setApprovedAt] = useState<Date | undefined>();
  const [closingDate, setClosingDate] = useState<Date | undefined>();

  useEffect(() => {
    if (application) {
      setStage(application.stage);
      setFinancingType(application.financing_type);
      setLenderId(application.lender_id);
      setLoanAmount(application.loan_amount?.toString() || '');
      setInterestRate(application.interest_rate?.toString() || '');
      setNotes(application.internal_notes || '');
      setPriority(application.priority || 'normal');
      setSubmittedAt(application.submitted_at ? new Date(application.submitted_at) : undefined);
      setApprovedAt(application.approved_at ? new Date(application.approved_at) : undefined);
      setClosingDate(application.closing_date ? new Date(application.closing_date) : undefined);
    }
  }, [application]);

  if (!application) return null;

  const handleSave = () => {
    updateMutation.mutate({
      id: application.id,
      stage,
      financing_type: financingType,
      lender_id: lenderId || null,
      loan_amount: loanAmount ? parseFloat(loanAmount) : null,
      interest_rate: interestRate ? parseFloat(interestRate) : null,
      internal_notes: notes || null,
      priority,
      submitted_at: submittedAt ? format(submittedAt, 'yyyy-MM-dd') : null,
      approved_at: approvedAt ? format(approvedAt, 'yyyy-MM-dd') : null,
      closing_date: closingDate ? format(closingDate, 'yyyy-MM-dd') : null,
    } as any, {
      onSuccess: () => {
        toast.success('Financing record updated');
        onOpenChange(false);
      },
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate(application.id, {
      onSuccess: () => {
        toast.success('Financing record deleted');
        setShowDeleteConfirm(false);
        onOpenChange(false);
      },
    });
  };

  const DateField = ({ label, value, onChange }: { label: string; value: Date | undefined; onChange: (d: Date | undefined) => void }) => (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-9 text-sm", !value && "text-muted-foreground")}>
            <CalendarIcon className="mr-2 h-3.5 w-3.5" />
            {value ? format(value, 'MMM d, yyyy') : 'Not set'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={value} onSelect={onChange} initialFocus className={cn("p-3 pointer-events-auto")} />
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {application.deal?.company_name || 'Financing Record'}
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              {FINANCING_TYPE_LABELS[application.financing_type]} • Created {format(new Date(application.created_at), 'MMM d, yyyy')}
            </p>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Row 1: Stage + Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Stage</Label>
                <Select value={stage} onValueChange={(v) => setStage(v as FinancingStage)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ALL_STAGES.map(s => (
                      <SelectItem key={s} value={s}>{FINANCING_STAGE_LABELS[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: Financing Type + Lender */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Financing Type</Label>
                <Select value={financingType} onValueChange={(v) => setFinancingType(v as FinancingType)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ALL_TYPES.map(t => (
                      <SelectItem key={t} value={t}>{FINANCING_TYPE_LABELS[t]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Lender</Label>
                <Select value={lenderId || 'none'} onValueChange={(v) => setLenderId(v === 'none' ? null : v)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select lender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No lender</SelectItem>
                    {lenders.map(l => (
                      <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 3: Loan Amount + Interest Rate */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Loan Amount ($)</Label>
                <Input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} placeholder="e.g. 500000" className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Interest Rate (%)</Label>
                <Input type="number" step="0.01" value={interestRate} onChange={e => setInterestRate(e.target.value)} placeholder="e.g. 6.5" className="h-9 text-sm" />
              </div>
            </div>

            {/* Row 4: Dates */}
            <div className="grid grid-cols-3 gap-3">
              <DateField label="Application Date" value={submittedAt} onChange={setSubmittedAt} />
              <DateField label="Approval Date" value={approvedAt} onChange={setApprovedAt} />
              <DateField label="Closing Date" value={closingDate} onChange={setClosingDate} />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-xs">Internal Notes</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add notes…" rows={3} className="text-sm resize-none" />
            </div>

            {/* Footer */}
            <div className="flex justify-between pt-3 border-t border-border">
              <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)}>
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Saving…</> : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this financing record?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove this record and cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
