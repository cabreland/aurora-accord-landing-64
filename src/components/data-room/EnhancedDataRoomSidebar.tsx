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
  AlertCircle,
  Search,
  Lock,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DataRoomCategory, DataRoomFolder, DataRoomDocument } from '@/hooks/useDataRoom';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderActionsMenu } from './FolderActionsMenu';
import { FolderBulkActions } from './FolderBulkActions';

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

// Default folder categories from SOP 03.1
const DEFAULT_FOLDER_CATEGORIES = [
  {
    id: '1',
    name: 'Corporate & Legal',
    icon: 'Building2',
    index_number: 1,
    defaultFolders: [
      'Articles of Incorporation & Operating Agreements',
      'Business Licenses & Permits',
      'Client Contracts & Service Agreements',
      'Employment Agreements',
      'Insurance Policies (Liability E&O)',
      'Intellectual Property',
      'Legal or Dispute History',
      'NDAs & Confidentiality Agreements',
      'Office & Lease Agreements',
      'Vendor & Contractor Agreements'
    ]
  },
  {
    id: '2',
    name: 'Financials',
    icon: 'DollarSign',
    index_number: 2,
    defaultFolders: [
      'Profit & Loss Statements',
      'Balance Sheets',
      'Bank Statements',
      'Projections & Forecasts',
      'Revenue Breakdown',
      'Tax Returns'
    ]
  },
  {
    id: '3',
    name: 'Operations',
    icon: 'Settings',
    index_number: 3,
    defaultFolders: [
      'Standard Operating Procedures',
      'Vendor Relationships',
      'Tools & Software Licenses',
      'Process Documentation'
    ]
  },
  {
    id: '4',
    name: 'Client Base & Contracts',
    icon: 'Users',
    index_number: 4,
    defaultFolders: [
      'Client List & Revenue by Client',
      'Active Contracts',
      'Retention Metrics'
    ]
  },
  {
    id: '5',
    name: 'Services & Deliverables',
    icon: 'Package',
    index_number: 5,
    defaultFolders: [
      'Service Catalog',
      'Pricing Structure',
      'Portfolio Examples',
      'Deliverables Templates'
    ]
  },
  {
    id: '6',
    name: 'Marketing & Sales',
    icon: 'TrendingUp',
    index_number: 6,
    defaultFolders: [
      'Brand Guidelines',
      'Marketing Materials',
      'Sales Collateral',
      'Lead Generation Process'
    ]
  },
  {
    id: '7',
    name: 'Revenue & Performance',
    icon: 'BarChart',
    index_number: 7,
    defaultFolders: [
      'Monthly Revenue Reports',
      'KPI Dashboards',
      'Performance Benchmarks'
    ]
  },
  {
    id: '8',
    name: 'Technology & Integrations',
    icon: 'Code',
    index_number: 8,
    defaultFolders: [
      'Tech Stack Documentation',
      'System Architecture',
      'API & Integration Docs',
      'Security Policies'
    ]
  },
  {
    id: '9',
    name: 'Deal Documents',
    icon: 'FileText',
    index_number: 9,
    defaultFolders: [
      'Letter of Intent',
      'Purchase Agreement',
      'Closing Documents',
      'Transition Plan'
    ]
  },
  {
    id: '10',
    name: 'Miscellaneous',
    icon: 'FolderOpen',
    index_number: 10,
    defaultFolders: [
      'Additional References',
      'Miscellaneous Documents'
    ]
  }
];

