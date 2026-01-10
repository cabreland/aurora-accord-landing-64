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
import { motion, AnimatePresence } from 'framer-motion';

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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(categories.map((c) => c.id)) // Expand all by default
  );

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

  const getFolderStatus = (folder: DataRoomFolder) => {
    const folderDocs = documents.filter((d) => d.folder_id === folder.id);
    if (folderDocs.length === 0) {
      return folder.is_required ? 'missing' : 'empty';
    }
    if (folderDocs.every((d) => d.status === 'approved')) return 'complete';
    if (folderDocs.some((d) => d.status === 'pending_review')) return 'pending';
    return 'partial';
  };

  return (
    <div className="w-80 bg-card rounded-xl border border-border overflow-hidden flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Folder Structure</h3>
        <p className="text-sm text-muted-foreground">
          {folders.length} folders · {documents.length} documents
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* All Documents option */}
          <motion.button
            whileHover={{ x: 2 }}
            onClick={() => {
              onSelectFolder(null);
              onSelectCategory(null);
            }}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200',
              !selectedFolderId && !selectedCategoryId
                ? 'bg-primary/10 text-primary border-l-2 border-primary'
                : 'hover:bg-muted text-foreground'
            )}
          >
            <FolderOpen className="h-4 w-4" />
            <span className="flex-1 text-sm font-medium">All Documents</span>
            <Badge variant="secondary" className="text-xs">
              {documents.length}
            </Badge>
          </motion.button>

          <div className="mt-3 space-y-1">
            {categories.map((category) => {
              const categoryFolders = getCategoryFolders(category.id);
              const isExpanded = expandedCategories.has(category.id);
              const docCount = getCategoryDocumentCount(category.id);
              const IconComponent = ICON_MAP[category.icon || 'FolderOpen'] || FolderOpen;

              return (
                <div key={category.id} className="space-y-0.5">
                  {/* Category Header */}
                  <motion.button
                    whileHover={{ x: 2 }}
                    onClick={() => {
                      toggleCategory(category.id);
                      onSelectCategory(category.id);
                      onSelectFolder(null, category.id);
                    }}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all duration-200',
                      selectedCategoryId === category.id && !selectedFolderId
                        ? 'bg-primary/10 text-primary border-l-2 border-primary'
                        : 'hover:bg-muted text-foreground'
                    )}
                  >
                    <motion.div
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {categoryFolders.length > 0 ? (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <div className="w-4" />
                      )}
                    </motion.div>
                    <IconComponent className="h-4 w-4" />
                    <span className="flex-1 text-sm font-medium truncate">
                      {category.index_number}. {category.name}
                    </span>
                    {docCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {docCount}
                      </Badge>
                    )}
                  </motion.button>

                  {/* Folders within category */}
                  <AnimatePresence>
                    {isExpanded && categoryFolders.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-4 space-y-0.5 overflow-hidden"
                      >
                        {categoryFolders.map((folder) => {
                          const docCount = getFolderDocumentCount(folder.id);
                          const status = getFolderStatus(folder);
                          const isSelected = selectedFolderId === folder.id;

                          return (
                            <motion.button
                              key={folder.id}
                              whileHover={{ x: 2, scale: 1.01 }}
                              onClick={() => onSelectFolder(folder.id, category.id)}
                              className={cn(
                                'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all duration-200',
                                isSelected
                                  ? 'bg-primary/10 text-primary border-l-2 border-primary'
                                  : 'hover:bg-muted text-foreground'
                              )}
                            >
                              <Folder className="h-4 w-4" />
                              <span className="flex-1 text-sm truncate">
                                {folder.index_number} {folder.name}
                              </span>
                              <div className="flex items-center gap-1.5">
                                {folder.is_required && status === 'missing' && (
                                  <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                                )}
                                {folder.is_required && status !== 'missing' && status !== 'complete' && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] px-1 py-0 h-4 bg-destructive/10 text-destructive border-destructive/20"
                                  >
                                    Required
                                  </Badge>
                                )}
                                {status === 'complete' && (
                                  <CheckCircle className="h-3.5 w-3.5 text-success" />
                                )}
                                {docCount > 0 && (
                                  <Badge
                                    variant={isSelected ? 'default' : 'outline'}
                                    className="text-xs h-5 min-w-[20px] justify-center"
                                  >
                                    {docCount}
                                  </Badge>
                                )}
                              </div>
                            </motion.button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
