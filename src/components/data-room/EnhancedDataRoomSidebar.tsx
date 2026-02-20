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
  FolderOpen,
  ChevronRight,
  Folder,
  CheckCircle,
  Lock,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
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
  FolderOpen,
  Building2,
};

// Color mapping for data room categories (mirrors diligence category colors)
const CATEGORY_COLOR_MAP: Record<string, string> = {
  'FileText': '#5B8CFF',
  'DollarSign': '#10B981',
  'Settings': '#F59E0B',
  'Users': '#8B5CF6',
  'Package': '#EC4899',
  'TrendingUp': '#F97316',
  'BarChart': '#06B6D4',
  'Code': '#6366F1',
  'FolderOpen': '#94A3B8',
  'Building2': '#5B8CFF',
  'FileCheck': '#10B981',
};

// Default folder categories from SOP 03.1
const DEFAULT_FOLDER_CATEGORIES = [
  { id: '1', name: 'Corporate & Legal', icon: 'Building2', index_number: 1 },
  { id: '2', name: 'Financials', icon: 'DollarSign', index_number: 2 },
  { id: '3', name: 'Operations', icon: 'Settings', index_number: 3 },
  { id: '4', name: 'Client Base & Contracts', icon: 'Users', index_number: 4 },
  { id: '5', name: 'Services & Deliverables', icon: 'Package', index_number: 5 },
  { id: '6', name: 'Marketing & Sales', icon: 'TrendingUp', index_number: 6 },
  { id: '7', name: 'Revenue & Performance', icon: 'BarChart', index_number: 7 },
  { id: '8', name: 'Technology & Integrations', icon: 'Code', index_number: 8 },
  { id: '9', name: 'Deal Documents', icon: 'FileText', index_number: 9 },
  { id: '10', name: 'Miscellaneous', icon: 'FolderOpen', index_number: 10 },
];

// LOI-Restricted folders
const LOI_RESTRICTED_FOLDERS = [
  { name: 'Seller Identity', docCount: 0 },
  { name: 'Full Financials', docCount: 0 },
  { name: 'Platform Access', docCount: 0 },
];

interface EnhancedDataRoomSidebarProps {
  categories: DataRoomCategory[];
  folders: DataRoomFolder[];
  documents: DataRoomDocument[];
  selectedFolderId: string | null;
  selectedCategoryId: string | null;
  onSelectFolder: (folderId: string | null, categoryId?: string) => void;
  onSelectCategory: (categoryId: string | null) => void;
  hasLOIAccess?: boolean;
  deal?: {
    id?: string;
    loi_submitted_at?: string | null;
    deposit_received?: boolean;
  };
  enableFolderManagement?: boolean;
  onFolderUpdate?: (folderId: string, updates: Partial<DataRoomFolder>) => void;
}

