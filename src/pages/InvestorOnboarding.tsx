import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle, ChevronRight, ChevronLeft, Home } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Form schema
const formSchema = z.object({
  // Step 1: Contact Info
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  company_name: z.string().optional(),
  phone_number: z.string().optional(),
  linkedin_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  
  // Step 2: Business Background
  owns_business: z.boolean(),
  business_type: z.string().optional(),
  annual_revenue: z.string().optional(),
  annual_profit: z.string().optional(),
  
  // Step 3: Investment Criteria
  acquisition_goal: z.string().optional(),
  ideal_business_types: z.array(z.string()).optional(),
  industries_of_interest: z.array(z.string()).optional(),
  preferred_tech_stacks: z.array(z.string()).optional(),
  
  // Step 4: Financial Parameters
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

type FormData = z.infer<typeof formSchema>;

const InvestorOnboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formCompleted, setFormCompleted] = useState(false);
  const [selectedBusinessTypes, setSelectedBusinessTypes] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedTechStacks, setSelectedTechStacks] = useState<string[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      owns_business: false,
      ideal_business_types: [],
      industries_of_interest: [],
      preferred_tech_stacks: [],
    },
  });

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    if (!user) return;
    
    try {
      await supabase.from('profiles').update({
        onboarding_skipped: true,
        onboarding_completed: false
      }).eq('user_id', user.id);
      
      toast({
        title: "Skipped",
        description: "You can complete your profile later from settings."
      });
      
      navigate('/investor-portal');
    } catch (error) {
      console.error('Error skipping onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to skip. Please try again.",
        variant: "destructive"
      });
    }
  };

  const onSubmit = async (data: FormData) => {
    console.log('[InvestorOnboarding] Form submitted with data:', data);
    
    if (!user) {
      console.error('[InvestorOnboarding] No user found');
      toast({
        title: "Error",
        description: "You must be logged in to complete onboarding.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      // Save to onboarding_responses table
      const { error: responseError } = await supabase
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
          completed_at: new Date().toISOString(),
        } as any);

      if (responseError) throw responseError;

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          onboarding_skipped: false,
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      setFormCompleted(true);
      
      toast({
        title: "Profile Complete!",
        description: "Thank you for completing your investor profile."
      });

      setTimeout(() => {
        navigate('/investor-portal');
      }, 2000);
    } catch (error) {
      console.error('Error saving onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to save your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (formCompleted) {
    return (
      <div className="min-h-screen bg-[hsl(var(--portal-bg))] flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-[hsl(var(--portal-card))] border-[hsl(var(--primary))]/30">
          <CardContent className="pt-12 pb-8 text-center">
            <CheckCircle className="w-16 h-16 text-[hsl(var(--success))] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))] mb-2">
              Profile Complete!
            </h2>
            <p className="text-[hsl(var(--text-secondary))]">
              Redirecting to your investor portal...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--portal-bg))] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[hsl(var(--text-primary))] mb-2">
            Complete Your Investor Profile
          </h1>
          <p className="text-[hsl(var(--text-secondary))]">
            Step {currentStep} of {totalSteps}
          </p>
          <Progress value={progress} className="mt-4 h-2" />
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="bg-[hsl(var(--portal-card))] border-[hsl(var(--primary))]/20">
            <CardContent className="pt-6">
              {/* Step 1: Contact Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <CardTitle className="text-2xl text-[hsl(var(--text-primary))]">Contact Information</CardTitle>
                  <CardDescription className="text-[hsl(var(--text-secondary))]">
                    Let's start with your basic information
                  </CardDescription>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="full_name" className="text-[hsl(var(--text-primary))]">
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="full_name"
                        {...form.register('full_name')}
                        className="mt-1.5 bg-[hsl(var(--portal-dark))] border-[hsl(var(--primary))]/20 text-[hsl(var(--text-primary))]"
                        placeholder="John Doe"
                      />
                      {form.formState.errors.full_name && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.full_name.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="company_name" className="text-[hsl(var(--text-primary))]">
                        Company Name
                      </Label>
                      <Input
                        id="company_name"
                        {...form.register('company_name')}
                        className="mt-1.5 bg-[hsl(var(--portal-dark))] border-[hsl(var(--primary))]/20 text-[hsl(var(--text-primary))]"
                        placeholder="Acme Corp"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone_number" className="text-[hsl(var(--text-primary))]">
                        Phone Number
                      </Label>
                      <Input
                        id="phone_number"
                        {...form.register('phone_number')}
                        className="mt-1.5 bg-[hsl(var(--portal-dark))] border-[hsl(var(--primary))]/20 text-[hsl(var(--text-primary))]"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div>
                      <Label htmlFor="linkedin_url" className="text-[hsl(var(--text-primary))]">
                        LinkedIn Profile
                      </Label>
                      <Input
                        id="linkedin_url"
                        {...form.register('linkedin_url')}
                        className="mt-1.5 bg-[hsl(var(--portal-dark))] border-[hsl(var(--primary))]/20 text-[hsl(var(--text-primary))]"
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                      {form.formState.errors.linkedin_url && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.linkedin_url.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Business Background */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <CardTitle className="text-2xl text-[hsl(var(--text-primary))]">Business Background</CardTitle>
                  <CardDescription className="text-[hsl(var(--text-secondary))]">
                    Tell us about your current business situation
                  </CardDescription>

                  <div className="space-y-6">
                    <div>
                      <Label className="text-[hsl(var(--text-primary))] mb-3 block">
                        Do you currently own a business?
                      </Label>
                      <RadioGroup
                        onValueChange={(value) => form.setValue('owns_business', value === 'true')}
                        defaultValue="false"
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
                          <Label htmlFor="business_type" className="text-[hsl(var(--text-primary))]">
                            Business Type
                          </Label>
                          <Select onValueChange={(value) => form.setValue('business_type', value)}>
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
                          <Label htmlFor="annual_revenue" className="text-[hsl(var(--text-primary))]">
                            Annual Revenue
                          </Label>
                          <Select onValueChange={(value) => form.setValue('annual_revenue', value)}>
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
                          <Label htmlFor="annual_profit" className="text-[hsl(var(--text-primary))]">
                            Annual Profit
                          </Label>
                          <Select onValueChange={(value) => form.setValue('annual_profit', value)}>
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
                  </div>
                </div>
              )}

              {/* Step 3: Investment Criteria */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <CardTitle className="text-2xl text-[hsl(var(--text-primary))]">Investment Criteria</CardTitle>
                  <CardDescription className="text-[hsl(var(--text-secondary))]">
                    What type of businesses are you looking for?
                  </CardDescription>

                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="acquisition_goal" className="text-[hsl(var(--text-primary))]">
                        Acquisition Goal
                      </Label>
                      <Select onValueChange={(value) => form.setValue('acquisition_goal', value)}>
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
                      <Label className="text-[hsl(var(--text-primary))] mb-3 block">
                        Ideal Business Types
                      </Label>
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
                  </div>
                </div>
              )}

              {/* Step 4: Financial Parameters */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <CardTitle className="text-2xl text-[hsl(var(--text-primary))]">Financial Parameters</CardTitle>
                  <CardDescription className="text-[hsl(var(--text-secondary))]">
                    Define your investment criteria
                  </CardDescription>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="asking_price_min" className="text-[hsl(var(--text-primary))]">
                          Min Asking Price
                        </Label>
                        <Input
                          id="asking_price_min"
                          type="number"
                          {...form.register('asking_price_min', { valueAsNumber: true })}
                          className="mt-1.5 bg-[hsl(var(--portal-dark))] border-[hsl(var(--primary))]/20 text-[hsl(var(--text-primary))]"
                          placeholder="100000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="asking_price_max" className="text-[hsl(var(--text-primary))]">
                          Max Asking Price
                        </Label>
                        <Input
                          id="asking_price_max"
                          type="number"
                          {...form.register('asking_price_max', { valueAsNumber: true })}
                          className="mt-1.5 bg-[hsl(var(--portal-dark))] border-[hsl(var(--primary))]/20 text-[hsl(var(--text-primary))]"
                          placeholder="5000000"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="referral_source" className="text-[hsl(var(--text-primary))]">
                        How did you hear about us?
                      </Label>
                      <Select onValueChange={(value) => form.setValue('referral_source', value)}>
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

                    {form.watch('referral_source') === 'other' && (
                      <div>
                        <Label htmlFor="referral_other_details" className="text-[hsl(var(--text-primary))]">
                          Please specify
                        </Label>
                        <Input
                          id="referral_other_details"
                          {...form.register('referral_other_details')}
                          className="mt-1.5 bg-[hsl(var(--portal-dark))] border-[hsl(var(--primary))]/20 text-[hsl(var(--text-primary))]"
                          placeholder="Tell us more"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 5: Review & Submit */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <CardTitle className="text-2xl text-[hsl(var(--text-primary))]">Review & Submit</CardTitle>
                  <CardDescription className="text-[hsl(var(--text-secondary))]">
                    Review your information before submitting
                  </CardDescription>

                  <div className="space-y-4 p-4 bg-[hsl(var(--portal-dark))] rounded-lg">
                    <div>
                      <p className="text-[hsl(var(--text-secondary))] text-sm">Name</p>
                      <p className="text-[hsl(var(--text-primary))]">{form.watch('full_name')}</p>
                    </div>
                    {form.watch('company_name') && (
                      <div>
                        <p className="text-[hsl(var(--text-secondary))] text-sm">Company</p>
                        <p className="text-[hsl(var(--text-primary))]">{form.watch('company_name')}</p>
                      </div>
                    )}
                    {form.watch('acquisition_goal') && (
                      <div>
                        <p className="text-[hsl(var(--text-secondary))] text-sm">Acquisition Goal</p>
                        <p className="text-[hsl(var(--text-primary))] capitalize">{form.watch('acquisition_goal')}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox id="nda-agree" required />
                    <Label htmlFor="nda-agree" className="text-[hsl(var(--text-secondary))] text-sm cursor-pointer">
                      I understand I'll need to sign NDAs to view confidential information
                    </Label>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-[hsl(var(--primary))]/20">
                <div>
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleBack}
                      className="text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleSkip}
                    className="text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]"
                  >
                    Skip for now
                  </Button>

                  {currentStep < totalSteps ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90"
                    >
                      Continue
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                   ) : (
                    <Button
                      type="submit"
                      disabled={loading}
                      onClick={() => console.log('[InvestorOnboarding] Submit button clicked, form valid:', form.formState.isValid, 'errors:', form.formState.errors)}
                      className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90"
                    >
                      {loading ? 'Submitting...' : 'Complete Profile'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Quick Exit */}
              <div className="text-center mt-6">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => navigate('/investor-portal')}
                  className="text-[hsl(var(--text-secondary))] text-sm hover:text-[hsl(var(--primary))]"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Take me to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default InvestorOnboarding;
