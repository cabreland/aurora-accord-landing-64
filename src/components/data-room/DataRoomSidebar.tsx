import React, { useState } from 'react';
import {
  FileText,
  DollarSign,
  Settings,
  Users,
  Package,
  TrendingUp,
  BarChart,
  Code,
  FileCheck,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Folder,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DataRoomCategory, DataRoomFolder, DataRoomDocument } from '@/hooks/useDataRoom';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText,
  DollarSign,
  Settings,
  Users,
  Package,
  TrendingUp,
  BarChart,
  Code,
  FileCheck,
  FolderOpen,
};

interface DataRoomSidebarProps {
  categories: DataRoomCategory[];
  folders: DataRoomFolder[];
  documents: DataRoomDocument[];
  selectedFolderId: string | null;
  selectedCategoryId: string | null;
  onSelectFolder: (folderId: string | null, categoryId?: string) => void;
  onSelectCategory: (categoryId: string | null) => void;
}

export const DataRoomSidebar: React.FC<DataRoomSidebarProps> = ({
  categories,
  folders,
  documents,
  selectedFolderId,
  selectedCategoryId,
  onSelectFolder,
  onSelectCategory,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const getCategoryFolders = (categoryId: string) => {
    return folders.filter((f) => f.category_id === categoryId);
  };

  const getFolderDocumentCount = (folderId: string) => {
    return documents.filter((d) => d.folder_id === folderId).length;
  };

  const getCategoryDocumentCount = (categoryId: string) => {
    const categoryFolderIds = getCategoryFolders(categoryId).map((f) => f.id);
    return documents.filter((d) => d.folder_id && categoryFolderIds.includes(d.folder_id)).length;
  };

  const getFolderStatus = (folderId: string) => {
    const folderDocs = documents.filter((d) => d.folder_id === folderId);
    if (folderDocs.length === 0) return 'empty';
    if (folderDocs.every((d) => d.status === 'approved')) return 'complete';
    if (folderDocs.some((d) => d.status === 'pending_review')) return 'pending';
    return 'partial';
  };

  return (
    <div className="w-80 bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Folder Structure</h3>
        <p className="text-sm text-muted-foreground">
          {folders.length} folders · {documents.length} documents
        </p>
      </div>

      <ScrollArea className="h-[calc(100vh-280px)]">
        <div className="p-2">
          {/* All Documents option */}
          <button
            onClick={() => {
              onSelectFolder(null);
              onSelectCategory(null);
            }}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
              !selectedFolderId && !selectedCategoryId
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-muted text-foreground'
            )}
          >
            <FolderOpen className="h-4 w-4" />
            <span className="flex-1 text-sm font-medium">All Documents</span>
            <Badge variant="secondary" className="text-xs">
              {documents.length}
            </Badge>
          </button>

          <div className="mt-2 space-y-1">
            {categories.map((category) => {
              const categoryFolders = getCategoryFolders(category.id);
              const isExpanded = expandedCategories.has(category.id);
              const docCount = getCategoryDocumentCount(category.id);
              const IconComponent = ICON_MAP[category.icon || 'FolderOpen'] || FolderOpen;

              return (
                <div key={category.id}>
                  {/* Category Header */}
                  <button
                    onClick={() => {
                      toggleCategory(category.id);
                      onSelectCategory(category.id);
                      onSelectFolder(null, category.id);
                    }}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors',
                      selectedCategoryId === category.id && !selectedFolderId
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted text-foreground'
                    )}
                  >
                    {categoryFolders.length > 0 ? (
                      isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )
                    ) : (
                      <div className="w-4" />
                    )}
                    <IconComponent className="h-4 w-4" />
                    <span className="flex-1 text-sm font-medium truncate">
                      {category.index_number}. {category.name}
                    </span>
                    {docCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {docCount}
                      </Badge>
                    )}
                  </button>

                  {/* Folders within category */}
                  {isExpanded && categoryFolders.length > 0 && (
                    <div className="ml-4 mt-1 space-y-1">
                      {categoryFolders.map((folder) => {
                        const docCount = getFolderDocumentCount(folder.id);
                        const status = getFolderStatus(folder.id);

                        return (
                          <button
                            key={folder.id}
                            onClick={() => onSelectFolder(folder.id, category.id)}
                            className={cn(
                              'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors',
                              selectedFolderId === folder.id
                                ? 'bg-primary/10 text-primary'
                                : 'hover:bg-muted text-foreground'
                            )}
                          >
                            <Folder className="h-4 w-4" />
                            <span className="flex-1 text-sm truncate">
                              {folder.index_number} {folder.name}
                            </span>
                            <div className="flex items-center gap-2">
                              {folder.is_required && docCount === 0 && (
                                <AlertCircle className="h-3 w-3 text-amber-500" />
                              )}
                              {status === 'complete' && (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              )}
                              {docCount > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {docCount}
                                </Badge>
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
      </ScrollArea>
    </div>
  );
};
