-- 1. Main categories (10 fixed categories)
CREATE TABLE data_room_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  index_number INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Subfolders (template-based, deal-specific)
CREATE TABLE data_room_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  category_id UUID REFERENCES data_room_categories(id),
  parent_folder_id UUID REFERENCES data_room_folders(id),
  name TEXT NOT NULL,
  index_number TEXT NOT NULL,
  description TEXT,
  is_required BOOLEAN DEFAULT false,
  sort_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Documents
CREATE TABLE data_room_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES data_room_folders(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT,
  file_size BIGINT,
  file_type TEXT,
  mime_type TEXT,
  index_number TEXT,
  status TEXT CHECK (status IN ('pending_review', 'approved', 'rejected')) DEFAULT 'pending_review',
  uploaded_by UUID REFERENCES auth.users(id),
  reviewed_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  version INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Permissions
CREATE TABLE data_room_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('admin', 'seller', 'investor')) NOT NULL,
  can_upload BOOLEAN DEFAULT false,
  can_download BOOLEAN DEFAULT true,
  can_approve BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(deal_id, user_id)
);

-- 5. Templates
CREATE TABLE data_room_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  folder_structure JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Activity log
CREATE TABLE data_room_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  document_id UUID REFERENCES data_room_documents(id) ON DELETE SET NULL,
  folder_id UUID REFERENCES data_room_folders(id) ON DELETE SET NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_dr_documents_deal ON data_room_documents(deal_id);
CREATE INDEX idx_dr_documents_folder ON data_room_documents(folder_id);
CREATE INDEX idx_dr_documents_status ON data_room_documents(status);
CREATE INDEX idx_dr_folders_deal ON data_room_folders(deal_id);
CREATE INDEX idx_dr_folders_category ON data_room_folders(category_id);
CREATE INDEX idx_dr_permissions_deal_user ON data_room_permissions(deal_id, user_id);
CREATE INDEX idx_dr_activity_deal ON data_room_activity(deal_id);

-- Enable RLS
ALTER TABLE data_room_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_room_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_room_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_room_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_room_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_room_activity ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories (public read for authenticated)
CREATE POLICY "Authenticated users can read categories"
  ON data_room_categories FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Admins can manage categories"
  ON data_room_categories FOR ALL
  TO authenticated USING (get_user_role(auth.uid()) = ANY(ARRAY['admin'::user_role, 'super_admin'::user_role]));

-- RLS Policies for folders
CREATE POLICY "Admins can manage all folders"
  ON data_room_folders FOR ALL
  TO authenticated USING (get_user_role(auth.uid()) = ANY(ARRAY['admin'::user_role, 'super_admin'::user_role, 'editor'::user_role]));

CREATE POLICY "Users can read folders for deals they have permission"
  ON data_room_folders FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM data_room_permissions
      WHERE data_room_permissions.deal_id = data_room_folders.deal_id
      AND data_room_permissions.user_id = auth.uid()
    )
  );

-- RLS Policies for documents
CREATE POLICY "Admins can manage all documents"
  ON data_room_documents FOR ALL
  TO authenticated USING (get_user_role(auth.uid()) = ANY(ARRAY['admin'::user_role, 'super_admin'::user_role, 'editor'::user_role]));

CREATE POLICY "Users can read documents for deals they have permission"
  ON data_room_documents FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM data_room_permissions
      WHERE data_room_permissions.deal_id = data_room_documents.deal_id
      AND data_room_permissions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload documents if permitted"
  ON data_room_documents FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM data_room_permissions
      WHERE data_room_permissions.deal_id = data_room_documents.deal_id
      AND data_room_permissions.user_id = auth.uid()
      AND data_room_permissions.can_upload = true
    )
  );

CREATE POLICY "Users can update documents if permitted"
  ON data_room_documents FOR UPDATE
  TO authenticated USING (
    uploaded_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM data_room_permissions
      WHERE data_room_permissions.deal_id = data_room_documents.deal_id
      AND data_room_permissions.user_id = auth.uid()
      AND data_room_permissions.can_approve = true
    )
  );

CREATE POLICY "Users can delete documents if permitted"
  ON data_room_documents FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM data_room_permissions
      WHERE data_room_permissions.deal_id = data_room_documents.deal_id
      AND data_room_permissions.user_id = auth.uid()
      AND data_room_permissions.can_delete = true
    )
  );

