import { supabase } from '@/integrations/supabase/client';
import { canAccessDeal, logInvestorActivity } from '@/lib/rpc/investorDealAccess';

export interface DocumentAccessResult {
  success: boolean;
  downloadUrl?: string;
  message?: string;
  requiresNDA?: boolean;
}

/**
 * Check if investor can download a document based on deal permissions
 */
export const checkDocumentAccess = async (
  email: string, 
  documentId: string
): Promise<DocumentAccessResult> => {
  try {
    // Get document and associated deal
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('id, name, deal_id, file_path')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      return {
        success: false,
        message: 'Document not found'
      };
    }

    // Check if user can access the deal
    const hasAccess = await canAccessDeal(email, document.deal_id);
    
    if (!hasAccess) {
      return {
        success: false,
        message: 'Access denied - insufficient permissions for this deal'
      };
    }

    // Check NDA status for the document's company
    const { data: deal } = await supabase
      .from('deals')
      .select('company_id')
      .eq('id', document.deal_id)
      .single();

    if (deal?.company_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', email)
        .single();

      if (profile?.user_id) {
        const { data: ndaAcceptance } = await supabase
          .from('company_nda_acceptances')
          .select('id')
          .eq('user_id', profile.user_id)
          .eq('company_id', deal.company_id)
          .single();

        if (!ndaAcceptance) {
          return {
            success: false,
            message: 'NDA acceptance required before accessing documents',
            requiresNDA: true
          };
        }
      }
    }

    return {
      success: true,
      message: 'Access granted'
    };
  } catch (error) {
    console.error('Error checking document access:', error);
    return {
      success: false,
      message: 'Error checking access permissions'
    };
  }
};

/**
 * Generate secure download URL for document
 */
export const getSecureDocumentUrl = async (
  email: string,
  documentId: string
): Promise<DocumentAccessResult> => {
  try {
    // First check access permissions
    const accessCheck = await checkDocumentAccess(email, documentId);
    
    if (!accessCheck.success) {
      return accessCheck;
    }

    // Get document file path
    const { data: document } = await supabase
      .from('documents')
      .select('file_path, name, deal_id')
      .eq('id', documentId)
      .single();

    if (!document?.file_path) {
      return {
        success: false,
        message: 'Document file not found'
      };
    }

    // Generate signed URL (expires in 15 minutes for security)
    const { data: signedUrl, error } = await supabase.storage
      .from('deal-documents')
      .createSignedUrl(document.file_path, 900); // 15 minutes

    if (error || !signedUrl) {
      return {
        success: false,
        message: 'Failed to generate secure download link'
      };
    }

    // Log download activity
    await logInvestorActivity(email, 'document_downloaded', document.deal_id, {
      document_id: documentId,
      document_name: document.name,
      file_path: document.file_path
    });

    return {
      success: true,
      downloadUrl: signedUrl.signedUrl,
      message: 'Secure download link generated'
    };
  } catch (error) {
    console.error('Error generating secure document URL:', error);
    return {
      success: false,
      message: 'Error generating download link'
    };
  }
};

/**
 * Get list of documents accessible to investor for a specific deal
 */
export const getAccessibleDocuments = async (email: string, dealId: string) => {
  try {
    // Check if user can access the deal
    const hasAccess = await canAccessDeal(email, dealId);
    
    if (!hasAccess) {
      return [];
    }

    // Get documents for the deal
    const { data: documents, error } = await supabase
      .from('documents')
      .select('id, name, file_type, file_size, created_at, tag')
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      return [];
    }

    return documents || [];
  } catch (error) {
    console.error('Error getting accessible documents:', error);
    return [];
  }
};

/**
 * Track document view activity
 */
export const trackDocumentView = async (
  email: string,
  documentId: string,
  dealId: string
) => {
  try {
    await logInvestorActivity(email, 'document_viewed', dealId, {
      document_id: documentId
    });
  } catch (error) {
    console.error('Error tracking document view:', error);
  }
};