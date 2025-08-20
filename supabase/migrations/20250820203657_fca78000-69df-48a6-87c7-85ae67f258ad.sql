
-- Create enums for company data if they don't exist
DO $$ BEGIN
    CREATE TYPE company_stage AS ENUM ('teaser', 'discovery', 'dd', 'closing');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create companies table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    industry TEXT,
    location TEXT,
    summary TEXT,
    stage company_stage,
    priority priority_level,
    fit_score INTEGER DEFAULT 50 CHECK (fit_score >= 0 AND fit_score <= 100),
    owner_id UUID REFERENCES auth.users(id),
    revenue TEXT,
    ebitda TEXT,
    asking_price TEXT,
    highlights JSONB DEFAULT '[]'::jsonb,
    risks JSONB DEFAULT '[]'::jsonb,
    passcode TEXT,
    is_draft BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add missing columns safely (only if they don't exist)
DO $$ 
BEGIN
    -- Check and add missing columns one by one
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'highlights') THEN
        ALTER TABLE public.companies ADD COLUMN highlights JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'risks') THEN
        ALTER TABLE public.companies ADD COLUMN risks JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'passcode') THEN
        ALTER TABLE public.companies ADD COLUMN passcode TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'is_draft') THEN
        ALTER TABLE public.companies ADD COLUMN is_draft BOOLEAN NOT NULL DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'stage') THEN
        ALTER TABLE public.companies ADD COLUMN stage company_stage;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'priority') THEN
        ALTER TABLE public.companies ADD COLUMN priority priority_level;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'fit_score') THEN
        ALTER TABLE public.companies ADD COLUMN fit_score INTEGER DEFAULT 50 CHECK (fit_score >= 0 AND fit_score <= 100);
    END IF;
END $$;

-- Enable RLS on companies table
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for companies table
DO $$ 
BEGIN
    -- Drop existing policies if they exist to avoid conflicts
    DROP POLICY IF EXISTS "Users can view companies based on access" ON public.companies;
    DROP POLICY IF EXISTS "Admins and staff can create companies" ON public.companies;
    DROP POLICY IF EXISTS "Company creators and admins can update companies" ON public.companies;
    DROP POLICY IF EXISTS "Admins can delete companies" ON public.companies;
    
    -- Create new policies
    CREATE POLICY "Users can view companies based on access" 
        ON public.companies 
        FOR SELECT 
        USING (
            get_user_role(auth.uid()) = 'admin'::user_role 
            OR get_user_role(auth.uid()) = 'editor'::user_role 
            OR owner_id = auth.uid()
        );
    
    CREATE POLICY "Admins and staff can create companies" 
        ON public.companies 
        FOR INSERT 
        WITH CHECK (
            get_user_role(auth.uid()) = 'admin'::user_role 
            OR get_user_role(auth.uid()) = 'editor'::user_role
        );
    
    CREATE POLICY "Company creators and admins can update companies" 
        ON public.companies 
        FOR UPDATE 
        USING (
            owner_id = auth.uid() 
            OR get_user_role(auth.uid()) = 'admin'::user_role
        );
    
    CREATE POLICY "Admins can delete companies" 
        ON public.companies 
        FOR DELETE 
        USING (get_user_role(auth.uid()) = 'admin'::user_role);
END $$;

-- Add updated_at trigger for companies table
CREATE OR REPLACE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
