
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  getSettings, 
  getSetting, 
  upsertSetting, 
  getGrowthOpportunities,
  createGrowthOpportunity,
  updateGrowthOpportunity,
  getCustomFields,
  createCustomField,
  updateCustomField,
  Setting,
  GrowthOpportunity,
  CustomField
} from '@/lib/data/settings';

export const useSettings = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    try {
      await upsertSetting(key, value);
      await fetchSettings();
      toast({
        title: "Success",
        description: "Setting updated successfully",
      });
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: "Error",
        description: "Failed to update setting",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    updateSetting,
    refresh: fetchSettings,
  };
};

export const useGrowthOpportunities = () => {
  const [opportunities, setOpportunities] = useState<GrowthOpportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchOpportunities = async (activeOnly = false) => {
    setLoading(true);
    try {
      const data = await getGrowthOpportunities(activeOnly);
      setOpportunities(data);
    } catch (error) {
      console.error('Error fetching growth opportunities:', error);
      toast({
        title: "Error",
        description: "Failed to load growth opportunities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createOpportunity = async (data: Omit<GrowthOpportunity, 'id' | 'created_at'>) => {
    try {
      await createGrowthOpportunity(data);
      await fetchOpportunities();
      toast({
        title: "Success",
        description: "Growth opportunity created successfully",
      });
    } catch (error) {
      console.error('Error creating growth opportunity:', error);
      toast({
        title: "Error",
        description: "Failed to create growth opportunity",
        variant: "destructive",
      });
    }
  };

  const updateOpportunity = async (id: string, data: Partial<GrowthOpportunity>) => {
    try {
      await updateGrowthOpportunity(id, data);
      await fetchOpportunities();
      toast({
        title: "Success",
        description: "Growth opportunity updated successfully",
      });
    } catch (error) {
      console.error('Error updating growth opportunity:', error);
      toast({
        title: "Error",
        description: "Failed to update growth opportunity",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  return {
    opportunities,
    loading,
    createOpportunity,
    updateOpportunity,
    refresh: fetchOpportunities,
  };
};

export const useCustomFields = () => {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchFields = async (activeOnly = false) => {
    setLoading(true);
    try {
      const data = await getCustomFields(activeOnly);
      setFields(data);
    } catch (error) {
      console.error('Error fetching custom fields:', error);
      toast({
        title: "Error",
        description: "Failed to load custom fields",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createField = async (data: Omit<CustomField, 'id' | 'created_at'>) => {
    try {
      await createCustomField(data);
      await fetchFields();
      toast({
        title: "Success",
        description: "Custom field created successfully",
      });
    } catch (error) {
      console.error('Error creating custom field:', error);
      toast({
        title: "Error",
        description: "Failed to create custom field",
        variant: "destructive",
      });
    }
  };

  const updateField = async (id: string, data: Partial<CustomField>) => {
    try {
      await updateCustomField(id, data);
      await fetchFields();
      toast({
        title: "Success",
        description: "Custom field updated successfully",
      });
    } catch (error) {
      console.error('Error updating custom field:', error);
      toast({
        title: "Error",
        description: "Failed to update custom field",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  return {
    fields,
    loading,
    createField,
    updateField,
    refresh: fetchFields,
  };
};
