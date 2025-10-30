import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search } from 'lucide-react';
import { UserType, FilterType, ChannelType } from './types';

interface LeftPaneProps {
  userType: UserType;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  channel: ChannelType;
  onChannelChange: (channel: ChannelType) => void;
  onNewConversation: () => void;
}

export const LeftPane = ({
  userType,
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  channel,
  onChannelChange,
  onNewConversation
}: LeftPaneProps) => {
  const investorFilters: FilterType[] = ['all', 'unread', 'deal-specific', 'general'];
  const teamFilters: FilterType[] = ['all', 'unread', 'urgent', 'high-priority', 'resolved', 'archived'];

  const filters = userType === 'investor' ? investorFilters : teamFilters;

  return (
    <div className="w-1/5 border-r p-4 space-y-4">
      <Button onClick={onNewConversation} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        New Conversation
      </Button>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search conversations..."
          className="pl-9"
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Filter</label>
        <Select value={filter} onValueChange={(value) => onFilterChange(value as FilterType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {filters.map((f) => (
              <SelectItem key={f} value={f}>
                {f.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Channel</label>
        <Select value={channel} onValueChange={(value) => onChannelChange(value as ChannelType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="platform">Platform</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="phone">Phone</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
