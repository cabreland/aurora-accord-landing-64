import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminDashboardLayout from '@/layouts/AdminDashboardLayout';
import { useDataRoom } from '@/hooks/useDataRoom';
import { DataRoomSidebar } from '@/components/data-room/DataRoomSidebar';
import { DataRoomContent } from '@/components/data-room/DataRoomContent';
import { DataRoomHeader } from '@/components/data-room/DataRoomHeader';
import { DataRoomEmptyState } from '@/components/data-room/DataRoomEmptyState';
import { DealSelector } from '@/components/data-room/DealSelector';
import { Skeleton } from '@/components/ui/skeleton';

const DataRoom = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dealIdFromUrl = searchParams.get('dealId');
  const [selectedDealId, setSelectedDealId] = useState<string | null>(dealIdFromUrl);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    categories,
    folders,
    documents,
    templates,
    foldersByCategory,
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
    setSearchParams({ dealId });
  };

  const handleFolderSelect = (folderId: string | null, categoryId?: string) => {
    setSelectedFolderId(folderId);
    if (categoryId) setSelectedCategoryId(categoryId);
  };

  // Filter documents based on selected folder/category and search
  const filteredDocuments = useMemo(() => {
    let result = documents;

    if (selectedFolderId) {
      result = result.filter((doc) => doc.folder_id === selectedFolderId);
    } else if (selectedCategoryId) {
      const categoryFolderIds = folders
        .filter((f) => f.category_id === selectedCategoryId)
        .map((f) => f.id);
      result = result.filter((doc) => doc.folder_id && categoryFolderIds.includes(doc.folder_id));
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (doc) =>
          doc.file_name.toLowerCase().includes(query) ||
          doc.index_number?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [documents, selectedFolderId, selectedCategoryId, folders, searchQuery]);

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
          <DataRoomEmptyState
            templates={templates}
            onApplyTemplate={applyTemplate}
          />
        ) : (
          <div className="flex gap-6">
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
              selectedFolderId={selectedFolderId}
              currentLocation={currentLocation}
              onUpload={(file) => uploadDocument(file, selectedFolderId)}
              onDelete={deleteDocument}
              onUpdateStatus={updateDocumentStatus}
            />
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
};

export default DataRoom;
