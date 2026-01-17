import React from 'react';
import { ArrowRight, CheckCircle2, FolderOpen, FileText, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FolderStatus {
  id: string;
  name: string;
  is_required: boolean;
  documentCount: number;
}

interface ProgressCardProps {
  healthPercentage: number;
  totalFolders: number;
  foldersWithDocuments: number;
  totalDocuments: number;
  pendingReview: number;
  folders: FolderStatus[];
  dealTitle: string;
  companyName: string;
  daysActive: number;
  onGoToDataRoom: () => void;
  onUploadToFolder?: (folderId: string) => void;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  healthPercentage,
  totalFolders,
  foldersWithDocuments,
  totalDocuments,
  pendingReview,
  folders,
  dealTitle,
  companyName,
  daysActive,
  onGoToDataRoom,
  onUploadToFolder,
}) => {
  // Find first empty required folder for "next step"
  const nextFolder = folders.find(f => f.is_required && f.documentCount === 0);
  const isComplete = healthPercentage === 100;

  // Calculate stroke values for circular progress
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (healthPercentage / 100) * circumference;

  const getHealthColor = () => {
    if (healthPercentage >= 80) return 'text-emerald-500';
    if (healthPercentage >= 50) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getHealthBg = () => {
    if (healthPercentage >= 80) return 'stroke-emerald-500';
    if (healthPercentage >= 50) return 'stroke-amber-500';
    return 'stroke-rose-500';
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-8">
        <div className="flex flex-col lg:flex-row lg:items-center gap-8">
          {/* Circular Progress */}
          <div className="flex-shrink-0 flex flex-col items-center">
            <div className="relative w-36 h-36">
              <svg className="w-36 h-36 transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted/30"
                />
                {/* Progress circle */}
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  className={cn('transition-all duration-500', getHealthBg())}
                  style={{
                    strokeDasharray: circumference,
                    strokeDashoffset,
                  }}
                />
              </svg>
              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={cn('text-4xl font-bold', getHealthColor())}>
                  {Math.round(healthPercentage)}%
                </span>
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Complete
                </span>
              </div>
            </div>
          </div>

          {/* Stats & Next Step */}
          <div className="flex-1 space-y-6">
            {/* Stat Pills */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full">
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{foldersWithDocuments}/{totalFolders} Folders</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{totalDocuments} Docs</span>
              </div>
              {pendingReview > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-full">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-600">{pendingReview} Pending</span>
                </div>
              )}
              <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full">
                <span className="text-sm text-muted-foreground">{daysActive} days active</span>
              </div>
            </div>

            {/* Next Step / Complete State */}
            {isComplete ? (
              <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-emerald-700">Data Room Complete</p>
                  <p className="text-sm text-emerald-600/80">Ready for review and distribution</p>
                </div>
                <Button onClick={onGoToDataRoom}>
                  Review Data Room
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : nextFolder ? (
              <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/10 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Next step</p>
                  <p className="font-medium">Upload to {nextFolder.name}</p>
                </div>
              <Button 
                  onClick={() => {
                    if (onUploadToFolder) {
                      onUploadToFolder(nextFolder.id);
                    } else {
                      onGoToDataRoom();
                    }
                  }}
                >
                  Upload
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Continue building</p>
                  <p className="font-medium">Add more documents to complete remaining folders</p>
                </div>
                <Button variant="outline" onClick={onGoToDataRoom}>
                  Go to Data Room
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
