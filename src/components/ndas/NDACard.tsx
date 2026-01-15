import { FileText, Eye, Download, RefreshCw, XCircle, Loader2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { differenceInDays, format } from 'date-fns';

interface NDACardProps {
  nda: {
    id: string;
    signer_name: string;
    signer_email: string;
    signer_company?: string | null;
    accepted_at: string;
    expires_at: string | null;
    status: string;
    companies?: { name: string };
  };
  isSelected: boolean;
  onSelect: (id: string) => void;
  onView: (id: string) => void;
  onExtend: (id: string) => void;
  onRevoke: (id: string) => void;
  isLoading?: boolean;
}

function getAccessLevelLabel(tier: number) {
  const labels: Record<number, string> = {
    1: 'Layer 1: Portfolio Access',
    2: 'Layer 2: Data Room Access',
    3: 'Layer 3: Full Access + LOI'
  };
  return labels[tier] || 'Layer 1: Portfolio Access';
}

function getAccessLevelDescription(tier: number) {
  const descriptions: Record<number, string> = {
    1: 'Anonymous CIMs across all portfolio deals',
    2: 'Full data room access (except LOI-restricted folders)',
    3: 'Complete access including LOI-restricted documents'
  };
  return descriptions[tier] || descriptions[1];
}

export function NDACard({ 
  nda, 
  isSelected, 
  onSelect, 
  onView, 
  onExtend, 
  onRevoke,
  isLoading 
}: NDACardProps) {
  const daysUntilExpiry = nda.expires_at 
    ? differenceInDays(new Date(nda.expires_at), new Date())
    : null;
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  const isExpired = daysUntilExpiry !== null && daysUntilExpiry <= 0;
  const isRevoked = nda.status === 'revoked';

  // Determine NDA type based on whether there's a specific company
  const ndaType = nda.companies?.name ? 'deal_specific' : 'mutual';
  const accessTier = ndaType === 'mutual' ? 1 : 2;

  const getStatusBadge = () => {
    if (isRevoked) {
      return (
        <Badge className="bg-muted text-muted-foreground border-muted-foreground/30">
          🚫 Revoked
        </Badge>
      );
    }
    if (isExpired) {
      return (
        <Badge className="bg-destructive/10 text-destructive border-destructive/30">
          🔴 Expired
        </Badge>
      );
    }
    if (isExpiringSoon) {
      return (
        <Badge className="bg-warning/10 text-warning border-warning/30">
          🟡 Expires in {daysUntilExpiry}d
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-500/10 text-green-500 border-green-500/30">
        🟢 Active
      </Badge>
    );
  };

  return (
    <div className={cn(
      "border rounded-lg p-5 bg-card transition-all hover:shadow-md",
      isExpiringSoon && "border-warning/30 bg-warning/5",
      isExpired && "border-destructive/30 bg-destructive/5",
      isRevoked && "border-muted bg-muted/5 opacity-75",
      isSelected && "ring-2 ring-primary"
    )}>
      {/* Header: Signer Info + Status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Checkbox 
            checked={isSelected}
            onCheckedChange={() => onSelect(nda.id)}
          />
          
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
            {nda.signer_name.charAt(0).toUpperCase()}
          </div>
          
          <div>
            <h3 className="font-semibold text-lg text-foreground">{nda.signer_name}</h3>
            <p className="text-sm text-muted-foreground">{nda.signer_email}</p>
            {nda.signer_company && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Building2 className="w-3 h-3" />
                {nda.signer_company}
              </p>
            )}
          </div>
        </div>
        
        {getStatusBadge()}
      </div>
      
      {/* NDA Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-muted-foreground">Type:</span>
          <div className="font-medium flex items-center gap-2 mt-1 text-foreground">
            <FileText className="w-4 h-4" />
            <span>{ndaType === 'mutual' ? 'Mutual NDA' : 'Deal-Specific'}</span>
            {ndaType === 'mutual' && (
              <span className="text-xs text-primary">(Portfolio)</span>
            )}
          </div>
        </div>
        
        <div>
          <span className="text-muted-foreground">Deal:</span>
          <div className="font-medium mt-1 text-foreground">
            {nda.companies?.name || 'All Deals'}
          </div>
        </div>
        
        <div>
          <span className="text-muted-foreground">Signed:</span>
          <div className="font-medium mt-1 text-foreground">
            {format(new Date(nda.accepted_at), 'MMM d, yyyy')}
          </div>
        </div>
        
        <div>
          <span className="text-muted-foreground">Expires:</span>
          <div className={cn(
            "font-medium mt-1",
            isExpiringSoon && "text-warning",
            isExpired && "text-destructive",
            !isExpiringSoon && !isExpired && "text-foreground"
          )}>
            {nda.expires_at 
              ? format(new Date(nda.expires_at), 'MMM d, yyyy')
              : 'No expiry'}
            {isExpiringSoon && daysUntilExpiry && (
              <span className="ml-2 text-xs">
                ({daysUntilExpiry} days)
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Access Level Info */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4">
        <div className="text-sm">
          <span className="text-muted-foreground">Access Granted:</span>
          <div className="font-semibold text-primary mt-1">
            {getAccessLevelLabel(accessTier)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {getAccessLevelDescription(accessTier)}
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => onView(nda.id)}
        >
          <Eye className="w-4 h-4 mr-1" />
          View
        </Button>
        
        {nda.status === 'active' && !isExpired && (
          <>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onExtend(nda.id)}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-1" />
              )}
              Extend
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => onRevoke(nda.id)}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4 mr-1" />
              )}
              Revoke
            </Button>
          </>
        )}
        
        {(nda.status === 'expired' || nda.status === 'revoked' || isExpired) && (
          <Button 
            size="sm" 
            variant="default"
            onClick={() => onExtend(nda.id)}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-1" />
            )}
            Reactivate
          </Button>
        )}
      </div>
    </div>
  );
}
