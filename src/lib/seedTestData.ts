import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const seedTestData = async () => {
  console.log('🌱 Starting test data seed...');
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Must be logged in as admin to seed data');
      return { success: false, error: 'Not authenticated' };
    }

    // Check if test deals already exist
    const { data: existingTestDeals } = await supabase
      .from('deals')
      .select('id')
      .eq('is_test_data', true);

    if (existingTestDeals && existingTestDeals.length > 0) {
      toast.error(`${existingTestDeals.length} test deals already exist. Clear them first to avoid duplicates.`);
      return { success: false, message: 'Test data already exists' };
    }

    // Create test deals with actual schema fields
    const testDeals = [
      {
        title: 'Blue Soft Websites - Digital Agency',
        company_name: 'Blue Soft Websites',
        industry: 'Digital Agency',
        description: '166 Subscriptions | 32 New in July | <1% Churn | Recurring Engine. This is a rare opportunity to acquire a profitable digital agency with sticky recurring revenue, exclusive partnerships, and a proven track record. Founded in 2020, the company now supports 166 active and pending subscriptions with churn under 1% — a powerful foundation of predictable income and strong client retention.',
        company_overview: 'Blue Soft Websites is a thriving digital agency specializing in website subscriptions for service-based businesses. The company has built a loyal customer base of 166 active subscriptions with minimal churn, creating highly predictable recurring revenue.',
        revenue: '$300,000',
        ebitda: '$110,000',
        asking_price: '$300,000',
        status: 'active' as const,
        location: 'Phoenix, AZ (Maricopa County)',
        priority: 'high',
        founded_year: 2020,
        team_size: '5-10 employees',
        growth_opportunities: JSON.stringify([
          'Add marketing services to existing clients',
          'Expand to additional verticals beyond service businesses',
          'Hire dedicated sales team for outbound growth'
        ]),
        reason_for_sale: 'Founder pursuing new opportunity',
        is_test_data: true,
        created_by: user.id
      },
      {
        title: 'CloudTech SaaS - Project Management Platform',
        company_name: 'CloudTech SaaS',
        industry: 'SaaS',
        description: 'B2B project management platform serving mid-market companies. 500+ paying customers with 95% annual retention rate. Strong product-market fit with minimal churn.',
        company_overview: 'CloudTech is a profitable B2B SaaS company offering project management software to mid-market businesses. The platform has achieved strong product-market fit with excellent retention metrics.',
        revenue: '$1,200,000',
        ebitda: '$400,000',
        asking_price: '$2,000,000',
        status: 'active' as const,
        location: 'Austin, TX',
        priority: 'high',
        founded_year: 2018,
        team_size: '10-20 employees',
        growth_opportunities: JSON.stringify([
          'Launch enterprise tier for larger companies',
          'Build API marketplace for integrations',
          'International expansion to European markets'
        ]),
        reason_for_sale: 'Founder ready to exit after successful scale',
        profit_margin: '33%',
        is_test_data: true,
        created_by: user.id
      },
      {
        title: 'EcomBrand Direct - Sustainable Home Goods',
        company_name: 'EcomBrand Direct',
        industry: 'E-commerce',
        description: 'Direct-to-consumer brand selling sustainable home goods. Strong presence on Amazon and Shopify with growing social media following.',
        company_overview: 'EcomBrand Direct is a D2C e-commerce brand focused on sustainable home products. The company sells through multiple channels including Amazon, Shopify, and has a strong social media presence with engaged followers.',
        revenue: '$800,000',
        ebitda: '$250,000',
        asking_price: '$1,000,000',
        status: 'active' as const,
        location: 'Los Angeles, CA',
        priority: 'medium',
        founded_year: 2020,
        team_size: '5-10 employees',
        growth_opportunities: JSON.stringify([
          'Establish retail partnerships with major chains',
          'Expand product line into adjacent categories',
          'Launch subscription box service'
        ]),
        reason_for_sale: 'Founder pivoting to new venture',
        profit_margin: '31%',
        is_test_data: true,
        created_by: user.id
      },
      {
        title: 'Marketing Agency Pro - Full-Service Digital',
        company_name: 'Marketing Agency Pro',
        industry: 'Marketing Agency',
        description: 'Full-service digital marketing agency specializing in local businesses. Established client base with long-term contracts.',
        company_overview: 'Marketing Agency Pro provides comprehensive digital marketing services to local businesses. The agency has built strong client relationships with an average contract length of 2+ years.',
        revenue: '$450,000',
        ebitda: '$135,000',
        asking_price: '$500,000',
        status: 'active' as const,
        location: 'Denver, CO',
        priority: 'medium',
        founded_year: 2017,
        team_size: '10-20 employees',
        growth_opportunities: JSON.stringify([
          'Scale team to take on larger clients',
          'Add specialized SEO and content services',
          'Expand to additional geographic markets'
        ]),
        reason_for_sale: 'Retirement',
        profit_margin: '30%',
        is_test_data: true,
        created_by: user.id
      },
      {
        title: 'FitnessTech App - Mobile Fitness Coaching',
        company_name: 'FitnessTech App',
        industry: 'Mobile App',
        description: 'Fitness tracking and coaching mobile app with subscription model. Growing user base and strong engagement metrics.',
        company_overview: 'FitnessTech is a mobile fitness app offering tracking and coaching features. The freemium model has successfully converted users to paid subscriptions with strong engagement and retention.',
        revenue: '$600,000',
        ebitda: '$200,000',
        asking_price: '$900,000',
        status: 'active' as const,
        location: 'Miami, FL',
        priority: 'high',
        founded_year: 2019,
        team_size: '5-10 employees',
        growth_opportunities: JSON.stringify([
          'Corporate wellness partnerships',
          'Integration with popular wearable devices',
          'Add nutrition tracking and meal planning'
        ]),
        reason_for_sale: 'Founder starting new business',
        profit_margin: '33%',
        is_test_data: true,
        created_by: user.id
      }
    ];

    const { data: createdDeals, error: dealsError } = await supabase
      .from('deals')
      .insert(testDeals)
      .select();

    if (dealsError) throw dealsError;
    console.log('✅ Created', createdDeals?.length, 'test deals (safely marked with is_test_data flag)');

    // Create NDA settings in platform_settings
    const ndaSettings = {
      key: 'nda_settings',
      value: {
        master_nda_content: `MASTER NON-DISCLOSURE AGREEMENT

This Agreement is entered into on {{date}}

BETWEEN:
Exclusive Business Brokers, located at [Address] ("Disclosing Party")

AND:
{{investor_name}} ("Receiving Party")
Email: {{investor_email}}
Company: {{investor_company}}

WHEREAS the Disclosing Party possesses confidential information regarding multiple business opportunities available for acquisition;

NOW THEREFORE, in consideration of the mutual covenants contained herein, the parties agree as follows:

1. CONFIDENTIAL INFORMATION
The Receiving Party acknowledges that they will receive confidential business information including but not limited to:
- Financial statements and projections
- Customer and vendor lists
- Operational procedures and trade secrets
- Strategic plans and pricing information
- Proprietary systems and technology

2. OBLIGATIONS OF RECEIVING PARTY
The Receiving Party agrees to:
a) Keep all Confidential Information strictly confidential
b) Not disclose any Confidential Information to third parties without prior written consent
c) Use Confidential Information solely for evaluation purposes
d) Protect Confidential Information with the same degree of care used for own confidential information
e) Not reverse engineer, decompile, or attempt to derive source information
f) Return or destroy all Confidential Information upon request

3. EXCLUSIONS
This Agreement does not apply to information that:
a) Is already known to the Receiving Party
b) Becomes publicly available through no breach of this Agreement
c) Is independently developed by the Receiving Party
d) Is rightfully received from a third party

4. TERM
This Agreement shall remain in effect for 60 days from the date of signature, and may be extended by mutual written agreement.

5. NO LICENSE
Nothing in this Agreement grants any license or rights to the Receiving Party in any Confidential Information.

6. REMEDIES
The Receiving Party acknowledges that breach of this Agreement may cause irreparable harm, and the Disclosing Party shall be entitled to equitable relief including injunction.

7. GOVERNING LAW
This Agreement shall be governed by the laws of [State/Country].

By signing below, the Receiving Party acknowledges they have read, understood, and agree to be bound by this Agreement.

ELECTRONIC SIGNATURE:
{{signature}}
Date: {{date}}
Time: {{timestamp}}
IP Address: {{ip_address}}`,
        single_deal_nda_content: `NON-DISCLOSURE AGREEMENT

This Agreement is entered into on {{date}}

BETWEEN:
Exclusive Business Brokers ("Disclosing Party")

AND:
{{investor_name}} ("Receiving Party")
Email: {{investor_email}}

REGARDING: {{deal_name}}
Asking Price: {{asking_price}}

The Receiving Party wishes to receive confidential information about the above-referenced business opportunity.

[Standard NDA terms - similar structure to Master NDA]

ELECTRONIC SIGNATURE:
{{signature}}
Date: {{date}}`,
        default_expiry_days: 60,
        auto_expire_enabled: true,
        require_signature: true,
        send_expiry_warnings: true,
        warning_days_before: 7
      },
      updated_by: user.id
    };

    const { error: settingsError } = await supabase
      .from('platform_settings')
      .upsert(ndaSettings);

    if (settingsError) throw settingsError;
    console.log('✅ Created NDA settings');

    toast.success(`Created ${createdDeals?.length} test deals (safely marked)!`, { duration: 5000 });
    
    return {
      success: true,
      message: `Created ${createdDeals?.length} deals and configured NDA settings`
    };

  } catch (error) {
    console.error('❌ Seed failed:', error);
    toast.error('Failed to create test data: ' + (error as Error).message);
    return { success: false, error };
  }
};
