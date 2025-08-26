
import { supabase } from '@/integrations/supabase/client';

export interface Setting {
  key: string;
  value: any;
  updated_at: string;
}

export interface GrowthOpportunity {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  is_active: boolean;
  created_at: string;
}

export interface CustomField {
  id: string;
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'currency' | 'date' | 'boolean';
  is_required: boolean;
  is_active: boolean;
  created_at: string;
}

export interface CustomValue {
  field_id: string;
  company_id: string;
  value: any;
}

// Settings functions
export const getSettings = async (): Promise<Setting[]> => {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .order('key');

  if (error) {
    // Handle RLS permission errors gracefully
    if (error.code === '42501' || error.message?.includes('permission denied')) {
      throw new Error('Access denied. Admin privileges required to view settings.');
    }
    throw error;
  }
  return data || [];
};

export const getSetting = async (key: string): Promise<Setting | null> => {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('key', key)
    .single();

  if (error && error.code !== 'PGRST116') {
    if (error.code === '42501' || error.message?.includes('permission denied')) {
      throw new Error('Access denied. Admin privileges required to view settings.');
    }
    throw error;
  }
  return data;
};

export const upsertSetting = async (key: string, value: any): Promise<void> => {
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value }, { onConflict: 'key' });

  if (error) {
    if (error.code === '42501' || error.message?.includes('permission denied')) {
      throw new Error('Access denied. Admin privileges required to modify settings.');
    }
    throw error;
  }
};

// Growth opportunities functions
export const getGrowthOpportunities = async (activeOnly = false): Promise<GrowthOpportunity[]> => {
  let query = supabase.from('growth_opportunities').select('*');
  
  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query.order('title');

  if (error) {
    if (error.code === '42501' || error.message?.includes('permission denied')) {
      throw new Error('Access denied. Admin or staff privileges required to view growth opportunities.');
    }
    throw error;
  }
  return data || [];
};

export const createGrowthOpportunity = async (data: Omit<GrowthOpportunity, 'id' | 'created_at'>): Promise<string> => {
  const { data: result, error } = await supabase
    .from('growth_opportunities')
    .insert(data)
    .select('id')
    .single();

  if (error) {
    if (error.code === '42501' || error.message?.includes('permission denied')) {
      throw new Error('Access denied. Admin or staff privileges required to create growth opportunities.');
    }
    throw error;
  }
  return result.id;
};

export const updateGrowthOpportunity = async (id: string, data: Partial<GrowthOpportunity>): Promise<void> => {
  const { error } = await supabase
    .from('growth_opportunities')
    .update(data)
    .eq('id', id);

  if (error) {
    if (error.code === '42501' || error.message?.includes('permission denied')) {
      throw new Error('Access denied. Admin or staff privileges required to update growth opportunities.');
    }
    throw error;
  }
};

// Custom fields functions
export const getCustomFields = async (activeOnly = false): Promise<CustomField[]> => {
  let query = supabase.from('company_custom_fields').select('*');
  
  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query.order('label');

  if (error) {
    if (error.code === '42501' || error.message?.includes('permission denied')) {
      throw new Error('Access denied. Admin or staff privileges required to view custom fields.');
    }
    throw error;
  }
  
  // Cast the type field to match our CustomField interface
  return (data || []).map(field => ({
    ...field,
    type: field.type as CustomField['type']
  }));
};

export const createCustomField = async (data: Omit<CustomField, 'id' | 'created_at'>): Promise<string> => {
  const { data: result, error } = await supabase
    .from('company_custom_fields')
    .insert(data)
    .select('id')
    .single();

  if (error) {
    if (error.code === '42501' || error.message?.includes('permission denied')) {
      throw new Error('Access denied. Admin or staff privileges required to create custom fields.');
    }
    throw error;
  }
  return result.id;
};

export const updateCustomField = async (id: string, data: Partial<CustomField>): Promise<void> => {
  const { error } = await supabase
    .from('company_custom_fields')
    .update(data)
    .eq('id', id);

  if (error) {
    if (error.code === '42501' || error.message?.includes('permission denied')) {
      throw new Error('Access denied. Admin or staff privileges required to update custom fields.');
    }
    throw error;
  }
};

// Custom values functions
export const getCompanyCustomValues = async (companyId: string): Promise<CustomValue[]> => {
  const { data, error } = await supabase
    .from('company_custom_values')
    .select('*')
    .eq('company_id', companyId);

  if (error) {
    if (error.code === '42501' || error.message?.includes('permission denied')) {
      throw new Error('Access denied. Admin or staff privileges required to view custom values.');
    }
    throw error;
  }
  return data || [];
};

export const upsertCustomValue = async (fieldId: string, companyId: string, value: any): Promise<void> => {
  const { error } = await supabase
    .from('company_custom_values')
    .upsert(
      { field_id: fieldId, company_id: companyId, value },
      { onConflict: 'field_id,company_id' }
    );

  if (error) {
    if (error.code === '42501' || error.message?.includes('permission denied')) {
      throw new Error('Access denied. Admin or staff privileges required to modify custom values.');
    }
    throw error;
  }
};

// Company growth opportunities functions
export const getCompanyGrowthOpportunities = async (companyId: string) => {
  const { data, error } = await supabase
    .from('company_growth_opps')
    .select(`
      note,
      growth_opportunities!inner(*)
    `)
    .eq('company_id', companyId);

  if (error) {
    if (error.code === '42501' || error.message?.includes('permission denied')) {
      throw new Error('Access denied. Admin or staff privileges required to view company growth opportunities.');
    }
    throw error;
  }
  return data || [];
};

export const addCompanyGrowthOpportunity = async (companyId: string, growthId: string, note?: string): Promise<void> => {
  const { error } = await supabase
    .from('company_growth_opps')
    .insert({ company_id: companyId, growth_id: growthId, note });

  if (error) {
    if (error.code === '42501' || error.message?.includes('permission denied')) {
      throw new Error('Access denied. Admin or staff privileges required to add company growth opportunities.');
    }
    throw error;
  }
};

export const removeCompanyGrowthOpportunity = async (companyId: string, growthId: string): Promise<void> => {
  const { error } = await supabase
    .from('company_growth_opps')
    .delete()
    .eq('company_id', companyId)
    .eq('growth_id', growthId);

  if (error) {
    if (error.code === '42501' || error.message?.includes('permission denied')) {
      throw new Error('Access denied. Admin or staff privileges required to remove company growth opportunities.');
    }
    throw error;
  }
};
