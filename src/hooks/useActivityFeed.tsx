import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ActivityItem {
  id: string;
  event_type: string;
  event_data: any;
  created_at: string;
  user_id?: string;
  description: string;
  icon: string;
  color: string;
}

export const useActivityFeed = (limit: number = 20) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchActivity();
    }
  }, [user]);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      
      // Fetch from security audit log for now - in production you'd have a proper activity table
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Transform security logs into activity feed format
      const transformedActivities: ActivityItem[] = (data || []).map(log => ({
        id: log.id,
        event_type: log.event_type,
        event_data: log.event_data,
        created_at: log.created_at,
        user_id: log.user_id,
        description: generateActivityDescription(log.event_type, log.event_data),
        icon: getActivityIcon(log.event_type),
        color: getActivityColor(log.event_type)
      }));

      setActivities(transformedActivities);
    } catch (error) {
      console.error('Error fetching activity:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    activities,
    loading,
    refresh: fetchActivity
  };
};

const generateActivityDescription = (eventType: string, eventData: any): string => {
  switch (eventType) {
    case 'login':
      return 'User signed in to the platform';
    case 'logout':
      return 'User signed out';
    case 'nda_accepted':
      return `NDA accepted for company`;
    case 'company_created':
      return 'New company listing created';
    case 'deal_created':
      return 'New deal created';
    case 'document_uploaded':
      return 'Document uploaded to deal room';
    case 'access_granted':
      return 'Access granted to restricted content';
    default:
      return `${eventType.replace(/_/g, ' ')} activity`;
  }
};

const getActivityIcon = (eventType: string): string => {
  const iconMap: Record<string, string> = {
    login: 'LogIn',
    logout: 'LogOut',
    nda_accepted: 'FileCheck',
    company_created: 'Building2',
    deal_created: 'Handshake',
    document_uploaded: 'Upload',
    access_granted: 'Unlock',
    default: 'Activity'
  };
  return iconMap[eventType] || iconMap.default;
};

const getActivityColor = (eventType: string): string => {
  const colorMap: Record<string, string> = {
    login: '#22C55E',
    logout: '#6B7280',
    nda_accepted: '#D4AF37',
    company_created: '#3B82F6',
    deal_created: '#F28C38',
    document_uploaded: '#8B5CF6',
    access_granted: '#22C55E',
    default: '#F4E4BC'
  };
  return colorMap[eventType] || colorMap.default;
};