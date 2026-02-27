
-- 1. Create buyers table
CREATE TABLE public.buyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  entity_name TEXT
);

ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view all buyers"
  ON public.buyers FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin', 'editor')));

CREATE POLICY "Staff can manage buyers"
  ON public.buyers FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin', 'editor')));

-- 2. Create deal_buyers junction table
CREATE TABLE public.deal_buyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.buyers(id) ON DELETE CASCADE,
  status TEXT,
  role TEXT,
  UNIQUE (deal_id, buyer_id)
);

ALTER TABLE public.deal_buyers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view all deal_buyers"
  ON public.deal_buyers FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin', 'editor')));

CREATE POLICY "Staff can manage deal_buyers"
  ON public.deal_buyers FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin', 'editor')));

CREATE INDEX idx_deal_buyers_deal ON public.deal_buyers(deal_id);
CREATE INDEX idx_deal_buyers_buyer ON public.deal_buyers(buyer_id);

-- 3. Add deal_buyer_id to financing_applications
ALTER TABLE public.financing_applications
  ADD COLUMN deal_buyer_id UUID REFERENCES public.deal_buyers(id) ON DELETE SET NULL;

CREATE INDEX idx_financing_applications_deal_buyer ON public.financing_applications(deal_buyer_id);
