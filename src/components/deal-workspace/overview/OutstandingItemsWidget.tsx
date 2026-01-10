import React, { useState } from 'react';
import { FileUp, MessageSquare, UserPlus, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, isToday, isBefore, addDays, isAfter } from 'date-fns';
import { DealTab } from '../DealWorkspaceTabs';

export interface OutstandingItem {
  id: string;
  type: 'document' | 'request' | 'team';
  title: string;
  description?: string;
  dueDate?: Date;
  priority?: 'high' | 'medium' | 'low';
  targetTab: DealTab;
}

interface OutstandingItemsWidgetProps {
  items: OutstandingItem[];
  onItemClick: (item: OutstandingItem) => void;
}

const getTypeIcon = (type: 'document' | 'request' | 'team') => {
  switch (type) {
    case 'document':
      return FileUp;
    case 'request':
      return MessageSquare;
    case 'team':
      return UserPlus;
  }
};

const getTypeColor = (type: 'document' | 'request' | 'team') => {
  switch (type) {
    case 'document':
      return 'text-blue-500 bg-blue-100';
    case 'request':
      return 'text-amber-500 bg-amber-100';
    case 'team':
      return 'text-purple-500 bg-purple-100';
  }
};

export const OutstandingItemsWidget: React.FC<OutstandingItemsWidgetProps> = ({
  items,
  onItemClick,
}) => {
  const [activeTab, setActiveTab] = useState<'overdue' | 'today' | 'week'>('overdue');

  const now = new Date();
  const weekFromNow = addDays(now, 7);

  // Categorize items
  const overdue = items.filter(item => item.dueDate && isBefore(item.dueDate, now));
  const today = items.filter(item => item.dueDate && isToday(item.dueDate));
  const thisWeek = items.filter(item => 
    item.dueDate && 
    isAfter(item.dueDate, now) && 
    !isToday(item.dueDate) &&
    isBefore(item.dueDate, weekFromNow)
  );
  const noDue = items.filter(item => !item.dueDate);

  const getItemsForTab = () => {
    switch (activeTab) {
      case 'overdue':
        return overdue;
      case 'today':
        return today;
      case 'week':
        return [...thisWeek, ...noDue];
    }
  };

  const currentItems = getItemsForTab();

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Outstanding Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-green-600">All caught up!</p>
            <p className="text-xs text-muted-foreground mt-1">No outstanding items</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          Outstanding Items
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overdue" className="relative">
              Overdue
              {overdue.length > 0 && (
                <Badge variant="destructive" className="absolute -top-1.5 -right-1.5 h-5 min-w-5 text-[10px] px-1">
                  {overdue.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="today" className="relative">
              Today
              {today.length > 0 && (
                <Badge className="absolute -top-1.5 -right-1.5 h-5 min-w-5 text-[10px] px-1 bg-amber-500">
                  {today.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="week" className="relative">
              This Week
              {(thisWeek.length + noDue.length) > 0 && (
                <Badge variant="secondary" className="absolute -top-1.5 -right-1.5 h-5 min-w-5 text-[10px] px-1">
                  {thisWeek.length + noDue.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 space-y-2 max-h-[200px] overflow-y-auto">
            {currentItems.length === 0 ? (
              <p className="text-sm text-center text-muted-foreground py-4">
                No items in this category
              </p>
            ) : (
              currentItems.map((item) => {
                const Icon = getTypeIcon(item.type);
                const colorClass = getTypeColor(item.type);

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                    onClick={() => onItemClick(item)}
                  >
                    <div className={cn('p-1.5 rounded', colorClass)}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      {item.dueDate && (
                        <p className={cn(
                          'text-xs',
                          isBefore(item.dueDate, now) ? 'text-red-500' : 'text-muted-foreground'
                        )}>
                          {isBefore(item.dueDate, now) 
                            ? `Overdue by ${formatDistanceToNow(item.dueDate)}`
                            : `Due ${formatDistanceToNow(item.dueDate, { addSuffix: true })}`
                          }
                        </p>
                      )}
                    </div>

                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                );
              })
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};
