import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';

export interface DealHealth {
  id: string;
  title: string;
  company_name: string;
  status: string;
  current_stage: string;
  health_score: number;
  days_in_stage: number;
  last_activity: string | null;
  overdue_tasks: number;
  pending_requests: number;
  document_completion: number;
  investor_views: number;
  asking_price: string | null;
  projected_close: string | null;
  close_probability: number;
  urgent_items: UrgentItem[];
}

export interface UrgentItem {
  type: 'overdue' | 'pending' | 'missing' | 'stalled';
  label: string;
  deal_id: string;
  deal_name: string;
  days?: number;
}

export interface HotLead {
  id: string;
  investor_name: string;
  investor_email: string;
  deal_name: string;
  deal_id: string;
  activity_type: 'nda_signed' | 'docs_viewed' | 'multiple_visits' | 'comment_posted';
  activity_time: string;
}

export interface RecentActivity {
  id: string;
  user_name: string;
  user_avatar?: string;
  action: string;
  deal_name: string;
  deal_id: string;
  timestamp: string;
  activity_type: string;
  metadata?: any;
}

export interface PipelineHealth {
  overall_score: number;
  trend: 'up' | 'down' | 'stable';
  deals_on_track: number;
  deals_need_attention: number;
  total_deals: number;
}

export interface RevenueForecast {
  month: string;
  projected: number;
  actual: number;
  probability_weighted: number;
}

