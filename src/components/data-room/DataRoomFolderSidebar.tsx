import React from 'react';
import { ChevronRight, Folder, CheckCircle, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DataRoomCategory, DataRoomFolder, DataRoomDocument } from '@/hooks/useDataRoom';

interface DataRoomFolderSidebarProps {
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

const DataRoomFolderSidebar: React.FC<DataRoomFolderSidebarProps> = ({
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
    if (total === 0) return 'bg-gray-200';
    const pct = (completed / total) * 100;
    if (pct >= 70) return 'bg-emerald-500';
    if (pct >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getCategoryProgress = (categoryId: string) => {
    const categoryFolders = folders.filter(f => f.category_id === categoryId && !f.is_not_applicable);
    const requiredFolders = categoryFolders.filter(f => f.is_required);
    const completedFolders = requiredFolders.filter(f => getDocCountForFolder(f.id) > 0);
    return { completed: completedFolders.length, total: requiredFolders.length };
  };

  return (
    <div className="w-72 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
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
              ? 'bg-blue-50 text-blue-700 font-medium border border-blue-200 shadow-sm'
              : 'text-gray-700 hover:bg-gray-100'
          )}
        >
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4" />
            <span className="font-medium">All Documents</span>
          </div>
          <Badge variant="secondary" className="text-xs bg-gray-200 text-gray-700 tabular-nums">
            {totalDocuments}
          </Badge>
        </button>

        <div className="h-px bg-gray-200 my-3" />

        {/* Main Categories */}
        <div className="space-y-1">
          {categories.map((category) => {
            const progress = getCategoryProgress(category.id);
            const isExpanded = expandedCategories.has(category.id);
            const categoryFolders = folders.filter(f => f.category_id === category.id);
            const hasSubfolders = categoryFolders.length > 0;
            const isSelected = selectedCategoryId === category.id && !selectedFolderId;
            const progressPct = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

            return (
              <div key={category.id} className="group">
                {/* Main Category Header */}
                <div
                  className={cn(
                    'rounded-lg transition-all duration-150',
                    isSelected
                      ? 'bg-blue-50 border border-blue-200 shadow-sm'
                      : 'hover:bg-gray-100 border border-transparent'
                  )}
                >
                  <div className="flex items-center">
                    {hasSubfolders && (
                      <button
                        onClick={() => onToggleCategory(category.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
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
                      <Folder
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: category.icon ? '#6B7280' : '#6B7280' }}
                      />
                      <span className={cn(
                        'flex-1 text-sm font-semibold truncate',
                        isSelected ? 'text-blue-700' : 'text-gray-800'
                      )}>
                        {category.index_number}. {category.name}
                      </span>
                    </button>
                  </div>
                  
                  {/* Progress Bar - Inside card */}
                  {progress.total > 0 && (
                    <div className="px-3 pb-2.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
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
                        isSelected ? 'text-blue-600' : 'text-gray-500'
                      )}>
                        {progress.completed}/{progress.total}
                      </span>
                    </div>
                  )}
                </div>

                {/* Subfolders */}
                {isExpanded && hasSubfolders && (
                  <div className="ml-5 mt-1 space-y-0.5 border-l-2 border-gray-200 pl-3">
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
                              ? 'bg-blue-50 text-blue-700 border-blue-500 font-medium'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-transparent hover:border-gray-300',
                            folder.is_not_applicable && 'opacity-50 line-through'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">•</span>
                            <span className="truncate">{folder.index_number} {folder.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              'text-xs tabular-nums',
                              isFolderSelected ? 'text-blue-600' : 'text-gray-400'
                            )}>
                              {folderDocCount}
                            </span>
                            {status === 'complete' && (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            )}
                            {status === 'missing' && (
                              <div className="w-2 h-2 rounded-full bg-red-500" />
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

export default DataRoomFolderSidebar;
