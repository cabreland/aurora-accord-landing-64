
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Save, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { upsertCompanyDraft, finalizeCompany, getCompany } from '@/lib/data/companies';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import BasicsStep from './wizard/BasicsStep';
import DealStep from './wizard/DealStep';
import FinancialsStep from './wizard/FinancialsStep';
import HighlightsStep from './wizard/HighlightsStep';
import AccessStep from './wizard/AccessStep';
import ReviewStep from './wizard/ReviewStep';
import CompanyDetailsStep from './wizard/CompanyDetailsStep';

interface CompanyWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (companyId: string) => void;
  editCompanyId?: string;
}

const steps = [
  { id: 'basics', title: 'Basics', component: BasicsStep },
  { id: 'deal', title: 'Deal Info', component: DealStep },
  { id: 'financials', title: 'Financials', component: FinancialsStep },
  { id: 'details', title: 'Details', component: CompanyDetailsStep },
  { id: 'highlights', title: 'Highlights', component: HighlightsStep },
  { id: 'access', title: 'Access', component: AccessStep },
  { id: 'review', title: 'Review', component: ReviewStep },
];

export interface CompanyFormData {
  // Basics
  name: string;
  industry: string;
  location: string;
  summary: string;
  
  // Deal - Allow empty strings for initial state, but filter them out before saving
  stage: 'teaser' | 'discovery' | 'dd' | 'closing' | '';
  priority: 'low' | 'medium' | 'high' | '';
  fit_score: number;
  owner_id: string;
  
  // Financials
  revenue: string;
  ebitda: string;
  asking_price: string;
  
  // Company Details
  detailed_description?: string;
  founded_year?: string;
  team_size?: string;
  reason_for_sale?: string;
  growth_opportunities?: string[];
  founders_message?: string;
  founder_name?: string;
  ideal_buyer_profile?: string;
  rollup_potential?: string;
  market_trends?: string;
  profit_margin?: string;
  customer_count?: string;
  recurring_revenue?: string;
  cac_ltv_ratio?: string;
  placeholder_documents?: Array<{
    name: string;
    type: string;
    size: string;
    lastUpdated: string;
  }>;
  
  // Highlights & Risks
  highlights: string[];
  risks: string[];
  
  // Access
  passcode: string;
}

