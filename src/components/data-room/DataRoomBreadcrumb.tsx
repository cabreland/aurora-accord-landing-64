import React from 'react';
import { Home, ChevronRight, Info, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DataRoomFolder, DataRoomCategory } from '@/hooks/useDataRoom';

interface DataRoomBreadcrumbProps {
  selectedFolder: DataRoomFolder | null;
  selectedCategory: DataRoomCategory | null;
  documentCount: number;
  onNavigateHome: () => void;
  onNavigateCategory: (categoryId: string) => void;
}

export const DataRoomBreadcrumb: React.FC<DataRoomBreadcrumbProps> = ({
  selectedFolder,
  selectedCategory,
  documentCount,
  onNavigateHome,
  onNavigateCategory,
}) => {
  return (
    <div className="bg-muted/50 rounded-lg px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Home className="h-4 w-4" />
          <span>Data Room</span>
        </button>

        {selectedCategory && (
          <>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <button
              onClick={() => onNavigateCategory(selectedCategory.id)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {selectedCategory.name}
            </button>
          </>
        )}

        {selectedFolder && (
          <>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-foreground flex items-center gap-2">
              {selectedFolder.index_number} {selectedFolder.name}
              {selectedFolder.is_required && (
                <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/20">
                  Required
                </Badge>
              )}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <FileText className="h-4 w-4" />
          <span>{documentCount} document{documentCount !== 1 ? 's' : ''}</span>
        </div>

        {selectedFolder?.description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1 rounded hover:bg-muted transition-colors">
                  <Info className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p>{selectedFolder.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};
