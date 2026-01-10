import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutDashboard, 
  FolderOpen, 
  ClipboardList, 
  Activity, 
  Users, 
  Settings,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type DealTab = 'overview' | 'data-room' | 'requests' | 'activity' | 'team' | 'settings';

interface DealWorkspaceTabsProps {
  activeTab: DealTab;
  onTabChange: (tab: DealTab) => void;
  hasNDAAccess?: boolean;
  requestCount?: number;
  activityCount?: number;
  teamCount?: number;
}

const tabs: { id: DealTab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'data-room', label: 'Data Room', icon: FolderOpen },
  { id: 'requests', label: 'Requests', icon: ClipboardList },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const DealWorkspaceTabs: React.FC<DealWorkspaceTabsProps> = ({
  activeTab,
  onTabChange,
  hasNDAAccess = true,
  requestCount,
  activityCount,
  teamCount,
}) => {
  const getCount = (tabId: DealTab): number | undefined => {
    switch (tabId) {
      case 'requests':
        return requestCount;
      case 'activity':
        return activityCount;
      case 'team':
        return teamCount;
      default:
        return undefined;
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as DealTab)} className="w-full">
      <TabsList className="w-full justify-start h-12 bg-card border-b border-border rounded-none px-0 gap-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const count = getCount(tab.id);
          const isLocked = !hasNDAAccess && (tab.id === 'data-room' || tab.id === 'requests');

          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              disabled={isLocked}
              className={cn(
                'relative h-12 px-4 rounded-none border-b-2 border-transparent',
                'data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary',
                'hover:bg-muted/50 transition-colors',
                'flex items-center gap-2',
                isLocked && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              {isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
              {count !== undefined && count > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs font-medium rounded-full bg-muted text-muted-foreground">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
};
