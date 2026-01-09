-- Add new columns to diligence_comments for threaded Q&A with approval workflow

ALTER TABLE public.diligence_comments 
ADD COLUMN IF NOT EXISTS comment_type text NOT NULL DEFAULT 'internal' CHECK (comment_type IN ('internal', 'approved')),
ADD COLUMN IF NOT EXISTS parent_comment_id uuid REFERENCES public.diligence_comments(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone NOT NULL DEFAULT now();

-- Add index for parent comments (threaded replies)
CREATE INDEX IF NOT EXISTS idx_diligence_comments_parent ON public.diligence_comments(parent_comment_id) WHERE parent_comment_id IS NOT NULL;

-- Add index for approved comments
CREATE INDEX IF NOT EXISTS idx_diligence_comments_approved ON public.diligence_comments(request_id, comment_type) WHERE comment_type = 'approved';

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_diligence_comment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_diligence_comments_updated_at ON public.diligence_comments;
CREATE TRIGGER update_diligence_comments_updated_at
  BEFORE UPDATE ON public.diligence_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_diligence_comment_updated_at();