import React, { useState, useEffect } from 'react';
import { Bell, FileText, Shield, Lock, Upload, Mail, MessageSquare, UserPlus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { useDiligenceNotifications, useUnreadNotificationCount, useMarkAllNotificationsRead } from '@/hooks/useDiligenceNotifications';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const NotificationBell = () => {
  const { activities, loading: activityLoading } = useActivityFeed(5);
  const { data: diligenceNotifications = [], isLoading: diligenceLoading } = useDiligenceNotifications();
  const { data: unreadDiligenceCount = 0 } = useUnreadNotificationCount();
  const markAllRead = useMarkAllNotificationsRead();
  const [isOpen, setIsOpen] = useState(false);
  const [activityUnreadCount, setActivityUnreadCount] = useState(0);
  const navigate = useNavigate();

  // Load activity unread count from localStorage
  useEffect(() => {
    const lastReadTime = localStorage.getItem('lastActivityReadTime');
    if (!lastReadTime || activities.length === 0) {
      setActivityUnreadCount(activities.length > 0 ? activities.length : 0);
      return;
    }

    const unread = activities.filter(
      activity => new Date(activity.created_at) > new Date(lastReadTime)
    ).length;
    setActivityUnreadCount(unread);
  }, [activities]);

  const totalUnreadCount = activityUnreadCount + unreadDiligenceCount;

  // Mark all as read when dropdown opens
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Mark activity as read
      if (activityUnreadCount > 0) {
        localStorage.setItem('lastActivityReadTime', new Date().toISOString());
        setActivityUnreadCount(0);
      }
      // Mark diligence notifications as read
      if (unreadDiligenceCount > 0) {
        markAllRead.mutate();
      }
    }
  };

  const getActivityIcon = (eventType: string) => {
    const lowerType = eventType.toLowerCase();
    if (lowerType.includes('deal')) return FileText;
    if (lowerType.includes('nda')) return Shield;
    if (lowerType.includes('access')) return Lock;
    if (lowerType.includes('document')) return Upload;
    if (lowerType.includes('investor')) return Mail;
    return Bell;
  };

  const getDiligenceIcon = (type: string) => {
    switch (type) {
      case 'assignment': return UserPlus;
      case 'comment': return MessageSquare;
      case 'document': return Upload;
      case 'status_change': return RefreshCw;
      case 'mention': return Bell;
      default: return Bell;
    }
  };

  const handleActivityClick = (activity: any) => {
    setIsOpen(false);
    
    const lowerEvent = activity.event_type.toLowerCase();
    if (lowerEvent.includes('deal')) {
      navigate('/deals');
    } else if (lowerEvent.includes('nda')) {
      navigate('/dashboard/ndas');
    } else if (lowerEvent.includes('access')) {
      navigate('/dashboard/access-requests');
    } else if (lowerEvent.includes('document')) {
      navigate('/documents');
    } else if (lowerEvent.includes('investor')) {
      navigate('/investor-invitations');
    }
  };

  const handleDiligenceNotificationClick = (notification: any) => {
    setIsOpen(false);
    navigate('/dashboard/diligence-tracker');
  };

  const handleViewAll = () => {
    setIsOpen(false);
    navigate('/dashboard/activity');
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-[#F4E4BC] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10"
        >
          <Bell className="w-5 h-5" />
          {totalUnreadCount > 0 && (
            <>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              <Badge className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center bg-red-500 text-white text-xs px-1">
                {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
              </Badge>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[420px] p-0 bg-gradient-to-b from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/30 max-h-[450px] overflow-hidden"
      >
        <Tabs defaultValue="diligence" className="w-full">
          {/* Header with Tabs */}
          <div className="px-4 py-3 border-b border-[#D4AF37]/20">
            <TabsList className="w-full bg-[#1A1F2E]/50">
              <TabsTrigger value="diligence" className="flex-1 text-xs data-[state=active]:bg-[#D4AF37]/20 data-[state=active]:text-[#D4AF37]">
                Diligence
                {unreadDiligenceCount > 0 && (
                  <Badge className="ml-1 h-4 px-1 bg-red-500 text-white text-[10px]">{unreadDiligenceCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex-1 text-xs data-[state=active]:bg-[#D4AF37]/20 data-[state=active]:text-[#D4AF37]">
                Activity
                {activityUnreadCount > 0 && (
                  <Badge className="ml-1 h-4 px-1 bg-red-500 text-white text-[10px]">{activityUnreadCount}</Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Diligence Notifications */}
          <TabsContent value="diligence" className="m-0">
            <div className="overflow-y-auto max-h-[340px]">
              {diligenceLoading ? (
                <div className="px-4 py-8 text-center text-[#F4E4BC]/60">
                  Loading notifications...
                </div>
              ) : diligenceNotifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-[#F4E4BC]/60">
                  No diligence notifications
                </div>
              ) : (
                <div className="divide-y divide-[#D4AF37]/10">
                  {diligenceNotifications.slice(0, 10).map((notification) => {
                    const Icon = getDiligenceIcon(notification.type);
                    return (
                      <button
                        key={notification.id}
                        onClick={() => handleDiligenceNotificationClick(notification)}
                        className={`w-full px-4 py-3 hover:bg-[#D4AF37]/5 transition-colors text-left ${
                          !notification.read ? 'bg-[#D4AF37]/5' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            notification.type === 'assignment' ? 'bg-blue-500/20' :
                            notification.type === 'comment' ? 'bg-green-500/20' :
                            notification.type === 'document' ? 'bg-purple-500/20' :
                            notification.type === 'status_change' ? 'bg-amber-500/20' :
                            'bg-[#D4AF37]/20'
                          }`}>
                            <Icon className={`w-4 h-4 ${
                              notification.type === 'assignment' ? 'text-blue-400' :
                              notification.type === 'comment' ? 'text-green-400' :
                              notification.type === 'document' ? 'text-purple-400' :
                              notification.type === 'status_change' ? 'text-amber-400' :
                              'text-[#D4AF37]'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#FAFAFA]">
                              {notification.title}
                            </p>
                            <p className="text-xs text-[#F4E4BC]/70 line-clamp-2 mt-0.5">
                              {notification.message}
                            </p>
                            <p className="text-xs text-[#F4E4BC]/50 mt-1">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Activity Feed */}
          <TabsContent value="activity" className="m-0">
            <div className="overflow-y-auto max-h-[340px]">
              {activityLoading ? (
                <div className="px-4 py-8 text-center text-[#F4E4BC]/60">
                  Loading activities...
                </div>
              ) : activities.length === 0 ? (
                <div className="px-4 py-8 text-center text-[#F4E4BC]/60">
                  No recent activity
                </div>
              ) : (
                <div className="divide-y divide-[#D4AF37]/10">
                  {activities.map((activity) => {
                    const Icon = getActivityIcon(activity.event_type);
                    return (
                      <button
                        key={activity.id}
                        onClick={() => handleActivityClick(activity)}
                        className="w-full px-4 py-3 hover:bg-[#D4AF37]/5 transition-colors text-left"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${activity.color || 'bg-[#D4AF37]/20'}`}>
                            <Icon className="w-4 h-4 text-[#D4AF37]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-[#FAFAFA] line-clamp-2">
                              {activity.description}
                            </p>
                            <p className="text-xs text-[#F4E4BC]/60 mt-1">
                              {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            
            {activities.length > 0 && (
              <div className="px-4 py-3 border-t border-[#D4AF37]/20">
                <Button
                  variant="ghost"
                  onClick={handleViewAll}
                  className="w-full text-[#D4AF37] hover:text-[#F4E4BC] hover:bg-[#D4AF37]/10"
                >
                  View All Activity
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};
