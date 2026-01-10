import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useDealMetrics = (dealId: string) => {
  return useQuery({
    queryKey: ["deal-metrics", dealId],
    queryFn: async () => {
      const { count: docCount } = await supabase
        .from("data_room_documents")
        .select("*", { count: "exact", head: true })
        .eq("deal_id", dealId);

      const { data: requests } = await supabase
        .from("diligence_requests")
        .select("status")
        .eq("deal_id", dealId);

      const openRequests = requests?.filter(r => r.status === "open").length || 0;
      const totalRequests = requests?.length || 0;
      const resolvedRequests = requests?.filter(r => r.status === "completed").length || 0;

      const completion = totalRequests ? Math.round((resolvedRequests / totalRequests) * 100) : 0;

      const { count: teamCount } = await supabase
        .from("deal_team_members")
        .select("*", { count: "exact", head: true })
        .eq("deal_id", dealId);

      return {
        documents: docCount || 0,
        openRequests,
        totalRequests,
        resolvedRequests,
        completion,
        teamMembers: teamCount || 0
      };
    },
    enabled: !!dealId,
    refetchInterval: 30000
  });
};

export const useDealById = (dealId: string) => {
  return useQuery({
    queryKey: ["deal", dealId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deals")
        .select(`
          *,
          company:companies(*)
        `)
        .eq("id", dealId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!dealId
  });
};
