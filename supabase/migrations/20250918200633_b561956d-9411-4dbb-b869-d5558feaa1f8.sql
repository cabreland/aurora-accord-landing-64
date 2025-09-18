-- Create registration settings table
CREATE TABLE public.registration_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL,
  setting_type text NOT NULL DEFAULT 'json',
  category text NOT NULL DEFAULT 'general',
  display_name text NOT NULL,
  description text,
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.registration_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage registration settings" 
ON public.registration_settings 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Authenticated users can view registration settings" 
ON public.registration_settings 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Create index for better performance
CREATE INDEX idx_registration_settings_key ON public.registration_settings(setting_key);
CREATE INDEX idx_registration_settings_category ON public.registration_settings(category);

-- Create trigger for updated_at
CREATE TRIGGER update_registration_settings_updated_at
  BEFORE UPDATE ON public.registration_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default registration settings
INSERT INTO public.registration_settings (setting_key, setting_value, setting_type, category, display_name, description) VALUES
-- NDA Content Settings
('nda_master_title', '"Master Non-Disclosure Agreement"', 'text', 'nda', 'Master NDA Title', 'Title for master NDA documents'),
('nda_single_title', '"Non-Disclosure Agreement"', 'text', 'nda', 'Single Deal NDA Title', 'Title for single deal NDA documents'),
('nda_master_content', '"EXCLUSIVE BUSINESS BROKERS, INC.\nMASTER NON-DISCLOSURE AGREEMENT\n\nThis Master Non-Disclosure Agreement (\"Agreement\") is entered into between Exclusive Business Brokers, Inc. (\"Disclosing Party\") and the undersigned (\"Receiving Party\") to facilitate the evaluation of confidential business information across multiple investment opportunities.\n\n1. CONFIDENTIAL INFORMATION\n\"Confidential Information\" includes all financial statements, business plans, customer lists, supplier information, operational data, proprietary processes, marketing strategies, and any other business information disclosed by the Disclosing Party or its clients.\n\n2. OBLIGATIONS OF RECEIVING PARTY\nThe Receiving Party agrees to:\n• Hold all Confidential Information in strict confidence\n• Use Confidential Information solely for the purpose of evaluating potential investment opportunities\n• Not disclose Confidential Information to any third party without prior written consent\n• Limit access to Confidential Information to authorized personnel with a legitimate need to know\n• Return or destroy all Confidential Information upon request\n\n3. PERMITTED DISCLOSURES\nConfidential Information may be disclosed if required by law, court order, or government regulation, provided the Receiving Party gives prompt written notice to allow the Disclosing Party to seek protective measures.\n\n4. TERM AND SURVIVAL\nThis Agreement remains in effect indefinitely. The obligations of confidentiality shall survive termination of this Agreement and continue in perpetuity.\n\n5. REMEDIES\nThe Receiving Party acknowledges that breach of this Agreement would cause irreparable harm and agrees that the Disclosing Party shall be entitled to injunctive relief and monetary damages.\n\n6. GOVERNING LAW\nThis Agreement shall be governed by the laws of the jurisdiction where Exclusive Business Brokers, Inc. is domiciled.\n\nBy signing below, the Receiving Party acknowledges reading, understanding, and agreeing to be bound by all terms of this Agreement."', 'richtext', 'nda', 'Master NDA Content', 'Full text content for master NDA agreements'),
('nda_single_content', '"EXCLUSIVE BUSINESS BROKERS, INC.\nNON-DISCLOSURE AGREEMENT\n\nThis Non-Disclosure Agreement (\"Agreement\") is entered into between Exclusive Business Brokers, Inc. (\"Disclosing Party\") and the undersigned (\"Receiving Party\") regarding confidential information related to a specific business opportunity.\n\n1. PURPOSE\nThe Disclosing Party wishes to disclose certain confidential information to the Receiving Party for the sole purpose of evaluating a potential business acquisition or investment opportunity.\n\n2. CONFIDENTIAL INFORMATION\n\"Confidential Information\" includes, but is not limited to:\n• Financial statements, tax returns, and accounting records\n• Business plans, forecasts, and projections\n• Customer and supplier lists and contracts\n• Employee information and compensation data\n• Proprietary processes, systems, and trade secrets\n• Marketing strategies and competitive information\n• Any other information marked or identified as confidential\n\n3. RECEIVING PARTY OBLIGATIONS\nThe Receiving Party covenants and agrees to:\n• Maintain the confidentiality of all Confidential Information\n• Use Confidential Information solely for evaluation purposes\n• Not disclose Confidential Information to any unauthorized person\n• Limit access to Confidential Information to authorized representatives\n• Exercise the same degree of care as with their own confidential information\n• Not make copies of any materials without written permission\n• Return or destroy all Confidential Information upon request\n\n4. EXCEPTIONS\nThe obligations of confidentiality shall not apply to information that:\n• Is or becomes publicly available through no breach of this Agreement\n• Was known to the Receiving Party prior to disclosure\n• Is independently developed without use of Confidential Information\n• Is required to be disclosed by law or court order\n\n5. TERM\nThis Agreement shall remain in effect indefinitely unless terminated by mutual written consent.\n\n6. REMEDIES\nThe Receiving Party acknowledges that any breach of this Agreement would cause irreparable harm to the Disclosing Party and agrees that the Disclosing Party shall be entitled to seek injunctive relief and monetary damages.\n\n7. GOVERNING LAW\nThis Agreement shall be governed by and construed in accordance with applicable state and federal laws.\n\nThe Receiving Party acknowledges that they have read, understood, and agree to be bound by all terms and conditions of this Agreement."', 'richtext', 'nda', 'Single Deal NDA Content', 'Full text content for single deal NDA agreements'),

