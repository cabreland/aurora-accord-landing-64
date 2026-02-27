-- Attach activity logging triggers (skip auth.users trigger - already exists)

-- 1) Log document uploads in data_room_documents
CREATE TRIGGER trg_log_document_upload
  AFTER INSERT ON public.data_room_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.log_document_upload_activity();

-- 2) Log document status changes (approve/reject)
CREATE TRIGGER trg_log_document_status
  AFTER UPDATE ON public.data_room_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.log_document_status_activity();

-- 3) Log deal stage changes
CREATE TRIGGER trg_log_deal_stage_change
  BEFORE UPDATE ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION public.log_deal_stage_change();

-- 4) Track financing stage changes
CREATE TRIGGER trg_track_financing_stage
  BEFORE UPDATE ON public.financing_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.track_financing_stage_change();

-- 5) Update diligence request updated_by
CREATE TRIGGER trg_diligence_request_updated_by
  BEFORE UPDATE ON public.diligence_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_diligence_request_updated_by();

-- 6) Update diligence last_activity_at
CREATE TRIGGER trg_diligence_last_activity
  BEFORE UPDATE ON public.diligence_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_diligence_last_activity();

-- 7) Update diligence comment updated_at
CREATE TRIGGER trg_diligence_comment_updated_at
  BEFORE UPDATE ON public.diligence_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_diligence_comment_updated_at();

-- 8) Update request activity on comment
CREATE TRIGGER trg_request_activity_on_comment
  AFTER INSERT ON public.diligence_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_request_activity_on_comment();

-- 9) Log settings changes
CREATE OR REPLACE TRIGGER trg_log_settings_change
  AFTER INSERT OR UPDATE ON public.platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.log_settings_change();

-- 10) Update platform_settings timestamp
CREATE TRIGGER trg_platform_settings_timestamp
  BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_platform_settings_timestamp();

-- 11) Log role changes on profiles
CREATE TRIGGER trg_log_role_change
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_role_change();

-- 12) Update updated_at on various tables
CREATE TRIGGER trg_deals_updated_at
  BEFORE UPDATE ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 13) Create company for deal
CREATE TRIGGER trg_create_company_for_deal
  BEFORE INSERT ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION public.create_company_for_deal();

-- 14) Team invitations updated_at
CREATE TRIGGER trg_team_invitations_updated_at
  BEFORE UPDATE ON public.team_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_team_invitations_updated_at();