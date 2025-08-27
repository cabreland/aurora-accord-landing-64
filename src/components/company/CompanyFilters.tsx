import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';

export type CompanyStatusFilter = 'all' | 'draft' | 'scheduled' | 'live';

interface CompanyFiltersProps {
  statusFilter: CompanyStatusFilter;
  onStatusFilterChange: (status: CompanyStatusFilter) => void;
}

const statusOptions = [
  { value: 'all' as const, label: 'All Companies' },
  { value: 'draft' as const, label: 'Draft' },
  { value: 'scheduled' as const, label: 'Scheduled' },
  { value: 'live' as const, label: 'Live' }
];

const CompanyFilters: React.FC<CompanyFiltersProps> = ({
  statusFilter,
  onStatusFilterChange
}) => {
  return (
    <div className="flex gap-4">
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-40 bg-background border-border">
          <Filter className="w-4 h-4 mr-2" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CompanyFilters;