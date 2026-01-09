-- Create enums for diligence tracker
CREATE TYPE diligence_priority AS ENUM ('high', 'medium', 'low');
CREATE TYPE diligence_status AS ENUM ('open', 'in_progress', 'completed', 'blocked');

-- Table: diligence_categories
CREATE TABLE public.diligence_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'folder',
  color TEXT DEFAULT '#5B8CFF',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.diligence_categories ENABLE ROW LEVEL SECURITY;

-- Policies for diligence_categories
CREATE POLICY "Admins can manage categories"
ON public.diligence_categories
FOR ALL
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role, 'editor'::user_role]));

CREATE POLICY "Authenticated users can view categories"
ON public.diligence_categories
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Table: diligence_subcategories
CREATE TABLE public.diligence_subcategories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.diligence_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.diligence_subcategories ENABLE ROW LEVEL SECURITY;

-- Policies for diligence_subcategories
CREATE POLICY "Admins can manage subcategories"
ON public.diligence_subcategories
FOR ALL
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role, 'editor'::user_role]));

CREATE POLICY "Authenticated users can view subcategories"
ON public.diligence_subcategories
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Table: diligence_requests
CREATE TABLE public.diligence_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.diligence_categories(id) ON DELETE CASCADE,
  subcategory_id UUID REFERENCES public.diligence_subcategories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority diligence_priority NOT NULL DEFAULT 'medium',
  status diligence_status NOT NULL DEFAULT 'open',
  assignee_id UUID,
  reviewer_ids UUID[] DEFAULT '{}',
  due_date DATE,
  completion_date DATE,
  document_ids UUID[] DEFAULT '{}',
  notes TEXT,
  order_index INTEGER DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.diligence_requests ENABLE ROW LEVEL SECURITY;

-- Policies for diligence_requests
CREATE POLICY "Admins and staff can manage requests"
ON public.diligence_requests
FOR ALL
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role, 'editor'::user_role]));

CREATE POLICY "Deal assignees can view their requests"
ON public.diligence_requests
FOR SELECT
USING (
  auth.uid() = assignee_id 
  OR auth.uid() = ANY(reviewer_ids)
  OR EXISTS (
    SELECT 1 FROM deal_assignments da 
    WHERE da.deal_id = diligence_requests.deal_id 
    AND da.user_id = auth.uid()
  )
);

-- Table: diligence_templates
CREATE TABLE public.diligence_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  industry TEXT,
  deal_type TEXT,
  template_data JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.diligence_templates ENABLE ROW LEVEL SECURITY;

-- Policies for diligence_templates
CREATE POLICY "Admins can manage templates"
ON public.diligence_templates
FOR ALL
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role, 'editor'::user_role]));

CREATE POLICY "Authenticated users can view templates"
ON public.diligence_templates
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Table: diligence_comments
CREATE TABLE public.diligence_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.diligence_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.diligence_comments ENABLE ROW LEVEL SECURITY;

-- Policies for diligence_comments
CREATE POLICY "Users can view comments on accessible requests"
ON public.diligence_comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM diligence_requests dr
    WHERE dr.id = diligence_comments.request_id
    AND (
      get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role, 'editor'::user_role])
      OR auth.uid() = dr.assignee_id
      OR auth.uid() = ANY(dr.reviewer_ids)
    )
  )
);

CREATE POLICY "Authenticated users can create comments"
ON public.diligence_comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at on diligence_requests
CREATE TRIGGER update_diligence_requests_updated_at
BEFORE UPDATE ON public.diligence_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_diligence_requests_deal_id ON public.diligence_requests(deal_id);
CREATE INDEX idx_diligence_requests_category_id ON public.diligence_requests(category_id);
CREATE INDEX idx_diligence_requests_status ON public.diligence_requests(status);
CREATE INDEX idx_diligence_requests_assignee_id ON public.diligence_requests(assignee_id);
CREATE INDEX idx_diligence_subcategories_category_id ON public.diligence_subcategories(category_id);
CREATE INDEX idx_diligence_comments_request_id ON public.diligence_comments(request_id);

-- Insert default categories
INSERT INTO public.diligence_categories (name, icon, color, order_index) VALUES
('Financial', 'bar-chart-3', '#5B8CFF', 1),
('Legal', 'scale', '#8B5CF6', 2),
('Tax', 'receipt', '#10B981', 3),
('Human Resources', 'users', '#F59E0B', 4),
('Operations', 'settings', '#EC4899', 5),
('Technology', 'cpu', '#06B6D4', 6),
('Commercial', 'shopping-cart', '#EF4444', 7),
('Environmental', 'leaf', '#22C55E', 8);

