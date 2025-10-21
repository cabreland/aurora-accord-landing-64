import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface WidgetSettings {
  id: string;
  widget_position: 'bottom-right' | 'bottom-left';
  primary_color: string;
  widget_size: 'small' | 'medium' | 'large';
  bubble_style: 'circle' | 'rounded-square';
  auto_open_enabled: boolean;
  auto_open_delay: number;
  show_online_status: boolean;
  enable_typing_indicators: boolean;
  enable_file_attachments: boolean;
  enable_emojis: boolean;
  initial_greeting: string;
  away_message: string;
  ask_button_label: string;
  info_button_label: string;
  interest_button_label: string;
  call_button_label: string;
  info_request_options: string[];
  calendly_link: string | null;
  enable_manual_scheduling: boolean;
  broker_email_notifications: boolean;
  investor_email_notifications: boolean;
  widget_title: string;
  placeholder_text: string;
  minimized_tooltip: string;
  updated_at: string;
}

export const useWidgetSettings = () => {
  const [settings, setSettings] = useState<WidgetSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('widget_settings' as any)
        .select('*')
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setSettings(data as any);
      }
    } catch (error) {
      console.error('Error fetching widget settings:', error);
      toast.error('Failed to load widget settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<WidgetSettings>) => {
    if (!settings) {
      toast.error('Settings not loaded');
      return;
    }

    try {
      setSaving(true);
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('widget_settings' as any)
        .update({
          ...updates,
          updated_by: user.user?.id,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', settings.id);

      if (error) {
        console.error('Update error:', error);
        throw error;
      }

      // Fetch fresh settings
      await fetchSettings();
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error updating widget settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    saving,
    updateSettings,
    refreshSettings: fetchSettings
  };
};
