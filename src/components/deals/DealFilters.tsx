import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface DealFiltersProps {
  filters: {
    status?: string;
    industry?: string;
    priority?: string;
    search?: string;
  };
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
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
    <div className="bg-muted/30 p-4 rounded-lg border">
      <div className="flex items-center justify-between mb-4">
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

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            Status
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

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
          {Object.entries(filters).map(([key, value]) => {
            if (key === 'search' || !value || value === 'all') return null;
            
            return (
              <Badge key={key} variant="secondary" className="gap-1">
                {key}: {value}
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