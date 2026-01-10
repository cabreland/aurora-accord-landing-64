-- Create deal_requests table for Q&A tracking
CREATE TABLE public.deal_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'Other',
  priority TEXT NOT NULL DEFAULT 'Medium',
  status TEXT NOT NULL DEFAULT 'Open',
  asked_by UUID,
  assigned_to UUID,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create request_responses table for threaded responses
CREATE TABLE public.request_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.deal_requests(id) ON DELETE CASCADE,
  user_id UUID,
  response_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create request_documents table for linking documents to requests
CREATE TABLE public.request_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.deal_requests(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  data_room_document_id UUID REFERENCES public.data_room_documents(id) ON DELETE SET NULL,
  attached_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.deal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for deal_requests
CREATE POLICY "Authenticated users can view deal requests"
ON public.deal_requests
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create deal requests"
ON public.deal_requests
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update deal requests"
ON public.deal_requests
FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete deal requests"
ON public.deal_requests
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- RLS Policies for request_responses
CREATE POLICY "Authenticated users can view responses"
ON public.request_responses
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create responses"
ON public.request_responses
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own responses"
ON public.request_responses
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own responses"
ON public.request_responses
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for request_documents
CREATE POLICY "Authenticated users can view request documents"
ON public.request_documents
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can attach documents"
ON public.request_documents
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can remove document attachments"
ON public.request_documents
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Create indexes for performance
CREATE INDEX idx_deal_requests_deal_id ON public.deal_requests(deal_id);
CREATE INDEX idx_deal_requests_status ON public.deal_requests(status);
CREATE INDEX idx_deal_requests_category ON public.deal_requests(category);
CREATE INDEX idx_deal_requests_assigned_to ON public.deal_requests(assigned_to);
CREATE INDEX idx_request_responses_request_id ON public.request_responses(request_id);
CREATE INDEX idx_request_documents_request_id ON public.request_documents(request_id);

-- Auto-update trigger for updated_at
CREATE TRIGGER update_deal_requests_updated_at
BEFORE UPDATE ON public.deal_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();