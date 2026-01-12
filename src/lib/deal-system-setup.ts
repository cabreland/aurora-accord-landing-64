import { supabase } from '@/integrations/supabase/client';

// Standard diligence categories with subcategories
const DILIGENCE_CATEGORIES = [
  {
    name: 'Corporate & Legal',
    subcategories: [
      'Articles of Incorporation & Operating Agreements',
      'Business Licenses & Permits',
      'Client Contracts & Service Agreements',
      'Employment Agreements',
      'Insurance Policies (Liability E&O)',
      'Intellectual Property',
      'Legal or Dispute History',
      'NDAs & Confidentiality Agreements',
      'Office & Lease Agreements',
      'Vendor & Contractor Agreements'
    ]
  },
  {
    name: 'Financials',
    subcategories: [
      'Historical Financial Statements (3-5 years)',
      'Monthly/Quarterly P&L',
      'Balance Sheets',
      'Cash Flow Statements',
      'Accounts Receivable Aging',
      'Accounts Payable Summary',
      'Tax Returns (3 years)',
      'Bank Statements (12 months)'
    ]
  },
  {
    name: 'Operations',
    subcategories: [
      'Standard Operating Procedures',
      'Vendor Relationships & Contracts',
      'Tools & Software Licenses',
      'Process Documentation',
      'Quality Control Procedures',
      'Inventory Management'
    ]
  },
  {
    name: 'Client Base & Contracts',
    subcategories: [
      'Top 10 Customer Contracts',
      'Customer Concentration Analysis',
      'Client Retention Metrics',
      'Revenue by Customer',
      'Recurring vs One-time Revenue Breakdown'
    ]
  },
  {
    name: 'Services & Deliverables',
    subcategories: [
      'Service Catalog / Menu',
      'Pricing Structure',
      'Service Level Agreements',
      'Delivery Process Documentation'
    ]
  },
  {
    name: 'Marketing & Sales',
    subcategories: [
      'Marketing Materials & Collateral',
      'Sales Process Documentation',
      'Lead Generation Sources',
      'Customer Acquisition Costs',
      'Sales Pipeline Overview'
    ]
  },
  {
    name: 'Revenue & Performance',
    subcategories: [
      'Revenue by Service Line',
      'Gross Margin Analysis',
      'KPI Dashboard/Metrics',
      'Year-over-Year Growth Analysis',
      'Seasonality Analysis'
    ]
  },
  {
    name: 'Technology & Integrations',
    subcategories: [
      'Technology Stack Overview',
      'Software Licenses & Subscriptions',
      'Integration Documentation',
      'Data Security Policies',
      'IT Infrastructure Details'
    ]
  },
  {
    name: 'Human Resources',
    subcategories: [
      'Organization Chart',
      'Employee Roster & Compensation',
      'Benefits Summary',
      'Employee Handbook',
      'Key Employee Agreements',
      'Contractor Agreements'
    ]
  },
  {
    name: 'Miscellaneous',
    subcategories: [
      'Debt Documents & Loan Agreements',
      'Pending Litigation',
      'Environmental Compliance',
      'Other Material Agreements'
    ]
  }
];

// Standard data room folder structure
const DATA_ROOM_FOLDERS = [
  { name: 'Corporate & Legal', index: '1', isLoiRestricted: false },
  { name: 'Financials', index: '2', isLoiRestricted: false },
  { name: 'Operations', index: '3', isLoiRestricted: false },
  { name: 'Client Base & Contracts', index: '4', isLoiRestricted: false },
  { name: 'Services & Deliverables', index: '5', isLoiRestricted: false },
  { name: 'Marketing & Sales', index: '6', isLoiRestricted: false },
  { name: 'Revenue & Performance', index: '7', isLoiRestricted: false },
  { name: 'Technology & Integrations', index: '8', isLoiRestricted: false },
  { name: 'Human Resources', index: '9', isLoiRestricted: false },
  { name: 'Miscellaneous', index: '10', isLoiRestricted: false },
  { name: 'LOI-Restricted Access', index: '11', isLoiRestricted: true }
];

export interface SetupResult {
  success: boolean;
  error?: string;
  requestsCreated?: number;
  foldersCreated?: number;
}

/**
 * Sets up the Due Diligence Tracker for a deal
 * Creates diligence requests for each category/subcategory
 */