-- RLS Policies for permissions
CREATE POLICY "Admins can manage all permissions"
  ON data_room_permissions FOR ALL
  TO authenticated USING (get_user_role(auth.uid()) = ANY(ARRAY['admin'::user_role, 'super_admin'::user_role]));

CREATE POLICY "Users can view their own permissions"
  ON data_room_permissions FOR SELECT
  TO authenticated USING (user_id = auth.uid());

-- RLS Policies for templates
CREATE POLICY "Authenticated users can read templates"
  ON data_room_templates FOR SELECT
  TO authenticated USING (is_active = true);

CREATE POLICY "Admins can manage templates"
  ON data_room_templates FOR ALL
  TO authenticated USING (get_user_role(auth.uid()) = ANY(ARRAY['admin'::user_role, 'super_admin'::user_role]));

-- RLS Policies for activity
CREATE POLICY "Admins can view all activity"
  ON data_room_activity FOR ALL
  TO authenticated USING (get_user_role(auth.uid()) = ANY(ARRAY['admin'::user_role, 'super_admin'::user_role, 'editor'::user_role]));

CREATE POLICY "Users can view activity for their deals"
  ON data_room_activity FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM data_room_permissions
      WHERE data_room_permissions.deal_id = data_room_activity.deal_id
      AND data_room_permissions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can log their own activity"
  ON data_room_activity FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

-- Seed categories
INSERT INTO data_room_categories (index_number, name, description, icon, sort_order) VALUES
(1, 'Corporate & Legal', 'Company formation, licenses, contracts, and legal documents', 'FileText', 1),
(2, 'Financials', 'Financial statements, tax returns, and projections', 'DollarSign', 2),
(3, 'Operations', 'Operational processes, procedures, and vendor relationships', 'Settings', 3),
(4, 'Client Base & Contracts', 'Client information, contracts, and revenue analysis', 'Users', 4),
(5, 'Services & Deliverables', 'Service catalog, case studies, and portfolio', 'Package', 5),
(6, 'Marketing & Sales', 'Marketing materials, sales processes, and brand assets', 'TrendingUp', 6),
(7, 'Revenue & Performance', 'KPIs, metrics, and performance data', 'BarChart', 7),
(8, 'Technology & Integrations', 'Tech stack, architecture, and system documentation', 'Code', 8),
(9, 'Deal Documents', 'LOI, purchase agreement, and closing documents', 'FileCheck', 9),
(10, 'Miscellaneous', 'Additional materials and references', 'FolderOpen', 10);