-- Insert default subcategories
INSERT INTO public.diligence_subcategories (category_id, name, order_index)
SELECT c.id, s.name, s.order_index
FROM public.diligence_categories c
CROSS JOIN (VALUES 
  ('Financial', 'Historical Financials', 1),
  ('Financial', 'Revenue & Metrics', 2),
  ('Financial', 'Accounts Receivable', 3),
  ('Financial', 'Accounts Payable', 4),
  ('Legal', 'Corporate Documents', 1),
  ('Legal', 'Contracts & Agreements', 2),
  ('Legal', 'Intellectual Property', 3),
  ('Legal', 'Litigation', 4),
  ('Tax', 'Tax Returns', 1),
  ('Tax', 'Tax Compliance', 2),
  ('Human Resources', 'Employee Records', 1),
  ('Human Resources', 'Benefits & Compensation', 2),
  ('Human Resources', 'Policies', 3),
  ('Operations', 'Facilities', 1),
  ('Operations', 'Equipment & Assets', 2),
  ('Operations', 'Inventory', 3),
  ('Technology', 'Infrastructure', 1),
  ('Technology', 'Software & Systems', 2),
  ('Technology', 'Security', 3),
  ('Commercial', 'Customer Data', 1),
  ('Commercial', 'Sales & Marketing', 2),
  ('Environmental', 'Compliance', 1),
  ('Environmental', 'Permits', 2)
) AS s(category_name, name, order_index)
WHERE c.name = s.category_name;

