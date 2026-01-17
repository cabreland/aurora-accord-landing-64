import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  FolderOpen, 
  Upload, 
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Folder {
  id: string;
  name: string;
  is_required: boolean;
  documentCount: number;
}

interface DataRoomStatusCardProps {
  healthPercentage: number;
  totalFolders: number;
  foldersWithDocuments: number;
  totalDocuments: number;
  pendingReview: number;
  folders: Folder[];
  onGoToDataRoom: () => void;
  onUploadToFolder?: (folderId: string) => void;
}

export const DataRoomStatusCard: React.FC<DataRoomStatusCardProps> = ({
  healthPercentage,
  totalFolders,
  foldersWithDocuments,
  totalDocuments,
  pendingReview,
  folders,
  onGoToDataRoom,
  onUploadToFolder,
}) => {
  const getHealthIcon = (pct: number) => {
    if (pct >= 80) return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (pct >= 50) return <AlertCircle className="h-4 w-4 text-amber-500" />;
    return <AlertCircle className="h-4 w-4 text-destructive" />;
  };

  const getHealthBadgeVariant = (pct: number) => {
    if (pct >= 80) return 'default';
    if (pct >= 50) return 'secondary';
    return 'destructive';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Data Room Status
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={getHealthBadgeVariant(healthPercentage)}>
              {healthPercentage}% Complete
            </Badge>
            {getHealthIcon(healthPercentage)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">Folder Completion</p>
            <p className="text-2xl font-bold">
              {foldersWithDocuments}/{totalFolders}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">Total Documents</p>
            <p className="text-2xl font-bold">{totalDocuments}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">Pending Review</p>
            <p className="text-2xl font-bold">{pendingReview}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <Progress value={healthPercentage} className="h-2" />
        </div>

        {/* Folder List */}
        <div className="border rounded-lg overflow-hidden max-h-[280px] overflow-y-auto">
          {folders.map((folder, index) => (
            <div 
              key={folder.id}
              className={cn(
                "flex items-center justify-between p-3 hover:bg-muted/50 transition-colors",
                index < folders.length - 1 && "border-b"
              )}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Status Indicator */}
                {folder.documentCount === 0 ? (
                  <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                )}
                
                {/* Folder Name */}
                <span className="font-medium text-sm truncate">{folder.name}</span>
                
                {/* Document Count */}
                <Badge variant="outline" className="text-xs shrink-0">
                  {folder.documentCount} docs
                </Badge>
                
                {/* Required Badge */}
                {folder.is_required && (
                  <Badge variant="secondary" className="text-xs shrink-0">Required</Badge>
                )}
              </div>
              
              {/* Upload Button */}
              {folder.documentCount === 0 && onUploadToFolder && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onUploadToFolder(folder.id)}
                  className="shrink-0 ml-2"
                >
                  <Upload className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={onGoToDataRoom} className="flex-1">
            Go to Data Room
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
