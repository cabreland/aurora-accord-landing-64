import React, { useState } from 'react';
import { 
  Search, 
  X,
  SlidersHorizontal,
  Save,
  RotateCcw,
  LayoutGrid,
  List,
  Columns,
  Calendar,
  Building2,
  DollarSign,
  Sparkles,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

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

// Mock team members data
const teamMembers = [
  { id: 'sa', initials: 'SA', name: 'Sarah Adams', online: true },
  { id: 'mk', initials: 'MK', name: 'Mike Kim', online: false },
  { id: 'hj', initials: 'HJ', name: 'Hannah Jones', online: true },
];

// Industries
const industries = ['SaaS', 'E-commerce', 'Agency', 'Marketplace', 'Healthcare', 'FinTech'];

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
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');
  const [dealSizeMin, setDealSizeMin] = useState('');
  const [dealSizeMax, setDealSizeMax] = useState('');
  const [updatedLast7Days, setUpdatedLast7Days] = useState(false);

  // Helper to get filter label
  const getStageLabel = (value: string) => {
    const labels: Record<string, string> = {
      'all': 'All Stages',
      'early': 'Early Stage',
      'due_diligence': 'Due Diligence',
      'final_review': 'Final Review',
      'closed': 'Closed',
      'on_hold': 'On Hold'
    };
    return labels[value] || value;
  };

  const getStatusLabel = (value: string) => {
    const labels: Record<string, string> = {
      'all': 'All Status',
      'active': 'Active',
      'at_risk': 'At Risk',
      'blocked': 'Blocked',
      'completed': 'Completed'
    };
    return labels[value] || value;
  };

  const getOwnerLabel = (value: string) => {
    if (value === 'all') return 'Anyone';
    if (value === 'me') return 'Assigned to Me';
    if (value === 'unassigned') return 'Unassigned';
    const member = teamMembers.find(m => m.id === value);
    return member?.name || value;
  };

  const getProgressLabel = (value: string) => {
    const labels: Record<string, string> = {
      'all': 'Any Progress',
      '0-0': 'Not Started (0%)',
      '1-25': 'Just Started (1-25%)',
      '26-75': 'In Progress (26-75%)',
      '76-99': 'Nearly Complete (76-99%)',
      '100-100': 'Complete (100%)'
    };
    return labels[value] || value;
  };

  const getRiskLabel = (value: string) => {
    const labels: Record<string, string> = {
      'all': 'All Risk',
      'low': '🟢 Low Risk',
      'medium': '🟡 Medium Risk',
      'high': '🔴 High Risk'
    };
    return labels[value] || value;
  };

  // Build active filter chips
  const activeFilters: { key: string; label: string; onRemove: () => void }[] = [];
  
  if (stageFilter !== 'all') {
    activeFilters.push({
      key: 'stage',
      label: getStageLabel(stageFilter),
      onRemove: () => onStageFilterChange('all')
    });
  }
  if (statusFilter !== 'all') {
    activeFilters.push({
      key: 'status',
      label: getStatusLabel(statusFilter),
      onRemove: () => onStatusFilterChange('all')
    });
  }
  if (ownerFilter !== 'all') {
    activeFilters.push({
      key: 'owner',
      label: getOwnerLabel(ownerFilter),
      onRemove: () => onOwnerFilterChange('all')
    });
  }
  if (progressFilter !== 'all') {
    activeFilters.push({
      key: 'progress',
      label: getProgressLabel(progressFilter),
      onRemove: () => onProgressFilterChange('all')
    });
  }
  if (riskFilter !== 'all') {
    activeFilters.push({
      key: 'risk',
      label: getRiskLabel(riskFilter),
      onRemove: () => onRiskFilterChange('all')
    });
  }
  if (hasOverdue) {
    activeFilters.push({
      key: 'overdue',
      label: 'Has Overdue Items',
      onRemove: () => onHasOverdueChange(false)
    });
  }
  if (highPriorityOnly) {
    activeFilters.push({
      key: 'priority',
      label: 'High Priority Only',
      onRemove: () => onHighPriorityOnlyChange(false)
    });
  }
  if (assignedToMe) {
    activeFilters.push({
      key: 'assigned',
      label: 'Assigned to Me',
      onRemove: () => onAssignedToMeChange(false)
    });
  }

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries(prev => 
      prev.includes(industry) 
        ? prev.filter(i => i !== industry)
        : [...prev, industry]
    );
  };

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
        {/* Stage Filter */}
        <Select value={stageFilter} onValueChange={onStageFilterChange}>
          <SelectTrigger className="w-[140px] bg-gray-50 border-gray-200 text-gray-700">
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200">
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="early">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Early Stage
              </span>
            </SelectItem>
            <SelectItem value="due_diligence">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Due Diligence
              </span>
            </SelectItem>
            <SelectItem value="final_review">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                Final Review
              </span>
            </SelectItem>
            <SelectItem value="closed">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Closed
              </span>
            </SelectItem>
            <SelectItem value="on_hold">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                On Hold
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
        
        <Separator orientation="vertical" className="h-8" />
        
        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-[130px] bg-gray-50 border-gray-200 text-gray-700">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Active
              </span>
            </SelectItem>
            <SelectItem value="at_risk">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                At Risk
              </span>
            </SelectItem>
            <SelectItem value="blocked">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Blocked
              </span>
            </SelectItem>
            <SelectItem value="completed">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Satisfied
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
        
        {/* Owner Filter */}
        <Select value={ownerFilter} onValueChange={onOwnerFilterChange}>
          <SelectTrigger className="w-[160px] bg-gray-50 border-gray-200 text-gray-700">
            <SelectValue placeholder="Owner" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200">
            <SelectItem value="all">Anyone</SelectItem>
            <SelectItem value="me">
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                Assigned to Me
              </span>
            </SelectItem>
            <SelectItem value="unassigned">
              <span className="flex items-center gap-2 text-gray-500">
                Unassigned
              </span>
            </SelectItem>
            <Separator className="my-1" />
            {teamMembers.map(member => (
              <SelectItem key={member.id} value={member.id}>
                <span className="flex items-center gap-2">
                  <Avatar className="w-5 h-5">
                    <AvatarFallback className="text-[10px] bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  {member.name}
                  {member.online && (
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 ml-auto" />
                  )}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Separator orientation="vertical" className="h-8" />
        
        {/* Progress Filter */}
        <Select value={progressFilter} onValueChange={onProgressFilterChange}>
          <SelectTrigger className="w-[160px] bg-gray-50 border-gray-200 text-gray-700">
            <SelectValue placeholder="Progress" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200">
            <SelectItem value="all">Any Progress</SelectItem>
            <SelectItem value="0-0">
              <span className="flex items-center gap-2">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="w-0 h-full bg-gray-400" />
                </div>
                Not Started (0%)
              </span>
            </SelectItem>
            <SelectItem value="1-25">
              <span className="flex items-center gap-2">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="w-1/4 h-full bg-blue-400" />
                </div>
                Just Started (1-25%)
              </span>
            </SelectItem>
            <SelectItem value="26-75">
              <span className="flex items-center gap-2">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="w-1/2 h-full bg-blue-500" />
                </div>
                In Progress (26-75%)
              </span>
            </SelectItem>
            <SelectItem value="76-99">
              <span className="flex items-center gap-2">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="w-4/5 h-full bg-blue-600" />
                </div>
                Nearly Complete (76-99%)
              </span>
            </SelectItem>
            <SelectItem value="100-100">
              <span className="flex items-center gap-2">
                <div className="w-12 h-1.5 bg-green-500 rounded-full" />
                Complete (100%)
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
        
        {/* Risk Filter */}
        <Select value={riskFilter} onValueChange={onRiskFilterChange}>
          <SelectTrigger className="w-[140px] bg-gray-50 border-gray-200 text-gray-700">
            <SelectValue placeholder="Risk" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200">
            <SelectItem value="all">All Risk</SelectItem>
            <SelectItem value="low">
              <span className="flex items-center gap-2">
                🟢 Low Risk
              </span>
            </SelectItem>
            <SelectItem value="medium">
              <span className="flex items-center gap-2">
                🟡 Medium Risk
              </span>
            </SelectItem>
            <SelectItem value="high">
              <span className="flex items-center gap-2">
                🔴 High Risk
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
        
        <div className="flex-1" />
        
        {/* More Filters Button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="border-gray-200 text-gray-700"
          onClick={() => setMoreFiltersOpen(true)}
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          More Filters
          {activeFilterCount > 0 && (
            <Badge className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-100">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Active Filter Chips */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-gray-100">
          {activeFilters.map((filter) => (
            <Badge 
              key={filter.key}
              variant="secondary" 
              className="bg-blue-50 text-blue-700 hover:bg-blue-100 pl-3 pr-1 py-1 cursor-pointer"
            >
              {filter.label}
              <button 
                className="ml-1 p-0.5 rounded-full hover:bg-blue-200 transition-colors"
                onClick={filter.onRemove}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-500 hover:text-gray-700 h-7 px-2"
            onClick={onResetFilters}
          >
            Clear All
          </Button>
        </div>
      )}

      {/* More Filters Modal */}
      <Dialog open={moreFiltersOpen} onOpenChange={setMoreFiltersOpen}>
        <DialogContent className="bg-white border-gray-200 max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900">
              <SlidersHorizontal className="w-5 h-5 text-blue-600" />
              Advanced Filters
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Date Range */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-gray-700 font-medium">
                <Calendar className="w-4 h-4 text-gray-500" />
                Date Range
              </Label>
              <div className="flex items-center gap-3">
                <Input 
                  type="date" 
                  value={dateRangeStart}
                  onChange={(e) => setDateRangeStart(e.target.value)}
                  className="flex-1 bg-gray-50 border-gray-200"
                />
                <span className="text-gray-400">to</span>
                <Input 
                  type="date" 
                  value={dateRangeEnd}
                  onChange={(e) => setDateRangeEnd(e.target.value)}
                  className="flex-1 bg-gray-50 border-gray-200"
                />
              </div>
            </div>

            {/* Industry */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-gray-700 font-medium">
                <Building2 className="w-4 h-4 text-gray-500" />
                Industry
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {industries.map((industry) => (
                  <label 
                    key={industry}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors",
                      selectedIndustries.includes(industry)
                        ? "border-blue-300 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <Checkbox 
                      checked={selectedIndustries.includes(industry)}
                      onCheckedChange={() => toggleIndustry(industry)}
                    />
                    <span className="text-sm text-gray-700">{industry}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Deal Size */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-gray-700 font-medium">
                <DollarSign className="w-4 h-4 text-gray-500" />
                Deal Size
              </Label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <Input 
                    type="text" 
                    placeholder="Min"
                    value={dealSizeMin}
                    onChange={(e) => setDealSizeMin(e.target.value)}
                    className="pl-7 bg-gray-50 border-gray-200"
                  />
                </div>
                <span className="text-gray-400">to</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <Input 
                    type="text" 
                    placeholder="Max"
                    value={dealSizeMax}
                    onChange={(e) => setDealSizeMax(e.target.value)}
                    className="pl-7 bg-gray-50 border-gray-200"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Quick Filters */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-gray-700 font-medium">
                <Sparkles className="w-4 h-4 text-gray-500" />
                Quick Filters
              </Label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <Checkbox 
                    checked={hasOverdue} 
                    onCheckedChange={(checked) => onHasOverdueChange(!!checked)}
                  />
                  <div>
                    <span className="text-sm text-gray-700">Has Overdue Items</span>
                    <p className="text-xs text-gray-500">Show only trackers with past-due requests</p>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <Checkbox 
                    checked={highPriorityOnly} 
                    onCheckedChange={(checked) => onHighPriorityOnlyChange(!!checked)}
                  />
                  <div>
                    <span className="text-sm text-gray-700">High Priority Only</span>
                    <p className="text-xs text-gray-500">Show only high-priority trackers</p>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <Checkbox 
                    checked={assignedToMe} 
                    onCheckedChange={(checked) => onAssignedToMeChange(!!checked)}
                  />
                  <div>
                    <span className="text-sm text-gray-700">Assigned to Me</span>
                    <p className="text-xs text-gray-500">Show only trackers I'm responsible for</p>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <Checkbox 
                    checked={updatedLast7Days} 
                    onCheckedChange={(checked) => setUpdatedLast7Days(!!checked)}
                  />
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-700">Updated Last 7 Days</span>
                      <p className="text-xs text-gray-500">Show only recently active trackers</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
          
          <DialogFooter className="border-t border-gray-100 pt-4">
            <Button 
              variant="outline" 
              className="border-gray-200 text-gray-700"
              onClick={() => {
                setSelectedIndustries([]);
                setDateRangeStart('');
                setDateRangeEnd('');
                setDealSizeMin('');
                setDealSizeMax('');
                setUpdatedLast7Days(false);
              }}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button 
              variant="outline" 
              className="border-gray-200 text-gray-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Preset
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setMoreFiltersOpen(false)}
            >
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdvancedFilters;
