import React, { useState } from 'react';
import { Link2, Check, Copy, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface ShareLinkButtonProps {
  dealId: string;
}

const EXPIRY_OPTIONS = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: 'No expiry', days: null },
];

export const ShareLinkButton: React.FC<ShareLinkButtonProps> = ({ dealId }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  const { data: token } = useQuery({
    queryKey: ['deal-share-token', dealId],
    queryFn: async () => {
      const { data } = await supabase
        .from('deal_share_tokens')
        .select('token, expires_at, is_active')
        .eq('deal_id', dealId)
        .eq('is_active', true)
        .maybeSingle();
      return data;
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (days: number | null) => {
      const expiresAt = days
        ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
        : null;

      // Deactivate old tokens
      await supabase
        .from('deal_share_tokens')
        .update({ is_active: false })
        .eq('deal_id', dealId);

      const { data, error } = await supabase
        .from('deal_share_tokens')
        .insert({
          deal_id: dealId,
          created_by: user?.id,
          expires_at: expiresAt,
          access_level: 'teaser',
          is_active: true,
        })
        .select('token')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal-share-token', dealId] });
      toast.success('Share link generated');
    },
    onError: () => toast.error('Failed to generate share link'),
  });

  const shareUrl = token?.token
    ? `${window.location.origin}/share/${token.token}`
    : null;

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link copied to clipboard');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Link2 className="h-4 w-4" />
          Share
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Shareable Link</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {shareUrl ? (
          <div className="p-2 space-y-2">
            <div className="flex gap-1.5">
              <Input value={shareUrl} readOnly className="text-xs h-8" />
              <Button size="sm" variant="outline" onClick={handleCopy} className="h-8 px-2 shrink-0">
                {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
            {token?.expires_at && (
              <p className="text-xs text-muted-foreground px-1">
                Expires {new Date(token.expires_at).toLocaleDateString()}
              </p>
            )}
          </div>
        ) : (
          <div className="p-2">
            <p className="text-xs text-muted-foreground mb-2">No active link. Generate one below.</p>
          </div>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Generate new link</DropdownMenuLabel>
        {EXPIRY_OPTIONS.map(({ label, days }) => (
          <DropdownMenuItem
            key={label}
            onClick={() => generateMutation.mutate(days)}
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Link2 className="h-4 w-4 mr-2" />
            )}
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
