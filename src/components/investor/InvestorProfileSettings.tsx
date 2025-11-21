import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save, User, Briefcase, Target, DollarSign } from 'lucide-react';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  company_name: z.string().optional(),
  phone_number: z.string().optional(),
  linkedin_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  owns_business: z.boolean(),
  business_type: z.string().optional(),
  annual_revenue: z.string().optional(),
  annual_profit: z.string().optional(),
  acquisition_goal: z.string().optional(),
  ttm_revenue_min: z.number().optional(),
  ttm_revenue_max: z.number().optional(),
  ttm_profit_min: z.number().optional(),
  ttm_profit_max: z.number().optional(),
  asking_price_min: z.number().optional(),
  asking_price_max: z.number().optional(),
  profit_multiple_min: z.number().optional(),
  profit_multiple_max: z.number().optional(),
  referral_source: z.string().optional(),
  referral_other_details: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const InvestorProfileSettings = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedBusinessTypes, setSelectedBusinessTypes] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedTechStacks, setSelectedTechStacks] = useState<string[]>([]);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      owns_business: false,
    },
  });

  // Load existing data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      setLoadingData(true);
      try {
        const { data, error } = await supabase
          .from('onboarding_responses')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          form.reset({
            full_name: data.full_name || '',
            company_name: data.company_name || '',
            phone_number: data.phone_number || '',
            linkedin_url: data.linkedin_url || '',
            owns_business: data.owns_business || false,
            business_type: data.business_type || '',
            annual_revenue: data.annual_revenue || '',
            annual_profit: data.annual_profit || '',
            acquisition_goal: data.acquisition_goal || '',
            ttm_revenue_min: data.ttm_revenue_min || undefined,
            ttm_revenue_max: data.ttm_revenue_max || undefined,
            ttm_profit_min: data.ttm_profit_min || undefined,
            ttm_profit_max: data.ttm_profit_max || undefined,
            asking_price_min: data.asking_price_min || undefined,
            asking_price_max: data.asking_price_max || undefined,
            profit_multiple_min: data.profit_multiple_min || undefined,
            profit_multiple_max: data.profit_multiple_max || undefined,
            referral_source: data.referral_source || '',
            referral_other_details: data.referral_other_details || '',
          });

          setSelectedBusinessTypes(data.ideal_business_types || []);
          setSelectedIndustries(data.industries_of_interest || []);
          setSelectedTechStacks(data.preferred_tech_stacks || []);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast({
          title: "Error",
          description: "Failed to load your profile data.",
          variant: "destructive"
        });
      } finally {
        setLoadingData(false);
      }
    };

    loadProfile();
  }, [user]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('onboarding_responses')
        .upsert({
          user_id: user.id,
          full_name: data.full_name,
          company_name: data.company_name || null,
          phone_number: data.phone_number || null,
          linkedin_url: data.linkedin_url || null,
          owns_business: data.owns_business || null,
          business_type: data.business_type || null,
          annual_revenue: data.annual_revenue || null,
          annual_profit: data.annual_profit || null,
          acquisition_goal: data.acquisition_goal as any,
          ideal_business_types: selectedBusinessTypes,
          industries_of_interest: selectedIndustries,
          preferred_tech_stacks: selectedTechStacks,
          ttm_revenue_min: data.ttm_revenue_min || null,
          ttm_revenue_max: data.ttm_revenue_max || null,
          ttm_profit_min: data.ttm_profit_min || null,
          ttm_profit_max: data.ttm_profit_max || null,
          asking_price_min: data.asking_price_min || null,
          asking_price_max: data.asking_price_max || null,
          profit_multiple_min: data.profit_multiple_min || null,
          profit_multiple_max: data.profit_multiple_max || null,
          referral_source: data.referral_source as any,
          referral_other_details: data.referral_other_details || null,
          updated_at: new Date().toISOString(),
        } as any);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your investment criteria have been saved successfully."
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--primary))]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Investment Profile</h2>
        <p className="text-[hsl(var(--text-secondary))] mt-1">
          Manage your investment criteria and preferences
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs defaultValue="contact" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-[hsl(var(--portal-card))]">
            <TabsTrigger value="contact" className="data-[state=active]:bg-[hsl(var(--primary))]">
              <User className="w-4 h-4 mr-2" />
              Contact
            </TabsTrigger>
            <TabsTrigger value="business" className="data-[state=active]:bg-[hsl(var(--primary))]">
              <Briefcase className="w-4 h-4 mr-2" />
              Business
            </TabsTrigger>
            <TabsTrigger value="criteria" className="data-[state=active]:bg-[hsl(var(--primary))]">
              <Target className="w-4 h-4 mr-2" />
              Criteria
            </TabsTrigger>
            <TabsTrigger value="financial" className="data-[state=active]:bg-[hsl(var(--primary))]">
              <DollarSign className="w-4 h-4 mr-2" />
              Financial
            </TabsTrigger>
          </TabsList>

          {/* Contact Information Tab */}
          <TabsContent value="contact">
            <Card className="bg-[hsl(var(--portal-card))] border-[hsl(var(--primary))]/20">
              <CardHeader>
                <CardTitle className="text-[hsl(var(--text-primary))]">Contact Information</CardTitle>
                <CardDescription className="text-[hsl(var(--text-secondary))]">
                  Your basic contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="full_name" className="text-[hsl(var(--text-primary))]">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="full_name"
                    {...form.register('full_name')}
                    className="mt-1.5 bg-[hsl(var(--portal-dark))] border-[hsl(var(--primary))]/20 text-[hsl(var(--text-primary))]"
                  />
                  {form.formState.errors.full_name && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.full_name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="company_name" className="text-[hsl(var(--text-primary))]">Company Name</Label>
                  <Input
                    id="company_name"
                    {...form.register('company_name')}
                    className="mt-1.5 bg-[hsl(var(--portal-dark))] border-[hsl(var(--primary))]/20 text-[hsl(var(--text-primary))]"
                  />
                </div>

                <div>
                  <Label htmlFor="phone_number" className="text-[hsl(var(--text-primary))]">Phone Number</Label>
                  <Input
                    id="phone_number"
                    {...form.register('phone_number')}
                    className="mt-1.5 bg-[hsl(var(--portal-dark))] border-[hsl(var(--primary))]/20 text-[hsl(var(--text-primary))]"
                  />
                </div>

                <div>
                  <Label htmlFor="linkedin_url" className="text-[hsl(var(--text-primary))]">LinkedIn Profile</Label>
                  <Input
                    id="linkedin_url"
                    {...form.register('linkedin_url')}
                    className="mt-1.5 bg-[hsl(var(--portal-dark))] border-[hsl(var(--primary))]/20 text-[hsl(var(--text-primary))]"
                  />
                  {form.formState.errors.linkedin_url && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.linkedin_url.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Background Tab */}
          <TabsContent value="business">
            <Card className="bg-[hsl(var(--portal-card))] border-[hsl(var(--primary))]/20">
              <CardHeader>
                <CardTitle className="text-[hsl(var(--text-primary))]">Business Background</CardTitle>
                <CardDescription className="text-[hsl(var(--text-secondary))]">
                  Your current business situation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-[hsl(var(--text-primary))] mb-3 block">
                    Do you currently own a business?
                  </Label>
                  <RadioGroup
                    onValueChange={(value) => form.setValue('owns_business', value === 'true')}
                    defaultValue={form.watch('owns_business') ? 'true' : 'false'}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="owns-yes" />
                      <Label htmlFor="owns-yes" className="text-[hsl(var(--text-secondary))] cursor-pointer">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="owns-no" />
                      <Label htmlFor="owns-no" className="text-[hsl(var(--text-secondary))] cursor-pointer">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                {form.watch('owns_business') && (
                  <>
                    <div>
                      <Label htmlFor="business_type" className="text-[hsl(var(--text-primary))]">Business Type</Label>
                      <Select onValueChange={(value) => form.setValue('business_type', value)} value={form.watch('business_type')}>
                        <SelectTrigger className="mt-1.5 bg-[hsl(var(--portal-dark))] border-[hsl(var(--primary))]/20 text-[hsl(var(--text-primary))]">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="saas">SaaS</SelectItem>
                          <SelectItem value="ecommerce">E-commerce</SelectItem>
                          <SelectItem value="services">Services</SelectItem>
                          <SelectItem value="manufacturing">Manufacturing</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="annual_revenue" className="text-[hsl(var(--text-primary))]">Annual Revenue</Label>
                      <Select onValueChange={(value) => form.setValue('annual_revenue', value)} value={form.watch('annual_revenue')}>
                        <SelectTrigger className="mt-1.5 bg-[hsl(var(--portal-dark))] border-[hsl(var(--primary))]/20 text-[hsl(var(--text-primary))]">
                          <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="<$500K">&lt;$500K</SelectItem>
                          <SelectItem value="$500K-$1M">$500K-$1M</SelectItem>
                          <SelectItem value="$1M-$5M">$1M-$5M</SelectItem>
                          <SelectItem value="$5M+">$5M+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="annual_profit" className="text-[hsl(var(--text-primary))]">Annual Profit</Label>
                      <Select onValueChange={(value) => form.setValue('annual_profit', value)} value={form.watch('annual_profit')}>
                        <SelectTrigger className="mt-1.5 bg-[hsl(var(--portal-dark))] border-[hsl(var(--primary))]/20 text-[hsl(var(--text-primary))]">
                          <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="<$100K">&lt;$100K</SelectItem>
                          <SelectItem value="$100K-$500K">$100K-$500K</SelectItem>
                          <SelectItem value="$500K-$1M">$500K-$1M</SelectItem>
                          <SelectItem value="$1M+">$1M+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Investment Criteria Tab */}
          <TabsContent value="criteria">
            <Card className="bg-[hsl(var(--portal-card))] border-[hsl(var(--primary))]/20">
              <CardHeader>
                <CardTitle className="text-[hsl(var(--text-primary))]">Investment Criteria</CardTitle>
                <CardDescription className="text-[hsl(var(--text-secondary))]">
                  What type of businesses are you looking for?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="acquisition_goal" className="text-[hsl(var(--text-primary))]">Acquisition Goal</Label>
                  <Select onValueChange={(value) => form.setValue('acquisition_goal', value)} value={form.watch('acquisition_goal')}>
                    <SelectTrigger className="mt-1.5 bg-[hsl(var(--portal-dark))] border-[hsl(var(--primary))]/20 text-[hsl(var(--text-primary))]">
                      <SelectValue placeholder="Select goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="first">First acquisition</SelectItem>
                      <SelectItem value="growing">Growing portfolio</SelectItem>
                      <SelectItem value="strategic">Strategic add-on</SelectItem>
                      <SelectItem value="exit">Exit strategy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-[hsl(var(--text-primary))] mb-3 block">Ideal Business Types</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {['SaaS', 'E-commerce', 'Services', 'Manufacturing', 'Healthcare', 'Technology', 'Real Estate', 'Other'].map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${type}`}
                          checked={selectedBusinessTypes.includes(type)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedBusinessTypes([...selectedBusinessTypes, type]);
                            } else {
                              setSelectedBusinessTypes(selectedBusinessTypes.filter(t => t !== type));
                            }
                          }}
                        />
                        <Label htmlFor={`type-${type}`} className="text-[hsl(var(--text-secondary))] cursor-pointer">
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-[hsl(var(--text-primary))] mb-3 block">Preferred Tech Stacks</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {['React', 'Node.js', 'Python', 'Ruby', 'PHP', 'WordPress', 'Shopify', 'Custom'].map((tech) => (
                      <div key={tech} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tech-${tech}`}
                          checked={selectedTechStacks.includes(tech)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTechStacks([...selectedTechStacks, tech]);
                            } else {
                              setSelectedTechStacks(selectedTechStacks.filter(t => t !== tech));
                            }
                          }}
                        />
                        <Label htmlFor={`tech-${tech}`} className="text-[hsl(var(--text-secondary))] cursor-pointer">
                          {tech}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Parameters Tab */}
          <TabsContent value="financial">
            <Card className="bg-[hsl(var(--portal-card))] border-[hsl(var(--primary))]/20">
              <CardHeader>
                <CardTitle className="text-[hsl(var(--text-primary))]">Financial Parameters</CardTitle>
                <CardDescription className="text-[hsl(var(--text-secondary))]">
                  Define your investment range
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="asking_price_min" className="text-[hsl(var(--text-primary))]">Min Asking Price ($)</Label>
                    <Input
                      id="asking_price_min"
                      type="number"
                      {...form.register('asking_price_min', { valueAsNumber: true })}
                      className="mt-1.5 bg-[hsl(var(--portal-dark))] border-[hsl(var(--primary))]/20 text-[hsl(var(--text-primary))]"
                      placeholder="100000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="asking_price_max" className="text-[hsl(var(--text-primary))]">Max Asking Price ($)</Label>
                    <Input
                      id="asking_price_max"
                      type="number"
                      {...form.register('asking_price_max', { valueAsNumber: true })}
                      className="mt-1.5 bg-[hsl(var(--portal-dark))] border-[hsl(var(--primary))]/20 text-[hsl(var(--text-primary))]"
                      placeholder="5000000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ttm_revenue_min" className="text-[hsl(var(--text-primary))]">Min TTM Revenue ($)</Label>
                    <Input
                      id="ttm_revenue_min"
                      type="number"
                      {...form.register('ttm_revenue_min', { valueAsNumber: true })}
                      className="mt-1.5 bg-[hsl(var(--portal-dark))] border-[hsl(var(--primary))]/20 text-[hsl(var(--text-primary))]"
                      placeholder="500000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ttm_revenue_max" className="text-[hsl(var(--text-primary))]">Max TTM Revenue ($)</Label>
                    <Input
                      id="ttm_revenue_max"
                      type="number"
                      {...form.register('ttm_revenue_max', { valueAsNumber: true })}
                      className="mt-1.5 bg-[hsl(var(--portal-dark))] border-[hsl(var(--primary))]/20 text-[hsl(var(--text-primary))]"
                      placeholder="10000000"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="referral_source" className="text-[hsl(var(--text-primary))]">How did you hear about us?</Label>
                  <Select onValueChange={(value) => form.setValue('referral_source', value)} value={form.watch('referral_source')}>
                    <SelectTrigger className="mt-1.5 bg-[hsl(var(--portal-dark))] border-[hsl(var(--primary))]/20 text-[hsl(var(--text-primary))]">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="google">Google</SelectItem>
                      <SelectItem value="newsletter">Newsletter</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end mt-6">
          <Button
            type="submit"
            disabled={loading}
            className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
