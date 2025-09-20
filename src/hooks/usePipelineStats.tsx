import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';

export interface PipelineStage {
  stage: string;
  count: number;
  totalValue: number;
  displayName: string;
  color: string;
}

export const usePipelineStats = () => {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && profile) {
      fetchPipelineStats();
    }
  }, [user, profile]);

  const fetchPipelineStats = async () => {
    try {
      setLoading(true);
      
      // Get both companies and deals data for comprehensive pipeline analysis
      const [companiesData, dealsData] = await Promise.all([
        // Companies query
        (() => {
          let query = supabase
            .from('companies')
            .select('stage, asking_price, revenue, ebitda, created_at, is_published');
          
          if (profile?.role !== 'admin') {
            query = query.eq('owner_id', user?.id);
          }
          
          return query;
        })(),
        
        // Deals query
        (() => {
          let query = supabase
            .from('deals')
            .select('status, asking_price, revenue, ebitda, created_at');
          
          if (profile?.role !== 'admin') {
            query = query.eq('created_by', user?.id);
          }
          
          return query;
        })()
      ]);

      if (companiesData.error) throw companiesData.error;
      if (dealsData.error) throw dealsData.error;

      // Process pipeline data with better stage mapping
      const stageMap = new Map<string, { count: number; totalValue: number }>();
      
      const stageConfigs = [
        { key: 'teaser', display: 'Teaser', color: '#3B82F6' },
        { key: 'discovery', display: 'Discovery', color: '#F59E0B' },
        { key: 'dd', display: 'Due Diligence', color: '#EF4444' },
        { key: 'closing', display: 'Closing', color: '#22C55E' }
      ];

      // Initialize all stages
      stageConfigs.forEach(config => {
        stageMap.set(config.key, { count: 0, totalValue: 0 });
      });

      // Map company stages (existing logic)
      companiesData.data?.forEach(company => {
        const stage = company.stage || 'teaser';
        const current = stageMap.get(stage) || { count: 0, totalValue: 0 };
        
        const askingPrice = parseFloat(company.asking_price?.replace(/[^0-9.]/g, '') || '0');
        
        stageMap.set(stage, {
          count: current.count + 1,
          totalValue: current.totalValue + (askingPrice * 1000000)
        });
      });

      // Map deal statuses to pipeline stages
      dealsData.data?.forEach(deal => {
        // Map deal status to pipeline stage
        let stage = 'teaser';
        switch (deal.status) {
          case 'draft':
            stage = 'teaser';
            break;
          case 'active':
            stage = 'discovery';
            break;
          case 'archived':
            stage = 'dd';
            break;
          default:
            stage = 'teaser';
        }
        
        const current = stageMap.get(stage) || { count: 0, totalValue: 0 };
        const askingPrice = parseFloat(deal.asking_price?.replace(/[^0-9.]/g, '') || '0');
        
        stageMap.set(stage, {
          count: current.count + 1,
          totalValue: current.totalValue + (askingPrice * 1000000)
        });
      });

      // Convert to array format
      const pipelineStages: PipelineStage[] = stageConfigs.map(config => {
        const data = stageMap.get(config.key) || { count: 0, totalValue: 0 };
        return {
          stage: config.key,
          displayName: config.display,
          color: config.color,
          count: data.count,
          totalValue: data.totalValue
        };
      });

      setStages(pipelineStages);
    } catch (error) {
      console.error('Error fetching pipeline stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalDeals = stages.reduce((sum, stage) => sum + stage.count, 0);
  const totalValue = stages.reduce((sum, stage) => sum + stage.totalValue, 0);

  return {
    stages,
    loading,
    totalDeals,
    totalValue,
    refresh: fetchPipelineStats
  };
};