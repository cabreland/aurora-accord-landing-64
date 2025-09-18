import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';

const inviteSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  investorName: z.string().min(1, 'Investor name is required'),
  companyName: z.string().optional(),
  dealId: z.string().min(1, 'Please select a deal'),
  expiresAt: z.date({
    required_error: 'Please select an expiry date',
  }),
  notes: z.string().optional(),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface InvestorInviteDialogProps {
  onInviteSuccess: () => void;
  deals?: Array<{ id: string; title: string; company_name: string }>;
}

const InvestorInviteDialog: React.FC<InvestorInviteDialogProps> = ({
  onInviteSuccess,
  deals = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      investorName: '',
      companyName: '',
      dealId: '',
      expiresAt: addDays(new Date(), 30), // Default to 30 days
      notes: '',
    },
  });

  const generateInvitationCode = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  const handleInviteInvestor = async (data: InviteFormData) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get user profile for invited_by foreign key
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('User profile not found');

      const invitationCode = generateInvitationCode();

      // Create invitation record
      const { data: invitation, error: inviteError } = await supabase
        .from('investor_invitations')
        .insert({
          deal_id: data.dealId,
          email: data.email,
          invitation_code: invitationCode,
          invited_by: profile.user_id,
          expires_at: data.expiresAt.toISOString(),
          investor_name: data.investorName,
          company_name: data.companyName || null,
          notes: data.notes || null,
        })
        .select()
        .single();

      if (inviteError) throw inviteError;

      // Send invitation email via edge function
      const { error: emailError } = await supabase.functions.invoke('send-investor-invitation', {
        body: {
          invitationId: invitation.id,
          email: data.email,
          investorName: data.investorName,
          invitationCode,
          dealId: data.dealId,
          expiresAt: data.expiresAt.toISOString(),
        },
      });

      if (emailError) {
        console.error('Email sending failed:', emailError);
        toast({
          title: 'Invitation Created',
          description: 'Invitation saved but email could not be sent. You can resend it later.',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Invitation Sent',
          description: `Invitation sent successfully to ${data.email}`,
        });
      }

      form.reset();
      setIsOpen(false);
      onInviteSuccess();
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send invitation',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Invite Investor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invite Investor to Deal</DialogTitle>
          <DialogDescription>
            Send an invitation to an investor to access deal information.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleInviteInvestor)} className="space-y-4">
            <FormField
              control={form.control}
              name="dealId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deal</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a deal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {deals.map((deal) => (
                        <SelectItem key={deal.id} value={deal.id}>
                          {deal.title} - {deal.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="investor@company.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="investorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Investor Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="John Smith" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Investment Firm LLC" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiresAt"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Invitation Expires</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick expiry date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Additional information about this invitation..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Invitation'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default InvestorInviteDialog;