
-- Feedback table for internal testing
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_identifier TEXT,
  route TEXT NOT NULL,
  page_area TEXT NOT NULL CHECK (page_area IN ('Dashboard', 'Deals', 'Data room', 'Financing', 'Tasks', 'Settings', 'Other')),
  severity TEXT NOT NULL CHECK (severity IN ('Blocker', 'Annoying', 'Nice to have')),
  message TEXT NOT NULL
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Authenticated users can insert their own feedback
CREATE POLICY "Users can insert own feedback"
  ON public.feedback FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admins can read all feedback
CREATE POLICY "Admins can read all feedback"
  ON public.feedback FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin')
  );

-- Users can also read their own feedback
CREATE POLICY "Users can read own feedback"
  ON public.feedback FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
