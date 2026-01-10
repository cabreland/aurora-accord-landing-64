-- Create activity_type enum
CREATE TYPE deal_activity_type AS ENUM (
  'document_uploaded',
  'document_deleted',
  'document_moved',
  'document_approved',
  'document_rejected',
  'document_downloaded',
  'request_created',
  'request_updated',
  'request_status_changed',
  'request_completed',
  'comment_added',
  'team_member_added',
  'team_member_removed',
  'permission_changed',
  'nda_signed',
  'deal_stage_changed',
  'deal_created',
  'deal_updated'
);

-- Create team_role enum
CREATE TYPE deal_team_role AS ENUM (
  'deal_lead',
  'analyst',
  'external_reviewer',
  'investor',
  'seller',
  'advisor'
);

-- Create deal_activities table for activity tracking
CREATE TABLE public.deal_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  activity_type deal_activity_type NOT NULL,
  entity_type VARCHAR(50) NOT NULL, -- 'document', 'request', 'comment', 'team', 'deal'
  entity_id UUID, -- Reference to the entity (document_id, request_id, etc.)
  metadata JSONB DEFAULT '{}', -- Additional context for the activity
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX idx_deal_activities_deal_created ON public.deal_activities(deal_id, created_at DESC);
CREATE INDEX idx_deal_activities_user_created ON public.deal_activities(user_id, created_at DESC);
CREATE INDEX idx_deal_activities_entity ON public.deal_activities(entity_id);
CREATE INDEX idx_deal_activities_type ON public.deal_activities(activity_type);

-- Create deal_team_members table
CREATE TABLE public.deal_team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role deal_team_role NOT NULL DEFAULT 'analyst',
  permissions JSONB NOT NULL DEFAULT '{
    "can_view_all_folders": true,
    "can_upload_documents": false,
    "can_delete_documents": false,
    "can_create_requests": false,
    "can_edit_requests": false,
    "can_approve_documents": false,
    "restricted_folders": []
  }',
  added_by UUID REFERENCES auth.users(id),
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_active TIMESTAMP WITH TIME ZONE,
  UNIQUE(deal_id, user_id)
);

-- Create indexes
CREATE INDEX idx_deal_team_members_deal ON public.deal_team_members(deal_id);
CREATE INDEX idx_deal_team_members_user ON public.deal_team_members(user_id);

-- Enable RLS on both tables
ALTER TABLE public.deal_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_team_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for deal_activities
-- Admins can see all activities
CREATE POLICY "Admins can view all activities"
ON public.deal_activities FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- Team members can view activities for their deals
CREATE POLICY "Team members can view deal activities"
ON public.deal_activities FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.deal_team_members
    WHERE deal_id = deal_activities.deal_id AND user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.deal_assignments
    WHERE deal_id = deal_activities.deal_id AND user_id = auth.uid()
  )
);

-- Users can insert activities (logged via RPC or triggers)
CREATE POLICY "Authenticated users can insert activities"
ON public.deal_activities FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- RLS policies for deal_team_members
-- Admins can manage all team members
CREATE POLICY "Admins can manage all team members"
ON public.deal_team_members FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin', 'editor')
  )
);

-- Team members can view their own deals' team
CREATE POLICY "Team members can view deal team"
ON public.deal_team_members FOR SELECT
USING (
  deal_id IN (
    SELECT deal_id FROM public.deal_team_members WHERE user_id = auth.uid()
  )
  OR
  deal_id IN (
    SELECT deal_id FROM public.deal_assignments WHERE user_id = auth.uid()
  )
);

-- Add columns to data_room_documents if they don't exist
ALTER TABLE public.data_room_documents
ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS linked_request_ids UUID[] DEFAULT '{}';

-- Add columns to data_room_folders if they don't exist
ALTER TABLE public.data_room_folders
ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0;

-- Create function to log deal activity
CREATE OR REPLACE FUNCTION public.log_deal_activity(
  p_deal_id UUID,
  p_activity_type deal_activity_type,
  p_entity_type VARCHAR(50),
  p_entity_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $func$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO public.deal_activities (
    deal_id,
    user_id,
    activity_type,
    entity_type,
    entity_id,
    metadata
  )
  VALUES (
    p_deal_id,
    auth.uid(),
    p_activity_type,
    p_entity_type,
    p_entity_id,
    p_metadata
  )
  RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$func$;

-- Create trigger to log document uploads
CREATE OR REPLACE FUNCTION public.log_document_upload_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $func$
BEGIN
  -- Only log if this is a new insert and deal_id exists
  IF TG_OP = 'INSERT' AND NEW.deal_id IS NOT NULL THEN
    INSERT INTO public.deal_activities (
      deal_id,
      user_id,
      activity_type,
      entity_type,
      entity_id,
      metadata
    )
    VALUES (
      NEW.deal_id,
      NEW.uploaded_by,
      'document_uploaded',
      'document',
      NEW.id,
      jsonb_build_object(
        'file_name', NEW.file_name,
        'folder_id', NEW.folder_id,
        'file_size', NEW.file_size
      )
    );
  END IF;
  RETURN NEW;
END;
$func$;

CREATE TRIGGER trigger_log_document_upload
AFTER INSERT ON public.data_room_documents
FOR EACH ROW
EXECUTE FUNCTION public.log_document_upload_activity();

-- Create trigger to log document status changes
CREATE OR REPLACE FUNCTION public.log_document_status_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $func$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.deal_id IS NOT NULL THEN
    INSERT INTO public.deal_activities (
      deal_id,
      user_id,
      activity_type,
      entity_type,
      entity_id,
      metadata
    )
    VALUES (
      NEW.deal_id,
      NEW.reviewed_by,
      CASE 
        WHEN NEW.status = 'approved' THEN 'document_approved'::deal_activity_type
        WHEN NEW.status = 'rejected' THEN 'document_rejected'::deal_activity_type
        ELSE 'document_uploaded'::deal_activity_type
      END,
      'document',
      NEW.id,
      jsonb_build_object(
        'file_name', NEW.file_name,
        'old_status', OLD.status,
        'new_status', NEW.status,
        'rejection_reason', NEW.rejection_reason
      )
    );
  END IF;
  RETURN NEW;
END;
$func$;

CREATE TRIGGER trigger_log_document_status_change
AFTER UPDATE ON public.data_room_documents
FOR EACH ROW
EXECUTE FUNCTION public.log_document_status_activity();