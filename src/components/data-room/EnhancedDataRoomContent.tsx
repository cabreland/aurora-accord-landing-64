import React, { useState } from 'react';
import { toast } from 'sonner';
import { 
  LayoutGrid, 
  List, 
  ArrowUpDown, 
  Filter, 
  Search,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { DataRoomDocument, DataRoomFolder, DataRoomCategory } from '@/hooks/useDataRoom';
import { DataRoomBreadcrumb } from './DataRoomBreadcrumb';
import { DataRoomUploadZone } from './DataRoomUploadZone';
import { DataRoomDocumentTable } from './DataRoomDocumentTable';
import { DataRoomDocumentGrid } from './DataRoomDocumentGrid';
import { DataRoomEmptyContent } from './DataRoomEmptyContent';
import { DataRoomBulkActions } from './DataRoomBulkActions';
import { DataRoomSubmitForReview } from './DataRoomSubmitForReview';
import { FolderActionButtons } from './FolderActionButtons';

interface EnhancedDataRoomContentProps {
  documents: DataRoomDocument[];
  folders: DataRoomFolder[];
  categories: DataRoomCategory[];
  selectedFolderId: string | null;
  selectedCategoryId: string | null;
  currentLocation: string;
  onUpload: (file: File) => Promise<unknown>;
  onDelete: (documentId: string) => Promise<boolean>;
  onUpdateStatus: (
    documentId: string,
    status: 'approved' | 'rejected',
    reason?: string
  ) => Promise<boolean>;
  onNavigateHome: () => void;
  onNavigateCategory: (categoryId: string) => void;
  // Submit for review props
  dealId?: string;
  approvalStatus?: string | null;
  isOwner?: boolean;
  onRefresh?: () => void;
  // Partner permission props
  canUploadDocuments?: boolean;
  canApproveDataRoom?: boolean;
  // Folder management
  enableFolderManagement?: boolean;
  onFolderUpdate?: (folderId: string, updates: Partial<DataRoomFolder>) => void;
}

export const EnhancedDataRoomContent: React.FC<EnhancedDataRoomContentProps> = ({
  documents,
  folders,
  categories,
  selectedFolderId,
  selectedCategoryId,
  currentLocation,
  onUpload,
  onDelete,
  onUpdateStatus,
  onNavigateHome,
  onNavigateCategory,
  dealId,
  approvalStatus,
  isOwner = false,
  onRefresh,
  canUploadDocuments = true,
  canApproveDataRoom = true,
  enableFolderManagement = false,
  onFolderUpdate,
}) => {
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Get selected folder and category objects
  const selectedFolder = selectedFolderId
    ? folders.find((f) => f.id === selectedFolderId) || null
    : null;
  const selectedCategory = selectedCategoryId
    ? categories.find((c) => c.id === selectedCategoryId) || null
    : null;

  // Filter and sort documents
  const filteredDocuments = documents
    .filter((doc) => {
      const matchesSearch =
        !searchQuery ||
        doc.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.index_number?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.file_name.localeCompare(b.file_name);
        case 'size':
          return (b.file_size || 0) - (a.file_size || 0);
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        case 'date':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const handleSelectDocument = (docId: string, selected: boolean) => {
    setSelectedDocuments((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(docId);
      } else {
        next.delete(docId);
      }
      return next;
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedDocuments(new Set(filteredDocuments.map((d) => d.id)));
    } else {
      setSelectedDocuments(new Set());
    }
  };

  const handleBulkApprove = async (ids: string[]) => {
    for (const id of ids) {
      await onUpdateStatus(id, 'approved');
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    for (const id of ids) {
      await onDelete(id);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'all';

  return (
    <div className="flex-1 space-y-4 min-w-0">
      {/* Breadcrumb */}
      <DataRoomBreadcrumb
        selectedFolder={selectedFolder}
        selectedCategory={selectedCategory}
        documentCount={filteredDocuments.length}
        onNavigateHome={onNavigateHome}
        onNavigateCategory={onNavigateCategory}
      />

      {/* Toolbar */}
      <div className="bg-card border border-border rounded-lg p-3 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Search and Filters */}
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 h-9">
                <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending_review">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32 h-9">
                <ArrowUpDown className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="size">Size</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Right: View Toggle and Upload */}
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex items-center bg-muted rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-1.5 rounded transition-colors',
                  viewMode === 'list' ? 'bg-background shadow-sm' : 'hover:bg-muted-foreground/10'
                )}
              >
                <List className="h-4 w-4 text-muted-foreground" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-1.5 rounded transition-colors',
                  viewMode === 'grid' ? 'bg-background shadow-sm' : 'hover:bg-muted-foreground/10'
                )}
              >
                <LayoutGrid className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div className="h-6 w-px bg-border" />

            {/* Folder Action Buttons - shown when a folder is selected */}
            {enableFolderManagement && selectedFolder && dealId && (
              <FolderActionButtons folder={selectedFolder} dealId={dealId} onFolderUpdate={onFolderUpdate} />
            )}

            {/* Submit for Review - for deal owners with approval permission */}
            {dealId && onRefresh && canApproveDataRoom && (
              <DataRoomSubmitForReview
                dealId={dealId}
                approvalStatus={approvalStatus}
                isOwner={isOwner}
                folders={folders}
                documents={documents}
                onRefresh={onRefresh}
              />
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
            <span className="text-xs text-muted-foreground">Active filters:</span>
            {searchQuery && (
              <Badge variant="secondary" className="text-xs gap-1">
                Search: {searchQuery}
                <button onClick={() => setSearchQuery('')}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {statusFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs gap-1 capitalize">
                Status: {statusFilter.replace('_', ' ')}
                <button onClick={() => setStatusFilter('all')}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <span className="text-xs text-muted-foreground ml-auto">
              {filteredDocuments.length} result{filteredDocuments.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Unassigned Documents — files with no folder */}
      {!selectedFolderId && !selectedCategoryId && (() => {
        const unassigned = documents.filter(d => !d.folder_id);
        if (unassigned.length === 0) return null;
        return (
          <div className="bg-card border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Unassigned Documents
                <Badge variant="secondary" className="ml-2 text-xs">{unassigned.length}</Badge>
              </h3>
              <p className="text-xs text-muted-foreground">
                These files haven't been assigned to a folder yet
              </p>
            </div>
            <div className="divide-y divide-border">
              {unassigned.map(doc => (
                <div key={doc.id} className="flex items-center justify-between py-2">
                  <span className="text-sm truncate flex-1">{doc.file_name}</span>
                  <Select
                    onValueChange={async (folderId) => {
                      const { error } = await (await import('@/integrations/supabase/client')).supabase
                        .from('data_room_documents')
                        .update({ folder_id: folderId })
                        .eq('id', doc.id);
                      if (!error) {
                        toast.success(`Moved "${doc.file_name}" to folder`);
                        onRefresh?.();
                      }
                    }}
                  >
                    <SelectTrigger className="w-[180px] h-8 text-xs">
                      <SelectValue placeholder="Assign to folder..." />
                    </SelectTrigger>
                    <SelectContent>
                      {folders.map(f => (
                        <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Upload Zone - Always visible when folder is selected and user can upload */}
      {canUploadDocuments && selectedFolderId && (
        <DataRoomUploadZone
          folderName={currentLocation}
          onUpload={onUpload}
        />
      )}

      {/* Document Content */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-card rounded-xl border border-border">
          <DataRoomEmptyContent folderName={currentLocation} />
        </div>
      ) : viewMode === 'list' ? (
        <DataRoomDocumentTable
          documents={filteredDocuments}
          folders={folders}
          selectedDocuments={selectedDocuments}
          onSelectDocument={handleSelectDocument}
          onSelectAll={handleSelectAll}
          onDelete={onDelete}
          onUpdateStatus={onUpdateStatus}
        />
      ) : (
        <DataRoomDocumentGrid
          documents={filteredDocuments}
          folders={folders}
          selectedDocuments={selectedDocuments}
          onSelectDocument={handleSelectDocument}
          onDelete={onDelete}
          onUpdateStatus={onUpdateStatus}
        />
      )}

      {/* Bulk Actions */}
      <DataRoomBulkActions
        selectedDocuments={selectedDocuments}
        documents={filteredDocuments}
        onClearSelection={() => setSelectedDocuments(new Set())}
        onBulkDelete={handleBulkDelete}
        onBulkApprove={handleBulkApprove}
      />
    </div>
  );
};
