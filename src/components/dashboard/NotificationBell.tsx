import React, { useState, useEffect } from 'react';
import { Bell, FileText, Shield, Lock, Upload, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export const NotificationBell = () => {
  const { activities, loading, refresh } = useActivityFeed(5);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  // Load unread count from localStorage
  useEffect(() => {
    const lastReadTime = localStorage.getItem('lastActivityReadTime');
    if (!lastReadTime || activities.length === 0) {
      setUnreadCount(activities.length > 0 ? activities.length : 0);
      return;
    }

    const unread = activities.filter(
      activity => new Date(activity.created_at) > new Date(lastReadTime)
    ).length;
    setUnreadCount(unread);
  }, [activities]);

  // Mark all as read when dropdown opens
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && unreadCount > 0) {
      localStorage.setItem('lastActivityReadTime', new Date().toISOString());
      setUnreadCount(0);
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

  const handleActivityClick = (activity: any) => {
    setIsOpen(false);
    
    // Navigate based on activity event type
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
          {unreadCount > 0 && (
            <>
              {/* Red dot indicator */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              {/* Badge count */}
              <Badge className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center bg-red-500 text-white text-xs px-1">
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[400px] p-0 bg-gradient-to-b from-[#2A2F3A] to-[#1A1F2E] border-[#D4AF37]/30 max-h-[400px] overflow-hidden"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#D4AF37]/20">
          <h3 className="text-lg font-semibold text-[#FAFAFA]">Recent Activity</h3>
        </div>

        {/* Activity List */}
        <div className="overflow-y-auto max-h-[320px]">
          {loading ? (
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

        {/* Footer */}
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
      </PopoverContent>
    </Popover>
  );
};
