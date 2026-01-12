import React from 'react';
import { AlertCircle, ArrowRight, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ActionStats {
  dealsAwaitingReview: number;
  overdueTasks: number;
}

const mockStats: ActionStats = {
  dealsAwaitingReview: 3,
  overdueTasks: 2,
};

export const ActionRequiredWidget = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-[#0A0F0F] to-[#1A1F2E] border border-[#D4AF37]/30 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#D4AF37]/5 rounded-full -ml-12 -mb-12" />
      
      <div className="relative z-10 p-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <h3 className="text-base font-semibold text-[#FAFAFA]">Action Required</h3>
        </div>

        {/* Stats */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between p-3 bg-[#D4AF37]/10 rounded-lg border border-[#D4AF37]/20">
            <div className="flex items-center gap-3">
              <ClipboardList className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-sm text-[#F4E4BC]">Deals awaiting review</span>
            </div>
            <span className="text-2xl font-bold text-[#D4AF37]">{mockStats.dealsAwaitingReview}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-sm text-[#F4E4BC]">Overdue tasks</span>
            </div>
            <span className="text-2xl font-bold text-red-400">{mockStats.overdueTasks}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button 
            onClick={() => navigate('/dashboard/diligence-tracker?filter=pending')}
            className="w-full bg-[#D4AF37] text-[#0A0F0F] hover:bg-[#B8962E] font-medium"
          >
            View Tasks
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/deals')}
            className="w-full text-[#F4E4BC] hover:text-[#FAFAFA] hover:bg-[#D4AF37]/10"
          >
            View all deals
          </Button>
        </div>
      </div>
    </div>
  );
};
