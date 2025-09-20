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
      
      // Query deals data only for clean pipeline analytics
      let query = supabase
        .from('deals')
        .select('status, asking_price, revenue, ebitda, created_at');
      
      if (profile?.role !== 'admin') {
        query = query.eq('created_by', user?.id);
      }
      
      const { data: dealsData, error } = await query;

      if (error) throw error;

      // Process pipeline data with clean stage mapping
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

      // Map deal statuses to pipeline stages - only real data
      dealsData?.forEach(deal => {
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
        
        // Parse asking price properly - handle values like "300k", "1.5M", or plain numbers
        let askingPrice = 0;
        if (deal.asking_price) {
          const priceStr = deal.asking_price.toLowerCase();
          const numValue = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
          
          if (priceStr.includes('m')) {
            askingPrice = numValue * 1000000; // Convert millions to actual value
          } else if (priceStr.includes('k')) {
            askingPrice = numValue * 1000; // Convert thousands to actual value  
          } else {
            askingPrice = numValue * 1000; // Assume plain numbers are in thousands
          }
        }
        
        stageMap.set(stage, {
          count: current.count + 1,
          totalValue: current.totalValue + askingPrice
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