import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Sparkles, ChevronRight, Building2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDealsWithDiligence, useDiligenceTemplates, useApplyDiligenceTemplate } from '@/hooks/useDiligenceTracker';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface CreateTrackerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateTrackerDialog: React.FC<CreateTrackerDialogProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'deal' | 'method' | 'template'>('deal');
  const [selectedDealId, setSelectedDealId] = useState<string>('');
  const [method, setMethod] = useState<'template' | 'scratch'>('template');
  
  const { data: dealsWithDiligence = [] } = useDealsWithDiligence();
  const { data: templates = [] } = useDiligenceTemplates();
  const applyTemplate = useApplyDiligenceTemplate();
  
  // Get all deals without existing trackers
  const { data: allDeals = [] } = useQuery({
    queryKey: ['all-deals-for-tracker'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('id, company_name, title, status, industry')
        .eq('status', 'active');
      
      if (error) throw error;
      return data;
    }
  });
  
  const dealsWithoutTrackers = allDeals.filter(
    deal => !dealsWithDiligence.some(d => d.id === deal.id && d.total_requests > 0)
  );
  
  const selectedDeal = allDeals.find(d => d.id === selectedDealId);
  
  const handleSelectTemplate = async (templateId: string) => {
    if (!selectedDealId) return;
    
    await applyTemplate.mutateAsync({ dealId: selectedDealId, templateId });
    onOpenChange(false);
    navigate(`/dashboard/diligence-tracker/${selectedDealId}`);
  };
  
  const handleStartFromScratch = () => {
    if (!selectedDealId) return;
    onOpenChange(false);
    navigate(`/dashboard/diligence-tracker/${selectedDealId}`);
  };
  
  const resetDialog = () => {
    setStep('deal');
    setSelectedDealId('');
    setMethod('template');
  };
  
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetDialog();
    }
    onOpenChange(newOpen);
  };

  // Step indicators
  const steps = [
    { key: 'deal', label: 'Select Deal', number: 1 },
    { key: 'method', label: 'Choose Method', number: 2 },
    { key: 'template', label: 'Apply Template', number: 3 },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">Add Deal to Due Diligence</DialogTitle>
        </DialogHeader>
        
        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-2 py-4 border-b border-gray-100">
          {steps.map((s, index) => {
            const isActive = s.key === step;
            const isCompleted = index < currentStepIndex;
            const isClickable = index <= currentStepIndex;
            
            return (
              <React.Fragment key={s.key}>
                <button
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
                    isActive 
                      ? 'bg-blue-100 text-blue-700' 
                      : isCompleted 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-400'
                  } ${isClickable ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed'}`}
                  onClick={() => {
                    if (isCompleted) {
                      setStep(s.key as 'deal' | 'method' | 'template');
                    }
                  }}
                  disabled={!isClickable}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                    isActive ? 'bg-blue-600 text-white' : isCompleted ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-500'
                  }`}>
                    {isCompleted ? '✓' : s.number}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {index < steps.length - 1 && (
                  <ChevronRight className={`w-4 h-4 ${index < currentStepIndex ? 'text-green-400' : 'text-gray-300'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
        
        {step === 'deal' && (
          <div className="space-y-6 py-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Select a deal to create a tracker for
              </label>
              <Select value={selectedDealId} onValueChange={setSelectedDealId}>
                <SelectTrigger className="w-full bg-gray-50 border-gray-200 text-gray-900">
                  <SelectValue placeholder="Choose a deal..." />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {dealsWithoutTrackers.length === 0 ? (
                    <SelectItem value="_none" disabled>
                      No deals available
                    </SelectItem>
                  ) : (
                    dealsWithoutTrackers.map((deal) => (
                      <SelectItem key={deal.id} value={deal.id}>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          <span>{deal.company_name}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500">{deal.title}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {dealsWithoutTrackers.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  All active deals already have diligence trackers.
                </p>
              )}
            </div>
            
            {selectedDeal && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{selectedDeal.company_name}</div>
                      <div className="text-sm text-gray-600">{selectedDeal.title} • {selectedDeal.industry || 'Technology'}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="flex justify-end">
              <Button
                onClick={() => setStep('method')}
                disabled={!selectedDealId}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
        
        {step === 'method' && (
          <div className="space-y-6 py-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-4 block">
                How would you like to set up the tracker?
              </label>
              <div className="grid grid-cols-2 gap-4">
                <Card 
                  className={`cursor-pointer transition-all ${
                    method === 'template' 
                      ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200' 
                      : 'bg-white border-gray-200 hover:border-blue-200 hover:shadow-sm'
                  }`}
                  onClick={() => setMethod('template')}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl mx-auto mb-3 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Use Template</h3>
                    <p className="text-sm text-gray-500">
                      Pre-built checklists for common industries with 100+ items
                    </p>
                    <Badge className="mt-3 bg-green-100 text-green-700 hover:bg-green-100">
                      Recommended
                    </Badge>
                  </CardContent>
                </Card>
                
                <Card 
                  className={`cursor-pointer transition-all ${
                    method === 'scratch' 
                      ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200' 
                      : 'bg-white border-gray-200 hover:border-blue-200 hover:shadow-sm'
                  }`}
                  onClick={() => setMethod('scratch')}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl mx-auto mb-3 flex items-center justify-center">
                      <Plus className="w-6 h-6 text-gray-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Start From Scratch</h3>
                    <p className="text-sm text-gray-500">
                      Build a custom tracker tailored to this specific deal
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep('deal')}
                className="border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Back
              </Button>
              <Button
                onClick={() => method === 'template' ? setStep('template') : handleStartFromScratch()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {method === 'template' ? 'Choose Template' : 'Create Tracker'}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
        
        {step === 'template' && (
          <div className="space-y-6 py-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-4 block">
                Select a template to apply
              </label>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {templates.map((template) => {
                  const templateData = template.template_data;
                  const totalRequests = templateData?.categories?.reduce(
                    (acc, cat) => acc + (cat.requests?.length || 0), 
                    0
                  ) || 0;
                  const totalCategories = templateData?.categories?.length || 0;
                  
                  return (
                    <Card 
                      key={template.id}
                      className="bg-white border-gray-200 hover:border-blue-200 hover:shadow-sm transition-all"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{template.name}</h3>
                              {template.is_default && (
                                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  Default
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mb-2">{template.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              <span className="bg-gray-100 px-2 py-0.5 rounded">{totalRequests} requests</span>
                              <span className="bg-gray-100 px-2 py-0.5 rounded">{totalCategories} categories</span>
                              {template.industry && (
                                <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                                  Best for: {template.industry}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleSelectTemplate(template.id)}
                            disabled={applyTemplate.isPending}
                            className="bg-blue-600 hover:bg-blue-700 text-white ml-4"
                          >
                            {applyTemplate.isPending ? 'Applying...' : 'Use Template'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                
                {templates.length === 0 && (
                  <Card className="bg-gray-50 border-gray-200">
                    <CardContent className="p-8 text-center">
                      <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No templates available yet.</p>
                      <Button 
                        variant="link" 
                        className="text-blue-600 mt-2"
                        onClick={handleStartFromScratch}
                      >
                        Start from scratch instead
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep('method')}
                className="border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Back
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateTrackerDialog;
