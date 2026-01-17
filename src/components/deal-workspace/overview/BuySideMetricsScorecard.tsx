import React from 'react';
import { FileSignature, Users, ClipboardCheck, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface BuySideMetricsScorecardProps {
  // NDA metrics
  ndasSigned: number;
  // LOI metrics
  loisReceived: number;
  loisActive: number;
  // DD Completeness
  ddCompletionPercentage: number;
  ddTotalRequests: number;
  ddCompletedRequests: number;
  // Buyer engagement
  activeBuyers: number;
}

export const BuySideMetricsScorecard: React.FC<BuySideMetricsScorecardProps> = ({
  ndasSigned,
  loisReceived,
  loisActive,
  ddCompletionPercentage,
  ddTotalRequests,
  ddCompletedRequests,
  activeBuyers
}) => {
  return (
    <Card className="bg-gradient-to-br from-card to-muted/30 border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          Buyer Activity & DD Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* NDAs Signed */}
          <div className="p-4 bg-background/60 rounded-lg border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <FileSignature className="h-4 w-4" />
              <span className="text-xs font-medium">NDAs Signed</span>
            </div>
            <p className="text-2xl font-bold tabular-nums">{ndasSigned}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Qualified buyers
            </p>
          </div>

          {/* LOIs */}
          <div className="p-4 bg-background/60 rounded-lg border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <ClipboardCheck className="h-4 w-4" />
              <span className="text-xs font-medium">LOIs</span>
            </div>
            <p className="text-2xl font-bold tabular-nums">{loisReceived}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {loisActive > 0 ? `${loisActive} active` : 'None active'}
            </p>
          </div>

          {/* DD Progress */}
          <div className="p-4 bg-background/60 rounded-lg border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <ClipboardCheck className="h-4 w-4" />
              <span className="text-xs font-medium">DD Progress</span>
            </div>
            <p className={cn(
              'text-2xl font-bold tabular-nums',
              ddCompletionPercentage >= 80 && 'text-green-600',
              ddCompletionPercentage >= 50 && ddCompletionPercentage < 80 && 'text-amber-600',
              ddCompletionPercentage < 50 && 'text-red-600'
            )}>
              {ddCompletionPercentage}%
            </p>
            <Progress value={ddCompletionPercentage} className="h-1.5 mt-1" />
            <p className="text-xs text-muted-foreground mt-1">
              {ddCompletedRequests}/{ddTotalRequests} complete
            </p>
          </div>

          {/* Active Buyers */}
          <div className="p-4 bg-background/60 rounded-lg border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Users className="h-4 w-4" />
              <span className="text-xs font-medium">Active Buyers</span>
            </div>
            <p className="text-2xl font-bold tabular-nums">{activeBuyers}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Engaged in DD
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BuySideMetricsScorecard;
