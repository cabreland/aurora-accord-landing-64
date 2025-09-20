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
      
      // Try to fetch from multiple activity sources for a richer feed
      const [auditLogs, dealUpdates, documentUploads] = await Promise.all([
        // Security audit logs
        supabase
          .from('security_audit_log')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5),
        
        // Recent deal updates
        supabase
          .from('deals')
          .select('id, title, company_name, created_at, updated_at, status')
          .order('updated_at', { ascending: false })
          .limit(5),
        
        // Recent document uploads
        supabase
          .from('documents')
          .select('id, name, created_at, deal:deals(title, company_name)')
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      const activities: ActivityItem[] = [];

      // Add security audit activities
      if (auditLogs.data) {
        auditLogs.data.forEach(log => {
          activities.push({
            id: `audit-${log.id}`,
            event_type: log.event_type,
            event_data: log.event_data,
            created_at: log.created_at,
            user_id: log.user_id,
            description: generateActivityDescription(log.event_type, log.event_data),
            icon: getActivityIcon(log.event_type),
            color: getActivityColor(log.event_type)
          });
        });
      }

      // Add deal activities
      if (dealUpdates.data) {
        dealUpdates.data.forEach(deal => {
          const isNew = new Date(deal.created_at).getTime() === new Date(deal.updated_at).getTime();
          activities.push({
            id: `deal-${deal.id}`,
            event_type: isNew ? 'deal_created' : 'deal_updated',
            event_data: { deal_id: deal.id, company_name: deal.company_name },
            created_at: deal.updated_at,
            user_id: null,
            description: isNew 
              ? `New deal created: ${deal.title}`
              : `Deal updated: ${deal.title}`,
            icon: isNew ? 'Handshake' : 'Edit',
            color: isNew ? '#F59E0B' : '#3B82F6'
          });
        });
      }

      // Add document activities
      if (documentUploads.data) {
        documentUploads.data.forEach(doc => {
          const dealInfo = doc.deal as any;
          activities.push({
            id: `doc-${doc.id}`,
            event_type: 'document_uploaded',
            event_data: { document_name: doc.name },
            created_at: doc.created_at,
            user_id: null,
            description: `Document uploaded: ${doc.name}${dealInfo ? ` for ${dealInfo.company_name}` : ''}`,
            icon: 'Upload',
            color: '#8B5CF6'
          });
        });
      }

      // Sort all activities by date and take the most recent
      activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setActivities(activities.slice(0, limit));
    } catch (error) {
      console.error('Error fetching activity:', error);
      setActivities([]);
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
    case 'deal_updated':
      return 'Deal information updated';
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
    deal_updated: 'Edit',
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
    deal_created: '#F59E0B',
    deal_updated: '#3B82F6',
    document_uploaded: '#8B5CF6',
    access_granted: '#22C55E',
    default: '#F4E4BC'
  };
  return colorMap[eventType] || colorMap.default;
};