export const useMissionControl = () => {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [dealHealthData, setDealHealthData] = useState<DealHealth[]>([]);
  const [hotLeads, setHotLeads] = useState<HotLead[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  useEffect(() => {
    if (user && profile) {
      fetchMissionControlData();
    }
  }, [user, profile]);

  const fetchMissionControlData = async () => {
    try {
      setLoading(true);

      // Fetch deals with related data
      let dealsQuery = supabase
        .from('deals')
        .select('*')
        .order('updated_at', { ascending: false });

      // If not admin, only show user's deals
      if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
        dealsQuery = dealsQuery.eq('created_by', user?.id);
      }

      const { data: deals, error: dealsError } = await dealsQuery;
      if (dealsError) throw dealsError;

      // Fetch diligence requests for all deals
      const dealIds = deals?.map(d => d.id) || [];
      
      let requests: any[] = [];
      if (dealIds.length > 0) {
        const { data: requestData } = await supabase
          .from('diligence_requests')
          .select('*')
          .in('deal_id', dealIds);
        requests = requestData || [];
      }

      // Fetch documents for all deals
      let documents: any[] = [];
      if (dealIds.length > 0) {
        const { data: docData } = await supabase
          .from('data_room_documents')
          .select('*')
          .in('deal_id', dealIds);
        documents = docData || [];
      }

      // Fetch folders for all deals
      let folders: any[] = [];
      if (dealIds.length > 0) {
        const { data: folderData } = await supabase
          .from('data_room_folders')
          .select('*')
          .in('deal_id', dealIds);
        folders = folderData || [];
      }

      // Fetch recent activities
      const { data: activities } = await supabase
        .from('deal_activities')
        .select(`
          *,
          deals!inner(title, company_name)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      // Fetch user profiles for activity names
      const userIds = [...new Set(activities?.map(a => a.user_id).filter(Boolean) || [])];
      let userProfiles: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, profile_picture_url')
          .in('user_id', userIds);
        profiles?.forEach(p => {
          userProfiles[p.user_id] = p;
        });
      }

      // Calculate health for each deal
      const healthData: DealHealth[] = (deals || []).map(deal => {
        const dealRequests = requests.filter(r => r.deal_id === deal.id);
        const dealDocs = documents.filter(d => d.deal_id === deal.id);
        const dealFolders = folders.filter(f => f.deal_id === deal.id);
        
        // Calculate days in stage
        const stageEnteredAt = deal.stage_entered_at || deal.created_at;
        const daysInStage = Math.floor(
          (Date.now() - new Date(stageEnteredAt).getTime()) / (1000 * 60 * 60 * 24)
        );

        // Calculate overdue tasks
        const overdueTasks = dealRequests.filter(r => 
          r.due_date && new Date(r.due_date) < new Date() && r.status !== 'completed'
        ).length;

        // Calculate pending requests
        const pendingRequests = dealRequests.filter(r => 
          r.status === 'open' || r.status === 'in_progress'
        ).length;

        // Calculate document completion
        const requiredFolders = dealFolders.filter(f => f.is_required);
        const completedFolders = requiredFolders.filter(f =>
          dealDocs.some(d => d.folder_id === f.id)
        );
        const docCompletion = requiredFolders.length > 0
          ? Math.round((completedFolders.length / requiredFolders.length) * 100)
          : dealDocs.length > 0 ? 50 : 0;

        // Calculate days since last activity
        const lastActivity = deal.updated_at;
        const daysSinceActivity = Math.floor(
          (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)
        );

        // Calculate health score
        let healthScore = 100;
        
        // Deduct for stale deals
        if (daysSinceActivity > 7) healthScore -= 20;
        if (daysSinceActivity > 14) healthScore -= 30;
        
        // Deduct for incomplete diligence
        if (docCompletion < 50) healthScore -= 20;
        else if (docCompletion < 80) healthScore -= 10;
        
        // Deduct for overdue tasks
        healthScore -= (overdueTasks * 5);
        
        // Deduct for too many pending requests
        if (pendingRequests > 5) healthScore -= 15;
        else if (pendingRequests > 2) healthScore -= 5;

        // Deduct for too long in stage
        if (daysInStage > 30) healthScore -= 15;
        else if (daysInStage > 14) healthScore -= 5;

        healthScore = Math.max(0, Math.min(100, healthScore));

        // Generate urgent items
        const urgentItems: UrgentItem[] = [];
        
        if (overdueTasks > 0) {
          urgentItems.push({
            type: 'overdue',
            label: `${overdueTasks} overdue task${overdueTasks > 1 ? 's' : ''}`,
            deal_id: deal.id,
            deal_name: deal.title
          });
        }
        
        if (pendingRequests > 3) {
          urgentItems.push({
            type: 'pending',
            label: `${pendingRequests} pending requests`,
            deal_id: deal.id,
            deal_name: deal.title
          });
        }
        
        if (docCompletion < 30 && deal.status === 'active') {
          urgentItems.push({
            type: 'missing',
            label: 'Missing required documents',
            deal_id: deal.id,
            deal_name: deal.title
          });
        }
        
        if (daysSinceActivity > 7) {
          urgentItems.push({
            type: 'stalled',
            label: `No activity for ${daysSinceActivity} days`,
            deal_id: deal.id,
            deal_name: deal.title,
            days: daysSinceActivity
          });
        }

        // Calculate close probability based on stage
        let closeProbability = 10;
        switch (deal.current_stage) {
          case 'closing': closeProbability = 90; break;
          case 'final_review': closeProbability = 70; break;
          case 'analysis': closeProbability = 50; break;
          case 'information_request': closeProbability = 30; break;
          case 'deal_initiated': closeProbability = 10; break;
          default: closeProbability = 20;
        }

        return {
          id: deal.id,
          title: deal.title,
          company_name: deal.company_name,
          status: deal.status,
          current_stage: deal.current_stage || 'deal_initiated',
          health_score: healthScore,
          days_in_stage: daysInStage,
          last_activity: lastActivity,
          overdue_tasks: overdueTasks,
          pending_requests: pendingRequests,
          document_completion: docCompletion,
          investor_views: 0, // TODO: Track from data_room_activity
          asking_price: deal.asking_price,
          projected_close: null,
          close_probability: closeProbability,
          urgent_items: urgentItems
        };
      });

      setDealHealthData(healthData);

      // Process recent activities
      const processedActivities: RecentActivity[] = (activities || []).map(activity => {
        const userProfile = userProfiles[activity.user_id];
        const userName = userProfile
          ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'Unknown User'
          : 'System';

        const actionMap: Record<string, string> = {
          'document_uploaded': 'uploaded a document',
          'document_approved': 'approved a document',
          'document_rejected': 'rejected a document',
          'request_created': 'created a request',
          'request_updated': 'updated a request',
          'request_status_changed': 'changed request status',
          'comment_added': 'added a comment',
          'team_member_added': 'added a team member',
          'stage_changed': 'changed deal stage',
          'status_changed': 'changed deal status'
        };

        return {
          id: activity.id,
          user_name: userName,
          user_avatar: userProfile?.profile_picture_url,
          action: actionMap[activity.activity_type] || activity.activity_type,
          deal_name: activity.deals?.title || 'Unknown Deal',
          deal_id: activity.deal_id,
          timestamp: activity.created_at,
          activity_type: activity.activity_type,
          metadata: activity.metadata
        };
      });

      setRecentActivities(processedActivities);

      // TODO: Fetch hot leads from NDA signatures and data room activity

    } catch (error) {
      console.error('Error fetching mission control data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate pipeline health
  const pipelineHealth = useMemo((): PipelineHealth => {
    const activeDeals = dealHealthData.filter(d => d.status === 'active');
    
    if (activeDeals.length === 0) {
      return {
        overall_score: 100,
        trend: 'stable',
        deals_on_track: 0,
        deals_need_attention: 0,
        total_deals: 0
      };
    }

    const avgScore = Math.round(
      activeDeals.reduce((sum, d) => sum + d.health_score, 0) / activeDeals.length
    );
    
    const onTrack = activeDeals.filter(d => d.health_score >= 70).length;
    const needAttention = activeDeals.filter(d => d.health_score < 70).length;

    return {
      overall_score: avgScore,
      trend: 'stable', // TODO: Calculate based on historical data
      deals_on_track: onTrack,
      deals_need_attention: needAttention,
      total_deals: activeDeals.length
    };
  }, [dealHealthData]);

  // Get deals requiring action (sorted by urgency)
  const dealsRequiringAction = useMemo(() => {
    return dealHealthData
      .filter(d => d.status === 'active' && d.urgent_items.length > 0)
      .sort((a, b) => {
        // Sort by number of urgent items, then by health score
        if (a.urgent_items.length !== b.urgent_items.length) {
          return b.urgent_items.length - a.urgent_items.length;
        }
        return a.health_score - b.health_score;
      })
      .slice(0, 5);
  }, [dealHealthData]);

  // Get this week's closings
  const thisWeeksClosings = useMemo(() => {
    return dealHealthData
      .filter(d => 
        d.status === 'active' && 
        (d.current_stage === 'closing' || d.current_stage === 'final_review')
      )
      .sort((a, b) => b.close_probability - a.close_probability)
      .slice(0, 5);
  }, [dealHealthData]);

  // Calculate total pipeline value
  const totalPipelineValue = useMemo(() => {
    return dealHealthData
      .filter(d => d.status === 'active')
      .reduce((sum, deal) => {
        const price = parseFloat(deal.asking_price?.replace(/[^0-9.]/g, '') || '0');
        // Handle K, M, B suffixes
        let multiplier = 1;
        if (deal.asking_price?.toLowerCase().includes('k')) multiplier = 1000;
        if (deal.asking_price?.toLowerCase().includes('m')) multiplier = 1000000;
        if (deal.asking_price?.toLowerCase().includes('b')) multiplier = 1000000000;
        return sum + (price * multiplier * (deal.close_probability / 100));
      }, 0);
  }, [dealHealthData]);

  return {
    loading,
    pipelineHealth,
    dealHealthData,
    dealsRequiringAction,
    thisWeeksClosings,
    hotLeads,
    recentActivities,
    totalPipelineValue,
    refresh: fetchMissionControlData
  };
};
