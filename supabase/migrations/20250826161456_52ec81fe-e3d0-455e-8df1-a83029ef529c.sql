
-- Create settings table for global system settings
CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create growth opportunities lookup table
CREATE TABLE IF NOT EXISTS public.growth_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create junction table for company growth opportunities
CREATE TABLE IF NOT EXISTS public.company_growth_opps (
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  growth_id UUID REFERENCES growth_opportunities(id) ON DELETE CASCADE,
  note TEXT,
  PRIMARY KEY(company_id, growth_id)
);

-- Create custom fields definition table
CREATE TABLE IF NOT EXISTS public.company_custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text','textarea','number','currency','date','boolean')),
  is_required BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create custom field values table
CREATE TABLE IF NOT EXISTS public.company_custom_values (
  field_id UUID REFERENCES company_custom_fields(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  value JSONB,
  PRIMARY KEY(field_id, company_id)
);

-- Add updated_at trigger for settings table
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER settings_updated_at_trigger
  BEFORE UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_updated_at();

-- Enable RLS on all tables
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_growth_opps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_custom_values ENABLE ROW LEVEL SECURITY;

-- RLS Policies for settings (admin only)
CREATE POLICY "Admins can manage settings" ON public.settings
  FOR ALL USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- RLS Policies for growth opportunities (admin can manage, all can view active)
CREATE POLICY "Admins can manage growth opportunities" ON public.growth_opportunities
  FOR ALL USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Users can view active growth opportunities" ON public.growth_opportunities
  FOR SELECT USING (is_active = true);

-- RLS Policies for company growth opportunities (based on company access)
CREATE POLICY "Users can manage company growth opps based on company access" ON public.company_growth_opps
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM companies c 
      WHERE c.id = company_id 
      AND (
        c.owner_id = auth.uid() 
        OR get_user_role(auth.uid()) = 'admin'::user_role 
        OR get_user_role(auth.uid()) = 'editor'::user_role
      )
    )
  );

CREATE POLICY "Users can view company growth opps for accessible companies" ON public.company_growth_opps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM companies c 
      WHERE c.id = company_id 
      AND c.is_draft = false
    )
  );

-- RLS Policies for custom fields (admin can manage, all can view active)
CREATE POLICY "Admins can manage custom fields" ON public.company_custom_fields
  FOR ALL USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Users can view active custom fields" ON public.company_custom_fields
  FOR SELECT USING (is_active = true);

-- RLS Policies for custom values (based on company access)
CREATE POLICY "Users can manage custom values based on company access" ON public.company_custom_values
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM companies c 
      WHERE c.id = company_id 
      AND (
        c.owner_id = auth.uid() 
        OR get_user_role(auth.uid()) = 'admin'::user_role 
        OR get_user_role(auth.uid()) = 'editor'::user_role
      )
    )
  );

CREATE POLICY "Users can view custom values for accessible companies" ON public.company_custom_values
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM companies c 
      WHERE c.id = company_id 
      AND c.is_draft = false
    )
  );

-- Insert some default growth opportunities
INSERT INTO public.growth_opportunities (title, description, tags) VALUES
  ('Digital Marketing Expansion', 'Opportunity to expand digital marketing efforts and online presence', ARRAY['marketing', 'digital']),
  ('Product Line Extension', 'Potential to add complementary products or services', ARRAY['product', 'expansion']),
  ('Geographic Expansion', 'Opportunity to expand into new markets or regions', ARRAY['geographic', 'expansion']),
  ('Operational Efficiency', 'Improvements in processes and operational efficiency', ARRAY['operations', 'efficiency']),
  ('Technology Upgrade', 'Modernization of technology stack and systems', ARRAY['technology', 'modernization']),
  ('Strategic Partnerships', 'Potential for strategic partnerships or alliances', ARRAY['partnerships', 'strategy'])
ON CONFLICT (id) DO NOTHING;

-- Insert some default custom fields
INSERT INTO public.company_custom_fields (key, label, type, is_required) VALUES
  ('founder_commitment', 'Founder Commitment Period', 'text', false),
  ('key_employees', 'Key Employee Count', 'number', false),
  ('customer_concentration', 'Top Customer % of Revenue', 'number', false),
  ('recurring_contracts', 'Recurring Contract %', 'number', false),
  ('capex_requirements', 'Annual CapEx Requirements', 'currency', false),
  ('regulatory_compliance', 'Regulatory Compliance Notes', 'textarea', false)
ON CONFLICT (key) DO NOTHING;
