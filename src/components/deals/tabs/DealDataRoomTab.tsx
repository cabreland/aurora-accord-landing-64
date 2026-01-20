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
import DataRoomFolderSidebar from '@/components/data-room/DataRoomFolderSidebar';
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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    return (localStorage.getItem('dataroom-view-mode') as 'grid' | 'list') || 'list';
  });
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
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

  // Persist view mode preference
  useEffect(() => {
    localStorage.setItem('dataroom-view-mode', viewMode);
  }, [viewMode]);

  // Calculate folder completion stats
  const folderStats = useMemo(() => {
    const totalFolders = folders.filter(f => !f.is_not_applicable && f.is_required).length;
    const foldersWithDocs = folders.filter(f => {
      if (f.is_not_applicable || !f.is_required) return false;
      return documents.some(d => d.folder_id === f.id);
    }).length;
    return { total: totalFolders, complete: foldersWithDocs };
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
  };

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'all';

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

  if (!dealId) {
    return (
      <div className="p-6 text-center text-gray-500">
        No deal selected
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="h-full flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="flex-1 flex">
          <div className="w-72 border-r border-gray-200 p-4 space-y-3">
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

  // Show empty state if no folders
  if (folders.length === 0) {
    return (
      <div className="h-full flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header - Matches DiligenceHeader exactly */}
      <EnterpriseDataRoomHeader
        deal={deal || undefined}
        completedCount={folderStats.complete}
        totalCount={folderStats.total}
        onUploadDocument={() => setIsUploadOpen(!isUploadOpen)}
      />

      {/* Upload Zone (collapsible) */}
      {isUploadOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-b border-gray-200"
        >
          <div className="p-4 bg-gray-50">
            <DataRoomUploadZone
              folderName={selectedFolderId ? folders.find(f => f.id === selectedFolderId)?.name || 'Documents' : 'Data Room'}
              onUpload={handleUpload}
            />
          </div>
        </motion.div>
      )}

      {/* Main Layout: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Matches EnhancedCategorySidebar exactly */}
        <DataRoomFolderSidebar
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

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {/* Filter Bar - Matches DealDiligenceTracker filter bar exactly */}
          <div className="p-4 border-b border-gray-200 bg-gray-50/80">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 h-9"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] bg-white border-gray-300 h-9">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
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
                  className="text-gray-600 hover:text-gray-900"
                >
                  Clear
                </Button>
              )}

              {/* View Mode Toggle */}
              <div className="flex items-center border border-gray-300 rounded-lg p-0.5 ml-auto bg-white">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-7 w-7 p-0',
                    viewMode === 'grid' && 'bg-gray-100'
                  )}
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-7 w-7 p-0',
                    viewMode === 'list' && 'bg-gray-100'
                  )}
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
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  {hasActiveFilters ? (
                    <Filter className="h-8 w-8 text-gray-400" />
                  ) : (
                    <FolderOpen className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No documents found</h3>
                <p className="text-gray-500 mb-4">
                  {documents.length === 0
                    ? 'Upload your first document to get started'
                    : 'Try adjusting your filters'}
                </p>
                {documents.length === 0 && (
                  <Button onClick={() => setIsUploadOpen(true)} className="bg-blue-600 hover:bg-blue-700">
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
                    onClick={() => setSelectedDocumentId(doc.id)}
                  />
                ))}
              </motion.div>
            )}
          </div>
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
