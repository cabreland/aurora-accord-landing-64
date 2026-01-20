import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DataRoomCategory, DataRoomFolder } from '@/hooks/useDataRoom';

interface DataRoomFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  folderFilter: string;
  onFolderFilterChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  categories: DataRoomCategory[];
  folders: DataRoomFolder[];
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const DOCUMENT_STATUSES = [
  { value: 'all', label: 'All Statuses' },
  { value: 'approved', label: 'Approved' },
  { value: 'pending_review', label: 'Pending' },
  { value: 'rejected', label: 'Rejected' },
];

export const DataRoomFilterBar: React.FC<DataRoomFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  folderFilter,
  onFolderFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  categories,
  folders,
  viewMode,
  onViewModeChange,
  onClearFilters,
  hasActiveFilters,
}) => {
  // Get folders for the selected category
  const availableFolders = categoryFilter === 'all' 
    ? folders 
    : folders.filter(f => f.category_id === categoryFilter);

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Status Filter */}
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
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

      {/* Category Filter */}
      <Select value={categoryFilter} onValueChange={(value) => {
        onCategoryFilterChange(value);
        // Reset folder filter when category changes
        if (value !== categoryFilter) {
          onFolderFilterChange('all');
        }
      }}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.index_number}. {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Folder Filter */}
      <Select value={folderFilter} onValueChange={onFolderFilterChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Folder" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Folders</SelectItem>
          {availableFolders.map((folder) => (
            <SelectItem key={folder.id} value={folder.id}>
              {folder.index_number} {folder.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
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
          onClick={() => onViewModeChange('grid')}
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
          onClick={() => onViewModeChange('list')}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