const CompanyWizard: React.FC<CompanyWizardProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editCompanyId
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    industry: '',
    location: '',
    summary: '',
    stage: '',
    priority: '',
    fit_score: 50,
    owner_id: '',
    revenue: '',
    ebitda: '',
    asking_price: '',
    highlights: [],
    risks: [],
    passcode: '',
    growth_opportunities: [],
    placeholder_documents: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftId, setDraftId] = useState<string | undefined>(editCompanyId);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { toast } = useToast();

  // Debounce form data for auto-save (400ms)
  const debouncedFormData = useDebounce(formData, 400);

  // Load existing company data if editing
  useEffect(() => {
    if (editCompanyId && isOpen) {
      loadCompanyData(editCompanyId);
    }
  }, [editCompanyId, isOpen]);

  // Auto-save draft when debounced form data changes
  useEffect(() => {
    if (isOpen && formData.name.trim() && user && !isSubmitting) {
      saveDraft();
    }
  }, [debouncedFormData, isOpen, user]);

  const loadCompanyData = async (companyId: string) => {
    try {
      const company = await getCompany(companyId);
      if (company) {
        setFormData({
          name: company.name || '',
          industry: company.industry || '',
          location: company.location || '',
          summary: company.summary || '',
          stage: company.stage || '',
          priority: company.priority || '',
          fit_score: company.fit_score || 50,
          owner_id: company.owner_id || user?.id || '',
          revenue: company.revenue || '',
          ebitda: company.ebitda || '',
          asking_price: company.asking_price || '',
          highlights: company.highlights || [],
          risks: company.risks || [],
          passcode: company.passcode || '',
          // Extended fields
          detailed_description: company.detailed_description || '',
          founded_year: company.founded_year || '',
          team_size: company.team_size || '',
          reason_for_sale: company.reason_for_sale || '',
          growth_opportunities: company.growth_opportunities || [],
          founders_message: company.founders_message || '',
          founder_name: company.founder_name || '',
          ideal_buyer_profile: company.ideal_buyer_profile || '',
          rollup_potential: company.rollup_potential || '',
          market_trends: company.market_trends || '',
          profit_margin: company.profit_margin || '',
          customer_count: company.customer_count || '',
          recurring_revenue: company.recurring_revenue || '',
          cac_ltv_ratio: company.cac_ltv_ratio || '',
          placeholder_documents: company.placeholder_documents || []
        });
      }
    } catch (error) {
      console.error('Error loading company data:', error);
      toast({
        title: "Error",
        description: "Failed to load company data",
        variant: "destructive",
      });
    }
  };

  const updateFormData = (stepData: Partial<CompanyFormData>) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  };

  const saveDraft = async () => {
    if (!user || isAutoSaving) return;
    
    try {
      setIsAutoSaving(true);
      // Convert form data to the format expected by the database
      const dataToSave = {
        name: formData.name,
        industry: formData.industry,
        location: formData.location,
        summary: formData.summary,
        stage: formData.stage !== '' ? formData.stage : undefined,
        priority: formData.priority !== '' ? formData.priority : undefined,
        fit_score: formData.fit_score,
        owner_id: formData.owner_id || user.id,
        revenue: formData.revenue,
        ebitda: formData.ebitda,
        asking_price: formData.asking_price,
        highlights: formData.highlights,
        risks: formData.risks,
        passcode: formData.passcode,
        // Extended fields
        detailed_description: formData.detailed_description,
        founded_year: formData.founded_year,
        team_size: formData.team_size,
        reason_for_sale: formData.reason_for_sale,
        growth_opportunities: formData.growth_opportunities,
        founders_message: formData.founders_message,
        founder_name: formData.founder_name,
        ideal_buyer_profile: formData.ideal_buyer_profile,
        rollup_potential: formData.rollup_potential,
        market_trends: formData.market_trends,
        profit_margin: formData.profit_margin,
        customer_count: formData.customer_count,
        recurring_revenue: formData.recurring_revenue,
        cac_ltv_ratio: formData.cac_ltv_ratio,
        placeholder_documents: formData.placeholder_documents
      };
      
      const id = await upsertCompanyDraft(dataToSave, draftId);
      setDraftId(id);
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: "Error",
        description: "Failed to save draft",
        variant: "destructive",
      });
    } finally {
      setIsAutoSaving(false);
    }
  };

  const validateStep = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0: // Basics
        return !!formData.name.trim();
      case 1: // Deal
        return !!formData.stage && !!formData.priority && !!formData.owner_id;
      case 2: // Financials
        return true; // Optional fields
      case 3: // Company Details
        return true; // Optional fields
      case 4: // Highlights
        return true; // Optional fields
      case 5: // Access
        return true; // Optional fields
      case 6: // Review
        return !!formData.name && !!formData.stage && !!formData.owner_id;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    } else {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields before proceeding.",
        variant: "destructive",
      });
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSaveDraft = async () => {
    if (!user) return;
    
    try {
      await saveDraft();
      toast({
        title: "Success",
        description: "Draft saved successfully",
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: "Error",
        description: "Failed to save draft",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep) || !draftId || isSubmitting) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert form data to the format expected by the database
      const finalData = {
        name: formData.name,
        industry: formData.industry,
        location: formData.location,
        summary: formData.summary,
        stage: formData.stage !== '' ? formData.stage : undefined,
        priority: formData.priority !== '' ? formData.priority : undefined,
        fit_score: formData.fit_score,
        owner_id: formData.owner_id || user?.id || '',
        revenue: formData.revenue,
        ebitda: formData.ebitda,
        asking_price: formData.asking_price,
        highlights: formData.highlights,
        risks: formData.risks,
        passcode: formData.passcode,
        // Extended fields
        detailed_description: formData.detailed_description,
        founded_year: formData.founded_year,
        team_size: formData.team_size,
        reason_for_sale: formData.reason_for_sale,
        growth_opportunities: formData.growth_opportunities,
        founders_message: formData.founders_message,
        founder_name: formData.founder_name,
        ideal_buyer_profile: formData.ideal_buyer_profile,
        rollup_potential: formData.rollup_potential,
        market_trends: formData.market_trends,
        profit_margin: formData.profit_margin,
        customer_count: formData.customer_count,
        recurring_revenue: formData.recurring_revenue,
        cac_ltv_ratio: formData.cac_ltv_ratio,
        placeholder_documents: formData.placeholder_documents
      };
      
      const companyId = await finalizeCompany(draftId, finalData);
      
      toast({
        title: "Success",
        description: `Company "${formData.name}" has been created successfully.`,
      });
      
      onSuccess(companyId);
      onClose();
    } catch (error) {
      console.error('Error creating company:', error);
      toast({
        title: "Error",
        description: "Failed to create company. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] overflow-hidden bg-card border-border">
        <DialogHeader className="pb-4 border-b border-border">
          <DialogTitle className="text-foreground text-xl">
            {editCompanyId ? 'Edit Company' : 'Add New Company'}
          </DialogTitle>
        </DialogHeader>

        {/* Step Progress */}
        <div className="py-4">
          <div className="flex items-center justify-center space-x-2 overflow-x-visible">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      index < currentStep
                        ? 'bg-primary text-primary-foreground'
                        : index === currentStep
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
                  </div>
                  <span className="mt-1 text-xs text-center text-foreground font-medium min-w-0">
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 transition-colors ${
                    index < currentStep ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="bg-background border-border flex-1 min-h-0">
          <CardContent className="p-6 overflow-y-auto" style={{ maxHeight: '60vh' }}>
            <CurrentStepComponent
              data={formData}
              onChange={updateFormData}
              isValid={validateStep(currentStep)}
            />
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="flex flex-col gap-4 pt-4 border-t border-border bg-card">
          {/* Status badges */}
          <div className="flex items-center justify-center">
            {isAutoSaving && (
              <Badge variant="outline" className="text-muted-foreground">
                Saving...
              </Badge>
            )}
            {draftId && !isAutoSaving && (
              <Badge variant="outline" className="text-success">
                Draft Saved
              </Badge>
            )}
          </div>
          
          {/* Buttons */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstStep || isSubmitting}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSubmitting || isAutoSaving || !formData.name.trim()}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </Button>
              
              {isLastStep ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !validateStep(currentStep) || !draftId}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Company'
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!validateStep(currentStep) || isSubmitting}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyWizard;
