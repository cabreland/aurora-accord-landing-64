import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const PAGE_AREAS = ['Dashboard', 'Deals', 'Data room', 'Financing', 'Tasks', 'Settings', 'Other'] as const;
const SEVERITIES = ['Blocker', 'Annoying', 'Nice to have'] as const;

export const FeedbackWidget = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState('');
  const [pageArea, setPageArea] = useState('');
  const [severity, setSeverity] = useState('');
  const [userIdentifier, setUserIdentifier] = useState('');

  const currentRoute = location.pathname + location.search;

  const resetForm = () => {
    setMessage('');
    setPageArea('');
    setSeverity('');
    setUserIdentifier('');
  };

  const handleSubmit = async () => {
    if (!message.trim() || !pageArea || !severity) return;

    setLoading(true);
    const { error } = await (supabase as any).from('feedback').insert({
      user_id: user?.id ?? null,
      user_identifier: userIdentifier.trim() || null,
      route: currentRoute,
      page_area: pageArea,
      severity,
      message: message.trim(),
    });

    setLoading(false);

    if (error) {
      toast({ title: 'Error', description: 'Could not save feedback. Please try again.', variant: 'destructive' });
      return;
    }

    toast({ title: 'Thanks!', description: 'Your feedback was saved.' });
    resetForm();
    setOpen(false);
  };

  if (!user) return null;

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="sm"
        className="fixed bottom-6 right-6 z-50 gap-1.5 shadow-lg rounded-full px-4 bg-primary text-primary-foreground hover:bg-primary/90"
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
            <div className="space-y-1.5">
              <Label htmlFor="fb-message">Message *</Label>
              <Textarea
                id="fb-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe what you were doing and what felt off..."
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Page area *</Label>
                <Select value={pageArea} onValueChange={setPageArea}>
                  <SelectTrigger><SelectValue placeholder="Select area" /></SelectTrigger>
                  <SelectContent>
                    {PAGE_AREAS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Severity *</Label>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger><SelectValue placeholder="Select severity" /></SelectTrigger>
                  <SelectContent>
                    {SEVERITIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fb-name">Your name or initials (optional)</Label>
              <Input id="fb-name" value={userIdentifier} onChange={(e) => setUserIdentifier(e.target.value)} placeholder="e.g. JD" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Current route</Label>
              <code className="block text-xs bg-muted px-2 py-1.5 rounded font-mono truncate">{currentRoute}</code>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setOpen(false); }}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading || !message.trim() || !pageArea || !severity}>
              {loading ? 'Submitting…' : 'Submit feedback'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
