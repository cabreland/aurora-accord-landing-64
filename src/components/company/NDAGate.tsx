import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Lock, CheckCircle, Clock } from 'lucide-react';
import { useNDA } from '@/hooks/useNDA';

interface NDAGateProps {
  companyId: string;
  companyName: string;
  children: React.ReactNode;
  onNDAAccepted?: () => void;
}

const NDAGate: React.FC<NDAGateProps> = ({ 
  companyId, 
  companyName, 
  children, 
  onNDAAccepted 
}) => {
  const { hasAcceptedNDA, requireNDA, loading, accepting, acceptNDA } = useNDA(companyId);

  const handleAcceptNDA = async () => {
    const success = await acceptNDA();
    if (success && onNDAAccepted) {
      onNDAAccepted();
    }
  };

  const getAccessStatus = () => {
    if (!requireNDA) {
      return { label: 'Full Access', variant: 'default' as const, icon: CheckCircle };
    }
    
    if (hasAcceptedNDA) {
      return { label: 'NDA Accepted', variant: 'default' as const, icon: CheckCircle };
    }
    
    return { label: 'Teaser Only', variant: 'secondary' as const, icon: Lock };
  };

  // If NDA not required or already accepted, show content
  if (!requireNDA || hasAcceptedNDA) {
    return <>{children}</>;
  }

  const status = getAccessStatus();
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6">
      {/* Access Status */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground flex items-center gap-2">
              <StatusIcon className="w-5 h-5" />
              Document Access Status
            </CardTitle>
            <Badge variant={status.variant} className="flex items-center gap-1">
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border border-amber-500/20 bg-amber-500/5 rounded-lg">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground mb-1">
                  NDA Required for {companyName}
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  To access confidential documents and detailed information about this company, 
                  you must first accept the Non-Disclosure Agreement.
                </p>
                <Button 
                  onClick={handleAcceptNDA}
                  disabled={accepting || loading}
                  className="bg-primary hover:bg-primary/90"
                >
                  {accepting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Accepting NDA...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Accept NDA & View Documents
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-muted-foreground">Teaser information available</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-500" />
              <span className="text-muted-foreground">CIM requires NDA</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-red-500" />
              <span className="text-muted-foreground">Financials require approval</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teaser Content (always shown) */}
      {children}
    </div>
  );
};

export default NDAGate;