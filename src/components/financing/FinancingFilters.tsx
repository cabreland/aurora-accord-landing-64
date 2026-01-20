import React from 'react';
import { 
  FinancingStage, 
  Lender,
  FINANCING_STAGE_LABELS 
} from '@/hooks/useFinancing';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Filter } from 'lucide-react';

interface FinancingFiltersProps {
  filters: {
    search: string;
    stage: string;
    lenderId: string;
  };
  onFiltersChange: (filters: {
    search: string;
    stage: string;
    lenderId: string;
  }) => void;
  lenders: Lender[];
  deals: { id: string; company_name: string }[];
}

const ALL_STAGES: FinancingStage[] = [
  'pre_qualification',
  'application_submitted',
  'under_review',
  'additional_docs_requested',
  'conditional_approval',
  'final_approval',
  'closing',
  'funded',
  'declined',
  'withdrawn'
];

export const FinancingFilters: React.FC<FinancingFiltersProps> = ({ 
  filters, 
  onFiltersChange,
  lenders,
  deals
}) => {
  const hasActiveFilters = filters.search || filters.stage || filters.lenderId;
  
  const clearFilters = () => {
    onFiltersChange({ search: '', stage: '', lenderId: '' });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-[300px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search applications..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-9 bg-secondary/50 border-border"
        />
      </div>
      
      {/* Stage Filter */}
      <Select
        value={filters.stage}
        onValueChange={(value) => onFiltersChange({ ...filters, stage: value })}
      >
        <SelectTrigger className="w-[180px] bg-secondary/50 border-border">
          <SelectValue placeholder="All Stages" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Stages</SelectItem>
          {ALL_STAGES.map(stage => (
            <SelectItem key={stage} value={stage}>
              {FINANCING_STAGE_LABELS[stage]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* Lender Filter */}
      <Select
        value={filters.lenderId}
        onValueChange={(value) => onFiltersChange({ ...filters, lenderId: value })}
      >
        <SelectTrigger className="w-[180px] bg-secondary/50 border-border">
          <SelectValue placeholder="All Lenders" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Lenders</SelectItem>
          {lenders.map(lender => (
            <SelectItem key={lender.id} value={lender.id}>
              {lender.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
};
