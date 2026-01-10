import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  CalendarDays, 
  FileText, 
  ClipboardList, 
  Users, 
  User, 
  Activity,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

export type ActivityFilter = 'all' | 'documents' | 'requests' | 'team' | 'my_activity';

interface ActivityFiltersProps {
  activeFilter: ActivityFilter;
  onFilterChange: (filter: ActivityFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onExport: () => void;
  totalCount: number;
  isExporting?: boolean;
}

const filterOptions: { id: ActivityFilter; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'All Activity', icon: Activity },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'requests', label: 'Requests', icon: ClipboardList },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'my_activity', label: 'My Activity', icon: User },
];

export const ActivityFilters: React.FC<ActivityFiltersProps> = ({
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  onExport,
  totalCount,
  isExporting = false,
}) => {
  const hasDateFilter = dateRange?.from || dateRange?.to;

  return (
    <div className="space-y-4">
      {/* Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {filterOptions.map((option) => {
          const Icon = option.icon;
          const isActive = activeFilter === option.id;
          return (
            <Button
              key={option.id}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange(option.id)}
              className={cn(
                'gap-2 transition-all',
                isActive && 'shadow-sm'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {option.label}
            </Button>
          );
        })}
      </div>

      {/* Search & Date Range */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search activity..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-background/50"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => onSearchChange('')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Date Range Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'gap-2',
                hasDateFilter && 'border-primary text-primary'
              )}
            >
              <CalendarDays className="h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, 'MMM d')} - {format(dateRange.to, 'MMM d')}
                  </>
                ) : (
                  format(dateRange.from, 'MMM d, yyyy')
                )
              ) : (
                'Date Range'
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={onDateRangeChange}
              numberOfMonths={2}
            />
            {hasDateFilter && (
              <div className="p-3 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => onDateRangeChange(undefined)}
                >
                  Clear Date Filter
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* Clear Filters */}
        {(searchQuery || hasDateFilter || activeFilter !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onSearchChange('');
              onDateRangeChange(undefined);
              onFilterChange('all');
            }}
            className="text-muted-foreground"
          >
            Clear All
          </Button>
        )}

        {/* Export Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          disabled={isExporting || totalCount === 0}
          className="ml-auto"
        >
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </div>

      {/* Active Filters Summary */}
      {(searchQuery || hasDateFilter) && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Showing {totalCount} activities</span>
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: "{searchQuery}"
              <button onClick={() => onSearchChange('')} className="ml-1 hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {hasDateFilter && (
            <Badge variant="secondary" className="gap-1">
              {dateRange?.from && format(dateRange.from, 'MMM d')}
              {dateRange?.to && ` - ${format(dateRange.to, 'MMM d')}`}
              <button onClick={() => onDateRangeChange(undefined)} className="ml-1 hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
