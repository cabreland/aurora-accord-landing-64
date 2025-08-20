
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  acceptCompanyNDA,
  submitAccessRequest,
  approveAccessRequest,
  denyAccessRequest,
  canViewCompanyConfidential,
  getUserCompanyAccessLevel,
  getInvestorCompanySummary,
  type AccessLevel,
  type InvestorCompanySummary
} from '@/lib/rpc/companyAccess';
import { useAuth } from '@/hooks/useAuth';

export const useCompanyAccess = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for investor company summary
  const { 
    data: companies, 
    isLoading: isLoadingCompanies,
    error: companiesError 
  } = useQuery({
    queryKey: ['investor-company-summary'],
    queryFn: getInvestorCompanySummary,
    enabled: !!user
  });

  // NDA acceptance mutation
  const ndaAcceptMutation = useMutation({
    mutationFn: acceptCompanyNDA,
    onSuccess: (data) => {
      toast({
        title: "NDA Accepted",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['investor-company-summary'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Access request submission mutation
  const accessRequestMutation = useMutation({
    mutationFn: ({ companyId, requestedLevel, reason }: {
      companyId: string;
      requestedLevel: AccessLevel;
      reason?: string;
    }) => submitAccessRequest(companyId, requestedLevel, reason),
    onSuccess: (data) => {
      toast({
        title: "Request Submitted",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['investor-company-summary'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Admin approval mutation
  const approvalMutation = useMutation({
    mutationFn: ({ requestId, approvedLevel }: {
      requestId: string;
      approvedLevel?: AccessLevel;
    }) => approveAccessRequest(requestId, approvedLevel),
    onSuccess: (data) => {
      toast({
        title: "Request Approved",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['investor-company-summary'] });
      queryClient.invalidateQueries({ queryKey: ['access-requests'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Admin denial mutation
  const denialMutation = useMutation({
    mutationFn: ({ requestId, reason }: {
      requestId: string;
      reason?: string;
    }) => denyAccessRequest(requestId, reason),
    onSuccess: (data) => {
      toast({
        title: "Request Denied",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['access-requests'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Helper function to check access level
  const checkAccess = async (companyId: string, requiredLevel: AccessLevel): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      return await canViewCompanyConfidential(user.id, companyId, requiredLevel);
    } catch (error) {
      console.error('Error checking access:', error);
      return false;
    }
  };

  // Helper function to get user's access level
  const getAccessLevel = async (companyId: string): Promise<AccessLevel> => {
    if (!user?.id) return 'public';
    
    try {
      return await getUserCompanyAccessLevel(user.id, companyId);
    } catch (error) {
      console.error('Error getting access level:', error);
      return 'public';
    }
  };

  return {
    // Data
    companies: companies || [],
    isLoadingCompanies,
    companiesError,

    // Mutations
    acceptNDA: ndaAcceptMutation.mutate,
    submitRequest: accessRequestMutation.mutate,
    approveRequest: approvalMutation.mutate,
    denyRequest: denialMutation.mutate,

    // Loading states
    isAcceptingNDA: ndaAcceptMutation.isPending,
    isSubmittingRequest: accessRequestMutation.isPending,
    isApprovingRequest: approvalMutation.isPending,
    isDenyingRequest: denialMutation.isPending,

    // Helper functions
    checkAccess,
    getAccessLevel,
  };
};
