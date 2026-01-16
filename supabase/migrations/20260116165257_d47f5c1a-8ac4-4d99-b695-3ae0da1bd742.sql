
-- Delete all test data except Blue Soft Websites (id: 8979ed55-11c0-442a-8ab7-f6f0fa46c084)

-- First delete child records that reference deals
DELETE FROM diligence_requests WHERE deal_id != '8979ed55-11c0-442a-8ab7-f6f0fa46c084';
DELETE FROM diligence_comments WHERE request_id NOT IN (SELECT id FROM diligence_requests);
DELETE FROM diligence_documents WHERE request_id NOT IN (SELECT id FROM diligence_requests);
DELETE FROM diligence_request_views WHERE request_id NOT IN (SELECT id FROM diligence_requests);
DELETE FROM diligence_notifications WHERE deal_id != '8979ed55-11c0-442a-8ab7-f6f0fa46c084';

DELETE FROM data_room_documents WHERE deal_id != '8979ed55-11c0-442a-8ab7-f6f0fa46c084';
DELETE FROM data_room_folders WHERE deal_id != '8979ed55-11c0-442a-8ab7-f6f0fa46c084';
DELETE FROM data_room_activity WHERE deal_id != '8979ed55-11c0-442a-8ab7-f6f0fa46c084';
DELETE FROM data_room_permissions WHERE deal_id != '8979ed55-11c0-442a-8ab7-f6f0fa46c084';

DELETE FROM deal_requests WHERE deal_id != '8979ed55-11c0-442a-8ab7-f6f0fa46c084';
DELETE FROM deal_activities WHERE deal_id != '8979ed55-11c0-442a-8ab7-f6f0fa46c084';
DELETE FROM deal_team_members WHERE deal_id != '8979ed55-11c0-442a-8ab7-f6f0fa46c084';
DELETE FROM deal_assignments WHERE deal_id != '8979ed55-11c0-442a-8ab7-f6f0fa46c084';
DELETE FROM deal_interests WHERE deal_id != '8979ed55-11c0-442a-8ab7-f6f0fa46c084';
DELETE FROM deal_stage_history WHERE deal_id != '8979ed55-11c0-442a-8ab7-f6f0fa46c084';
DELETE FROM deal_watchlist WHERE deal_id NOT IN (SELECT company_id FROM deals WHERE id = '8979ed55-11c0-442a-8ab7-f6f0fa46c084');

DELETE FROM documents WHERE deal_id != '8979ed55-11c0-442a-8ab7-f6f0fa46c084';
DELETE FROM document_views WHERE document_id NOT IN (SELECT id FROM documents);

DELETE FROM info_requests WHERE deal_id != '8979ed55-11c0-442a-8ab7-f6f0fa46c084';
DELETE FROM call_requests WHERE deal_id != '8979ed55-11c0-442a-8ab7-f6f0fa46c084';
DELETE FROM investor_messages WHERE deal_id != '8979ed55-11c0-442a-8ab7-f6f0fa46c084';
DELETE FROM investor_invitations WHERE deal_id IS NOT NULL AND deal_id != '8979ed55-11c0-442a-8ab7-f6f0fa46c084';
DELETE FROM conversations WHERE deal_id IS NOT NULL AND deal_id != '8979ed55-11c0-442a-8ab7-f6f0fa46c084';

DELETE FROM partner_deal_access WHERE deal_id != '8979ed55-11c0-442a-8ab7-f6f0fa46c084';

-- Finally delete the deals themselves
DELETE FROM deals WHERE id != '8979ed55-11c0-442a-8ab7-f6f0fa46c084';

-- Also update Blue Soft to mark it as NOT test data since it's a real company
UPDATE deals SET is_test_data = false WHERE id = '8979ed55-11c0-442a-8ab7-f6f0fa46c084';
