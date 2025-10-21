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
    if (!settings?.id) {
      console.error('[useWidgetSettings] No settings ID available');
      toast.error('Settings not loaded properly');
      return;
    }

    console.log('[useWidgetSettings] Updating settings:', updates);

    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Not authenticated');
        return;
      }

      const { data, error } = await supabase
        .from('widget_settings' as any)
        .update({
          ...updates,
          updated_by: user.id,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', settings.id)
        .select()
        .single();

      if (error) {
        console.error('[useWidgetSettings] Update failed:', error);
        toast.error(`Save failed: ${error.message}`);
        return;
      }

      console.log('[useWidgetSettings] Settings saved successfully:', data);
      setSettings(data as any);
      toast.success('Settings saved successfully');
    } catch (error: any) {
      console.error('[useWidgetSettings] Exception:', error);
      toast.error(error.message || 'Failed to save settings');
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