export const EnhancedDataRoomSidebar: React.FC<EnhancedDataRoomSidebarProps> = ({
  categories,
  folders,
  documents,
  selectedFolderId,
  selectedCategoryId,
  onSelectFolder,
  onSelectCategory,
  hasLOIAccess = false,
  deal,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(categories.map((c) => c.id))
  );

  const computedLOIAccess = hasLOIAccess || Boolean(deal?.loi_submitted_at && deal?.deposit_received);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };

  const getCategoryFolders = (categoryId: string) =>
    folders.filter((f) => f.category_id === categoryId);

  const getFolderDocumentCount = (folderId: string) =>
    documents.filter((d) => d.folder_id === folderId).length;

  const getFolderStatus = (folder: DataRoomFolder) => {
    if (folder.is_not_applicable) return 'not_applicable';
    const folderDocs = documents.filter((d) => d.folder_id === folder.id);
    if (folderDocs.length === 0) return folder.is_required ? 'missing' : 'empty';
    if (folderDocs.every((d) => d.status === 'approved')) return 'complete';
    return 'partial';
  };

  const getProgressColor = (completed: number, total: number) => {
    if (total === 0) return 'bg-muted';
    const pct = (completed / total) * 100;
    if (pct >= 70) return 'bg-success';
    if (pct >= 40) return 'bg-warning';
    return 'bg-destructive';
  };

  const getCategoryProgress = (categoryId: string) => {
    const catFolders = getCategoryFolders(categoryId).filter(f => !f.is_not_applicable);
    const required = catFolders.filter(f => f.is_required);
    const completed = required.filter(f => getFolderDocumentCount(f.id) > 0);
    return { completed: completed.length, total: required.length };
  };

  const displayCategories = categories.length > 0
    ? categories
    : DEFAULT_FOLDER_CATEGORIES.map(c => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
        index_number: c.index_number,
        description: null,
        sort_order: c.index_number,
        is_active: true,
        created_at: null,
      }));

  return (
    <div className="w-72 bg-card border-r border-border flex flex-col h-full">
      {/* Header — matches EnhancedCategorySidebar */}
      <div className="p-4 border-b border-border bg-card">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Folders
        </h2>
      </div>

      {/* Category Tree */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* All Documents */}
        <button
          onClick={() => {
            onSelectFolder(null);
            onSelectCategory(null);
          }}
          className={cn(
            'w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-all duration-150 mb-2',
            !selectedFolderId && !selectedCategoryId
              ? 'bg-primary/10 text-primary font-medium border border-primary/20 shadow-sm'
              : 'text-foreground hover:bg-muted'
          )}
        >
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            <span className="font-medium">All Documents</span>
          </div>
          <Badge variant="secondary" className="text-xs tabular-nums">
            {documents.length}
          </Badge>
        </button>

        <div className="h-px bg-border my-3" />

        {/* Main Categories */}
        <div className="space-y-1">
          {displayCategories.map((category) => {
            const progress = getCategoryProgress(category.id);
            const IconComponent = ICON_MAP[category.icon || 'FolderOpen'] || FolderOpen;
            const isExpanded = expandedCategories.has(category.id);
            const categoryFolders = getCategoryFolders(category.id);
            const hasSubfolders = categoryFolders.length > 0;
            const isSelected = selectedCategoryId === category.id && !selectedFolderId;
            const progressPct = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

            return (
              <div key={category.id} className="group">
                {/* Category Header */}
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
                        onClick={() => toggleCategory(category.id)}
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
                        onSelectFolder(null, category.id);
                      }}
                      className={cn(
                        'flex-1 flex items-center gap-2 py-2.5 pr-3 text-left',
                        !hasSubfolders && 'pl-3'
                      )}
                    >
                      <IconComponent className="w-4 h-4 flex-shrink-0" style={{ color: CATEGORY_COLOR_MAP[category.icon || 'FolderOpen'] || undefined }} />
                      <span className={cn(
                        'flex-1 text-sm font-semibold truncate',
                        isSelected ? 'text-primary' : 'text-foreground'
                      )}>
                        {category.index_number}. {category.name}
                      </span>
                    </button>
                  </div>

                  {/* Progress Bar */}
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
                      const folderDocCount = getFolderDocumentCount(folder.id);
                      const isFolderSelected = selectedFolderId === folder.id;
                      const status = getFolderStatus(folder);

                      return (
                        <button
                          key={folder.id}
                          onClick={() => onSelectFolder(folder.id, category.id)}
                          className={cn(
                            'w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all duration-150 border-l-2 -ml-[2px]',
                            isFolderSelected
                              ? 'bg-primary/10 text-primary border-primary font-medium'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted border-transparent hover:border-border',
                            status === 'not_applicable' && 'opacity-60'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">•</span>
                            <span className={cn(
                              "truncate",
                              status === 'not_applicable' && 'line-through'
                            )}>
                              {folder.index_number} {folder.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              'text-xs tabular-nums',
                              isFolderSelected ? 'text-primary' : 'text-muted-foreground'
                            )}>
                              {folderDocCount}
                            </span>
                            {status === 'complete' && (
                              <CheckCircle className="w-3.5 h-3.5 text-success" />
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

        {/* LOI-Restricted Section */}
        <div className="my-4 border-t-2 border-border" />
        <div className="bg-destructive/5 border-2 border-destructive/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-destructive" />
            <span className="text-sm font-bold text-destructive uppercase tracking-wide">
              LOI-Restricted Access
            </span>
          </div>
          {computedLOIAccess ? (
            <div className="space-y-1">
              {LOI_RESTRICTED_FOLDERS.map((folder) => (
                <button
                  key={folder.name}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-destructive/10 transition-colors"
                >
                  <Folder className="w-4 h-4" />
                  <span className="flex-1 text-left">{folder.name}</span>
                  <span className="text-xs text-muted-foreground">{folder.docCount}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <Lock className="w-8 h-8 text-destructive/40 mx-auto mb-2" />
              <p className="text-sm font-semibold text-destructive mb-1">LOI Required</p>
              <p className="text-xs text-destructive/70">Submit LOI + deposit to unlock</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
