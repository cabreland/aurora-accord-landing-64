import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, FolderOpen, Filter, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { DataRoomMetricsBar } from '@/components/data-room/DataRoomMetricsBar';
import { DataRoomEmptyState } from '@/components/data-room/DataRoomEmptyState';
import { DataRoomUploadZone } from '@/components/data-room/DataRoomUploadZone';
import { DocumentCard } from '@/components/data-room/DocumentCard';
import { DocumentDetailModal } from '@/components/data-room/DocumentDetailModal';
import { DataRoomFilterBar } from '@/components/data-room/DataRoomFilterBar';
import { useDataRoom } from '@/hooks/useDataRoom';

export const DealDataRoomTab = () => {
  const { dealId } = useParams<{ dealId: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [folderFilter, setFolderFilter] = useState('all');
  const [activeMetricFilter, setActiveMetricFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    return (localStorage.getItem('dataroom-view-mode') as 'grid' | 'list') || 'grid';
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

  // Filter documents
  const filteredDocuments = useMemo(() => {
    let result = documents;

    // Apply metric filter
    if (activeMetricFilter) {
      switch (activeMetricFilter) {
        case 'approved':
          result = result.filter(d => d.status === 'approved');
          break;
        case 'pending':
          result = result.filter(d => d.status === 'pending_review');
          break;
        case 'rejected':
          result = result.filter(d => d.status === 'rejected');
          break;
      }
    }

    // Apply dropdown filters
    if (statusFilter !== 'all') {
      result = result.filter(d => d.status === statusFilter);
    }
    
    if (categoryFilter !== 'all') {
      const categoryFolderIds = folders
        .filter(f => f.category_id === categoryFilter)
        .map(f => f.id);
      result = result.filter(d => d.folder_id && categoryFolderIds.includes(d.folder_id));
    }
    
    if (folderFilter !== 'all') {
      result = result.filter(d => d.folder_id === folderFilter);
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
  }, [documents, activeMetricFilter, statusFilter, categoryFilter, folderFilter, folders, searchQuery]);

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
    setCategoryFilter('all');
    setFolderFilter('all');
    setActiveMetricFilter(null);
  };

  const hasActiveFilters = searchQuery !== '' || 
    statusFilter !== 'all' || 
    categoryFilter !== 'all' || 
    folderFilter !== 'all' || 
    activeMetricFilter !== null;

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
    const targetFolderId = folderFilter !== 'all' ? folderFilter : null;
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
      <div className="p-6 text-center text-muted-foreground">
        No deal selected
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Data Room</h2>
          <p className="text-muted-foreground text-sm">
            Manage deal documents and materials
          </p>
        </div>
        {folders.length > 0 && (
          <Button onClick={() => setIsUploadOpen(!isUploadOpen)} className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Document
          </Button>
        )}
      </div>

      {/* Upload Zone (collapsible) */}
      {isUploadOpen && folders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <DataRoomUploadZone
            folderName={folderFilter !== 'all' ? folders.find(f => f.id === folderFilter)?.name || 'Documents' : 'Data Room'}
            onUpload={handleUpload}
          />
        </motion.div>
      )}

      {/* Metrics Bar */}
      {loading ? (
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : folders.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DataRoomMetricsBar
            folders={folders}
            documents={documents}
            loading={loading}
            activeFilter={activeMetricFilter}
            onFilterChange={setActiveMetricFilter}
          />
        </motion.div>
      ) : null}

      {/* Filter Bar */}
      {!loading && folders.length > 0 && (
        <DataRoomFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          folderFilter={folderFilter}
          onFolderFilterChange={setFolderFilter}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          categories={categories}
          folders={folders}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      )}

      {/* Active Filter Badge */}
      {activeMetricFilter && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Showing:</span>
          <Badge variant="secondary" className="capitalize">
            {activeMetricFilter === 'pending' ? 'Pending Review' : activeMetricFilter}
          </Badge>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : folders.length === 0 ? (
        <DataRoomEmptyState templates={templates} onApplyTemplate={applyTemplate} />
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-16 bg-muted/20 rounded-lg border border-dashed">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Filter className="h-8 w-8 text-muted-foreground" />
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
          className={viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-2' : 'grid gap-4'}
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
