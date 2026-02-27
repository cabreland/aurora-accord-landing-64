import React, { useState, useMemo } from 'react';
import AdminDashboardLayout from '@/layouts/AdminDashboardLayout';
import { 
  useFinancingApplications, 
  useLenders, 
  useUpdateFinancingStage,
  FinancingStage, 
  FinancingApplication,
  FINANCING_STAGE_LABELS,
  FINANCING_STAGE_COLORS,
  FINANCING_TYPE_LABELS,
} from '@/hooks/useFinancing';
import { FinancingPipelineOverview } from '@/components/financing/FinancingPipelineOverview';
import { FinancingFilters } from '@/components/financing/FinancingFilters';
import { AddDealToFinancingDialog } from '@/components/financing/AddDealToFinancingDialog';
import { FinancingDetailDialog } from '@/components/financing/FinancingDetailDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, DollarSign, RefreshCw, Building2, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const ALL_STAGES: FinancingStage[] = [
  'pre_qualification', 'application_submitted', 'under_review',
  'additional_docs_requested', 'conditional_approval', 'final_approval',
  'closing', 'funded', 'declined', 'withdrawn',
];

const ACTIVE_STAGES: FinancingStage[] = [
  'pre_qualification', 'application_submitted', 'under_review',
  'additional_docs_requested', 'conditional_approval', 'final_approval', 'closing',
];

const formatCurrency = (value: number | null) => {
  if (!value) return '—';
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
};

const FinancingTracker = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedApp, setSelectedApp] = useState<FinancingApplication | null>(null);
  const [filters, setFilters] = useState({ search: '', stage: '', lenderId: '' });

  const { data: applications = [], isLoading: appsLoading, refetch } = useFinancingApplications();
  const { data: lenders = [], isLoading: lendersLoading } = useLenders();
  const updateStageMutation = useUpdateFinancingStage();

  const isLoading = appsLoading || lendersLoading;

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      if (filters.search) {
        const s = filters.search.toLowerCase();
        const match = app.deal?.company_name?.toLowerCase().includes(s) ||
          app.lender?.name?.toLowerCase().includes(s) ||
          app.application_number?.toLowerCase().includes(s);
        if (!match) return false;
      }
      if (filters.stage && filters.stage !== 'all' && app.stage !== filters.stage) return false;
      if (filters.lenderId && filters.lenderId !== 'all' && app.lender_id !== filters.lenderId) return false;
      return true;
    });
  }, [applications, filters]);

  const deals = useMemo(() => {
    const map = new Map<string, { id: string; company_name: string }>();
    applications.forEach(app => {
      if (app.deal && !map.has(app.deal.id)) map.set(app.deal.id, app.deal);
    });
    return Array.from(map.values());
  }, [applications]);

  // Stats
  const activeApps = applications.filter(a => ACTIVE_STAGES.includes(a.stage));
  const totalPipeline = activeApps.reduce((s, a) => s + (a.loan_amount || 0), 0);

  const handleInlineStageChange = (appId: string, newStage: FinancingStage) => {
    updateStageMutation.mutate({ id: appId, stage: newStage }, {
      onSuccess: () => toast.success('Stage updated'),
    });
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <AdminDashboardLayout activeTab="financing" breadcrumbs={[{ label: 'Financing' }]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <DollarSign className="w-7 h-7 text-[#D4AF37]" />
              Financing Tracker
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {applications.length} total • {activeApps.length} active • {formatCurrency(totalPipeline)} in pipeline
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-1" /> Refresh
            </Button>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-1" /> New Financing
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
            </div>
            <Skeleton className="h-96 rounded-xl" />
          </div>
        ) : (
          <>
            <FinancingPipelineOverview applications={applications} />

            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card border border-border rounded-xl p-4">
              <FinancingFilters filters={filters} onFiltersChange={setFilters} lenders={lenders} deals={deals} />
              <div className="text-sm text-muted-foreground shrink-0">
                {filteredApplications.length} of {applications.length} records
              </div>
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {filteredApplications.length === 0 ? (
                <div className="p-10 text-center text-muted-foreground">
                  {applications.length === 0
                    ? 'No financing records yet. Click "New Financing" to get started.'
                    : 'No records match your filters.'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left p-3 font-medium text-muted-foreground">Deal</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Lender</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
                        <th className="text-right p-3 font-medium text-muted-foreground">Amount</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Stage</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Priority</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Key Date</th>
                        <th className="p-3 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredApplications.map(app => {
                        const keyDate = app.closing_date || app.approved_at || app.submitted_at || app.created_at;
                        return (
                          <tr
                            key={app.id}
                            className="hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => setSelectedApp(app)}
                          >
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                                <span className="font-medium text-foreground truncate max-w-[180px]">
                                  {app.deal?.company_name || 'Unknown'}
                                </span>
                              </div>
                            </td>
                            <td className="p-3 text-muted-foreground truncate max-w-[120px]">
                              {app.lender?.name || '—'}
                            </td>
                            <td className="p-3 text-muted-foreground">
                              {FINANCING_TYPE_LABELS[app.financing_type]}
                            </td>
                            <td className="p-3 text-right font-medium text-foreground">
                              {formatCurrency(app.loan_amount)}
                            </td>
                            <td className="p-3" onClick={e => e.stopPropagation()}>
                              <Select
                                value={app.stage}
                                onValueChange={(v) => handleInlineStageChange(app.id, v as FinancingStage)}
                              >
                                <SelectTrigger className="h-7 text-xs w-[150px] border-border">
                                  <div className="flex items-center gap-1.5">
                                    <div className={`w-2 h-2 rounded-full ${FINANCING_STAGE_COLORS[app.stage]}`} />
                                    <SelectValue />
                                  </div>
                                </SelectTrigger>
                                <SelectContent>
                                  {ALL_STAGES.map(s => (
                                    <SelectItem key={s} value={s}>
                                      <div className="flex items-center gap-1.5">
                                        <div className={`w-2 h-2 rounded-full ${FINANCING_STAGE_COLORS[s]}`} />
                                        {FINANCING_STAGE_LABELS[s]}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="p-3">
                              <Badge variant="outline" className={`text-xs ${getPriorityColor(app.priority)}`}>
                                {app.priority}
                              </Badge>
                            </td>
                            <td className="p-3 text-xs text-muted-foreground">
                              {keyDate ? format(new Date(keyDate), 'MMM d, yyyy') : '—'}
                            </td>
                            <td className="p-3">
                              <ExternalLink className="w-4 h-4 text-muted-foreground" />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <AddDealToFinancingDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
      <FinancingDetailDialog
        open={!!selectedApp}
        onOpenChange={(open) => { if (!open) setSelectedApp(null); }}
        application={selectedApp}
      />
    </AdminDashboardLayout>
  );
};

export default FinancingTracker;
