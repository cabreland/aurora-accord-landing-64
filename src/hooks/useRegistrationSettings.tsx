import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RegistrationSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  setting_type: string; // Allow any string from database
  category: string;
  display_name: string;
  description?: string;
  updated_at: string;
}

export const useRegistrationSettings = (category?: string) => {
  const [settings, setSettings] = useState<RegistrationSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('registration_settings')
        .select('*')
        .order('category', { ascending: true })
        .order('display_name', { ascending: true });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSettings(data || []);
    } catch (error: any) {
      console.error('Error fetching registration settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (settingKey: string, value: any) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('registration_settings')
        .update({ 
          setting_value: value,
          updated_by: (await supabase.auth.getUser()).data.user?.id 
        })
        .eq('setting_key', settingKey);

      if (error) throw error;

      // Update local state
      setSettings(prev => prev.map(setting => 
        setting.setting_key === settingKey 
          ? { ...setting, setting_value: value }
          : setting
      ));

      toast({
        title: 'Success',
        description: 'Setting updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating setting:', error);
      toast({
        title: 'Error',
        description: 'Failed to update setting',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getSetting = (settingKey: string, defaultValue?: any) => {
    const setting = settings.find(s => s.setting_key === settingKey);
    if (!setting) return defaultValue;

    // Handle different setting types
    if (setting.setting_type === 'json') {
      return setting.setting_value;
    } else if (setting.setting_type === 'text' || setting.setting_type === 'richtext') {
      return setting.setting_value;
    } else if (setting.setting_type === 'boolean') {
      return setting.setting_value;
    }

    return setting.setting_value || defaultValue;
  };

  const getSettingsByCategory = (categoryName: string) => {
    return settings.filter(setting => setting.category === categoryName);
  };

  const createSetting = async (settingData: Omit<RegistrationSetting, 'id' | 'updated_at'>) => {
    try {
      setSaving(true);
      const { data, error } = await supabase
        .from('registration_settings')
        .insert({
          ...settingData,
          updated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      setSettings(prev => [...prev, data]);
      toast({
        title: 'Success',
        description: 'Setting created successfully',
      });

      return data;
    } catch (error: any) {
      console.error('Error creating setting:', error);
      toast({
        title: 'Error',
        description: 'Failed to create setting',
        variant: 'destructive',
      });
      return null;
    } finally {
      setSaving(false);
    }
  };

  const deleteSetting = async (settingKey: string) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('registration_settings')
        .delete()
        .eq('setting_key', settingKey);

      if (error) throw error;

      setSettings(prev => prev.filter(setting => setting.setting_key !== settingKey));
      toast({
        title: 'Success',
        description: 'Setting deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting setting:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete setting',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [category]);

  return {
    settings,
    loading,
    saving,
    fetchSettings,
    updateSetting,
    getSetting,
    getSettingsByCategory,
    createSetting,
    deleteSetting,
  };
};