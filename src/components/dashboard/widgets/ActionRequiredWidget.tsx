import React from 'react';
import { AlertCircle, ArrowRight, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface ActionStats {
  dealsAwaitingReview: number;
  overdueTasks: number;
}

export const ActionRequiredWidget = () => {
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-action-stats'],
    queryFn: async () => {
      // Get deals awaiting review (pending approval status from real deals)
      const { count: pendingDealsCount } = await supabase
        .from('deals')
        .select('*', { count: 'exact', head: true })
        .eq('is_test_data', false)
        .eq('approval_status', 'pending');

      // Get overdue tasks (diligence requests with past due dates from real deals)
      const today = new Date().toISOString().split('T')[0];
      const { data: overdueRequests } = await supabase
        .from('diligence_requests')
        .select(`
          id,
          deal:deals!inner(
            id,
            is_test_data
          )
        `)
        .in('status', ['open', 'in_progress'])
        .lt('due_date', today);

      // Filter to only real deals
      const overdueCount = (overdueRequests || [])
        .filter((r: any) => r.deal && r.deal.is_test_data === false)
        .length;

      return {
        dealsAwaitingReview: pendingDealsCount || 0,
        overdueTasks: overdueCount,
      } as ActionStats;
    },
  });

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-[#0A0F0F] to-[#1A1F2E] border border-[#D4AF37]/30 rounded-xl shadow-sm overflow-hidden relative">
        <div className="relative z-10 p-5">
          <div className="flex items-center gap-3 mb-5">
            <Skeleton className="w-10 h-10 rounded-lg bg-[#D4AF37]/20" />
            <Skeleton className="h-4 w-32 bg-[#D4AF37]/20" />
          </div>
          <div className="space-y-4 mb-6">
            <Skeleton className="h-16 w-full bg-[#D4AF37]/10" />
            <Skeleton className="h-16 w-full bg-red-500/10" />
          </div>
          <Skeleton className="h-10 w-full bg-[#D4AF37]/20" />
        </div>
      </div>
    );
  }

  const { dealsAwaitingReview = 0, overdueTasks = 0 } = stats || {};

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
            <span className="text-2xl font-bold text-[#D4AF37]">{dealsAwaitingReview}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-sm text-[#F4E4BC]">Overdue tasks</span>
            </div>
            <span className="text-2xl font-bold text-red-400">{overdueTasks}</span>
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
