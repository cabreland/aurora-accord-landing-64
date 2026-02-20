import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, Search, LayoutGrid, List, FolderOpen, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { DataRoomEmptyState } from '@/components/data-room/DataRoomEmptyState';
import { DataRoomUploadZone } from '@/components/data-room/DataRoomUploadZone';
import { DocumentCard } from '@/components/data-room/DocumentCard';
import { DocumentDetailModal } from '@/components/data-room/DocumentDetailModal';
import { EnterpriseDataRoomHeader } from '@/components/data-room/EnterpriseDataRoomHeader';
import { EnhancedDataRoomSidebar } from '@/components/data-room/EnhancedDataRoomSidebar';
import { InlineDocumentViewer } from '@/components/data-room/InlineDocumentViewer';
import { useDataRoom } from '@/hooks/useDataRoom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const DOCUMENT_STATUSES = [
  { value: 'all', label: 'All Status' },
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    return (localStorage.getItem('dataroom-view-mode') as 'grid' | 'list') || 'list';
  });
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [viewingDocumentId, setViewingDocumentId] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Fetch deal info
  const { data: deal } = useQuery({
    queryKey: ['deal', dealId],
    queryFn: async () => {
      if (!dealId) return null;
      const { data } = await supabase
        .from('deals')
        .select('company_name, asking_price, industry')
        .eq('id', dealId)
        .single();
      return data;
    },
    enabled: !!dealId,
  });

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

  useEffect(() => {
    localStorage.setItem('dataroom-view-mode', viewMode);
  }, [viewMode]);

  const folderStats = useMemo(() => {
    const totalFolders = folders.filter(f => !f.is_not_applicable && f.is_required).length;
    const foldersWithDocs = folders.filter(f => {
      if (f.is_not_applicable || !f.is_required) return false;
      return documents.some(d => d.folder_id === f.id);
    }).length;
    return { total: totalFolders, complete: foldersWithDocs };
  }, [folders, documents]);

  const filteredDocuments = useMemo(() => {
    let result = documents;
    if (selectedCategoryId) {
      const categoryFolderIds = folders
        .filter(f => f.category_id === selectedCategoryId)
        .map(f => f.id);
      result = result.filter(d => d.folder_id && categoryFolderIds.includes(d.folder_id));
    }
    if (selectedFolderId) {
      result = result.filter(d => d.folder_id === selectedFolderId);
    }
    if (statusFilter !== 'all') {
      result = result.filter(d => d.status === statusFilter);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(d =>
        d.file_name.toLowerCase().includes(query) ||
        d.index_number?.toLowerCase().includes(query)
      );
    }
    return result;
  }, [documents, selectedCategoryId, selectedFolderId, statusFilter, folders, searchQuery]);

  const selectedDocument = useMemo(() => {
    if (!selectedDocumentId) return null;
    return documents.find(d => d.id === selectedDocumentId) || null;
  }, [selectedDocumentId, documents]);

  const selectedDocumentFolder = useMemo(() => {
    if (!selectedDocument?.folder_id) return null;
    return folders.find(f => f.id === selectedDocument.folder_id) || null;
  }, [selectedDocument, folders]);

  const viewingDocument = useMemo(() => {
    if (!viewingDocumentId) return null;
    return documents.find(d => d.id === viewingDocumentId) || null;
  }, [viewingDocumentId, documents]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'all';

  const handleApproveDocument = async () => {
    if (!selectedDocumentId) return false;
    return await updateDocumentStatus(selectedDocumentId, 'approved');
  };

  const handleRejectDocument = async (reason: string) => {
    if (!selectedDocumentId) return false;
    return await updateDocumentStatus(selectedDocumentId, 'rejected', reason);
  };

  const handleDeleteDocument = async () => {
    if (!selectedDocumentId) return false;
    const success = await deleteDocument(selectedDocumentId);
    if (success) setSelectedDocumentId(null);
    return success;
  };

  const handleUpload = async (file: File) => {
    await uploadDocument(file, selectedFolderId || null);
  };

  const getFolderForDocument = (doc: { folder_id: string | null }) => {
    if (!doc.folder_id) return null;
    const folder = folders.find(f => f.id === doc.folder_id);
    if (folder) {
      const category = categories.find(c => c.id === folder.category_id);
      return { ...folder, category };
    }
    return null;
  };

  if (!dealId) {
    return (
      <div className="p-6 text-center text-muted-foreground">No deal selected</div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex flex-col bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3 border-b border-border">
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="flex-1 flex">
          <div className="w-72 border-r border-border p-4 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-px w-full" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
          <div className="flex-1 p-4 space-y-4">
            <Skeleton className="h-10 w-full" />
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (folders.length === 0) {
    return (
      <div className="h-full flex flex-col bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        <EnterpriseDataRoomHeader
          deal={deal || undefined}
          completedCount={0}
          totalCount={0}
          onUploadDocument={() => setIsUploadOpen(true)}
        />
        <div className="flex-1 p-6">
          <DataRoomEmptyState templates={templates} onApplyTemplate={applyTemplate} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-card rounded-lg shadow-sm border border-border overflow-hidden">
      {/* Header */}
      <EnterpriseDataRoomHeader
        deal={deal || undefined}
        completedCount={folderStats.complete}
        totalCount={folderStats.total}
        onUploadDocument={() => setIsUploadOpen(!isUploadOpen)}
      />

      {/* Upload Zone */}
      {isUploadOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-b border-border"
        >
          <div className="p-4 bg-muted/30">
            <DataRoomUploadZone
              folderName={selectedFolderId ? folders.find(f => f.id === selectedFolderId)?.name || 'Documents' : 'Data Room'}
              onUpload={handleUpload}
            />
          </div>
        </motion.div>
      )}

      {/* Main Layout: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar — mirrors EnhancedCategorySidebar */}
        <EnhancedDataRoomSidebar
          categories={categories}
          folders={folders}
          documents={documents}
          selectedFolderId={selectedFolderId}
          selectedCategoryId={selectedCategoryId}
          onSelectFolder={(folderId, categoryId) => {
            setSelectedFolderId(folderId);
            if (categoryId) setSelectedCategoryId(categoryId);
            setViewingDocumentId(null);
          }}
          onSelectCategory={(categoryId) => {
            setSelectedCategoryId(categoryId);
            setSelectedFolderId(null);
            setViewingDocumentId(null);
          }}
        />

        {/* Main Content — either inline viewer or document list */}
        {viewingDocument ? (
          <InlineDocumentViewer
            document={viewingDocument}
            onBack={() => setViewingDocumentId(null)}
          />
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden bg-card">
            {/* Filter Bar */}
            <div className="p-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-9"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] h-9">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-muted-foreground" />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </Button>
                )}

                {/* View Mode Toggle */}
                <div className="flex items-center border border-border rounded-lg p-0.5 ml-auto bg-card">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn('h-7 w-7 p-0', viewMode === 'grid' && 'bg-muted')}
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn('h-7 w-7 p-0', viewMode === 'list' && 'bg-muted')}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Document List/Grid */}
            <div className="flex-1 overflow-auto p-4">
              {filteredDocuments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    {hasActiveFilters ? (
                      <Filter className="h-8 w-8 text-muted-foreground" />
                    ) : (
                      <FolderOpen className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-1">No documents found</h3>
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
                  className={viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' : 'space-y-3'}
                >
                  {filteredDocuments.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      document={doc}
                      folder={getFolderForDocument(doc)}
                      onClick={() => setViewingDocumentId(doc.id)}
                    />
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Document Detail Modal — kept as fallback */}
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