-- Seed Agency template
INSERT INTO data_room_templates (name, description, folder_structure) VALUES
('Agency', 'Digital marketing and creative agency template', '{
  "categories": [
    {
      "categoryIndex": 1,
      "folders": [
        {"index": "1.1", "name": "Articles of Incorporation & Operating Agreement", "required": true},
        {"index": "1.2", "name": "Business Licenses & Permits", "required": true},
        {"index": "1.3", "name": "Client Contracts & Service Agreements", "required": true},
        {"index": "1.4", "name": "Employment Agreements", "required": true},
        {"index": "1.5", "name": "Insurance Policies (Liability E&O Health)", "required": true},
        {"index": "1.6", "name": "Intellectual Property", "required": false},
        {"index": "1.7", "name": "Legal or Dispute History", "required": false},
        {"index": "1.8", "name": "NDAs & Confidentiality Agreements", "required": true},
        {"index": "1.9", "name": "Office & Lease Agreements", "required": false},
        {"index": "1.10", "name": "Vendor & Contractor Agreements", "required": true}
      ]
    },
    {
      "categoryIndex": 2,
      "folders": [
        {"index": "2.1", "name": "Profit & Loss Statements", "required": true},
        {"index": "2.2", "name": "Balance Sheets", "required": true},
        {"index": "2.3", "name": "Bank Statements", "required": true},
        {"index": "2.4", "name": "Projections & Forecasts", "required": false},
        {"index": "2.5", "name": "Revenue Breakdown", "required": true},
        {"index": "2.6", "name": "Tax Returns", "required": true}
      ]
    },
    {
      "categoryIndex": 3,
      "folders": [
        {"index": "3.1", "name": "Standard Operating Procedures", "required": false},
        {"index": "3.2", "name": "Vendor Relationships", "required": true},
        {"index": "3.3", "name": "Tools & Software Licenses", "required": true},
        {"index": "3.4", "name": "Process Documentation", "required": false}
      ]
    },
    {
      "categoryIndex": 4,
      "folders": [
        {"index": "4.1", "name": "Client List & Revenue by Client", "required": true},
        {"index": "4.2", "name": "Active Contracts", "required": true},
        {"index": "4.3", "name": "Retention Metrics", "required": true},
        {"index": "4.4", "name": "Top Client Case Studies", "required": false}
      ]
    },
    {
      "categoryIndex": 5,
      "folders": [
        {"index": "5.1", "name": "Service Catalog", "required": true},
        {"index": "5.2", "name": "Pricing Structure", "required": true},
        {"index": "5.3", "name": "Portfolio Examples", "required": false},
        {"index": "5.4", "name": "Deliverables Templates", "required": false}
      ]
    },
    {
      "categoryIndex": 6,
      "folders": [
        {"index": "6.1", "name": "Brand Guidelines", "required": false},
        {"index": "6.2", "name": "Marketing Materials", "required": false},
        {"index": "6.3", "name": "Sales Collateral", "required": false},
        {"index": "6.4", "name": "Lead Generation Process", "required": false}
      ]
    },
    {
      "categoryIndex": 7,
      "folders": [
        {"index": "7.1", "name": "Monthly Revenue Reports", "required": true},
        {"index": "7.2", "name": "KPI Dashboards", "required": false},
        {"index": "7.3", "name": "Performance Benchmarks", "required": false}
      ]
    },
    {
      "categoryIndex": 8,
      "folders": [
        {"index": "8.1", "name": "Tech Stack Documentation", "required": true},
        {"index": "8.2", "name": "System Architecture", "required": false},
        {"index": "8.3", "name": "API & Integration Docs", "required": false},
        {"index": "8.4", "name": "Security Policies", "required": true}
      ]
    },
    {
      "categoryIndex": 9,
      "folders": [
        {"index": "9.1", "name": "Letter of Intent", "required": true},
        {"index": "9.2", "name": "Purchase Agreement", "required": true},
        {"index": "9.3", "name": "Closing Documents", "required": true},
        {"index": "9.4", "name": "Transition Plan", "required": false}
      ]
    },
    {
      "categoryIndex": 10,
      "folders": [
        {"index": "10.1", "name": "Additional References", "required": false},
        {"index": "10.2", "name": "Miscellaneous Documents", "required": false}
      ]
    }
  ]
}');

-- RPC function to apply template and create folders for a deal
CREATE OR REPLACE FUNCTION create_data_room_from_template(
  p_deal_id UUID,
  p_template_name TEXT
)
RETURNS void AS $$
DECLARE
  v_template JSONB;
  v_category JSONB;
  v_folder JSONB;
  v_category_id UUID;
BEGIN
  -- Get template
  SELECT folder_structure INTO v_template
  FROM data_room_templates
  WHERE name = p_template_name AND is_active = true;

  IF v_template IS NULL THEN
    RAISE EXCEPTION 'Template not found: %', p_template_name;
  END IF;

  -- Loop through categories
  FOR v_category IN SELECT * FROM jsonb_array_elements(v_template->'categories')
  LOOP
    -- Get category ID
    SELECT id INTO v_category_id
    FROM data_room_categories
    WHERE index_number = (v_category->>'categoryIndex')::INTEGER;

    IF v_category_id IS NULL THEN
      CONTINUE;
    END IF;

    -- Loop through folders in category
    FOR v_folder IN SELECT * FROM jsonb_array_elements(v_category->'folders')
    LOOP
      -- Insert folder
      INSERT INTO data_room_folders (
        deal_id,
        category_id,
        name,
        index_number,
        is_required,
        sort_order
      ) VALUES (
        p_deal_id,
        v_category_id,
        v_folder->>'name',
        v_folder->>'index',
        COALESCE((v_folder->>'required')::BOOLEAN, false),
        CAST(SPLIT_PART(v_folder->>'index', '.', 2) AS INTEGER)
      );
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;