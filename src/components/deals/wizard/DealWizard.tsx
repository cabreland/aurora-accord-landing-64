import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ChevronLeft, ChevronRight, Check, Loader2, Save, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { setupDealSystems } from '@/lib/deal-system-setup';
import { formatDistanceToNow } from 'date-fns';

import { BasicInfoStep } from './BasicInfoStep';
import { CompanyDetailsStep } from './CompanyDetailsStep';
import { FinancialsStep } from './FinancialsStep';
import { GrowthStrategyStep } from './GrowthStrategyStep';
import { FounderTeamStep } from './FounderTeamStep';
import { StrategicAnalysisStep } from './StrategicAnalysisStep';
import { EnhancedDocumentsStep } from './EnhancedDocumentsStep';
import { PublishingStep } from './PublishingStep';
import { SystemSetupStep } from './SystemSetupStep';
import { DealSuccessModal } from './DealSuccessModal';

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
  business_type: string;
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
  
  // System Setup
  createDueDiligence: boolean;
  createDataRoom: boolean;
}


const steps = [
  { id: 'basic', title: 'Basic Info', component: BasicInfoStep },
  { id: 'company', title: 'Company Details', component: CompanyDetailsStep },
  { id: 'financials', title: 'Financial Metrics', component: FinancialsStep },
  { id: 'growth', title: 'Growth & Strategy', component: GrowthStrategyStep },
  { id: 'founder', title: 'Founder & Team', component: FounderTeamStep },
  { id: 'strategic', title: 'Strategic Analysis', component: StrategicAnalysisStep },
  { id: 'documents', title: 'Documents', component: EnhancedDocumentsStep },
  { id: 'system', title: 'System Setup', component: SystemSetupStep },
  { id: 'publishing', title: 'Status & Publishing', component: PublishingStep },
];

// Draft storage key generator
const getDraftKey = (userId: string | undefined) => `deal-draft-${userId || 'anonymous'}`;
const DRAFT_EXPIRY_DAYS = 7;

// Initial form state
const getInitialFormData = (): DealFormData => ({
  title: '',
  company_name: '',
  industry: '',
  business_type: '',
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
  createDueDiligence: true,
  createDataRoom: true,
});


