import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useWidgetSettings } from '@/hooks/useWidgetSettings';

interface RequestInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealId: string;
  dealName: string;
}

export const RequestInfoModal: React.FC<RequestInfoModalProps> = ({
  open,
  onOpenChange,
  dealId,
  dealName
}) => {
  const { settings } = useWidgetSettings();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [otherDetails, setOtherDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [infoOptions, setInfoOptions] = useState<string[]>([]);

  useEffect(() => {
    if (settings?.info_request_options) {
      setInfoOptions(settings.info_request_options);
    }
  }, [settings]);

  const handleToggle = (option: string) => {
    setSelectedOptions(prev =>
      prev.includes(option)
        ? prev.filter(o => o !== option)
        : [...prev, option]
    );
  };

  const handleSubmit = async () => {
    if (selectedOptions.length === 0 && !otherDetails.trim()) {
      toast.error('Please select at least one option or specify your request');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please log in to submit a request');
        return;
      }

      const requestedItems = [...selectedOptions];
      if (otherDetails.trim()) {
        requestedItems.push(`Other: ${otherDetails.trim()}`);
      }

      const { error } = await supabase
        .from('info_requests' as any)
        .insert({
          deal_id: dealId,
          investor_id: user.id,
          requested_items: requestedItems,
          additional_notes: otherDetails.trim() || null
        } as any);

      if (error) throw error;
      
      toast.success('Information request sent to broker team');
      onOpenChange(false);
      
      // Reset form
      setSelectedOptions([]);
      setOtherDetails('');
    } catch (error) {
      console.error('Error submitting info request:', error);
      toast.error('Failed to send request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Request Information</DialogTitle>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            About: {dealName}
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {infoOptions.map((option, index) => (
            <div key={index} className="flex items-start space-x-3">
              <Checkbox
                id={`option-${index}`}
                checked={selectedOptions.includes(option)}
                onCheckedChange={() => handleToggle(option)}
              />
              <Label
                htmlFor={`option-${index}`}
                className="text-sm font-normal cursor-pointer"
              >
                {option}
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
