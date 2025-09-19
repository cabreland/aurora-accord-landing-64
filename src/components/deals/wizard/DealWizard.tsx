import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

import { BasicInfoStep } from './BasicInfoStep';
import { CompanyDetailsStep } from './CompanyDetailsStep';
import { FinancialsStep } from './FinancialsStep';
import { GrowthStrategyStep } from './GrowthStrategyStep';
import { FounderTeamStep } from './FounderTeamStep';
import { StrategicAnalysisStep } from './StrategicAnalysisStep';
import { EnhancedDocumentsStep } from './EnhancedDocumentsStep';
import { PublishingStep } from './PublishingStep';

interface DealWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDealCreated: () => void;
}

export interface DealFormData {
  // Basic Info
  title: string;
  company_name: string;
  industry: string;
  location: string;
  description: string;
  
  // Company Details
  company_overview: string;
  founded_year: number | null;
  team_size: string;
  reason_for_sale: string;
  
  // Financials
  revenue: string;
  ebitda: string;
  asking_price: string;
  profit_margin: string;
  customer_count: string;
  recurring_revenue: string;
  cac_ltv_ratio: string;
  growth_rate: string;
  
  // Growth & Strategy
  growth_opportunities: string[];
  market_position: string;
  competitive_advantages: string;
  strategic_fit: string;
  
  // Founder & Team
  founders_message: string;
  founder_name: string;
  founder_title: string;
  key_personnel: string;
  management_experience: string;
  
  // Strategic Analysis
  ideal_buyer_profile: string;
  rollup_potential: string;
  market_trends_alignment: string;
  
  // Documents
  documents: File[];
  document_categories: string[];
  
  // Publishing
  status: 'draft' | 'active' | 'archived';
  priority: 'low' | 'medium' | 'high';
  publish_immediately: boolean;
  scheduled_publish: Date | null;
}

const steps = [
  { id: 'basic', title: 'Basic Info', component: BasicInfoStep },
  { id: 'company', title: 'Company Details', component: CompanyDetailsStep },
  { id: 'financials', title: 'Financial Metrics', component: FinancialsStep },
  { id: 'growth', title: 'Growth & Strategy', component: GrowthStrategyStep },
  { id: 'founder', title: 'Founder & Team', component: FounderTeamStep },
  { id: 'strategic', title: 'Strategic Analysis', component: StrategicAnalysisStep },
  { id: 'documents', title: 'Documents', component: EnhancedDocumentsStep },
  { id: 'publishing', title: 'Status & Publishing', component: PublishingStep },
];

