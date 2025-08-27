import { useState, useEffect } from 'react';
import { useNDA } from './useNDA';
import { useUserProfile } from './useUserProfile';

export interface DocumentAccessControl {
  canViewTeasers: boolean;
  canViewCIM: boolean;
  canViewFinancials: boolean;
  canViewRestricted: boolean;
  accessLevel: 'teaser' | 'nda' | 'approved' | 'admin';
}

export const useDocumentAccess = (companyId?: string) => {
  const { hasAcceptedNDA, requireNDA } = useNDA(companyId);
  const { profile } = useUserProfile();
  
  const [accessControl, setAccessControl] = useState<DocumentAccessControl>({
    canViewTeasers: true,
    canViewCIM: false,
    canViewFinancials: false,
    canViewRestricted: false,
    accessLevel: 'teaser'
  });

  useEffect(() => {
    const isAdmin = profile?.role === 'admin';
    const isEditor = profile?.role === 'editor';
    const isStaff = isAdmin || isEditor;
    
    // Admin/staff have full access
    if (isStaff) {
      setAccessControl({
        canViewTeasers: true,
        canViewCIM: true,
        canViewFinancials: true,
        canViewRestricted: true,
        accessLevel: 'admin'
      });
      return;
    }

    // Regular users - check NDA status
    if (!requireNDA || hasAcceptedNDA) {
      setAccessControl({
        canViewTeasers: true,
        canViewCIM: true,
        canViewFinancials: false, // Still requires approval
        canViewRestricted: false, // Still requires approval
        accessLevel: hasAcceptedNDA ? 'nda' : 'approved'
      });
    } else {
      setAccessControl({
        canViewTeasers: true,
        canViewCIM: false,
        canViewFinancials: false,
        canViewRestricted: false,
        accessLevel: 'teaser'
      });
    }
  }, [hasAcceptedNDA, requireNDA, profile]);

  const canAccessDocument = (confidentialityLevel?: string) => {
    if (!confidentialityLevel) return true;
    
    switch (confidentialityLevel.toLowerCase()) {
      case 'public_teaser':
      case 'public':
        return accessControl.canViewTeasers;
      case 'cim':
      case 'confidential':
        return accessControl.canViewCIM;
      case 'financials':
        return accessControl.canViewFinancials;
      case 'restricted':
      case 'highly_confidential':
        return accessControl.canViewRestricted;
      default:
        return accessControl.canViewTeasers;
    }
  };

  return {
    accessControl,
    canAccessDocument
  };
};