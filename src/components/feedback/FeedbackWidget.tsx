import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useCreateFeedback, FEEDBACK_TYPES, FEEDBACK_TYPE_LABELS, FEEDBACK_SEVERITIES } from '@/hooks/useFeedback';
import { toast } from 'sonner';

const STORAGE_KEY_TYPE = 'feedback-widget-last-type';
const STORAGE_KEY_SEVERITY = 'feedback-widget-last-severity';

const STAFF_ROLES = ['admin', 'super_admin', 'editor'] as const;

export const FeedbackWidget = () => {
  const { user } = useAuth();
  const { profile, getDisplayName } = useUserProfile();
  const location = useLocation();
  const createFeedback = useCreateFeedback();
  const [open, setOpen] = useState(false);

  const [summary, setSummary] = useState('');
  const [details, setDetails] = useState('');
  const [type, setType] = useState(() => localStorage.getItem(STORAGE_KEY_TYPE) || '');
  const [severity, setSeverity] = useState(() => localStorage.getItem(STORAGE_KEY_SEVERITY) || '');

  // Persist last-used type & severity
  useEffect(() => {
    if (type) localStorage.setItem(STORAGE_KEY_TYPE, type);
  }, [type]);
  useEffect(() => {
    if (severity) localStorage.setItem(STORAGE_KEY_SEVERITY, severity);
  }, [severity]);

  const currentRoute = location.pathname + location.search;

  // Build optional page_context from URL
  const buildPageContext = (): Record<string, unknown> | null => {
    const dealMatch = location.pathname.match(/\/deal[s]?\/([a-f0-9-]+)/);
    if (dealMatch) {
      const params = new URLSearchParams(location.search);
      return { deal_id: dealMatch[1], tab: params.get('tab') || undefined };
    }
    return null;
  };

  const resetForm = () => {
    setSummary('');
    setDetails('');
    // Keep type & severity (persisted)
  };

  const handleSubmit = async () => {
    if (!summary.trim() || !type || !user?.id) return;

    createFeedback.mutate(
      {
        created_by: user.id,
        page_path: currentRoute,
        page_context: buildPageContext(),
        type,
        severity: severity || undefined,
        summary: summary.trim(),
        details: details.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Feedback submitted');
          resetForm();
          setOpen(false);
        },
        onError: (error) => {
          toast.error('Could not save feedback: ' + error.message);
        },
      }
    );
  };

  // Guard: only render for authenticated staff/admin
  if (!user) return null;
  if (!profile) return null;
  if (!STAFF_ROLES.includes(profile.role as any)) return null;

  const displayName = getDisplayName();

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="sm"
        className="fixed bottom-6 right-6 z-50 gap-1.5 shadow-lg rounded-full px-4 bg-[#D4AF37] text-[#0A0F0F] hover:bg-[#D4AF37]/90"
      >
        <MessageSquarePlus className="h-4 w-4" />
        Feedback
      </Button>

      <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); setOpen(v); }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Leave feedback</DialogTitle>
            <DialogDescription>Tell us what's confusing, broken, or could be better.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Auto-captured identity */}
            <div className="text-sm text-muted-foreground">
              Submitting as: <span className="font-medium text-foreground">{displayName}</span>
            </div>

            {/* Summary */}
            <div className="space-y-1.5">
              <Label htmlFor="fb-summary">Summary *</Label>
              <Input
                id="fb-summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="One-line description…"
              />
            </div>

            {/* Details */}
            <div className="space-y-1.5">
              <Label htmlFor="fb-details">Details</Label>
              <Textarea
                id="fb-details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Steps to reproduce, what you expected…"
                className="min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Type *</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {FEEDBACK_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{FEEDBACK_TYPE_LABELS[t]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Severity</Label>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger><SelectValue placeholder="Select severity" /></SelectTrigger>
                  <SelectContent>
                    {FEEDBACK_SEVERITIES.map((s) => (
                      <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Auto-captured route */}
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Current route</Label>
              <code className="block text-xs bg-muted px-2 py-1.5 rounded font-mono truncate">{currentRoute}</code>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setOpen(false); }}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createFeedback.isPending || !summary.trim() || !type}>
              {createFeedback.isPending ? 'Submitting…' : 'Submit feedback'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
