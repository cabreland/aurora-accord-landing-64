import React from 'react';
import { 
  Search, 
  Filter,
  X,
  SlidersHorizontal,
  Save,
  RotateCcw,
  LayoutGrid,
  List,
  Columns
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export type ViewMode = 'cards' | 'table' | 'kanban';

interface AdvancedFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  stageFilter: string;
  onStageFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  ownerFilter: string;
  onOwnerFilterChange: (value: string) => void;
  progressFilter: string;
  onProgressFilterChange: (value: string) => void;
  riskFilter: string;
  onRiskFilterChange: (value: string) => void;
  hasOverdue: boolean;
  onHasOverdueChange: (value: boolean) => void;
  highPriorityOnly: boolean;
  onHighPriorityOnlyChange: (value: boolean) => void;
  assignedToMe: boolean;
  onAssignedToMeChange: (value: boolean) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  activeFilterCount: number;
  onResetFilters: () => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  searchQuery,
  onSearchChange,
  stageFilter,
  onStageFilterChange,
  statusFilter,
  onStatusFilterChange,
  ownerFilter,
  onOwnerFilterChange,
  progressFilter,
  onProgressFilterChange,
  riskFilter,
  onRiskFilterChange,
  hasOverdue,
  onHasOverdueChange,
  highPriorityOnly,
  onHighPriorityOnlyChange,
  assignedToMe,
  onAssignedToMeChange,
  viewMode,
  onViewModeChange,
  activeFilterCount,
  onResetFilters
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
      {/* Top row - Search and View Toggle */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search deals, companies, requests..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white"
          />
          {searchQuery && (
            <button 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => onSearchChange('')}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <ToggleGroup 
          type="single" 
          value={viewMode} 
          onValueChange={(value) => value && onViewModeChange(value as ViewMode)}
          className="bg-gray-100 rounded-lg p-1"
        >
          <ToggleGroupItem value="cards" aria-label="Card view" className="px-3 data-[state=on]:bg-white data-[state=on]:shadow-sm">
            <LayoutGrid className="w-4 h-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="table" aria-label="Table view" className="px-3 data-[state=on]:bg-white data-[state=on]:shadow-sm">
            <List className="w-4 h-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="kanban" aria-label="Kanban view" className="px-3 data-[state=on]:bg-white data-[state=on]:shadow-sm">
            <Columns className="w-4 h-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      {/* Filter Row */}
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={stageFilter} onValueChange={onStageFilterChange}>
          <SelectTrigger className="w-[130px] bg-gray-50 border-gray-200 text-gray-700">
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200">
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="early">Early Stage</SelectItem>
            <SelectItem value="due_diligence">Due Diligence</SelectItem>
            <SelectItem value="final_review">Final Review</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        
        <Separator orientation="vertical" className="h-8" />
        
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-[130px] bg-gray-50 border-gray-200 text-gray-700">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={ownerFilter} onValueChange={onOwnerFilterChange}>
          <SelectTrigger className="w-[130px] bg-gray-50 border-gray-200 text-gray-700">
            <SelectValue placeholder="Owner" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200">
            <SelectItem value="all">Anyone</SelectItem>
            <SelectItem value="me">Assigned to Me</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
          </SelectContent>
        </Select>
        
        <Separator orientation="vertical" className="h-8" />
        
        <Select value={progressFilter} onValueChange={onProgressFilterChange}>
          <SelectTrigger className="w-[130px] bg-gray-50 border-gray-200 text-gray-700">
            <SelectValue placeholder="Progress" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200">
            <SelectItem value="all">Any Progress</SelectItem>
            <SelectItem value="0-25">0-25%</SelectItem>
            <SelectItem value="25-50">25-50%</SelectItem>
            <SelectItem value="50-75">50-75%</SelectItem>
            <SelectItem value="75-100">75-100%</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={riskFilter} onValueChange={onRiskFilterChange}>
          <SelectTrigger className="w-[130px] bg-gray-50 border-gray-200 text-gray-700">
            <SelectValue placeholder="Risk" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200">
            <SelectItem value="all">All Risk</SelectItem>
            <SelectItem value="high">High Risk</SelectItem>
            <SelectItem value="medium">Medium Risk</SelectItem>
            <SelectItem value="low">Low Risk</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="flex-1" />
        
        {/* Quick Filters */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="border-gray-200 text-gray-700">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              More Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-100">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 bg-white border-gray-200" align="end">
            <div className="space-y-4">
              <div className="font-medium text-gray-900 text-sm">Quick Filters</div>
              
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox 
                    checked={hasOverdue} 
                    onCheckedChange={(checked) => onHasOverdueChange(!!checked)}
                  />
                  <span className="text-sm text-gray-700">Has Overdue Items</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox 
                    checked={highPriorityOnly} 
                    onCheckedChange={(checked) => onHighPriorityOnlyChange(!!checked)}
                  />
                  <span className="text-sm text-gray-700">High Priority Only</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox 
                    checked={assignedToMe} 
                    onCheckedChange={(checked) => onAssignedToMeChange(!!checked)}
                  />
                  <span className="text-sm text-gray-700">Assigned to Me</span>
                </label>
              </div>
              
              <Separator />
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 text-gray-600">
                  <Save className="w-3 h-3 mr-1" />
                  Save
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-gray-600"
                  onClick={onResetFilters}
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Reset
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default AdvancedFilters;
