import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { Loader2, Building2, Mail, Calendar, FileText } from 'lucide-react';

interface NDARecord {
  id: string;
  user_id: string;
  company_id: string;
  signature: string;
  signer_name: string;
  signer_email: string;
  signer_company: string | null;
  accepted_at: string;
  expires_at: string | null;
  status: string;
  nda_content: string;
  companies?: { name: string };
}

interface NDADetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nda: NDARecord | null;
  onExtend: (id: string, days: number) => void;
  isLoading?: boolean;
}

export function NDADetailsModal({ 
  open, 
  onOpenChange, 
  nda, 
  onExtend,
  isLoading 
}: NDADetailsModalProps) {
  if (!nda) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            NDA Details
          </DialogTitle>
          <DialogDescription>
            Full NDA information and management actions
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6 p-1">
            {/* Signer Info Card */}
            <div className="bg-muted/50 rounded-lg p-5 border border-border">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xl font-semibold">
                  {nda.signer_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground">{nda.signer_name}</h3>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <Mail className="w-4 h-4" />
                    {nda.signer_email}
                  </div>
                  {nda.signer_company && (
                    <div className="flex items-center gap-2 text-muted-foreground mt-1">
                      <Building2 className="w-4 h-4" />
                      {nda.signer_company}
                    </div>
                  )}
                </div>
                <Badge 
                  variant={nda.status === 'active' ? 'default' : 'destructive'}
                  className="text-sm"
                >
                  {nda.status === 'active' ? '🟢 Active' : 
                   nda.status === 'revoked' ? '🚫 Revoked' : '🔴 Expired'}
                </Badge>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Deal / Coverage</p>
                <p className="font-medium text-foreground">
                  {nda.companies?.name || 'Portfolio Access (All Deals)'}
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Electronic Signature</p>
                <p className="font-serif text-xl italic text-foreground">{nda.signature}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Signed At
                </p>
                <p className="font-medium text-foreground">
                  {format(new Date(nda.accepted_at), 'PPpp')}
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Expires At
                </p>
                <p className="font-medium text-foreground">
                  {nda.expires_at ? format(new Date(nda.expires_at), 'PPpp') : 'Never'}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            {nda.status === 'active' && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-sm font-medium text-foreground mb-3">Quick Extend</p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onExtend(nda.id, 30)}
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    +30 days
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onExtend(nda.id, 60)}
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    +60 days
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onExtend(nda.id, 90)}
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    +90 days
                  </Button>
                </div>
              </div>
            )}

            {/* NDA Content */}
            <div>
              <h3 className="font-semibold mb-3 text-foreground">NDA Content</h3>
              <div className="border border-border rounded-lg p-4 bg-muted/30 max-h-[300px] overflow-y-auto">
                <pre className="text-xs whitespace-pre-wrap font-mono text-foreground/80">
                  {nda.nda_content || 'No content available'}
                </pre>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
