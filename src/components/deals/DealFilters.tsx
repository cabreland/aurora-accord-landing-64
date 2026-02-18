import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface DealFiltersProps {
  filters: {
    status?: string;
    deal_status?: string;
    industry?: string;
    priority?: string;
    search?: string;
  };
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
}

const WORKFLOW_STATUS_OPTIONS = [
  { value: 'all', label: 'All Workflow Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'data_gathering', label: 'Data Gathering' },
  { value: 'live', label: 'Live' },
  { value: 'active', label: 'Active' },
  { value: 'under_loi', label: 'Under LOI' },
  { value: 'closing', label: 'Closing' },
  { value: 'closed', label: 'Closed' },
  { value: 'dead', label: 'Dead' },
];

const WORKFLOW_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  data_gathering: 'bg-blue-100 text-blue-700',
  live: 'bg-green-100 text-green-700',
  active: 'bg-emerald-100 text-emerald-700',
  under_loi: 'bg-amber-100 text-amber-700',
  closing: 'bg-orange-100 text-orange-700',
  closed: 'bg-gray-100 text-gray-700',
  dead: 'bg-red-100 text-red-700',
};

export const WORKFLOW_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  data_gathering: 'Data Gathering',
  live: 'Live',
  active: 'Active',
  under_loi: 'Under LOI',
  closing: 'Closing',
  closed: 'Closed',
  dead: 'Dead',
};

export function getWorkflowStatusBadgeClass(status: string): string {
  return WORKFLOW_STATUS_COLORS[status] || 'bg-muted text-muted-foreground';
}

export const DealFilters: React.FC<DealFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters
}) => {
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'archived', label: 'Archived' }
  ];

  const industryOptions = [
    { value: 'all', label: 'All Industries' },
    { value: 'SaaS', label: 'SaaS' },
    { value: 'E-commerce', label: 'E-commerce' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Clean Tech', label: 'Clean Tech' },
    { value: 'Manufacturing', label: 'Manufacturing' },
    { value: 'Digital Agency', label: 'Digital Agency' },
    { value: 'Other', label: 'Other' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) => key !== 'search' && value && value !== 'all'
  ).length;

  return (
    <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Filters</h3>
        {activeFiltersCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear all ({activeFiltersCount})
            <X className="w-3 h-3 ml-1" />
          </Button>
        )}
      </div>

      {/* Row 1: Status, Industry, Priority */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            Record Status
          </label>
          <Select 
            value={filters.status || 'all'} 
            onValueChange={(value) => onFiltersChange({ status: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            Industry
          </label>
          <Select 
            value={filters.industry || 'all'} 
            onValueChange={(value) => onFiltersChange({ industry: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {industryOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            Priority
          </label>
          <Select 
            value={filters.priority || 'all'} 
            onValueChange={(value) => onFiltersChange({ priority: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 2: Workflow Status */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">
          Workflow Status
        </label>
        <Select 
          value={filters.deal_status || 'all'} 
          onValueChange={(value) => onFiltersChange({ deal_status: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WORKFLOW_STATUS_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          {Object.entries(filters).map(([key, value]) => {
            if (key === 'search' || !value || value === 'all') return null;
            const displayKey = key === 'deal_status' ? 'Workflow' : key;
            const displayValue = key === 'deal_status' ? (WORKFLOW_STATUS_LABELS[value] || value) : value;
            return (
              <Badge key={key} variant="secondary" className="gap-1">
                {displayKey}: {displayValue}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto w-auto p-0 hover:bg-transparent"
                  onClick={() => onFiltersChange({ [key]: 'all' })}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};
