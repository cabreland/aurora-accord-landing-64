
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Save, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BasicsStep from './wizard/BasicsStep';
import DealStep from './wizard/DealStep';
import FinancialsStep from './wizard/FinancialsStep';
import HighlightsStep from './wizard/HighlightsStep';
import AccessStep from './wizard/AccessStep';
import ReviewStep from './wizard/ReviewStep';

interface CompanyWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (companyId: string) => void;
  editCompanyId?: string;
}

const steps = [
  { id: 'basics', title: 'Company Basics', component: BasicsStep },
  { id: 'deal', title: 'Deal Information', component: DealStep },
  { id: 'financials', title: 'Financials', component: FinancialsStep },
  { id: 'highlights', title: 'Highlights & Risks', component: HighlightsStep },
  { id: 'access', title: 'Access Defaults', component: AccessStep },
  { id: 'review', title: 'Review & Create', component: ReviewStep },
];

export interface CompanyFormData {
  // Basics
  name: string;
  industry: string;
  location: string;
  summary: string;
  
  // Deal
  stage: string;
  priority: string;
  fit_score: number;
  owner_id: string;
  
  // Financials
  revenue: string;
  ebitda: string;
  asking_price: string;
  
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
    passcode: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(true);
  const { toast } = useToast();

  const updateFormData = (stepData: Partial<CompanyFormData>) => {
    setFormData(prev => ({ ...prev, ...stepData }));
    // Auto-save as draft
    saveDraft({ ...formData, ...stepData });
  };

  const saveDraft = async (data: CompanyFormData) => {
    try {
      // TODO: Implement draft save to companies table with is_draft=true
      console.log('Saving draft:', data);
    } catch (error) {
      console.error('Error saving draft:', error);
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
      case 3: // Highlights
        return true; // Optional fields
      case 4: // Access
        return true; // Optional fields
      case 5: // Review
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

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implement company creation with is_draft=false
      console.log('Creating company:', formData);
      
      const mockCompanyId = `company-${Date.now()}`;
      
      toast({
        title: "Success",
        description: `Company "${formData.name}" has been created successfully.`,
      });
      
      onSuccess(mockCompanyId);
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {editCompanyId ? 'Edit Company' : 'Add New Company'}
          </DialogTitle>
        </DialogHeader>

        {/* Step Progress */}
        <div className="flex items-center justify-between mb-6 px-1">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index < currentStep
                      ? 'bg-primary text-primary-foreground'
                      : index === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                <span className="ml-2 text-sm text-foreground hidden sm:inline">
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="w-8 h-0.5 bg-muted mx-2" />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card className="bg-background border-border flex-1 min-h-0">
          <CardContent className="p-6 overflow-y-auto max-h-96">
            <CurrentStepComponent
              data={formData}
              onChange={updateFormData}
              isValid={validateStep(currentStep)}
            />
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border bg-card">
          <div className="flex items-center gap-2">
            {isDraft && (
              <Badge variant="outline" className="text-muted-foreground">
                Draft Auto-saved
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstStep}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <Button
              variant="outline"
              onClick={() => saveDraft(formData)}
              disabled={isSubmitting}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            
            {isLastStep ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !validateStep(currentStep)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isSubmitting ? 'Creating...' : 'Create Company'}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!validateStep(currentStep)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyWizard;
