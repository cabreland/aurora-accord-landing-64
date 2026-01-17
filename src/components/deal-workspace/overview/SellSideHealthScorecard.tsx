import React from 'react';
import { FolderCheck, FileText, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SellSideHealthScorecardProps {
  healthPercentage: number;
  requiredFolders: number;
  requiredFoldersWithDocuments: number;
  totalDocuments: number;
  isComplete: boolean;
}

const getHealthStatus = (score: number): { label: string; colorClass: string } => {
  if (score >= 80) return { label: 'Excellent', colorClass: 'text-green-600' };
  if (score >= 50) return { label: 'In Progress', colorClass: 'text-amber-600' };
  return { label: 'Needs Attention', colorClass: 'text-red-600' };
};

export const SellSideHealthScorecard: React.FC<SellSideHealthScorecardProps> = ({
  healthPercentage,
  requiredFolders,
  requiredFoldersWithDocuments,
  totalDocuments,
  isComplete
}) => {
  const health = getHealthStatus(healthPercentage);

  return (
    <Card className="bg-gradient-to-br from-card to-muted/30 border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <FolderCheck className="h-5 w-5 text-primary" />
            Data Room Health
          </div>
          <Badge 
            variant={isComplete ? 'default' : 'secondary'}
            className={cn(
              isComplete && 'bg-green-100 text-green-800 hover:bg-green-100'
            )}
          >
            {isComplete ? 'Ready to Publish' : health.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Main Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Folder Completion</span>
              <span className={cn('text-2xl font-bold tabular-nums', health.colorClass)}>
                {healthPercentage}%
              </span>
            </div>
            <Progress 
              value={healthPercentage} 
              className="h-3"
            />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="text-center p-3 bg-background/60 rounded-lg border border-border/50">
              <FileText className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-xl font-bold tabular-nums">{totalDocuments}</p>
              <p className="text-xs text-muted-foreground">Documents</p>
            </div>
            <div className="text-center p-3 bg-background/60 rounded-lg border border-border/50">
              <FolderCheck className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-xl font-bold tabular-nums">
                {requiredFoldersWithDocuments}/{requiredFolders}
              </p>
              <p className="text-xs text-muted-foreground">Required Folders</p>
            </div>
            <div className="text-center p-3 bg-background/60 rounded-lg border border-border/50">
              <AlertCircle className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-xl font-bold tabular-nums">
                {requiredFolders - requiredFoldersWithDocuments}
              </p>
              <p className="text-xs text-muted-foreground">Missing</p>
            </div>
          </div>

          {!isComplete && (
            <p className="text-xs text-muted-foreground text-center pt-2">
              Complete all required folders to publish this deal to the marketplace
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SellSideHealthScorecard;
