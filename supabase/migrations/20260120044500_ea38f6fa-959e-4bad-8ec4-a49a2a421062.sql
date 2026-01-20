-- Create enum for financing application stages
CREATE TYPE public.financing_stage AS ENUM (
  'pre_qualification',
  'application_submitted',
  'under_review',
  'additional_docs_requested',
  'conditional_approval',
  'final_approval',
  'closing',
  'funded',
  'declined',
  'withdrawn'
);

-- Create enum for financing types
CREATE TYPE public.financing_type AS ENUM (
  'sba_7a',
  'sba_504',
  'conventional',
  'seller_financing',
  'mezzanine',
  'equity',
  'bridge',
  'line_of_credit',
  'other'
);

-- Create enum for condition status
CREATE TYPE public.condition_status AS ENUM (
  'pending',
  'in_progress',
  'submitted',
  'approved',
  'waived',
  'rejected'
);

-- Create enum for document status
CREATE TYPE public.financing_doc_status AS ENUM (
  'required',
  'requested',
  'received',
  'under_review',
  'approved',
  'rejected',
  'waived'
);

-- 1. Lenders table - Directory of lenders
CREATE TABLE public.lenders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  notes TEXT,
  avg_close_days INTEGER,
  success_rate NUMERIC(5,2),
  is_preferred BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Financing Applications - Main tracking table
CREATE TABLE public.financing_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE NOT NULL,
  lender_id UUID REFERENCES public.lenders(id) ON DELETE SET NULL,
  application_number TEXT,
  financing_type public.financing_type NOT NULL DEFAULT 'conventional',
  stage public.financing_stage NOT NULL DEFAULT 'pre_qualification',
  loan_amount NUMERIC(15,2),
  interest_rate NUMERIC(5,3),
  term_months INTEGER,
  amortization_months INTEGER,
  down_payment_percent NUMERIC(5,2),
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  closing_date DATE,
  funded_at TIMESTAMPTZ,
  assigned_to UUID,
  partner_id UUID,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  health_score INTEGER DEFAULT 100 CHECK (health_score >= 0 AND health_score <= 100),
  days_in_stage INTEGER DEFAULT 0,
  stage_entered_at TIMESTAMPTZ DEFAULT now(),
  internal_notes TEXT,
  decline_reason TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Financing Documents
CREATE TABLE public.financing_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.financing_applications(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  status public.financing_doc_status DEFAULT 'required',
  file_path TEXT,
  file_name TEXT,
  file_size INTEGER,
  file_type TEXT,
  requested_at TIMESTAMPTZ DEFAULT now(),
  due_date DATE,
  received_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  notes TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Financing Conditions
CREATE TABLE public.financing_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.financing_applications(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  status public.condition_status DEFAULT 'pending',
  due_date DATE,
  completed_at TIMESTAMPTZ,
  completed_by UUID,
  assigned_to UUID,
  notes TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Financing Activity
CREATE TABLE public.financing_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.financing_applications(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  document_id UUID REFERENCES public.financing_documents(id) ON DELETE SET NULL,
  condition_id UUID REFERENCES public.financing_conditions(id) ON DELETE SET NULL,
  metadata JSONB,
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_financing_applications_deal ON public.financing_applications(deal_id);
CREATE INDEX idx_financing_applications_lender ON public.financing_applications(lender_id);
CREATE INDEX idx_financing_applications_stage ON public.financing_applications(stage);
CREATE INDEX idx_financing_applications_partner ON public.financing_applications(partner_id);
CREATE INDEX idx_financing_documents_application ON public.financing_documents(application_id);
CREATE INDEX idx_financing_conditions_application ON public.financing_conditions(application_id);
CREATE INDEX idx_financing_activity_application ON public.financing_activity(application_id);

-- Enable RLS
ALTER TABLE public.lenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financing_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financing_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financing_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financing_activity ENABLE ROW LEVEL SECURITY;

-- Lender policies
CREATE POLICY "Authenticated users can view lenders"
  ON public.lenders FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage lenders"
  ON public.lenders FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin', 'editor')));

-- Application policies
CREATE POLICY "Staff can view all applications"
  ON public.financing_applications FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin', 'editor')));

CREATE POLICY "Partners can view their assigned applications"
  ON public.financing_applications FOR SELECT TO authenticated
  USING (partner_id = auth.uid() OR assigned_to = auth.uid() OR created_by = auth.uid());

CREATE POLICY "Staff can manage applications"
  ON public.financing_applications FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin', 'editor')));

CREATE POLICY "Users can create applications"
  ON public.financing_applications FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Document policies
CREATE POLICY "Users can view documents for accessible applications"
  ON public.financing_documents FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.financing_applications fa WHERE fa.id = application_id
    AND (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin', 'editor'))
      OR fa.partner_id = auth.uid() OR fa.assigned_to = auth.uid() OR fa.created_by = auth.uid())
  ));

CREATE POLICY "Staff can manage documents"
  ON public.financing_documents FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin', 'editor')));

-- Condition policies
CREATE POLICY "Users can view conditions for accessible applications"
  ON public.financing_conditions FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.financing_applications fa WHERE fa.id = application_id
    AND (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin', 'editor'))
      OR fa.partner_id = auth.uid() OR fa.assigned_to = auth.uid() OR fa.created_by = auth.uid())
  ));

CREATE POLICY "Staff can manage conditions"
  ON public.financing_conditions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin', 'editor')));

-- Activity policies
CREATE POLICY "Users can view activity for accessible applications"
  ON public.financing_activity FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.financing_applications fa WHERE fa.id = application_id
    AND (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin', 'editor'))
      OR fa.partner_id = auth.uid() OR fa.assigned_to = auth.uid() OR fa.created_by = auth.uid())
  ));

CREATE POLICY "Users can create activity logs"
  ON public.financing_activity FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Updated_at triggers
CREATE TRIGGER update_lenders_updated_at BEFORE UPDATE ON public.lenders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financing_applications_updated_at BEFORE UPDATE ON public.financing_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financing_documents_updated_at BEFORE UPDATE ON public.financing_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financing_conditions_updated_at BEFORE UPDATE ON public.financing_conditions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Stage change tracking trigger
CREATE OR REPLACE FUNCTION public.track_financing_stage_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.stage IS DISTINCT FROM NEW.stage THEN
    NEW.stage_entered_at = now();
    NEW.days_in_stage = 0;
    INSERT INTO public.financing_activity (application_id, activity_type, title, description, metadata, user_id)
    VALUES (NEW.id, 'stage_change', 'Stage changed to ' || NEW.stage::text,
      'Application moved from ' || OLD.stage::text || ' to ' || NEW.stage::text,
      jsonb_build_object('old_stage', OLD.stage, 'new_stage', NEW.stage), auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER track_financing_stage_change BEFORE UPDATE ON public.financing_applications
  FOR EACH ROW EXECUTE FUNCTION public.track_financing_stage_change();

-- Insert default lenders
INSERT INTO public.lenders (name, type, is_preferred, notes) VALUES
  ('Live Oak Bank', 'sba_lender', true, 'Top SBA lender, fast processing'),
  ('Celtic Bank', 'sba_lender', true, 'Good for SBA 7(a) loans'),
  ('Newtek Business Services', 'sba_lender', false, 'Alternative SBA option'),
  ('Bank of America', 'bank', false, 'Conventional loans'),
  ('Wells Fargo', 'bank', false, 'Business banking relationships'),
  ('Savvy Capital Partners', 'private', true, 'Preferred financing partner');