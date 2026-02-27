import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Buyer {
  id: string;
  created_at: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  entity_name: string | null;
}

export interface DealBuyer {
  id: string;
  created_at: string;
  deal_id: string;
  buyer_id: string;
  status: string | null;
  role: string | null;
  buyer?: Buyer;
}

export const useBuyers = () => {
  return useQuery({
    queryKey: ['buyers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buyers')
        .select('*')
        .order('full_name');
      if (error) throw error;
      return data as Buyer[];
    },
  });
};

export const useDealBuyers = (dealId: string | null) => {
  return useQuery({
    queryKey: ['deal-buyers', dealId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deal_buyers')
        .select('*, buyer:buyers(*)')
        .eq('deal_id', dealId!)
        .order('created_at');
      if (error) throw error;
      return data as DealBuyer[];
    },
    enabled: !!dealId,
  });
};

export const useCreateBuyer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { full_name: string; email?: string; phone?: string; entity_name?: string }) => {
      const { data: result, error } = await supabase
        .from('buyers')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result as Buyer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyers'] });
    },
    onError: (error) => {
      toast.error('Failed to create buyer: ' + error.message);
    },
  });
};

export const useAttachBuyerToDeal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { deal_id: string; buyer_id: string; status?: string; role?: string }) => {
      const { data: result, error } = await supabase
        .from('deal_buyers')
        .insert(data)
        .select('*, buyer:buyers(*)')
        .single();
      if (error) throw error;
      return result as DealBuyer;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deal-buyers', variables.deal_id] });
    },
    onError: (error) => {
      toast.error('Failed to attach buyer: ' + error.message);
    },
  });
};
