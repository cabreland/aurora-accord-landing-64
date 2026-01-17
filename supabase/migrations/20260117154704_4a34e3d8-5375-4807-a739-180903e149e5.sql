-- Add is_not_applicable column to data_room_folders table
-- This allows marking folders as "N/A" so they don't count toward required folder completion

ALTER TABLE public.data_room_folders
ADD COLUMN IF NOT EXISTS is_not_applicable boolean DEFAULT false;

-- Add comment explaining the field
COMMENT ON COLUMN public.data_room_folders.is_not_applicable IS 'When true, folder is marked as Not Applicable and excluded from required folder counts';

-- Create index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_data_room_folders_not_applicable 
ON public.data_room_folders(deal_id, is_not_applicable) 
WHERE is_not_applicable = true;