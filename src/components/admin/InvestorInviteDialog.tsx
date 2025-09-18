import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Calendar as CalendarIcon, Users, Building, Package, Globe } from 'lucide-react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  accessType: z.enum(['single', 'multiple', 'portfolio', 'custom'], {
    required_error: 'Please select an access type',
  }),
  dealId: z.string().optional(),
  dealIds: z.array(z.string()).optional(),
  portfolioAccess: z.boolean().default(false),
  masterNda: z.boolean().default(false),
  expiresAt: z.date({
    required_error: 'Please select an expiry date',
  }),
  notes: z.string().optional(),
}).refine((data) => {
  if (data.accessType === 'single' && (!data.dealId || data.dealId.trim() === '')) {
    return false;
  }
  if ((data.accessType === 'multiple' || data.accessType === 'custom') && (!data.dealIds || data.dealIds.length === 0)) {
    return false;
  }
  if (data.accessType === 'portfolio' && !data.masterNda) {
    return false;
  }
  return true;
}, {
  message: 'Please select appropriate deals or Master NDA for the chosen access type',
  path: ['dealId'],
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

  // Debug deals loading
  console.log('InvestorInviteDialog: deals prop:', deals);

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      investorName: '',
      companyName: '',
      accessType: 'single',
      dealId: '',
      dealIds: [],
      portfolioAccess: false,
      masterNda: false,
      expiresAt: addDays(new Date(), 30),
      notes: '',
    },
  });

  const watchAccessType = form.watch('accessType');

  const generateInvitationCode = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  const handleInviteInvestor = async (data: InviteFormData) => {
    setIsLoading(true);
    
    // Debug logging
    console.log('Form data submitted:', data);
    console.log('Available deals:', deals);
    
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

      // Determine deal_id and portfolio_access based on access type
      let primaryDealId: string | null = null;
      let portfolioAccess = false;
      
      if (data.accessType === 'single') {
        if (!data.dealId || data.dealId.trim() === '') {
          throw new Error('Please select a deal for single deal access');
        }
        primaryDealId = data.dealId;
        portfolioAccess = false;
      } else if (data.accessType === 'multiple' || data.accessType === 'custom') {
        if (!data.dealIds || data.dealIds.length === 0) {
          throw new Error('Please select at least one deal for multiple deal access');
        }
        primaryDealId = null; // No single deal for multiple access
        portfolioAccess = false;
      } else if (data.accessType === 'portfolio') {
        primaryDealId = null; // No single deal for portfolio access
        portfolioAccess = true;
      } else {
        throw new Error('Invalid access type selected');
      }

      // Create invitation record
      const insertData = {
        email: data.email,
        invitation_code: invitationCode,
        invited_by: profile.user_id,
        expires_at: data.expiresAt.toISOString(),
        investor_name: data.investorName,
        company_name: data.companyName || null,
        notes: data.notes || null,
        access_type: data.accessType,
        deal_id: primaryDealId, // Will be null for portfolio/multiple access
        portfolio_access: portfolioAccess,
        master_nda_signed: data.masterNda,
        // Handle deal assignment based on access type
        ...(data.accessType === 'multiple' || data.accessType === 'custom') && { 
          deal_ids: JSON.stringify(data.dealIds)
        },
        ...(data.accessType === 'portfolio' && { 
          deal_ids: JSON.stringify(deals.map(d => d.id))
        }),
      };

      console.log('Insert data:', insertData);

      const { data: invitation, error: inviteError } = await supabase
        .from('investor_invitations')
        .insert(insertData)
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
          accessType: data.accessType,
          dealId: data.dealId,
          dealIds: data.dealIds,
          portfolioAccess: data.accessType === 'portfolio',
          masterNda: data.masterNda,
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invite Investor</DialogTitle>
          <DialogDescription>
            Send an invitation to an investor with customizable access levels.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleInviteInvestor)} className="space-y-4">
            <FormField
              control={form.control}
              name="accessType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Access Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="single" id="single" />
                        <label htmlFor="single" className="flex items-center cursor-pointer">
                          <Users className="h-4 w-4 mr-2" />
                          Single Deal
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="multiple" id="multiple" />
                        <label htmlFor="multiple" className="flex items-center cursor-pointer">
                          <Package className="h-4 w-4 mr-2" />
                          Multiple Deals
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="portfolio" id="portfolio" />
                        <label htmlFor="portfolio" className="flex items-center cursor-pointer">
                          <Globe className="h-4 w-4 mr-2" />
                          Full Portfolio
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="custom" id="custom" />
                        <label htmlFor="custom" className="flex items-center cursor-pointer">
                          <Building className="h-4 w-4 mr-2" />
                          Custom Package
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Deal Selection based on Access Type */}
            {watchAccessType === 'single' && (
              <FormField
                control={form.control}
                name="dealId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Deal</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a deal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {deals.length === 0 ? (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            No deals available
                          </div>
                        ) : (
                          deals.map((deal) => (
                            <SelectItem key={deal.id} value={deal.id}>
                              {deal.title} - {deal.company_name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    {deals.length === 0 && (
                      <p className="text-sm text-destructive">
                        No deals available. Please create a deal first.
                      </p>
                    )}
                  </FormItem>
                )}
              />
            )}

            {(watchAccessType === 'multiple' || watchAccessType === 'custom') && (
              <FormField
                control={form.control}
                name="dealIds"
                render={() => (
                  <FormItem>
                    <FormLabel>Select Deals</FormLabel>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-3 max-h-48 overflow-y-auto">
                          {deals.map((deal) => (
                            <FormField
                              key={deal.id}
                              control={form.control}
                              name="dealIds"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={deal.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(deal.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...(field.value || []), deal.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== deal.id
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal cursor-pointer">
                                      <div>
                                        <div className="font-medium">{deal.title}</div>
                                        <div className="text-xs text-muted-foreground">{deal.company_name}</div>
                                      </div>
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {watchAccessType === 'portfolio' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Portfolio Access</CardTitle>
                  <CardDescription>
                    This investor will have access to all current and future deals.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="masterNda"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Master NDA Required</FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

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