export const DealWizard: React.FC<DealWizardProps> = ({
  open,
  onOpenChange,
  onDealCreated
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdDealId, setCreatedDealId] = useState<string>('');
  const [createdDealName, setCreatedDealName] = useState<string>('');
  const [formData, setFormData] = useState<DealFormData>(getInitialFormData());
  
  // Draft state
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);
  const [draftData, setDraftData] = useState<{ formData: DealFormData; currentStep: number; timestamp: number } | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();

  // Load draft on open
  useEffect(() => {
    if (open && user) {
      const draftKey = getDraftKey(user.id);
      const storedDraft = localStorage.getItem(draftKey);
      
      if (storedDraft) {
        try {
          const parsed = JSON.parse(storedDraft);
          const draftAge = Date.now() - parsed.timestamp;
          const maxAge = DRAFT_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
          
          if (draftAge < maxAge && parsed.formData?.company_name) {
            setDraftData(parsed);
            setShowDraftPrompt(true);
          } else {
            // Draft expired, remove it
            localStorage.removeItem(draftKey);
          }
        } catch (e) {
          localStorage.removeItem(draftKey);
        }
      }
    }
  }, [open, user]);

  // Debounced auto-save
  const saveDraft = useCallback(() => {
    if (!user) return;
    
    setSaveStatus('saving');
    
    const draftKey = getDraftKey(user.id);
    const draftPayload = {
      formData: { ...formData, documents: [] }, // Don't store files in localStorage
      currentStep,
      timestamp: Date.now()
    };
    
    localStorage.setItem(draftKey, JSON.stringify(draftPayload));
    
    setTimeout(() => {
      setSaveStatus('saved');
      setLastSaved(new Date());
    }, 300);
  }, [formData, currentStep, user]);

  // Trigger save on form changes (debounced)
  useEffect(() => {
    if (!open || showDraftPrompt) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveDraft();
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formData, currentStep, open, showDraftPrompt, saveDraft]);

  // Clear draft on successful submission
  const clearDraft = useCallback(() => {
    if (user) {
      localStorage.removeItem(getDraftKey(user.id));
    }
  }, [user]);

  // Resume draft handler
  const handleResumeDraft = () => {
    if (draftData) {
      setFormData({ ...getInitialFormData(), ...draftData.formData });
      setCurrentStep(draftData.currentStep);
      setShowDraftPrompt(false);
      toast({
        title: "Draft Restored",
        description: "Your previous progress has been restored.",
      });
    }
  };

  // Start fresh handler
  const handleStartFresh = () => {
    clearDraft();
    setFormData(getInitialFormData());
    setCurrentStep(0);
    setShowDraftPrompt(false);
    setDraftData(null);
  };

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

  // Focus first input on step change
  useEffect(() => {
    if (!open || showDraftPrompt) return;
    
    const timer = setTimeout(() => {
      if (contentRef.current) {
        const firstInput = contentRef.current.querySelector('input:not([type="hidden"]), textarea, select');
        if (firstInput instanceof HTMLElement) {
          firstInput.focus();
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [currentStep, open, showDraftPrompt]);

  // Keyboard navigation
  useEffect(() => {
    if (!open || showDraftPrompt) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      
      if (e.key === 'Escape') {
        e.preventDefault();
        onOpenChange(false);
      } else if (e.key === 'Enter' && !isInputField && !e.shiftKey) {
        e.preventDefault();
        if (currentStep === steps.length - 1) {
          // Don't call handleSubmit here to avoid circular dependency - just navigate
        } else if (validateStep(currentStep)) {
          handleNext();
        }
      } else if (e.key === 'Enter' && e.shiftKey && !isInputField) {
        e.preventDefault();
        handlePrevious();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveDraft();
        toast({
          title: "Draft Saved",
          description: "Your progress has been saved.",
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, showDraftPrompt, currentStep, saveDraft, validateStep, handleNext, handlePrevious, onOpenChange, toast]);

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
          business_type: formData.business_type || null,
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

      // Upload documents to the data room if any exist
      if (formData.documents.length > 0) {
        console.log(`Uploading ${formData.documents.length} documents for deal ${deal.id}`);
        
        // Fetch data room folders for intelligent assignment
        const { data: dataRoomFolders } = await supabase
          .from('data_room_folders')
          .select('*')
          .eq('deal_id', deal.id);

        const { mapFileToFolder } = await import('@/lib/data/mapFileToFolder');

        for (const file of formData.documents) {
          try {
            const fileName = `${deal.id}/${Date.now()}-${file.name}`;
            
            // Upload to the data-room-documents bucket
            const { data: storageData, error: storageError } = await supabase.storage
              .from('data-room-documents')
              .upload(fileName, file);

            if (storageError) {
              console.error('Storage upload error for', file.name, ':', storageError);
              continue;
            }

            // Auto-detect folder assignment
            const folderId = dataRoomFolders 
              ? mapFileToFolder(file.name, dataRoomFolders as any)
              : null;

            // Save to data_room_documents table
            const { error: docError } = await supabase
              .from('data_room_documents')
              .insert({
                deal_id: deal.id,
                file_name: file.name,
                file_path: fileName,
                file_size: file.size,
                file_type: file.type,
                mime_type: file.type,
                folder_id: folderId,
                uploaded_by: user.id,
                status: 'pending_review',
              });

            if (docError) {
              console.error('Document metadata save error for', file.name, ':', docError);
            } else {
              console.log('Successfully uploaded document:', file.name, 'to folder:', folderId || 'Unassigned');
            }

          } catch (error) {
            console.error('Error processing document:', file.name, error);
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

      // Setup Due Diligence Tracker and Data Room if selected
      if (formData.createDueDiligence || formData.createDataRoom) {
        const setupResults = await setupDealSystems(deal.id, {
          dueDiligence: formData.createDueDiligence,
          dataRoom: formData.createDataRoom
        });

        if (formData.createDueDiligence && setupResults.dueDiligence?.success) {
          toast({
            title: "Due Diligence Tracker Created",
            description: `${setupResults.dueDiligence.requestsCreated} requests ready for tracking`,
          });
        }

        if (formData.createDataRoom && setupResults.dataRoom?.success) {
          toast({
            title: "Data Room Created",
            description: `${setupResults.dataRoom.foldersCreated} folders ready for uploads`,
          });
        }
      }

      // Store deal info for success modal
      setCreatedDealId(deal.id);
      setCreatedDealName(formData.company_name);

      // Clear draft from localStorage
      clearDraft();
      
      // Reset form
      setFormData(getInitialFormData());
      setCurrentStep(0);
      setSaveStatus('idle');
      setLastSaved(null);
      onDealCreated();
      onOpenChange(false);
      
      // Show success modal
      setShowSuccessModal(true);

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
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-6xl h-[95vh] overflow-auto p-0 flex flex-col">
        {/* Draft Resume Prompt */}
        {showDraftPrompt && draftData && (
          <div className="absolute inset-0 bg-background/95 z-50 flex items-center justify-center p-6">
            <Alert className="max-w-md shadow-lg">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-base font-semibold">Resume Previous Draft?</AlertTitle>
              <AlertDescription className="mt-3">
                <p className="font-semibold text-foreground mb-0.5">
                  {draftData.formData.company_name || 'Unnamed Deal'}
                </p>
                <p className="text-sm text-muted-foreground mb-1">
                  Picked up at Step {draftData.currentStep + 1} of {steps.length} — {steps[draftData.currentStep]?.title}
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Auto-saved {formatDistanceToNow(new Date(draftData.timestamp), { addSuffix: true })}
                </p>
                <div className="flex flex-col gap-2">
                  <Button onClick={handleResumeDraft} className="w-full">
                    Resume Draft
                  </Button>
                  <Button onClick={handleStartFresh} variant="ghost" className="w-full text-destructive hover:text-destructive">
                    Start Fresh
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}

        <div className="flex flex-col h-full min-h-0">
          {/* Header */}
          <div className="border-b border-border p-3 sm:p-4 shrink-0 bg-background">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground truncate">Create New Deal</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Save Status Indicator */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {saveStatus === 'saving' && (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Saving...</span>
                    </>
                  )}
                  {saveStatus === 'saved' && lastSaved && (
                    <>
                      <Check className="w-3 h-3 text-green-500" />
                      <span>Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}</span>
                    </>
                  )}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                  {Math.round(progress)}% Complete
                </div>
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
          <div className="flex-1 overflow-y-auto min-h-0 overscroll-contain" ref={contentRef}>
            <div className="p-3 sm:p-6 pb-8">
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
          <div className="border-t border-border p-3 sm:p-4 shrink-0 bg-background mt-auto">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 order-2 sm:order-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="flex items-center justify-center h-9 min-w-[100px]"
                  size="sm"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                
                {/* Manual Save Button */}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    saveDraft();
                    toast({
                      title: "Draft Saved",
                      description: "Your progress has been saved.",
                    });
                  }}
                  className="h-9"
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
              </div>

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
            
            {/* Keyboard Hints - Desktop Only */}
            <div className="hidden sm:flex items-center justify-center gap-4 mt-2 text-[10px] text-muted-foreground">
              <span><kbd className="px-1 py-0.5 rounded bg-muted border border-border text-[10px]">Enter</kbd> Continue</span>
              <span><kbd className="px-1 py-0.5 rounded bg-muted border border-border text-[10px]">Shift+Enter</kbd> Back</span>
              <span><kbd className="px-1 py-0.5 rounded bg-muted border border-border text-[10px]">⌘S</kbd> Save</span>
              <span><kbd className="px-1 py-0.5 rounded bg-muted border border-border text-[10px]">Esc</kbd> Close</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    
    {/* Success Modal */}
    <DealSuccessModal
      open={showSuccessModal}
      onOpenChange={setShowSuccessModal}
      dealId={createdDealId}
      dealName={createdDealName}
      industry={formData.industry}
      askingPrice={formData.asking_price}
      createdDueDiligence={formData.createDueDiligence}
      createdDataRoom={formData.createDataRoom}
    />
  </>
  );
};