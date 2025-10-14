-- Create widget_settings table for comprehensive chat widget customization
CREATE TABLE widget_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Appearance
  widget_position text DEFAULT 'bottom-right' CHECK (widget_position IN ('bottom-right', 'bottom-left')),
  primary_color text DEFAULT '#D4AF37',
  widget_size text DEFAULT 'medium' CHECK (widget_size IN ('small', 'medium', 'large')),
  bubble_style text DEFAULT 'circle' CHECK (bubble_style IN ('circle', 'rounded-square')),
  
  -- Behavior
  auto_open_enabled boolean DEFAULT false,
  auto_open_delay integer DEFAULT 5000,
  show_online_status boolean DEFAULT true,
  enable_typing_indicators boolean DEFAULT true,
  enable_file_attachments boolean DEFAULT true,
  enable_emojis boolean DEFAULT true,
  
  -- Greeting Messages
  initial_greeting text DEFAULT 'Hi! Have questions about a deal? We''re here to help.',
  away_message text DEFAULT 'We''re currently offline. Leave a message and we''ll respond soon.',
  
  -- Button Labels
  ask_button_label text DEFAULT 'Ask Question',
  info_button_label text DEFAULT 'Request Info',
  interest_button_label text DEFAULT 'Express Interest',
  call_button_label text DEFAULT 'Schedule Call',
  
  -- Info Request Options (JSON array)
  info_request_options jsonb DEFAULT '[
    "Financial Statements (last 3 years)",
    "Customer/Revenue breakdown",
    "Operating metrics",
    "Cap table and ownership",
    "Growth strategy",
    "Team information"
  ]'::jsonb,
  
  -- Call Scheduling
  calendly_link text,
  enable_manual_scheduling boolean DEFAULT true,
  
  -- Notifications
  broker_email_notifications boolean DEFAULT true,
  investor_email_notifications boolean DEFAULT true,
  
  -- Widget Text Customization
  widget_title text DEFAULT 'Chat with Broker Team',
  placeholder_text text DEFAULT 'Type your message...',
  minimized_tooltip text DEFAULT 'Chat with us',
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE widget_settings ENABLE ROW LEVEL SECURITY;

-- Admins can manage widget settings
CREATE POLICY "Admins can manage widget settings"
ON widget_settings
FOR ALL
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Authenticated users can view widget settings
CREATE POLICY "Authenticated users can view widget settings"
ON widget_settings
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Insert default settings
INSERT INTO widget_settings (id) VALUES (gen_random_uuid());

-- Create trigger for updated_at
CREATE TRIGGER update_widget_settings_updated_at
BEFORE UPDATE ON widget_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create info_requests table for tracking information requests
CREATE TABLE info_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  investor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_items text[] NOT NULL,
  additional_notes text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'declined')),
  created_at timestamptz DEFAULT now(),
  fulfilled_at timestamptz,
  fulfilled_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE info_requests ENABLE ROW LEVEL SECURITY;

-- Investors can create their own requests
CREATE POLICY "Investors can create info requests"
ON info_requests
FOR INSERT
WITH CHECK (auth.uid() = investor_id);

-- Investors can view their own requests
CREATE POLICY "Investors can view their own requests"
ON info_requests
FOR SELECT
USING (auth.uid() = investor_id);

-- Admins can manage all requests
CREATE POLICY "Admins can manage info requests"
ON info_requests
FOR ALL
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]));

-- Create deal_interests table
CREATE TABLE deal_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  investor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  notes text,
  UNIQUE(deal_id, investor_id)
);

-- Enable RLS
ALTER TABLE deal_interests ENABLE ROW LEVEL SECURITY;

-- Investors can express interest
CREATE POLICY "Investors can express interest"
ON deal_interests
FOR INSERT
WITH CHECK (auth.uid() = investor_id);

-- Investors can view their own interests
CREATE POLICY "Investors can view their own interests"
ON deal_interests
FOR SELECT
USING (auth.uid() = investor_id);

-- Admins can view all interests
CREATE POLICY "Admins can view all interests"
ON deal_interests
FOR SELECT
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]));

-- Create call_requests table
CREATE TABLE call_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  investor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_date date,
  preferred_time time,
  alternative_times text,
  additional_message text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  scheduled_at timestamptz,
  scheduled_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE call_requests ENABLE ROW LEVEL SECURITY;

-- Investors can create call requests
CREATE POLICY "Investors can create call requests"
ON call_requests
FOR INSERT
WITH CHECK (auth.uid() = investor_id);

-- Investors can view their own requests
CREATE POLICY "Investors can view their own requests"
ON call_requests
FOR SELECT
USING (auth.uid() = investor_id);

-- Admins can manage call requests
CREATE POLICY "Admins can manage call requests"
ON call_requests
FOR ALL
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]));