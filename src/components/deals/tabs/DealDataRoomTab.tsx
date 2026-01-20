import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Filter, Upload, Search, LayoutGrid, List, FolderOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { DataRoomEmptyState } from '@/components/data-room/DataRoomEmptyState';
import { DataRoomUploadZone } from '@/components/data-room/DataRoomUploadZone';
import { DocumentCard } from '@/components/data-room/DocumentCard';
import { DocumentDetailModal } from '@/components/data-room/DocumentDetailModal';
import { DataRoomCategorySidebar } from '@/components/data-room/DataRoomCategorySidebar';
import { useDataRoom } from '@/hooks/useDataRoom';
import { cn } from '@/lib/utils';

const DOCUMENT_STATUSES = [
  { value: 'all', label: 'All Statuses' },
  { value: 'approved', label: 'Approved' },
  { value: 'pending_review', label: 'Pending' },
  { value: 'rejected', label: 'Rejected' },
];

export const DealDataRoomTab = () => {
  const { dealId } = useParams<{ dealId: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    return (localStorage.getItem('dataroom-view-mode') as 'grid' | 'list') || 'list';
  });
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const {
    categories,
    folders,
    documents,
    templates,
    loading,
    refresh,
    applyTemplate,
    uploadDocument,
    deleteDocument,
    updateDocumentStatus,
  } = useDataRoom({ dealId: dealId || undefined });

  // Persist view mode preference
  useEffect(() => {
    localStorage.setItem('dataroom-view-mode', viewMode);
  }, [viewMode]);

  // Calculate folder completion stats
  const folderStats = useMemo(() => {
    const totalFolders = folders.filter(f => !f.is_not_applicable).length;
    const foldersWithDocs = folders.filter(f => {
      if (f.is_not_applicable) return false;
      return documents.some(d => d.folder_id === f.id);
    }).length;
    const completionPct = totalFolders > 0 ? Math.round((foldersWithDocs / totalFolders) * 100) : 0;
    return { total: totalFolders, complete: foldersWithDocs, pct: completionPct };
  }, [folders, documents]);

  // Filter documents
  const filteredDocuments = useMemo(() => {
    let result = documents;

    // Apply category filter
    if (selectedCategoryId) {
      const categoryFolderIds = folders
        .filter(f => f.category_id === selectedCategoryId)
        .map(f => f.id);
      result = result.filter(d => d.folder_id && categoryFolderIds.includes(d.folder_id));
    }

    // Apply folder filter
    if (selectedFolderId) {
      result = result.filter(d => d.folder_id === selectedFolderId);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(d => d.status === statusFilter);
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(d =>
        d.file_name.toLowerCase().includes(query) ||
        d.index_number?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [documents, selectedCategoryId, selectedFolderId, statusFilter, folders, searchQuery]);

  // Get selected document details
  const selectedDocument = useMemo(() => {
    if (!selectedDocumentId) return null;
    return documents.find(d => d.id === selectedDocumentId) || null;
  }, [selectedDocumentId, documents]);

  const selectedDocumentFolder = useMemo(() => {
    if (!selectedDocument?.folder_id) return null;
    return folders.find(f => f.id === selectedDocument.folder_id) || null;
  }, [selectedDocument, folders]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSelectedCategoryId(null);
    setSelectedFolderId(null);
  };

  const hasActiveFilters = searchQuery !== '' || 
    statusFilter !== 'all' || 
    selectedCategoryId !== null ||
    selectedFolderId !== null;

  const handleToggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const handleApproveDocument = async () => {
    if (!selectedDocumentId) return false;
    const success = await updateDocumentStatus(selectedDocumentId, 'approved');
    return success;
  };

  const handleRejectDocument = async (reason: string) => {
    if (!selectedDocumentId) return false;
    const success = await updateDocumentStatus(selectedDocumentId, 'rejected', reason);
    return success;
  };

  const handleDeleteDocument = async () => {
    if (!selectedDocumentId) return false;
    const success = await deleteDocument(selectedDocumentId);
    if (success) {
      setSelectedDocumentId(null);
    }
    return success;
  };

  const handleUpload = async (file: File) => {
    // Upload to the selected folder or root
    const targetFolderId = selectedFolderId || null;
    await uploadDocument(file, targetFolderId);
  };

  // Get folder with category info for document cards
  const getFolderForDocument = (doc: { folder_id: string | null }) => {
    if (!doc.folder_id) return null;
    const folder = folders.find(f => f.id === doc.folder_id);
    if (folder) {
      const category = categories.find(c => c.id === folder.category_id);
      return { ...folder, category };
    }
    return null;
  };

  // Get current location label
  const currentLocationLabel = useMemo(() => {
    if (selectedFolderId) {
      const folder = folders.find(f => f.id === selectedFolderId);
      return folder ? `${folder.index_number} ${folder.name}` : 'All Documents';
    }
    if (selectedCategoryId) {
      const category = categories.find(c => c.id === selectedCategoryId);
      return category ? `${category.index_number}. ${category.name}` : 'All Documents';
    }
    return 'All Documents';
  }, [selectedCategoryId, selectedFolderId, categories, folders]);

  if (!dealId) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        No deal selected
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-6 flex-1 max-w-xs" />
          <Skeleton className="h-6 w-40 ml-auto" />
        </div>
        <div className="flex gap-6">
          <Skeleton className="w-72 h-[600px]" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-10" />
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no folders
  if (folders.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/deals')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Data Room</h2>
              <p className="text-muted-foreground text-sm">
                Set up your data room structure
              </p>
            </div>
          </div>
        </div>
        <DataRoomEmptyState templates={templates} onApplyTemplate={applyTemplate} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/deals')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Data Room</h2>
            <p className="text-muted-foreground text-sm">
              Manage deal documents and materials
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Progress Indicator */}
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="font-semibold text-foreground">{folderStats.pct}%</span>
            <span>|</span>
            <span>{folderStats.complete} of {folderStats.total} folders complete</span>
          </div>
          <Button onClick={() => setIsUploadOpen(!isUploadOpen)} className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Upload Zone (collapsible) */}
      {isUploadOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <DataRoomUploadZone
            folderName={selectedFolderId ? folders.find(f => f.id === selectedFolderId)?.name || 'Documents' : 'Data Room'}
            onUpload={handleUpload}
          />
        </motion.div>
      )}

      {/* Main Layout: Sidebar + Content */}
      <div className="flex gap-6 min-h-[600px]">
        {/* Sidebar */}
        <DataRoomCategorySidebar
          categories={categories}
          folders={folders}
          documents={documents}
          selectedCategoryId={selectedCategoryId}
          selectedFolderId={selectedFolderId}
          expandedCategories={expandedCategories}
          onSelectCategory={setSelectedCategoryId}
          onSelectFolder={setSelectedFolderId}
          onToggleCategory={handleToggleCategory}
        />

        {/* Content Area */}
        <div className="flex-1 space-y-4">
          {/* Content Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">{currentLocationLabel}</h3>
              <p className="text-sm text-muted-foreground">
                {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-lg p-1 ml-auto">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-8 w-8 p-0',
                  viewMode === 'grid' && 'bg-muted'
                )}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-8 w-8 p-0',
                  viewMode === 'list' && 'bg-muted'
                )}
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Document List/Grid */}
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-16 bg-muted/20 rounded-lg border border-dashed">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                {hasActiveFilters ? (
                  <Filter className="h-8 w-8 text-muted-foreground" />
                ) : (
                  <FolderOpen className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <h3 className="text-lg font-medium mb-1">No documents found</h3>
              <p className="text-muted-foreground mb-4">
                {documents.length === 0
                  ? 'Upload your first document to get started'
                  : 'Try adjusting your filters'}
              </p>
              {documents.length === 0 && (
                <Button onClick={() => setIsUploadOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              )}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className={viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2' : 'grid gap-3'}
            >
              {filteredDocuments.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  folder={getFolderForDocument(doc)}
                  onClick={() => setSelectedDocumentId(doc.id)}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Document Detail Modal */}
      <DocumentDetailModal
        open={!!selectedDocumentId}
        onOpenChange={(open) => !open && setSelectedDocumentId(null)}
        document={selectedDocument}
        folder={selectedDocumentFolder}
        onApprove={handleApproveDocument}
        onReject={handleRejectDocument}
        onDelete={handleDeleteDocument}
      />
    </div>
  );
};

export default DealDataRoomTab;