// LOI-Restricted folders (only visible after LOI + deposit)
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
  enableFolderManagement = false,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(categories.map((c) => c.id))
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolderIds, setSelectedFolderIds] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

  // Check LOI access based on deal data
  const computedLOIAccess = hasLOIAccess || Boolean(deal?.loi_submitted_at && deal?.deposit_received);

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

  const toggleFolderSelection = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFolderIds((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const clearFolderSelection = () => {
    setSelectedFolderIds(new Set());
    setSelectionMode(false);
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
    if (folder.is_not_applicable) return 'not_applicable';
    const folderDocs = documents.filter((d) => d.folder_id === folder.id);
    if (folderDocs.length === 0) {
      return folder.is_required ? 'missing' : 'empty';
    }
    if (folderDocs.every((d) => d.status === 'approved')) return 'complete';
    if (folderDocs.some((d) => d.status === 'pending_review')) return 'pending';
    return 'partial';
  };

  const getCategoryProgress = (categoryId: string) => {
    const categoryFolders = getCategoryFolders(categoryId);
    if (categoryFolders.length === 0) return 0;
    
    const completedFolders = categoryFolders.filter(f => {
      const folderDocs = documents.filter(d => d.folder_id === f.id);
      return folderDocs.length > 0 && folderDocs.every(d => d.status === 'approved');
    }).length;
    
    return Math.round((completedFolders / categoryFolders.length) * 100);
  };

  // Use actual categories if available, otherwise use defaults
  const displayCategories = categories.length > 0 ? categories : DEFAULT_FOLDER_CATEGORIES.map(c => ({
    id: c.id,
    name: c.name,
    icon: c.icon,
    index_number: c.index_number,
    description: null,
    sort_order: c.index_number,
    is_active: true,
    created_at: null,
  }));

  // Filter folders based on search
  const filteredCategories = displayCategories.filter(category => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const categoryFolders = getCategoryFolders(category.id);
    return (
      category.name.toLowerCase().includes(query) ||
      categoryFolders.some(f => f.name.toLowerCase().includes(query))
    );
  });

  return (
    <div className="w-72 bg-card rounded-xl border border-border overflow-hidden flex flex-col shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground text-sm">Data Room</h3>
          <Badge variant="secondary" className="text-xs">
            {folders.length} folders
          </Badge>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm bg-background"
          />
        </div>
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
              'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all duration-200',
              !selectedFolderId && !selectedCategoryId
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted text-foreground'
            )}
          >
            <FolderOpen className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1 text-sm font-medium">All Documents</span>
            <Badge 
              variant={!selectedFolderId && !selectedCategoryId ? "secondary" : "outline"} 
              className={cn(
                "text-xs h-5 min-w-[24px] justify-center",
                !selectedFolderId && !selectedCategoryId && "bg-primary-foreground/20 text-primary-foreground border-0"
              )}
            >
              {documents.length}
            </Badge>
          </motion.button>

          <div className="mt-3 space-y-1">
            {filteredCategories.map((category) => {
              const categoryFolders = getCategoryFolders(category.id);
              const isExpanded = expandedCategories.has(category.id);
              const docCount = getCategoryDocumentCount(category.id);
              const progress = getCategoryProgress(category.id);
              const IconComponent = ICON_MAP[category.icon || 'FolderOpen'] || FolderOpen;

              // Filter folders within category based on search
              const visibleFolders = searchQuery 
                ? categoryFolders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
                : categoryFolders;

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
                      'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all duration-200 group',
                      selectedCategoryId === category.id && !selectedFolderId
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted text-foreground'
                    )}
                  >
                    <motion.div
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-shrink-0"
                    >
                      {categoryFolders.length > 0 ? (
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <div className="w-3.5" />
                      )}
                    </motion.div>
                    <IconComponent className="h-4 w-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium truncate block">
                        {category.index_number}. {category.name}
                      </span>
                      {/* Progress bar */}
                      {categoryFolders.length > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full transition-all duration-300",
                                progress === 100 ? 'bg-success' : progress > 50 ? 'bg-primary' : 'bg-warning'
                              )}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground">{progress}%</span>
                        </div>
                      )}
                    </div>
                    {docCount > 0 && (
                      <Badge variant="outline" className="text-xs h-5 min-w-[24px] justify-center">
                        {docCount}
                      </Badge>
                    )}
                  </motion.button>

                  {/* Folders within category */}
                  <AnimatePresence>
                    {isExpanded && visibleFolders.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-5 space-y-0.5 overflow-hidden border-l border-border pl-2"
                      >
                        {visibleFolders.map((folder) => {
                          const folderDocCount = getFolderDocumentCount(folder.id);
                          const status = getFolderStatus(folder);
                          const isSelected = selectedFolderId === folder.id;

                          return (
                            <motion.button
                              key={folder.id}
                              whileHover={{ x: 2, scale: 1.01 }}
                              onClick={() => onSelectFolder(folder.id, category.id)}
                              className={cn(
                                'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-all duration-200 group',
                                isSelected
                                  ? 'bg-primary/15 text-primary ring-1 ring-primary/30'
                                  : 'hover:bg-muted text-foreground',
                                status === 'not_applicable' && 'opacity-60'
                              )}
                            >
                              <Folder className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className={cn(
                                "flex-1 text-xs truncate",
                                status === 'not_applicable' && 'line-through'
                              )}>
                                {folder.name}
                              </span>
                              
                              <div className="flex items-center gap-1">
                                {/* N/A Badge */}
                                {status === 'not_applicable' && (
                                  <Badge variant="secondary" className="text-[10px] h-4 px-1 bg-muted text-muted-foreground">
                                    N/A
                                  </Badge>
                                )}
                                {/* Required missing indicator */}
                                {folder.is_required && status === 'missing' && (
                                  <AlertCircle className="h-3 w-3 text-destructive" />
                                )}
                                {/* Complete indicator */}
                                {status === 'complete' && (
                                  <CheckCircle className="h-3 w-3 text-success" />
                                )}
                                {/* Document count */}
                                {folderDocCount > 0 && status !== 'not_applicable' && (
                                  <Badge
                                    variant={isSelected ? 'default' : 'outline'}
                                    className="text-[10px] h-4 min-w-[18px] justify-center px-1"
                                  >
                                    {folderDocCount}
                                  </Badge>
                                )}
                                {/* Actions menu */}
                                {enableFolderManagement && deal?.id && (
                                  <FolderActionsMenu
                                    folder={folder}
                                    dealId={deal.id}
                                  />
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

          {/* LOI-Restricted Section Divider */}
          <div className="my-4 border-t-2 border-border"></div>

          {/* LOI-Restricted Folder */}
          <div className="bg-destructive/5 border-2 border-destructive/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-destructive" />
              <span className="text-sm font-bold text-destructive uppercase tracking-wide">
                LOI-Restricted Access
              </span>
            </div>
            
            {computedLOIAccess ? (
              // If buyer has LOI + deposit, show folders
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
              // If no LOI access, show locked message
              <div className="text-center py-4">
                <Lock className="w-8 h-8 text-destructive/40 mx-auto mb-2" />
                <p className="text-sm font-semibold text-destructive mb-1">
                  LOI Required
                </p>
                <p className="text-xs text-destructive/70">
                  Submit LOI + deposit to unlock
                </p>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{documents.filter(d => d.status === 'approved').length} approved</span>
          <span>{documents.filter(d => d.status === 'pending_review').length} pending</span>
        </div>
      </div>

      {/* Bulk actions for folder management */}
      {enableFolderManagement && deal?.id && (
        <FolderBulkActions
          selectedFolderIds={selectedFolderIds}
          dealId={deal.id}
          onClearSelection={clearFolderSelection}
        />
      )}
    </div>
  );
};