-- Insert default SaaS template
INSERT INTO public.diligence_templates (name, description, industry, deal_type, is_default, template_data) VALUES
('Standard SaaS Due Diligence', 'Comprehensive due diligence checklist for SaaS businesses', 'SaaS', 'Asset Purchase', true, '{
  "categories": [
    {
      "name": "Financial",
      "requests": [
        {"title": "Audited Financial Statements (Last 3 Years)", "priority": "high", "description": "Complete audited financials including balance sheet, P&L, and cash flow statements"},
        {"title": "Monthly P&L Statements (Last 24 Months)", "priority": "high", "description": "Detailed monthly profit and loss statements"},
        {"title": "Monthly Recurring Revenue (MRR) Report", "priority": "high", "description": "Historical MRR with breakdown by plan/tier"},
        {"title": "Annual Recurring Revenue (ARR) Analysis", "priority": "high", "description": "ARR trends and projections"},
        {"title": "Churn Analysis Report", "priority": "high", "description": "Customer churn rates, revenue churn, and cohort analysis"},
        {"title": "Customer Acquisition Cost (CAC) Analysis", "priority": "medium", "description": "CAC by channel and trends over time"},
        {"title": "Lifetime Value (LTV) Analysis", "priority": "medium", "description": "Customer LTV calculations and trends"},
        {"title": "Cash Flow Projections", "priority": "medium", "description": "12-month cash flow forecast"},
        {"title": "Accounts Receivable Aging Report", "priority": "medium", "description": "Current AR aging schedule"},
        {"title": "Revenue Recognition Policy", "priority": "medium", "description": "Documentation of revenue recognition practices"}
      ]
    },
    {
      "name": "Legal",
      "requests": [
        {"title": "Articles of Incorporation", "priority": "high", "description": "Current articles of incorporation and amendments"},
        {"title": "Bylaws", "priority": "high", "description": "Current corporate bylaws"},
        {"title": "Board Minutes (Last 3 Years)", "priority": "medium", "description": "All board meeting minutes"},
        {"title": "Cap Table", "priority": "high", "description": "Fully diluted capitalization table"},
        {"title": "Stock Option Plan Documents", "priority": "high", "description": "All equity incentive plan documents"},
        {"title": "Customer Contracts (Top 20)", "priority": "high", "description": "Contracts with top 20 customers by revenue"},
        {"title": "Vendor Contracts", "priority": "medium", "description": "All material vendor agreements"},
        {"title": "Terms of Service", "priority": "high", "description": "Current customer terms of service"},
        {"title": "Privacy Policy", "priority": "high", "description": "Current privacy policy"},
        {"title": "Pending Litigation Summary", "priority": "high", "description": "Summary of any pending or threatened litigation"}
      ]
    },
    {
      "name": "Technology",
      "requests": [
        {"title": "System Architecture Documentation", "priority": "high", "description": "Technical architecture diagrams and documentation"},
        {"title": "Source Code Repository Access", "priority": "high", "description": "Access to code repositories for review"},
        {"title": "Infrastructure Overview", "priority": "high", "description": "Cloud infrastructure and hosting details"},
        {"title": "Security Audit Reports", "priority": "high", "description": "Recent security audits and penetration test results"},
        {"title": "SOC 2 Compliance Report", "priority": "high", "description": "Current SOC 2 Type II report if available"},
        {"title": "Third-Party Integrations List", "priority": "medium", "description": "All third-party services and APIs used"},
        {"title": "Technical Debt Assessment", "priority": "medium", "description": "Known technical debt and remediation plans"},
        {"title": "Disaster Recovery Plan", "priority": "medium", "description": "Business continuity and DR documentation"}
      ]
    },
    {
      "name": "Human Resources",
      "requests": [
        {"title": "Organizational Chart", "priority": "high", "description": "Current org chart with all positions"},
        {"title": "Employee Census", "priority": "high", "description": "List of all employees with roles, start dates, compensation"},
        {"title": "Key Employee Contracts", "priority": "high", "description": "Employment agreements for key personnel"},
        {"title": "Contractor Agreements", "priority": "medium", "description": "All independent contractor agreements"},
        {"title": "Employee Handbook", "priority": "medium", "description": "Current employee handbook and policies"},
        {"title": "Benefits Summary", "priority": "medium", "description": "Overview of all employee benefits"}
      ]
    }
  ]
}'::jsonb),
('E-commerce Due Diligence', 'Due diligence checklist for e-commerce businesses', 'E-commerce', 'Asset Purchase', true, '{
  "categories": [
    {
      "name": "Financial",
      "requests": [
        {"title": "Audited Financial Statements (Last 3 Years)", "priority": "high", "description": "Complete audited financials"},
        {"title": "Sales by Channel Report", "priority": "high", "description": "Revenue breakdown by sales channel"},
        {"title": "Gross Margin Analysis by SKU", "priority": "high", "description": "Product-level profitability analysis"},
        {"title": "Inventory Valuation Report", "priority": "high", "description": "Current inventory with valuation method"},
        {"title": "Customer Acquisition Cost by Channel", "priority": "medium", "description": "Marketing spend and CAC analysis"}
      ]
    },
    {
      "name": "Operations",
      "requests": [
        {"title": "Supplier Agreements", "priority": "high", "description": "All supplier and manufacturer contracts"},
        {"title": "Fulfillment Operations Overview", "priority": "high", "description": "Warehouse and fulfillment documentation"},
        {"title": "Shipping Carrier Agreements", "priority": "medium", "description": "All shipping and logistics contracts"},
        {"title": "Returns Policy and Metrics", "priority": "medium", "description": "Return rates and policy documentation"}
      ]
    },
    {
      "name": "Commercial",
      "requests": [
        {"title": "Customer Database Export", "priority": "high", "description": "Anonymized customer data for analysis"},
        {"title": "Top 100 Customers Analysis", "priority": "high", "description": "Revenue concentration analysis"},
        {"title": "Marketing Strategy Documentation", "priority": "medium", "description": "Current marketing plans and performance"}
      ]
    }
  ]
}'::jsonb),
('Digital Agency Due Diligence', 'Due diligence checklist for digital agencies and service businesses', 'Digital Agency', 'Asset Purchase', true, '{
  "categories": [
    {
      "name": "Financial",
      "requests": [
        {"title": "Audited Financial Statements (Last 3 Years)", "priority": "high", "description": "Complete audited financials"},
        {"title": "Revenue by Client Report", "priority": "high", "description": "Revenue breakdown by client"},
        {"title": "Project Profitability Analysis", "priority": "high", "description": "Margin analysis by project type"},
        {"title": "Utilization Reports", "priority": "medium", "description": "Staff utilization and billable hours data"}
      ]
    },
    {
      "name": "Commercial",
      "requests": [
        {"title": "Client Contracts (All Active)", "priority": "high", "description": "All active client service agreements"},
        {"title": "Client Concentration Analysis", "priority": "high", "description": "Revenue dependency analysis"},
        {"title": "Retainer Agreements", "priority": "high", "description": "All recurring retainer contracts"},
        {"title": "Pipeline Report", "priority": "medium", "description": "Current sales pipeline and proposals"}
      ]
    },
    {
      "name": "Human Resources",
      "requests": [
        {"title": "Employee Skills Matrix", "priority": "high", "description": "Team capabilities and certifications"},
        {"title": "Contractor Relationships", "priority": "high", "description": "All freelancer and contractor details"},
        {"title": "Key Person Dependencies", "priority": "high", "description": "Analysis of key personnel risks"}
      ]
    }
  ]
}'::jsonb);