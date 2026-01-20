import React from 'react';
import { ChevronDown, ChevronRight, Folder, CheckCircle, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DataRoomCategory, DataRoomFolder, DataRoomDocument } from '@/hooks/useDataRoom';

interface DataRoomCategorySidebarProps {
  categories: DataRoomCategory[];
  folders: DataRoomFolder[];
  documents: DataRoomDocument[];
  selectedCategoryId: string | null;
  selectedFolderId: string | null;
  expandedCategories: Set<string>;
  onSelectCategory: (categoryId: string | null) => void;
  onSelectFolder: (folderId: string | null) => void;
  onToggleCategory: (categoryId: string) => void;
}

export const DataRoomCategorySidebar: React.FC<DataRoomCategorySidebarProps> = ({
  categories,
  folders,
  documents,
  selectedCategoryId,
  selectedFolderId,
  expandedCategories,
  onSelectCategory,
  onSelectFolder,
  onToggleCategory,
}) => {
  const totalDocuments = documents.length;

  const getDocCountForCategory = (categoryId: string) => {
    const categoryFolderIds = folders.filter(f => f.category_id === categoryId).map(f => f.id);
    return documents.filter(d => d.folder_id && categoryFolderIds.includes(d.folder_id)).length;
  };

  const getDocCountForFolder = (folderId: string) => {
    return documents.filter(d => d.folder_id === folderId).length;
  };

  const getFolderCompletionStatus = (folder: DataRoomFolder) => {
    const docCount = getDocCountForFolder(folder.id);
    if (folder.is_not_applicable) return 'na';
    if (!folder.is_required) return docCount > 0 ? 'complete' : 'optional';
    return docCount > 0 ? 'complete' : 'missing';
  };

  const getProgressColor = (completed: number, total: number) => {
    if (total === 0) return 'bg-muted';
    const pct = (completed / total) * 100;
    if (pct >= 70) return 'bg-green-600';
    if (pct >= 40) return 'bg-yellow-500';
    return 'bg-destructive';
  };

  const getCategoryProgress = (categoryId: string) => {
    const categoryFolders = folders.filter(f => f.category_id === categoryId && !f.is_not_applicable);
    const requiredFolders = categoryFolders.filter(f => f.is_required);
    const completedFolders = requiredFolders.filter(f => getDocCountForFolder(f.id) > 0);
    return { completed: completedFolders.length, total: requiredFolders.length };
  };

  return (
    <div className="w-72 bg-muted/30 border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border bg-background">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Folders
        </h2>
      </div>

      {/* Category Tree - Scrollable */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* All Documents - Always visible */}
        <button
          onClick={() => {
            onSelectCategory(null);
            onSelectFolder(null);
          }}
          className={cn(
            'w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-all duration-150 mb-2',
            selectedCategoryId === null && selectedFolderId === null
              ? 'bg-primary/10 text-primary font-medium border border-primary/20 shadow-sm'
              : 'text-foreground hover:bg-muted'
          )}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="font-medium">All Documents</span>
          </div>
          <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground tabular-nums">
            {totalDocuments}
          </Badge>
        </button>

        <div className="h-px bg-border my-3" />

        {/* Main Categories */}
        <div className="space-y-1">
          {categories.map((category) => {
            const progress = getCategoryProgress(category.id);
            const isExpanded = expandedCategories.has(category.id);
            const categoryFolders = folders.filter(f => f.category_id === category.id);
            const hasSubfolders = categoryFolders.length > 0;
            const isSelected = selectedCategoryId === category.id && !selectedFolderId;
            const progressPct = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;
            const docCount = getDocCountForCategory(category.id);

            return (
              <div key={category.id} className="group">
                {/* Main Category Header */}
                <div
                  className={cn(
                    'rounded-lg transition-all duration-150',
                    isSelected
                      ? 'bg-primary/10 border border-primary/20 shadow-sm'
                      : 'hover:bg-muted border border-transparent'
                  )}
                >
                  <div className="flex items-center">
                    {hasSubfolders && (
                      <button
                        onClick={() => onToggleCategory(category.id)}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <div className={cn(
                          "transition-transform duration-200",
                          isExpanded && "rotate-90"
                        )}>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onSelectCategory(category.id);
                        onSelectFolder(null);
                      }}
                      className={cn(
                        'flex-1 flex items-center gap-2 py-2.5 pr-3 text-left',
                        !hasSubfolders && 'pl-3'
                      )}
                    >
                      <Folder className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                      <span className={cn(
                        'flex-1 text-sm font-semibold truncate',
                        isSelected ? 'text-primary' : 'text-foreground'
                      )}>
                        {category.index_number}. {category.name}
                      </span>
                    </button>
                  </div>
                  
                  {/* Progress Bar - Inside card */}
                  {progress.total > 0 && (
                    <div className="px-3 pb-2.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-300",
                            getProgressColor(progress.completed, progress.total)
                          )}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <span className={cn(
                        'text-xs font-medium tabular-nums min-w-[40px] text-right',
                        isSelected ? 'text-primary' : 'text-muted-foreground'
                      )}>
                        {progress.completed}/{progress.total}
                      </span>
                    </div>
                  )}
                </div>

                {/* Subfolders */}
                {isExpanded && hasSubfolders && (
                  <div className="ml-5 mt-1 space-y-0.5 border-l-2 border-border pl-3">
                    {categoryFolders.map((folder) => {
                      const folderDocCount = getDocCountForFolder(folder.id);
                      const isFolderSelected = selectedFolderId === folder.id;
                      const status = getFolderCompletionStatus(folder);

                      return (
                        <button
                          key={folder.id}
                          onClick={() => {
                            onSelectCategory(category.id);
                            onSelectFolder(folder.id);
                          }}
                          className={cn(
                            'w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all duration-150 border-l-2 -ml-[2px]',
                            isFolderSelected
                              ? 'bg-primary/10 text-primary border-primary font-medium'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted border-transparent hover:border-muted-foreground/30',
                            folder.is_not_applicable && 'opacity-50 line-through'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">•</span>
                            <span className="truncate">{folder.index_number} {folder.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              'text-xs tabular-nums',
                              isFolderSelected ? 'text-primary' : 'text-muted-foreground'
                            )}>
                              {folderDocCount}
                            </span>
                            {status === 'complete' && (
                              <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                            )}
                            {status === 'missing' && (
                              <div className="w-2 h-2 rounded-full bg-destructive" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DataRoomCategorySidebar;