export const DealWizard: React.FC<DealWizardProps> = ({
  open,
  onOpenChange,
  onDealCreated
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [formData, setFormData] = useState<DealFormData>({
    title: '',
    company_name: '',
    industry: '',
    location: '',
    description: '',
    company_overview: '',
    founded_year: null,
    team_size: '',
    reason_for_sale: '',
    revenue: '',
    ebitda: '',
    asking_price: '',
    profit_margin: '',
    customer_count: '',
    recurring_revenue: '',
    cac_ltv_ratio: '',
    growth_rate: '',
    growth_opportunities: [],
    market_position: '',
    competitive_advantages: '',
    strategic_fit: '',
    founders_message: '',
    founder_name: '',
    founder_title: '',
    key_personnel: '',
    management_experience: '',
    ideal_buyer_profile: '',
    rollup_potential: '',
    market_trends_alignment: '',
    documents: [],
    document_categories: [],
    status: 'draft',
    priority: 'medium',
    publish_immediately: false,
    scheduled_publish: null,
  });
  const { toast } = useToast();

  const updateFormData = (updates: Partial<DealFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const validateStep = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0: // Basic Info
        return !!(formData.title && formData.company_name);
      case 1: // Company Details
        return true; // Optional step
      case 2: // Financial Metrics
        return !!(formData.revenue || formData.ebitda);
      case 3: // Growth & Strategy
        return true; // Optional step
      case 4: // Founder & Team
        return true; // Optional step
      case 5: // Strategic Analysis
        return true; // Optional step
      case 6: // Documents
        return true; // Optional step
      case 7: // Status & Publishing
        return true; // Always valid
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      toast({
        title: "Validation Error",
        description: "Please fill in the required fields",
        variant: "destructive",
      });
      return;
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast({
        title: "Validation Error",
        description: "Please fill in the required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      if (!user) throw new Error('User not authenticated');

      // Create the deal with comprehensive data
      const { data: deal, error: dealError } = await supabase
        .from('deals')
        .insert({
          title: formData.title,
          company_name: formData.company_name,
          industry: formData.industry,
          location: formData.location,
          description: formData.description,
          company_overview: formData.company_overview,
          founded_year: formData.founded_year,
          team_size: formData.team_size,
          reason_for_sale: formData.reason_for_sale,
          revenue: formData.revenue,
          ebitda: formData.ebitda,
          asking_price: formData.asking_price,
          profit_margin: formData.profit_margin,
          customer_count: formData.customer_count,
          recurring_revenue: formData.recurring_revenue,
          cac_ltv_ratio: formData.cac_ltv_ratio,
          growth_rate: formData.growth_rate,
          growth_opportunities: formData.growth_opportunities,
          founders_message: formData.founders_message,
          founder_name: formData.founder_name,
          founder_title: formData.founder_title,
          ideal_buyer_profile: formData.ideal_buyer_profile,
          rollup_potential: formData.rollup_potential,
          market_trends_alignment: formData.market_trends_alignment,
          status: formData.status,
          priority: formData.priority,
          created_by: user.id
        })
        .select()
        .single();

      if (dealError) throw dealError;

      // Upload documents if any exist
      if (formData.documents.length > 0) {
        console.log(`Uploading ${formData.documents.length} documents for deal ${deal.id}`);
        
        for (const file of formData.documents) {
          try {
            // Generate unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${deal.id}/${Date.now()}-${file.name}`;
            
            // Upload to Supabase Storage
            const { data: storageData, error: storageError } = await supabase.storage
              .from('deal-documents')
              .upload(fileName, file);

            if (storageError) {
              console.error('Storage upload error for', file.name, ':', storageError);
              continue; // Skip this file but continue with others
            }

            // Save document metadata to database
            const { error: docError } = await supabase
              .from('documents')
              .insert({
                deal_id: deal.id,
                name: file.name,
                file_path: fileName,
                file_size: file.size,
                file_type: file.type,
                tag: 'other', // Default tag, can be enhanced later
                uploaded_by: user.id
              });

            if (docError) {
              console.error('Document metadata save error for', file.name, ':', docError);
              // Continue with other files even if one fails
            } else {
              console.log('Successfully uploaded document:', file.name);
            }

          } catch (error) {
            console.error('Error processing document:', file.name, error);
            // Continue with other files
          }
        }
      }

      // Create associated company record with full details
      const { error: companyError } = await supabase
        .from('companies')
        .insert({
          name: formData.company_name,
          industry: formData.industry,
          location: formData.location,
          summary: formData.description,
          revenue: formData.revenue,
          ebitda: formData.ebitda,
          asking_price: formData.asking_price,
          owner_id: user.id,
          is_draft: formData.status === 'draft',
            teaser_payload: {
              growth_opportunities: formData.growth_opportunities,
              market_position: formData.market_position,
              competitive_advantages: formData.competitive_advantages,
              strategic_fit: formData.strategic_fit,
              founders_message: formData.founders_message,
              team_size: formData.team_size,
              key_personnel: formData.key_personnel,
              management_experience: formData.management_experience,
              profit_margin: formData.profit_margin,
              growth_rate: formData.growth_rate
            }
        });

      if (companyError) {
        console.warn('Company creation failed:', companyError);
        // Don't fail the entire process if company creation fails
      }

      toast({
        title: "Success",
        description: `Deal created successfully with ${formData.documents.length} documents uploaded`,
      });

      // Reset form and close
      setFormData({
        title: '',
        company_name: '',
        industry: '',
        location: '',
        description: '',
        company_overview: '',
        founded_year: null,
        team_size: '',
        reason_for_sale: '',
        revenue: '',
        ebitda: '',
        asking_price: '',
        profit_margin: '',
        customer_count: '',
        recurring_revenue: '',
        cac_ltv_ratio: '',
        growth_rate: '',
        growth_opportunities: [],
        market_position: '',
        competitive_advantages: '',
        strategic_fit: '',
        founders_message: '',
        founder_name: '',
        founder_title: '',
        key_personnel: '',
        management_experience: '',
        ideal_buyer_profile: '',
        rollup_potential: '',
        market_trends_alignment: '',
        documents: [],
        document_categories: [],
        status: 'draft',
        priority: 'medium',
        publish_immediately: false,
        scheduled_publish: null,
      });
      setCurrentStep(0);
      onDealCreated();
      onOpenChange(false);

    } catch (error: any) {
      console.error('Error creating deal:', error);
      toast({
        title: "Error",
        description: "Failed to create deal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-6xl h-[95vh] overflow-hidden p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="border-b border-border p-3 sm:p-4 shrink-0 bg-background">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground truncate">Create New Deal</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
                </p>
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                {Math.round(progress)}% Complete
              </div>
            </div>
            
            {/* Progress Bar */}
            <Progress value={progress} className="mb-3" />
            
            {/* Step Indicators - Desktop */}
            <div className="hidden lg:flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0
                    ${index < currentStep 
                      ? 'bg-primary text-primary-foreground' 
                      : index === currentStep 
                        ? 'bg-primary/20 text-primary border-2 border-primary' 
                        : 'bg-muted text-muted-foreground'
                    }
                  `}>
                    {index < currentStep ? <Check className="w-3 h-3" /> : index + 1}
                  </div>
                  <span className={`ml-2 text-xs ${index === currentStep ? 'text-foreground font-medium' : 'text-muted-foreground'} hidden xl:inline`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`mx-2 h-px w-6 ${index < currentStep ? 'bg-primary' : 'bg-muted'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Mobile Step Indicators */}
            <div className="lg:hidden">
              <div className="flex items-center justify-center space-x-2">
                {steps.map((step, index) => (
                  <div key={step.id} className={`
                    w-2 h-2 rounded-full
                    ${index < currentStep 
                      ? 'bg-primary' 
                      : index === currentStep 
                        ? 'bg-primary border border-primary' 
                        : 'bg-muted'
                    }
                  `} />
                ))}
              </div>
              <p className="text-center text-xs text-muted-foreground mt-2">
                {steps[currentStep].title}
              </p>
            </div>
          </div>

          {/* Step Content - Scrollable Area */}
          <div className="flex-1 overflow-y-auto min-h-0 overscroll-contain">
            <div className="p-3 sm:p-6 pb-4">
              <div className="max-w-3xl mx-auto">
                <CurrentStepComponent 
                  data={formData}
                  onChange={updateFormData}
                  isValid={validateStep(currentStep)}
                />
              </div>
            </div>
          </div>

          {/* Footer - Sticky at Bottom */}
          <div className="border-t border-border p-3 sm:p-4 shrink-0 bg-background sticky bottom-0 z-10">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center justify-center h-9 order-2 sm:order-1 min-w-[100px]"
                size="sm"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <div className="flex items-center gap-2 order-1 sm:order-2 flex-1 sm:flex-none">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 sm:flex-none h-9 min-w-[80px]"
                  size="sm"
                >
                  Cancel
                </Button>
                
                {currentStep === steps.length - 1 ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center justify-center flex-1 sm:flex-none h-9 min-w-[120px]"
                    size="sm"
                  >
                    {loading ? 'Creating...' : 'Create Deal'}
                    <Check className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    className="flex items-center justify-center flex-1 sm:flex-none h-9 min-w-[80px]"
                    size="sm"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};