-- Company Information Settings
('company_name', '"Exclusive Business Brokers, Inc."', 'text', 'company', 'Company Name', 'Legal name of the disclosing party'),
('company_address', '{"street": "123 Business Ave", "city": "New York", "state": "NY", "zip": "10001", "country": "USA"}', 'json', 'company', 'Company Address', 'Complete address of the company'),
('company_contact', '{"phone": "+1 (555) 123-4567", "email": "legal@exclusivebb.com", "website": "https://exclusivebb.com"}', 'json', 'company', 'Contact Information', 'Phone, email, and website'),

-- Registration Form Fields
('required_fields', '["email", "password", "firstName", "lastName", "investorType"]', 'json', 'form', 'Required Fields', 'List of required form fields'),
('optional_fields', '["companyName", "phoneNumber"]', 'json', 'form', 'Optional Fields', 'List of optional form fields'),
('investor_types', '[{"value": "individual", "label": "Individual Investor"}, {"value": "fund", "label": "Investment Fund"}, {"value": "institution", "label": "Institution"}, {"value": "family_office", "label": "Family Office"}, {"value": "other", "label": "Other"}]', 'json', 'form', 'Investor Types', 'Available investor type options'),

-- Email Templates
('welcome_email_subject', '"Welcome to the Investor Portal"', 'text', 'email', 'Welcome Email Subject', 'Subject line for welcome emails'),
('welcome_email_content', '"<h1>Welcome to our Investor Portal!</h1><p>Thank you for completing your registration. Your account has been created and you now have access to our exclusive investment opportunities.</p><p>You can access your dashboard at any time to view available deals and manage your profile.</p><p>If you have any questions, please don''t hesitate to contact our team.</p><p>Best regards,<br>The Investment Team</p>"', 'richtext', 'email', 'Welcome Email Content', 'HTML content for welcome emails'),

-- Validation Rules
('password_requirements', '{"minLength": 8, "requireUppercase": true, "requireLowercase": true, "requireNumbers": true, "requireSpecialChars": true}', 'json', 'validation', 'Password Requirements', 'Password validation criteria');