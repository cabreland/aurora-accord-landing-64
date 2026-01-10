import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminDashboardLayout from '@/layouts/AdminDashboardLayout';
import { useDataRoom } from '@/hooks/useDataRoom';
import { DataRoomSidebar } from '@/components/data-room/DataRoomSidebar';
import { DataRoomContent } from '@/components/data-room/DataRoomContent';
import { DataRoomHeader } from '@/components/data-room/DataRoomHeader';
import { DataRoomEmptyState } from '@/components/data-room/DataRoomEmptyState';
import { DataRoomMetricsBar } from '@/components/data-room/DataRoomMetricsBar';
import { DealSelector } from '@/components/data-room/DealSelector';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

const DataRoom = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dealIdFromUrl = searchParams.get('dealId');
  const [selectedDealId, setSelectedDealId] = useState<string | null>(dealIdFromUrl);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMetricFilter, setActiveMetricFilter] = useState<string | null>(null);

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
  } = useDataRoom({ dealId: selectedDealId || undefined });

  const handleDealSelect = (dealId: string) => {
    setSelectedDealId(dealId);
    setSelectedFolderId(null);
    setSelectedCategoryId(null);
    setActiveMetricFilter(null);
    setSearchParams({ dealId });
  };

  const handleFolderSelect = (folderId: string | null, categoryId?: string) => {
    setSelectedFolderId(folderId);
    if (categoryId) setSelectedCategoryId(categoryId);
    setActiveMetricFilter(null);
  };

  const handleNavigateHome = () => {
    setSelectedFolderId(null);
    setSelectedCategoryId(null);
    setActiveMetricFilter(null);
  };

  const handleNavigateCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedFolderId(null);
  };

  // Filter documents based on selected folder/category, search, and metric filter
  const filteredDocuments = useMemo(() => {
    let result = documents;

    // Filter by folder/category selection
    if (selectedFolderId) {
      result = result.filter((doc) => doc.folder_id === selectedFolderId);
    } else if (selectedCategoryId) {
      const categoryFolderIds = folders
        .filter((f) => f.category_id === selectedCategoryId)
        .map((f) => f.id);
      result = result.filter((doc) => doc.folder_id && categoryFolderIds.includes(doc.folder_id));
    }

    // Filter by metric filter
    if (activeMetricFilter === 'approved') {
      result = result.filter((doc) => doc.status === 'approved');
    } else if (activeMetricFilter === 'pending') {
      result = result.filter((doc) => doc.status === 'pending_review');
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (doc) =>
          doc.file_name.toLowerCase().includes(query) ||
          doc.index_number?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [documents, selectedFolderId, selectedCategoryId, folders, searchQuery, activeMetricFilter]);

  // Get current folder/category name for header
  const currentLocation = useMemo(() => {
    if (selectedFolderId) {
      const folder = folders.find((f) => f.id === selectedFolderId);
      return folder?.name || 'Documents';
    }
    if (selectedCategoryId) {
      const category = categories.find((c) => c.id === selectedCategoryId);
      return category?.name || 'Documents';
    }
    return 'All Documents';
  }, [selectedFolderId, selectedCategoryId, folders, categories]);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Data Room', href: '/data-room' },
    ...(selectedDealId ? [{ label: currentLocation }] : []),
  ];

  if (!selectedDealId) {
    return (
      <AdminDashboardLayout breadcrumbs={breadcrumbs}>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Data Room</h1>
            <p className="text-muted-foreground mt-1">
              Secure document repository for due diligence
            </p>
          </div>
          <DealSelector onSelect={handleDealSelect} />
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <DataRoomHeader
          dealId={selectedDealId}
          currentLocation={currentLocation}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onBackToDeals={() => {
            setSelectedDealId(null);
            setSearchParams({});
          }}
          templates={templates}
          onApplyTemplate={applyTemplate}
          foldersExist={folders.length > 0}
        />

        {/* Metrics Dashboard */}
        {!loading && folders.length > 0 && (
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
        )}

        {/* Active Filter Indicator */}
        {activeMetricFilter && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Showing:</span>
            <Badge variant="secondary" className="capitalize">
              {activeMetricFilter === 'pending' ? 'Pending Review' : activeMetricFilter}
            </Badge>
          </div>
        )}

        {/* Main Content */}
        {loading ? (
          <div className="flex gap-6">
            <div className="w-80 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="flex-1 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        ) : folders.length === 0 ? (
          <DataRoomEmptyState templates={templates} onApplyTemplate={applyTemplate} />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex gap-6"
          >
            <DataRoomSidebar
              categories={categories}
              folders={folders}
              documents={documents}
              selectedFolderId={selectedFolderId}
              selectedCategoryId={selectedCategoryId}
              onSelectFolder={handleFolderSelect}
              onSelectCategory={(categoryId) => {
                setSelectedCategoryId(categoryId);
                setSelectedFolderId(null);
              }}
            />
            <DataRoomContent
              documents={filteredDocuments}
              folders={folders}
              categories={categories}
              selectedFolderId={selectedFolderId}
              selectedCategoryId={selectedCategoryId}
              currentLocation={currentLocation}
              onUpload={(file) => uploadDocument(file, selectedFolderId)}
              onDelete={deleteDocument}
              onUpdateStatus={updateDocumentStatus}
              onNavigateHome={handleNavigateHome}
              onNavigateCategory={handleNavigateCategory}
            />
          </motion.div>
        )}
      </div>
    </AdminDashboardLayout>
  );
};

export default DataRoom;
