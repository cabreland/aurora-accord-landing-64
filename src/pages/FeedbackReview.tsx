import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface FeedbackRow {
  id: string;
  created_at: string;
  user_identifier: string | null;
  route: string;
  page_area: string;
  severity: string;
  message: string;
}

const severityColor = (s: string) => {
  if (s === 'Blocker') return 'destructive';
  if (s === 'Annoying') return 'secondary'; // amber-ish via theme
  return 'outline';
};

const FeedbackReview = () => {
  const { isAdmin, loading: profileLoading } = useUserProfile();
  const [rows, setRows] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<FeedbackRow | null>(null);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterArea, setFilterArea] = useState('all');

  useEffect(() => {
    if (profileLoading) return;
    const fetchFeedback = async () => {
      setLoading(true);
      const { data } = await (supabase as any)
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });
      setRows((data as FeedbackRow[]) ?? []);
      setLoading(false);
    };
    fetchFeedback();
  }, [profileLoading]);

  if (profileLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">You don't have access to this page.</p>
      </div>
    );
  }

  const filtered = rows.filter((r) => {
    if (filterSeverity !== 'all' && r.severity !== filterSeverity) return false;
    if (filterArea !== 'all' && r.page_area !== filterArea) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold text-foreground mb-6">Feedback</h1>

      <div className="flex gap-3 mb-4 flex-wrap">
        <Select value={filterSeverity} onValueChange={setFilterSeverity}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All severities</SelectItem>
            <SelectItem value="Blocker">Blocker</SelectItem>
            <SelectItem value="Annoying">Annoying</SelectItem>
            <SelectItem value="Nice to have">Nice to have</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterArea} onValueChange={setFilterArea}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All areas</SelectItem>
            {['Dashboard','Deals','Data room','Financing','Tasks','Settings','Other'].map(a => (
              <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm py-8 text-center">No feedback entries yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Area</TableHead>
              <TableHead>Route</TableHead>
              <TableHead className="max-w-xs">Message</TableHead>
              <TableHead>User</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r) => (
              <TableRow key={r.id} className="cursor-pointer" onClick={() => setSelected(r)}>
                <TableCell className="whitespace-nowrap text-xs">{format(new Date(r.created_at), 'MMM d, h:mm a')}</TableCell>
                <TableCell><Badge variant={severityColor(r.severity) as any}>{r.severity}</Badge></TableCell>
                <TableCell className="text-sm">{r.page_area}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground max-w-[140px] truncate">{r.route}</TableCell>
                <TableCell className="max-w-xs truncate text-sm">{r.message}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{r.user_identifier || '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Feedback detail</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div><span className="text-muted-foreground">Date:</span> {format(new Date(selected.created_at), 'PPpp')}</div>
              <div><span className="text-muted-foreground">Severity:</span> <Badge variant={severityColor(selected.severity) as any}>{selected.severity}</Badge></div>
              <div><span className="text-muted-foreground">Page area:</span> {selected.page_area}</div>
              <div><span className="text-muted-foreground">Route:</span> <code className="text-xs bg-muted px-1 py-0.5 rounded">{selected.route}</code></div>
              <div><span className="text-muted-foreground">User:</span> {selected.user_identifier || '—'}</div>
              <div className="pt-2 border-t">
                <span className="text-muted-foreground block mb-1">Message:</span>
                <p className="whitespace-pre-wrap">{selected.message}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeedbackReview;
