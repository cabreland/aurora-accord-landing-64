import React from 'react';
import { Folder, Lock, CheckCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export interface FolderData {
  id: string;
  name: string;
  icon: React.ReactNode;
  fileCount: number;
  lastUpdated: Date | null;
  requiresNDA: boolean;
  accessLevel: 'public' | 'teaser' | 'cim' | 'financials' | 'full';
}

interface FolderCardProps {
  folder: FolderData;
  hasAccess: boolean;
  onOpen: (folderId: string) => void;
  onRequestAccess?: () => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  hasAccess,
  onOpen,
  onRequestAccess
}) => {
  const isLocked = folder.requiresNDA && !hasAccess;

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-200",
        "bg-card border-border hover:border-primary/50",
        isLocked ? "opacity-80" : "hover:shadow-lg cursor-pointer"
      )}
      onClick={() => !isLocked && onOpen(folder.id)}
    >
      {/* Lock overlay for restricted folders */}
      {isLocked && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-4">
          <Lock className="w-8 h-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground text-center mb-3">
            Sign NDA to Access
          </p>
          {onRequestAccess && (
            <Button size="sm" variant="outline" onClick={(e) => {
              e.stopPropagation();
              onRequestAccess();
            }}>
              Review NDA
            </Button>
          )}
        </div>
      )}

      <CardContent className="p-6">
        {/* Header: Icon + Access Badge */}
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            "w-14 h-14 rounded-lg flex items-center justify-center",
            "bg-primary/10 text-primary"
          )}>
            {folder.icon || <Folder className="w-7 h-7" />}
          </div>
          <Badge 
            variant={folder.requiresNDA ? "secondary" : "outline"}
            className={cn(
              "flex items-center gap-1.5 text-xs",
              folder.requiresNDA 
                ? "bg-amber-500/10 text-amber-600 border-amber-500/20" 
                : "bg-green-500/10 text-green-600 border-green-500/20"
            )}
          >
            {folder.requiresNDA ? (
              <>
                <Lock className="w-3 h-3" />
                NDA Required
              </>
            ) : (
              <>
                <CheckCircle className="w-3 h-3" />
                Public Access
              </>
            )}
          </Badge>
        </div>

        {/* Folder Name */}
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {folder.name}
        </h3>

        {/* Metadata */}
        <div className="space-y-1 text-sm text-muted-foreground mb-4">
          <p>{folder.fileCount} {folder.fileCount === 1 ? 'file' : 'files'}</p>
          <p>
            Last updated: {folder.lastUpdated 
              ? format(folder.lastUpdated, 'MMM d, yyyy')
              : 'N/A'
            }
          </p>
        </div>

        {/* Action Button */}
        <Button 
          variant="ghost" 
          className={cn(
            "w-full justify-between text-primary",
            "group-hover:bg-primary/10",
            isLocked && "opacity-50 pointer-events-none"
          )}
          disabled={isLocked}
        >
          View Folder
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </CardContent>
    </Card>
  );
};
