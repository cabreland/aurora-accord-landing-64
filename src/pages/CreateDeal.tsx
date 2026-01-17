import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ChevronLeft, ChevronRight, Check, Loader2, Save, AlertCircle, X, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { setupDealSystems } from '@/lib/deal-system-setup';
import { formatDistanceToNow } from 'date-fns';

import { BasicInfoStep } from '@/components/deals/wizard/BasicInfoStep';
import { CompanyDetailsStep } from '@/components/deals/wizard/CompanyDetailsStep';
import { FinancialsStep } from '@/components/deals/wizard/FinancialsStep';
import { GrowthStrategyStep } from '@/components/deals/wizard/GrowthStrategyStep';
import { FounderTeamStep } from '@/components/deals/wizard/FounderTeamStep';
import { StrategicAnalysisStep } from '@/components/deals/wizard/StrategicAnalysisStep';
import { EnhancedDocumentsStep } from '@/components/deals/wizard/EnhancedDocumentsStep';
import { PublishingStep } from '@/components/deals/wizard/PublishingStep';
import { SystemSetupStep } from '@/components/deals/wizard/SystemSetupStep';
import { DealSuccessModal } from '@/components/deals/wizard/DealSuccessModal';
import type { DealFormData } from '@/components/deals/wizard/DealWizard';

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

