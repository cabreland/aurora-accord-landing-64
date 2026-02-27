
-- Product feedback table for internal team dogfooding
CREATE TABLE public.product_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL,
  page_path TEXT NOT NULL,
  page_context JSONB,
  type TEXT NOT NULL,
  severity TEXT,
  summary TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID
);

ALTER TABLE public.product_feedback ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_product_feedback_status ON public.product_feedback(status);
CREATE INDEX idx_product_feedback_type ON public.product_feedback(type);
CREATE INDEX idx_product_feedback_created_by ON public.product_feedback(created_by);

-- Staff/admin can see all feedback
CREATE POLICY "Staff can view all product feedback"
  ON public.product_feedback FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin', 'editor')));

-- Staff/admin can insert feedback
CREATE POLICY "Staff can create product feedback"
  ON public.product_feedback FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin', 'editor'))
  );

-- Staff/admin can update feedback (status, resolution)
CREATE POLICY "Staff can update product feedback"
  ON public.product_feedback FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin', 'editor')));
