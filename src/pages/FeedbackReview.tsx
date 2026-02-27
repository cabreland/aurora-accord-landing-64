import React, { useState } from 'react';
import { format } from 'date-fns';
import AdminDashboardLayout from '@/layouts/AdminDashboardLayout';
import {
  useFeedbackList,
  useUpdateFeedback,
  ProductFeedback,
  FEEDBACK_TYPES,
  FEEDBACK_STATUSES,
  FEEDBACK_TYPE_LABELS,
  FEEDBACK_STATUS_LABELS,
} from '@/hooks/useFeedback';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, X, MessageSquarePlus, CheckCircle2, Loader2 } from 'lucide-react';

const statusColor = (s: string) => {
  switch (s) {
    case 'open': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'in_progress': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'resolved': return 'bg-green-100 text-green-700 border-green-200';
    case 'closed': return 'bg-slate-100 text-slate-600 border-slate-200';
    default: return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

const typeColor = (t: string) => {
  switch (t) {
    case 'bug': return 'bg-red-100 text-red-700 border-red-200';
    case 'idea': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'ui-copy': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
    case 'data-issue': return 'bg-orange-100 text-orange-700 border-orange-200';
    default: return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

const severityColor = (s: string | null) => {
  switch (s) {
    case 'high': return 'destructive';
    case 'medium': return 'secondary';
    default: return 'outline';
  }
};

const FeedbackReview = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ status: '', type: '', search: '' });
  const [selected, setSelected] = useState<ProductFeedback | null>(null);

  const { data: items = [], isLoading } = useFeedbackList({
    status: filters.status || undefined,
    type: filters.type || undefined,
    search: filters.search || undefined,
  });

  // Detail editing state
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const updateFeedback = useUpdateFeedback();

  const openDetail = (item: ProductFeedback) => {
    setSelected(item);
    setEditStatus(item.status);
    setEditNotes(item.resolution_notes || '');
  };

  const handleSave = () => {
    if (!selected) return;
    const updates: any = { id: selected.id, status: editStatus, resolution_notes: editNotes || null };
    if (editStatus === 'resolved' && selected.status !== 'resolved') {
      updates.resolved_at = new Date().toISOString();
      updates.resolved_by = user?.id || null;
    }
    updateFeedback.mutate(updates, {
      onSuccess: () => setSelected(null),
    });
  };

  const handleMarkResolved = () => {
    if (!selected) return;
    updateFeedback.mutate({
      id: selected.id,
      status: 'resolved',
      resolution_notes: editNotes || null,
      resolved_at: new Date().toISOString(),
      resolved_by: user?.id || null,
    }, {
      onSuccess: () => setSelected(null),
    });
  };

  const getAuthorName = (item: ProductFeedback) => {
    if (item.profile) {
      const name = [item.profile.first_name, item.profile.last_name].filter(Boolean).join(' ');
      return name || item.profile.email || '—';
    }
    return '—';
  };

  const hasFilters = filters.status || filters.type || filters.search;

  return (
    <AdminDashboardLayout activeTab="feedback-review" breadcrumbs={[{ label: 'Feedback' }]}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MessageSquarePlus className="w-7 h-7 text-[#D4AF37]" />
            Product Feedback
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {items.length} item{items.length !== 1 ? 's' : ''}
            {hasFilters ? ' (filtered)' : ''}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-card border border-border rounded-xl p-4">
          <div className="relative flex-1 min-w-[200px] max-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search feedback…"
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              className="pl-9 bg-secondary/50 border-border"
            />
          </div>
          <Select value={filters.status || 'all'} onValueChange={v => setFilters(f => ({ ...f, status: v === 'all' ? '' : v }))}>
            <SelectTrigger className="w-[160px] bg-secondary/50 border-border"><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {FEEDBACK_STATUSES.map(s => (
                <SelectItem key={s} value={s}>{FEEDBACK_STATUS_LABELS[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.type || 'all'} onValueChange={v => setFilters(f => ({ ...f, type: v === 'all' ? '' : v }))}>
            <SelectTrigger className="w-[160px] bg-secondary/50 border-border"><SelectValue placeholder="All Types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {FEEDBACK_TYPES.map(t => (
                <SelectItem key={t} value={t}>{FEEDBACK_TYPE_LABELS[t]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={() => setFilters({ status: '', type: '', search: '' })}>
              <X className="w-4 h-4 mr-1" /> Clear
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 rounded" />)}
            </div>
          ) : items.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              No feedback yet. Use the floating button to submit.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="max-w-xs">Summary</TableHead>
                    <TableHead>Page</TableHead>
                    <TableHead>By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map(item => (
                    <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openDetail(item)}>
                      <TableCell className="whitespace-nowrap text-xs">{format(new Date(item.created_at), 'MMM d, h:mm a')}</TableCell>
                      <TableCell><Badge variant="outline" className={`text-xs ${typeColor(item.type)}`}>{FEEDBACK_TYPE_LABELS[item.type] || item.type}</Badge></TableCell>
                      <TableCell><Badge variant={severityColor(item.severity) as any} className="text-xs">{item.severity || '—'}</Badge></TableCell>
                      <TableCell><Badge variant="outline" className={`text-xs ${statusColor(item.status)}`}>{FEEDBACK_STATUS_LABELS[item.status] || item.status}</Badge></TableCell>
                      <TableCell className="max-w-xs truncate text-sm">{item.summary}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground max-w-[140px] truncate">{item.page_path}</TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{getAuthorName(item)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={open => { if (!open) setSelected(null); }}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Feedback Detail</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 pt-2">
              {/* Meta */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs">Created</span>
                  <p>{format(new Date(selected.created_at), 'PPpp')}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">By</span>
                  <p>{getAuthorName(selected)}</p>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Page</span>
                <code className="block text-xs bg-muted px-2 py-1.5 rounded border border-border mt-0.5">{selected.page_path}</code>
              </div>

              {/* Type + Severity badges */}
              <div className="flex gap-2">
                <Badge variant="outline" className={typeColor(selected.type)}>{FEEDBACK_TYPE_LABELS[selected.type]}</Badge>
                {selected.severity && <Badge variant={severityColor(selected.severity) as any}>{selected.severity}</Badge>}
              </div>

              {/* Summary + Details */}
              <div>
                <Label className="text-xs text-muted-foreground">Summary</Label>
                <p className="text-sm font-medium mt-0.5">{selected.summary}</p>
              </div>
              {selected.details && (
                <div>
                  <Label className="text-xs text-muted-foreground">Details</Label>
                  <p className="text-sm whitespace-pre-wrap mt-0.5">{selected.details}</p>
                </div>
              )}

              <hr className="border-border" />

              {/* Status + Resolution */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Status</Label>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FEEDBACK_STATUSES.map(s => (
                        <SelectItem key={s} value={s}>{FEEDBACK_STATUS_LABELS[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Resolution Notes</Label>
                  <Textarea
                    value={editNotes}
                    onChange={e => setEditNotes(e.target.value)}
                    placeholder="How was this resolved?"
                    rows={2}
                    className="text-sm resize-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-2 border-t border-border">
                {selected.status !== 'resolved' && (
                  <Button variant="outline" size="sm" onClick={handleMarkResolved} disabled={updateFeedback.isPending}>
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Mark Resolved
                  </Button>
                )}
                <div className="flex gap-2 ml-auto">
                  <Button variant="outline" size="sm" onClick={() => setSelected(null)}>Cancel</Button>
                  <Button size="sm" onClick={handleSave} disabled={updateFeedback.isPending}>
                    {updateFeedback.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
                    Save
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminDashboardLayout>
  );
};

export default FeedbackReview;