const CreateDeal: React.FC = () => {
  const navigate = useNavigate();
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

  // Load draft on mount
  useEffect(() => {
    if (user) {
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
  }, [user]);

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
    if (showDraftPrompt) return;
    
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
  }, [formData, currentStep, showDraftPrompt, saveDraft]);

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

  const handleClose = () => {
    navigate('/deals');
  };

  // Focus first input on step change
  useEffect(() => {
    if (showDraftPrompt) return;
    
    const timer = setTimeout(() => {
      if (contentRef.current) {
        const firstInput = contentRef.current.querySelector('input:not([type=\"hidden\"]), textarea, select');
        if (firstInput instanceof HTMLElement) {
          firstInput.focus();
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [currentStep, showDraftPrompt]);

  // Keyboard navigation - use document instead of window for better compatibility
  useEffect(() => {
    if (showDraftPrompt) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const isInputField = tagName === 'input' || tagName === 'textarea' || tagName === 'select' || target.isContentEditable;
      
      // Handle Escape - always close
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        navigate('/deals');
        return;
      }
      
      // Handle Cmd/Ctrl+S - always save (even in input fields)
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        e.stopPropagation();
        saveDraft();
        toast({
          title: "Draft Saved",
          description: "Your progress has been saved.",
        });
        return;
      }
      
      // Don't trigger navigation from input fields
      if (isInputField) return;
      
      // Handle Enter (not in input) - go next
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        if (currentStep < steps.length - 1 && validateStep(currentStep)) {
          setCurrentStep(prev => prev + 1);
        }
        return;
      }
      
      // Handle Shift+Enter (not in input) - go back
      if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        if (currentStep > 0) {
          setCurrentStep(prev => prev - 1);
        }
        return;
      }
    };

    // Use capture phase for better event handling
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [showDraftPrompt, currentStep, saveDraft, validateStep, toast, navigate]);

  // Helper: Map file to appropriate data room folder based on name/type
  const mapFileToFolder = (fileName: string, folders: { id: string; name: string }[]): { id: string; name: string } | undefined => {
    const lowerName = fileName.toLowerCase();
    
    // Check for financial documents
    if (lowerName.includes('financial') || lowerName.includes('p&l') || lowerName.includes('balance') || 
        lowerName.includes('income') || lowerName.includes('revenue') || lowerName.includes('tax') ||
        lowerName.includes('audit') || lowerName.includes('budget')) {
      return folders.find(f => f.name === 'Financials');
    }
    
    // Check for legal/corporate documents
    if (lowerName.includes('legal') || lowerName.includes('contract') || lowerName.includes('agreement') ||
        lowerName.includes('article') || lowerName.includes('bylaws') || lowerName.includes('certificate') ||
        lowerName.includes('license') || lowerName.includes('permit') || lowerName.includes('incorporation')) {
      return folders.find(f => f.name === 'Corporate & Legal');
    }
    
    // Check for operations documents
    if (lowerName.includes('operation') || lowerName.includes('process') || lowerName.includes('procedure') ||
        lowerName.includes('workflow') || lowerName.includes('sop') || lowerName.includes('manual')) {
      return folders.find(f => f.name === 'Operations');
    }
    
    // Check for marketing/sales documents
    if (lowerName.includes('marketing') || lowerName.includes('sales') || lowerName.includes('campaign') ||
        lowerName.includes('branding') || lowerName.includes('pitch') || lowerName.includes('deck')) {
      return folders.find(f => f.name === 'Marketing & Sales');
    }
    
    // Check for client/customer documents
    if (lowerName.includes('client') || lowerName.includes('customer') || lowerName.includes('account')) {
      return folders.find(f => f.name === 'Client Base & Contracts');
    }
    
    // Check for technology documents
    if (lowerName.includes('tech') || lowerName.includes('software') || lowerName.includes('api') ||
        lowerName.includes('integration') || lowerName.includes('system') || lowerName.includes('architecture')) {
      return folders.find(f => f.name === 'Technology & Integrations');
    }
    
    // Check for debt documents
    if (lowerName.includes('debt') || lowerName.includes('loan') || lowerName.includes('credit') ||
        lowerName.includes('mortgage') || lowerName.includes('liability')) {
      return folders.find(f => f.name === 'Debt Documents');
    }
    
    // Default to Miscellaneous
    return folders.find(f => f.name === 'Miscellaneous');
  };

  // CRITICAL: handleSubmit with document mapping and activity logging
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
          created_by: user.id,
          listing_received_at: new Date().toISOString()
        })
        .select()
        .single();

      if (dealError) throw dealError;

      // Log deal creation activity
      await supabase.from('deal_activities').insert({
        deal_id: deal.id,
        user_id: user.id,
        activity_type: 'deal_created',
        entity_type: 'deal',
        entity_id: deal.id,
        metadata: {
          company_name: formData.company_name,
          industry: formData.industry,
          status: formData.status
        }
      });

      // Setup Due Diligence Tracker and Data Room FIRST (before document upload)
      // This ensures folders exist before we try to map documents to them
      let dataRoomFolders: { id: string; name: string }[] = [];
      
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
          
          // Fetch the created folders for document mapping
          const { data: folders } = await supabase
            .from('data_room_folders')
            .select('id, name')
            .eq('deal_id', deal.id);
          
          if (folders) {
            dataRoomFolders = folders;
          }
        }
      }

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

            // Save document metadata to documents table (library)
            const { error: docError } = await supabase
              .from('documents')
              .insert({
                deal_id: deal.id,
                name: file.name,
                file_path: fileName,
                file_size: file.size,
                file_type: file.type,
                tag: 'other',
                uploaded_by: user.id
              });

            if (docError) {
              console.error('Document metadata save error for', file.name, ':', docError);
            }

            // CRITICAL FIX: Also add to data_room_documents if data room was created
            if (formData.createDataRoom && dataRoomFolders.length > 0) {
              const targetFolder = mapFileToFolder(file.name, dataRoomFolders);
              
              if (targetFolder) {
                const { error: drDocError } = await supabase
                  .from('data_room_documents')
                  .insert({
                    deal_id: deal.id,
                    folder_id: targetFolder.id,
                    file_name: file.name,
                    file_path: fileName,
                    file_size: file.size,
                    file_type: fileExt || null,
                    mime_type: file.type,
                    status: 'pending_review',
                    uploaded_by: user.id,
                    version: 1
                  });

                if (drDocError) {
                  console.error('Data room document error for', file.name, ':', drDocError);
                } else {
                  console.log(`Mapped ${file.name} to data room folder: ${targetFolder.name}`);
                  
                  // Log document upload activity
                  await supabase.from('deal_activities').insert({
                    deal_id: deal.id,
                    user_id: user.id,
                    activity_type: 'document_uploaded',
                    entity_type: 'document',
                    metadata: {
                      file_name: file.name,
                      folder_name: targetFolder.name,
                      file_size: file.size
                    }
                  });
                }
              }
            }

            console.log('Successfully uploaded document:', file.name);

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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Draft Resume Prompt - Overlay */}
      {showDraftPrompt && draftData && (
        <div className="fixed inset-0 bg-background/95 z-50 flex items-center justify-center p-6">
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Resume Previous Draft?</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-2">
                You have an unsaved draft for <strong>{draftData.formData.company_name || 'a new deal'}</strong> 
                from {formatDistanceToNow(new Date(draftData.timestamp), { addSuffix: true })}.
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Step {draftData.currentStep + 1} of {steps.length}: {steps[draftData.currentStep]?.title}
              </p>
              <div className="flex gap-2">
                <Button onClick={handleResumeDraft} size="sm">
                  Resume Draft
                </Button>
                <Button onClick={handleStartFresh} variant="outline" size="sm">
                  Start Fresh
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClose}
              className="h-auto p-0 hover:bg-transparent hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Deals
            </Button>
            <span>/</span>
            <span className="text-foreground">Create New Deal</span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Create New Deal</h1>
              <p className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
              </p>
            </div>
            <div className="flex items-center gap-4">
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
              <div className="text-sm font-medium">
                {Math.round(progress)}% Complete
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <Progress value={progress} className="mt-4" />
          
          {/* Step Indicators - Desktop */}
          <div className="hidden lg:flex items-center justify-between mt-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0 transition-colors
                  ${index < currentStep 
                    ? 'bg-primary text-primary-foreground' 
                    : index === currentStep 
                      ? 'bg-primary/20 text-primary border-2 border-primary' 
                      : 'bg-muted text-muted-foreground'
                  }
                `}>
                  {index < currentStep ? <Check className="w-3.5 h-3.5" /> : index + 1}
                </div>
                <span className={`ml-2 text-xs ${index === currentStep ? 'text-foreground font-medium' : 'text-muted-foreground'} hidden xl:inline`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`mx-3 h-px w-8 ${index < currentStep ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Mobile Step Indicators */}
          <div className="lg:hidden mt-4">
            <div className="flex items-center justify-center space-x-1.5">
              {steps.map((step, index) => (
                <div key={step.id} className={`
                  w-2.5 h-2.5 rounded-full transition-colors
                  ${index < currentStep 
                    ? 'bg-primary' 
                    : index === currentStep 
                      ? 'bg-primary' 
                      : 'bg-muted'
                  }
                `} />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto" ref={contentRef}>
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <CurrentStepComponent 
            data={formData}
            onChange={updateFormData}
            isValid={validateStep(currentStep)}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card sticky bottom-0 z-40">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 order-2 sm:order-1">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="h-10"
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
                className="h-10"
              >
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
            </div>

            <div className="flex items-center gap-2 order-1 sm:order-2 flex-1 sm:flex-none">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 sm:flex-none h-10"
              >
                Cancel
              </Button>
              
              {currentStep === steps.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 sm:flex-none h-10 min-w-[140px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Deal
                      <Check className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="flex-1 sm:flex-none h-10"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
          
          {/* Keyboard Hints - Desktop Only */}
          <div className="hidden sm:flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
            <span><kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px]">Enter</kbd> Continue</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px]">Shift+Enter</kbd> Back</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px]">⌘S</kbd> Save</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px]">Esc</kbd> Close</span>
          </div>
        </div>
      </footer>
      
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
    </div>
  );
};

export default CreateDeal;
