
-- Create enums only if they don't exist
DO $$ 
BEGIN
    -- company_stage enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'company_stage') THEN
        CREATE TYPE company_stage AS ENUM ('teaser', 'discovery', 'dd', 'closing');
    END IF;
    
    -- priority_level enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'priority_level') THEN
        CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high');
    END IF;
    
    -- access_level enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'access_level') THEN
        CREATE TYPE access_level AS ENUM ('teaser', 'cim', 'financials', 'full_data_room');
    END IF;
    
    -- confidential_level enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'confidential_level') THEN
        CREATE TYPE confidential_level AS ENUM ('public_teaser', 'nda_only', 'restricted');
    END IF;
END $$;

-- Create companies table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    industry TEXT,
    stage company_stage DEFAULT 'teaser',
    location TEXT,
    website TEXT,
    revenue_range TEXT,
    ebitda_range TEXT,
    asking_price_range TEXT,
    confidential_level confidential_level DEFAULT 'nda_only',
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create ndas table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.ndas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
    document_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create access_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.access_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    requested_access_level access_level DEFAULT 'teaser',
    priority priority_level DEFAULT 'medium',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'expired')),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_company_access table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_company_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    access_level access_level DEFAULT 'teaser',
    granted_by UUID NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, company_id)
);

-- Create activity_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('company', 'deal', 'document', 'nda', 'access_request')),
    entity_id UUID NOT NULL,
    action TEXT NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_companies_created_by ON public.companies(created_by);
CREATE INDEX IF NOT EXISTS idx_companies_stage ON public.companies(stage);
CREATE INDEX IF NOT EXISTS idx_companies_confidential_level ON public.companies(confidential_level);

CREATE INDEX IF NOT EXISTS idx_ndas_user_id ON public.ndas(user_id);
CREATE INDEX IF NOT EXISTS idx_ndas_company_id ON public.ndas(company_id);
CREATE INDEX IF NOT EXISTS idx_ndas_status ON public.ndas(status);

CREATE INDEX IF NOT EXISTS idx_access_requests_user_id ON public.access_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_company_id ON public.access_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_status ON public.access_requests(status);

CREATE INDEX IF NOT EXISTS idx_user_company_access_user_id ON public.user_company_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_company_access_company_id ON public.user_company_access(company_id);

CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON public.activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON public.activity_log(created_at);

-- Add updated_at triggers
DO $$ 
BEGIN
    -- Add trigger for companies table
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_companies_updated_at') THEN
        CREATE TRIGGER update_companies_updated_at
            BEFORE UPDATE ON public.companies
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    -- Add trigger for ndas table
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_ndas_updated_at') THEN
        CREATE TRIGGER update_ndas_updated_at
            BEFORE UPDATE ON public.ndas
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    -- Add trigger for access_requests table
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_access_requests_updated_at') THEN
        CREATE TRIGGER update_access_requests_updated_at
            BEFORE UPDATE ON public.access_requests
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    -- Add trigger for user_company_access table
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_company_access_updated_at') THEN
        CREATE TRIGGER update_user_company_access_updated_at
            BEFORE UPDATE ON public.user_company_access
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

-- Enable RLS on all new tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ndas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_company_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies for companies
CREATE POLICY IF NOT EXISTS "Users can view companies based on access level" 
    ON public.companies FOR SELECT 
    USING (
        confidential_level = 'public_teaser' OR
        created_by = auth.uid() OR
        get_user_role(auth.uid()) = 'admin'::user_role OR
        EXISTS (
            SELECT 1 FROM public.user_company_access 
            WHERE user_id = auth.uid() AND company_id = companies.id
        )
    );

CREATE POLICY IF NOT EXISTS "Editors and admins can create companies" 
    ON public.companies FOR INSERT 
    WITH CHECK (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'editor'::user_role]));

CREATE POLICY IF NOT EXISTS "Creators and admins can update companies" 
    ON public.companies FOR UPDATE 
    USING (created_by = auth.uid() OR get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY IF NOT EXISTS "Admins can delete companies" 
    ON public.companies FOR DELETE 
    USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Basic RLS policies for ndas
CREATE POLICY IF NOT EXISTS "Users can view their own NDAs" 
    ON public.ndas FOR SELECT 
    USING (user_id = auth.uid() OR get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY IF NOT EXISTS "Users can create their own NDAs" 
    ON public.ndas FOR INSERT 
    WITH CHECK (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Admins can update NDAs" 
    ON public.ndas FOR UPDATE 
    USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Basic RLS policies for access_requests
CREATE POLICY IF NOT EXISTS "Users can view their own access requests" 
    ON public.access_requests FOR SELECT 
    USING (user_id = auth.uid() OR get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY IF NOT EXISTS "Users can create access requests" 
    ON public.access_requests FOR INSERT 
    WITH CHECK (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Admins can update access requests" 
    ON public.access_requests FOR UPDATE 
    USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Basic RLS policies for user_company_access
CREATE POLICY IF NOT EXISTS "Users can view their own company access" 
    ON public.user_company_access FOR SELECT 
    USING (user_id = auth.uid() OR get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY IF NOT EXISTS "Admins can manage company access" 
    ON public.user_company_access FOR ALL 
    USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Basic RLS policies for activity_log
CREATE POLICY IF NOT EXISTS "Users can view their own activity" 
    ON public.activity_log FOR SELECT 
    USING (user_id = auth.uid() OR get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY IF NOT EXISTS "System can insert activity logs" 
    ON public.activity_log FOR INSERT 
    WITH CHECK (true);
