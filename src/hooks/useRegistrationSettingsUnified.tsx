import { useState, useEffect } from 'react';
import { useEnhancedSettings } from '@/hooks/useEnhancedSettings';
import { useToast } from '@/hooks/use-toast';

export const useRegistrationSettingsUnified = () => {
  const { getSetting, updateSetting, loading, saving } = useEnhancedSettings('registration');
  const { toast } = useToast();

  const getRegistrationSetting = (settingKey: string, defaultValue?: any) => {
    return getSetting(settingKey, defaultValue);
  };

  const updateRegistrationSetting = async (settingKey: string, value: any) => {
    try {
      await updateSetting(settingKey, value, 'registration', undefined, typeof value === 'string' ? 'text' : 'json');
      return true;
    } catch (error) {
      console.error('Error updating registration setting:', error);
      toast({
        title: 'Error',
        description: 'Failed to update setting',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    loading,
    saving,
    getSetting: getRegistrationSetting,
    updateSetting: updateRegistrationSetting,
  };
};