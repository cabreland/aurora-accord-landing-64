import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Sparkles } from 'lucide-react';
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
        .select('id, company_name, title, status')
        .eq('status', 'active');
      
      if (error) throw error;
      return data;
    }
  });
  
  const dealsWithoutTrackers = allDeals.filter(
    deal => !dealsWithDiligence.some(d => d.id === deal.id && d.total_requests > 0)
  );
  
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-[#1A1F2E] border-[#2A2F3A] text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Create Diligence Tracker</DialogTitle>
        </DialogHeader>
        
        {step === 'deal' && (
          <div className="space-y-6 py-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Step 1: Select Deal
              </label>
              <Select value={selectedDealId} onValueChange={setSelectedDealId}>
                <SelectTrigger className="w-full bg-[#0A0F0F] border-[#2A2F3A]">
                  <SelectValue placeholder="Select a deal..." />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1F2E] border-[#2A2F3A]">
                  {dealsWithoutTrackers.length === 0 ? (
                    <SelectItem value="_none" disabled>
                      No deals available
                    </SelectItem>
                  ) : (
                    dealsWithoutTrackers.map((deal) => (
                      <SelectItem key={deal.id} value={deal.id}>
                        {deal.company_name} - {deal.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {dealsWithoutTrackers.length === 0 && (
                <p className="text-sm text-gray-400 mt-2">
                  All active deals already have diligence trackers.
                </p>
              )}
            </div>
            
            <div className="flex justify-end">
              <Button
                onClick={() => setStep('method')}
                disabled={!selectedDealId}
                className="bg-[#D4AF37] hover:bg-[#B4941F] text-[#0A0F0F]"
              >
                Continue
              </Button>
            </div>
          </div>
        )}
        
        {step === 'method' && (
          <div className="space-y-6 py-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-4 block">
                Step 2: Choose Method
              </label>
              <div className="grid grid-cols-2 gap-4">
                <Card 
                  className={`cursor-pointer transition-all ${
                    method === 'template' 
                      ? 'bg-[#D4AF37]/20 border-[#D4AF37]' 
                      : 'bg-[#0A0F0F] border-[#2A2F3A] hover:border-[#D4AF37]/50'
                  }`}
                  onClick={() => setMethod('template')}
                >
                  <CardContent className="p-6 text-center">
                    <FileText className="w-10 h-10 text-[#D4AF37] mx-auto mb-3" />
                    <h3 className="font-semibold text-white mb-2">Use Template</h3>
                    <p className="text-sm text-gray-400">
                      Pre-built checklists for common industries
                    </p>
                  </CardContent>
                </Card>
                
                <Card 
                  className={`cursor-pointer transition-all ${
                    method === 'scratch' 
                      ? 'bg-[#D4AF37]/20 border-[#D4AF37]' 
                      : 'bg-[#0A0F0F] border-[#2A2F3A] hover:border-[#D4AF37]/50'
                  }`}
                  onClick={() => setMethod('scratch')}
                >
                  <CardContent className="p-6 text-center">
                    <Plus className="w-10 h-10 text-[#D4AF37] mx-auto mb-3" />
                    <h3 className="font-semibold text-white mb-2">Start From Scratch</h3>
                    <p className="text-sm text-gray-400">
                      Build a custom tracker
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep('deal')}
                className="border-[#2A2F3A] text-gray-300 hover:bg-[#2A2F3A]"
              >
                Back
              </Button>
              <Button
                onClick={() => method === 'template' ? setStep('template') : handleStartFromScratch()}
                className="bg-[#D4AF37] hover:bg-[#B4941F] text-[#0A0F0F]"
              >
                {method === 'template' ? 'Choose Template' : 'Create Tracker'}
              </Button>
            </div>
          </div>
        )}
        
        {step === 'template' && (
          <div className="space-y-6 py-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-4 block">
                Step 3: Select Template
              </label>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
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
                      className="bg-[#0A0F0F] border-[#2A2F3A] hover:border-[#D4AF37]/50 transition-colors"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-white">{template.name}</h3>
                              {template.is_default && (
                                <Badge variant="outline" className="border-[#D4AF37]/50 text-[#D4AF37] text-xs">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  Default
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-400 mb-2">{template.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>{totalRequests} requests</span>
                              <span>{totalCategories} categories</span>
                              {template.industry && <span>Best for: {template.industry}</span>}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleSelectTemplate(template.id)}
                            disabled={applyTemplate.isPending}
                            className="bg-[#D4AF37] hover:bg-[#B4941F] text-[#0A0F0F]"
                          >
                            Use Template
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep('method')}
                className="border-[#2A2F3A] text-gray-300 hover:bg-[#2A2F3A]"
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
