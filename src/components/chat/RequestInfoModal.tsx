import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface RequestInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealId: string;
  dealName: string;
}

const infoOptions = [
  { id: 'financials', label: 'Financial Statements (last 3 years)' },
  { id: 'customer_breakdown', label: 'Customer/Revenue breakdown' },
  { id: 'operating_metrics', label: 'Operating metrics' },
  { id: 'cap_table', label: 'Cap table and ownership' },
];

export const RequestInfoModal: React.FC<RequestInfoModalProps> = ({
  open,
  onOpenChange,
  dealId,
  dealName
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [otherDetails, setOtherDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggle = (optionId: string) => {
    setSelectedOptions(prev =>
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const handleSubmit = async () => {
    if (selectedOptions.length === 0 && !otherDetails.trim()) {
      toast.error('Please select at least one option or specify your request');
      return;
    }

    setIsSubmitting(true);
    try {
      // Here you would create an info_request record in the database
      // For now, just show success toast
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success('Information request sent to broker team');
      onOpenChange(false);
      
      // Reset form
      setSelectedOptions([]);
      setOtherDetails('');
    } catch (error) {
      toast.error('Failed to send request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Information</DialogTitle>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            About: {dealName}
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {infoOptions.map(option => (
            <div key={option.id} className="flex items-start space-x-3">
              <Checkbox
                id={option.id}
                checked={selectedOptions.includes(option.id)}
                onCheckedChange={() => handleToggle(option.id)}
              />
              <Label
                htmlFor={option.id}
                className="text-sm font-normal cursor-pointer"
              >
                {option.label}
              </Label>
            </div>
          ))}

          <div className="space-y-2">
            <Label htmlFor="other">Other (specify):</Label>
            <Textarea
              id="other"
              value={otherDetails}
              onChange={(e) => setOtherDetails(e.target.value)}
              placeholder="Describe any additional information you need..."
              className="min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
