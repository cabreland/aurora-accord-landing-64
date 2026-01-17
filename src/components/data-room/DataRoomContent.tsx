import React, { useState } from 'react';
import { DataRoomDocument, DataRoomFolder, DataRoomCategory } from '@/hooks/useDataRoom';
import { DataRoomBreadcrumb } from './DataRoomBreadcrumb';
import { DataRoomUploadZone } from './DataRoomUploadZone';
import { DataRoomDocumentTable } from './DataRoomDocumentTable';
import { DataRoomEmptyContent } from './DataRoomEmptyContent';
import { DataRoomFilters } from './DataRoomFilters';
import { DataRoomBulkActions } from './DataRoomBulkActions';

interface DataRoomContentProps {
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
}

export const DataRoomContent: React.FC<DataRoomContentProps> = ({
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
}) => {
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Get selected folder and category objects
  const selectedFolder = selectedFolderId
    ? folders.find((f) => f.id === selectedFolderId) || null
    : null;
  const selectedCategory = selectedCategoryId
    ? categories.find((c) => c.id === selectedCategoryId) || null
    : null;

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      !searchQuery ||
      doc.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.index_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
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

  return (
    <div className="flex-1 space-y-4">
      {/* Breadcrumb */}
      <DataRoomBreadcrumb
        selectedFolder={selectedFolder}
        selectedCategory={selectedCategory}
        documentCount={filteredDocuments.length}
        onNavigateHome={onNavigateHome}
        onNavigateCategory={onNavigateCategory}
      />

      {/* Upload Zone */}
      <DataRoomUploadZone
        folderName={currentLocation}
        onUpload={onUpload}
      />

      {/* Filters */}
      {documents.length > 0 && (
        <DataRoomFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          resultCount={filteredDocuments.length}
          onClearFilters={handleClearFilters}
        />
      )}

      {/* Document Table or Empty State */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-card rounded-xl border border-border">
          <DataRoomEmptyContent folderName={currentLocation} />
        </div>
      ) : (
        <DataRoomDocumentTable
          documents={filteredDocuments}
          folders={folders}
          selectedDocuments={selectedDocuments}
          onSelectDocument={handleSelectDocument}
          onSelectAll={handleSelectAll}
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
