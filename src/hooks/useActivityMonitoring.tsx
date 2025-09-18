import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  ip_address?: string | null;
  user_agent?: string | null;
  metadata: any;
  created_at: string;
  profiles?: {
    email: string;
    first_name?: string;
    last_name?: string;
  } | null;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  ip_address?: string | null;
  user_agent?: string | null;
  location_data?: any;
  is_active: boolean;
  last_activity: string;
  created_at: string;
  expires_at: string;
  profiles?: {
    email: string;
    first_name?: string;
    last_name?: string;
  } | null;
}

export interface SecurityEvent {
  id: string;
  event_type: string;
  user_id?: string;
  ip_address?: string | null;
  user_agent?: string | null;
  event_data: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  profiles?: {
    email: string;
    first_name?: string;
    last_name?: string;
  } | null;
}

export const useActivityMonitoring = () => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchActivities = async (limit = 50) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_activity_log')
        .select(`
          *,
          profiles (
            email,
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setActivities((data as any) || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveSessions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select(`
          *,
          profiles (
            email,
            first_name,
            last_name
          )
        `)
        .eq('is_active', true)
        .order('last_activity', { ascending: false });

      if (error) throw error;
      setSessions((data as any) || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSecurityEvents = async (limit = 50) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('security_events')
        .select(`
          *,
          profiles (
            email,
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setSecurityEvents((data as any) || []);
    } catch (error) {
      console.error('Error fetching security events:', error);
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (
    action: string,
    resourceType?: string,
    resourceId?: string,
    metadata?: any
  ) => {
    try {
      const { error } = await supabase.rpc('log_user_activity', {
        p_action: action,
        p_resource_type: resourceType,
        p_resource_id: resourceId,
        p_metadata: metadata || {}
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const recordSecurityEvent = async (
    eventType: string,
    eventData?: any,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
  ) => {
    try {
      const { error } = await supabase.rpc('record_security_event', {
        p_event_type: eventType,
        p_event_data: eventData || {},
        p_severity: severity
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error recording security event:', error);
    }
  };

  const forceLogoutSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('id', sessionId);

      if (error) throw error;
      
      // Refresh sessions list
      await fetchActiveSessions();
    } catch (error) {
      console.error('Error forcing logout:', error);
    }
  };

  const exportActivityData = async (startDate?: string, endDate?: string) => {
    try {
      let query = supabase
        .from('user_activity_log')
        .select(`
          *,
          profiles!user_activity_log_user_id_fkey (
            email,
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error exporting activity data:', error);
      return [];
    }
  };

  return {
    activities,
    sessions,
    securityEvents,
    loading,
    fetchActivities,
    fetchActiveSessions,
    fetchSecurityEvents,
    logActivity,
    recordSecurityEvent,
    forceLogoutSession,
    exportActivityData
  };
};