export const setupDueDiligenceTracker = async (dealId: string): Promise<SetupResult> => {
  try {
    // First, get existing category IDs from the database
    const { data: existingCategories, error: catError } = await supabase
      .from('diligence_categories')
      .select('id, name');

    if (catError) {
      console.error('Error fetching categories:', catError);
      throw catError;
    }

    // Create a map of category names to IDs
    const categoryMap = new Map<string, string>();
    existingCategories?.forEach(cat => {
      categoryMap.set(cat.name.toLowerCase(), cat.id);
    });

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Build diligence requests
    const requests: any[] = [];
    
    for (const category of DILIGENCE_CATEGORIES) {
      // Try to match with existing category or use first available
      let categoryId = categoryMap.get(category.name.toLowerCase());
      
      // If no exact match, try partial match
      if (!categoryId) {
        for (const [name, id] of categoryMap.entries()) {
          if (category.name.toLowerCase().includes(name) || name.includes(category.name.toLowerCase())) {
            categoryId = id;
            break;
          }
        }
      }
      
      // If still no match, use the first category as fallback
      if (!categoryId && existingCategories && existingCategories.length > 0) {
        categoryId = existingCategories[0].id;
      }

      if (!categoryId) {
        console.warn(`No category found for: ${category.name}`);
        continue;
      }

      for (const subcategory of category.subcategories) {
        requests.push({
          deal_id: dealId,
          title: subcategory,
          category_id: categoryId,
          status: 'open',
          priority: 'none',
          created_by: user.id,
          created_at: new Date().toISOString()
        });
      }
    }

    if (requests.length === 0) {
      throw new Error('No diligence requests could be created - no categories found');
    }

    // Bulk insert requests
    const { error: insertError } = await supabase
      .from('diligence_requests')
      .insert(requests);

    if (insertError) {
      console.error('Error inserting diligence requests:', insertError);
      throw insertError;
    }

    return {
      success: true,
      requestsCreated: requests.length
    };
  } catch (error: any) {
    console.error('Failed to setup due diligence tracker:', error);
    return {
      success: false,
      error: error.message || 'Failed to create due diligence tracker'
    };
  }
};

/**
 * Sets up the Data Room for a deal
 * Creates standard folder structure
 */
export const setupDataRoom = async (dealId: string): Promise<SetupResult> => {
  try {
    // Get category IDs for folder mapping
    const { data: categories, error: catError } = await supabase
      .from('data_room_categories')
      .select('id, name, index_number');

    if (catError) {
      console.warn('Could not fetch data room categories:', catError);
    }

    // Create a map of category names to IDs
    const categoryMap = new Map<string, string>();
    categories?.forEach(cat => {
      categoryMap.set(cat.name?.toLowerCase() || '', cat.id);
    });

    // Build folder inserts
    const folderInserts = DATA_ROOM_FOLDERS.map((folder, idx) => {
      // Try to find matching category
      let categoryId = categoryMap.get(folder.name.toLowerCase());
      
      // If no match and categories exist, try partial match
      if (!categoryId && categories && categories.length > 0) {
        for (const cat of categories) {
          if (folder.name.toLowerCase().includes(cat.name?.toLowerCase() || '')) {
            categoryId = cat.id;
            break;
          }
        }
      }

      return {
        deal_id: dealId,
        name: folder.name,
        index_number: folder.index,
        sort_order: idx + 1,
        is_required: !folder.isLoiRestricted,
        category_id: categoryId || null,
        created_at: new Date().toISOString()
      };
    });

    // Insert folders
    const { error: folderError } = await supabase
      .from('data_room_folders')
      .insert(folderInserts);

    if (folderError) {
      console.error('Error creating data room folders:', folderError);
      throw folderError;
    }

    // Update deal to mark data room as created
    const { error: dealError } = await supabase
      .from('deals')
      .update({
        approval_status: 'draft'
      })
      .eq('id', dealId);

    if (dealError) {
      console.warn('Could not update deal status:', dealError);
    }

    return {
      success: true,
      foldersCreated: folderInserts.length
    };
  } catch (error: any) {
    console.error('Failed to setup data room:', error);
    return {
      success: false,
      error: error.message || 'Failed to create data room'
    };
  }
};

/**
 * Sets up both Due Diligence Tracker and Data Room
 */
export const setupDealSystems = async (
  dealId: string, 
  options: { dueDiligence: boolean; dataRoom: boolean }
): Promise<{
  dueDiligence?: SetupResult;
  dataRoom?: SetupResult;
}> => {
  const results: {
    dueDiligence?: SetupResult;
    dataRoom?: SetupResult;
  } = {};

  if (options.dueDiligence) {
    results.dueDiligence = await setupDueDiligenceTracker(dealId);
  }

  if (options.dataRoom) {
    results.dataRoom = await setupDataRoom(dealId);
  }

  return results;
};
