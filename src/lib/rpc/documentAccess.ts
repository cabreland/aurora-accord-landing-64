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
 * Download document directly (for authenticated users)
 */
export const downloadDocument = async (documentId: string): Promise<DocumentAccessResult> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      return {
        success: false,
        message: 'Authentication required'
      };
    }

    // Get document with file info
    const { data: documentData } = await supabase
      .from('documents')
      .select('id, name, file_path, deal_id, file_type, file_size')
      .eq('id', documentId)
      .single();

    if (!documentData) {
      return {
        success: false,
        message: 'Document not found'
      };
    }

    // Check if file exists in storage before attempting download
    try {
      // For files stored directly in bucket root with folder structure
      // filePath format: "dealId/category/timestamp-filename.ext"
      const pathParts = documentData.file_path.split('/');
      if (pathParts.length < 2) {
        return {
          success: false,
          message: 'Invalid file path format'
        };
      }
      
      // Get the folder path and filename
      const fileName = pathParts[pathParts.length - 1];
      const folderPath = pathParts.slice(0, -1).join('/');
      
      const { data: fileList, error: listError } = await supabase.storage
        .from('deal-documents')
        .list(folderPath, {
          limit: 100,
          search: fileName
        });
      
      if (listError) {
        console.error('Storage list error:', listError);
        return {
          success: false,
          message: `Unable to verify file: ${listError.message}`
        };
      }
      
      if (!fileList || !fileList.some(file => file.name === fileName)) {
        console.error('File not found in storage:', documentData.file_path);
        return {
          success: false,
          message: 'File not available in storage'
        };
      }
    } catch (checkError) {
      console.error('Error checking file existence:', checkError);
      return {
        success: false,
        message: 'Unable to verify file availability'
      };
    }

    // Generate signed URL for download
    const { data: signedUrl, error } = await supabase.storage
      .from('deal-documents')
      .createSignedUrl(documentData.file_path, 300); // 5 minutes for download

    if (error) {
      console.error('Signed URL error:', error);
      return {
        success: false,
        message: `Failed to generate download link: ${error.message}`
      };
    }

    if (!signedUrl?.signedUrl) {
      return {
        success: false,
        message: 'No download URL generated'
      };
    }

    // Download the file and trigger browser download
    const response = await fetch(signedUrl.signedUrl);
    if (!response.ok) {
      throw new Error(`Download failed with status: ${response.status}`);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const downloadLink = window.document.createElement('a');
    downloadLink.href = downloadUrl;
    downloadLink.download = documentData.name;
    downloadLink.style.display = 'none';
    window.document.body.appendChild(downloadLink);
    downloadLink.click();
    window.document.body.removeChild(downloadLink);
    window.URL.revokeObjectURL(downloadUrl);

    // Log download activity
    await logInvestorActivity(user.email, 'document_downloaded', documentData.deal_id, {
      document_id: documentId,
      document_name: documentData.name,
      file_path: documentData.file_path,
      file_size: documentData.file_size
    });

    return {
      success: true,
      message: 'Document downloaded successfully'
    };
  } catch (error) {
    console.error('Error downloading document:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Download failed'
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