-- Create enum types for roles and permissions
CREATE TYPE public.user_role AS ENUM ('admin', 'editor', 'viewer');
CREATE TYPE public.deal_status AS ENUM ('active', 'archived', 'draft');
CREATE TYPE public.document_tag AS ENUM ('cim', 'nda', 'financials', 'buyer_notes', 'legal', 'due_diligence', 'other');

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role user_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create deals table
CREATE TABLE public.deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  company_name TEXT NOT NULL,
  industry TEXT,
  revenue TEXT,
  ebitda TEXT,
  location TEXT,
  status deal_status NOT NULL DEFAULT 'draft',
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create deal assignments table (users assigned to deals)
CREATE TABLE public.deal_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'viewer',
  can_view BOOLEAN NOT NULL DEFAULT true,
  can_download BOOLEAN NOT NULL DEFAULT false,
  can_upload BOOLEAN NOT NULL DEFAULT false,
  assigned_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(deal_id, user_id)
);

-- Create documents table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  tag document_tag NOT NULL DEFAULT 'other',
  version INTEGER NOT NULL DEFAULT 1,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create security definer functions to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.user_has_deal_access(user_uuid UUID, deal_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.deal_assignments 
    WHERE user_id = user_uuid AND deal_id = deal_uuid
  ) OR public.get_user_role(user_uuid) = 'admin';
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for deals
CREATE POLICY "Users can view assigned deals" ON public.deals
  FOR SELECT USING (
    public.user_has_deal_access(auth.uid(), id) OR 
    created_by = auth.uid()
  );

CREATE POLICY "Editors and admins can create deals" ON public.deals
  FOR INSERT WITH CHECK (
    public.get_user_role(auth.uid()) IN ('admin', 'editor')
  );

CREATE POLICY "Creators and admins can update deals" ON public.deals
  FOR UPDATE USING (
    created_by = auth.uid() OR 
    public.get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can delete deals" ON public.deals
  FOR DELETE USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for deal assignments
CREATE POLICY "Users can view deal assignments" ON public.deal_assignments
  FOR SELECT USING (
    user_id = auth.uid() OR 
    public.get_user_role(auth.uid()) = 'admin' OR
    EXISTS (
      SELECT 1 FROM public.deals d 
      WHERE d.id = deal_id AND d.created_by = auth.uid()
    )
  );

CREATE POLICY "Admins and deal creators can manage assignments" ON public.deal_assignments
  FOR ALL USING (
    public.get_user_role(auth.uid()) = 'admin' OR
    EXISTS (
      SELECT 1 FROM public.deals d 
      WHERE d.id = deal_id AND d.created_by = auth.uid()
    )
  );

-- RLS Policies for documents
CREATE POLICY "Users can view documents for assigned deals" ON public.documents
  FOR SELECT USING (
    public.user_has_deal_access(auth.uid(), deal_id)
  );

CREATE POLICY "Users with upload permission can insert documents" ON public.documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.deal_assignments da
      WHERE da.deal_id = deal_id 
      AND da.user_id = auth.uid() 
      AND da.can_upload = true
    ) OR public.get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Document uploaders and admins can update documents" ON public.documents
  FOR UPDATE USING (
    uploaded_by = auth.uid() OR 
    public.get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can delete documents" ON public.documents
  FOR DELETE USING (public.get_user_role(auth.uid()) = 'admin');

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('deal-documents', 'deal-documents', false);

-- Storage policies
CREATE POLICY "Users can view documents they have access to" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'deal-documents' AND
    EXISTS (
      SELECT 1 FROM public.documents d
      JOIN public.deal_assignments da ON d.deal_id = da.deal_id
      WHERE d.file_path = name
      AND da.user_id = auth.uid()
      AND da.can_view = true
    )
  );

CREATE POLICY "Users can upload to deals they have permission for" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'deal-documents' AND
    auth.uid() IS NOT NULL
  );

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();