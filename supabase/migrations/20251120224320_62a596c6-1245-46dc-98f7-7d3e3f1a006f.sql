-- =====================================================
-- RLS POLICY UPDATES FOR INVESTOR/ADMIN ACCESS CONTROL
-- =====================================================

-- ============================================================
-- 1. DEALS TABLE - Restrict investor access to published deals
-- ============================================================

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Users can view assigned deals or admins can view all" ON deals;

-- Create new policies with clear separation
CREATE POLICY "Admins and staff can view all deals"
ON deals FOR SELECT
TO authenticated
USING (
  get_user_role(auth.uid()) IN ('super_admin', 'admin', 'editor')
);

CREATE POLICY "Investors can view published active deals"
ON deals FOR SELECT
TO authenticated
USING (
  get_user_role(auth.uid()) = 'viewer'
  AND status = 'active'
  AND EXISTS (
    SELECT 1 FROM companies c
    WHERE c.id = deals.company_id
    AND c.is_published = true
    AND c.is_draft = false
    AND (c.publish_at IS NULL OR c.publish_at <= now())
  )
);

-- ============================================================
-- 2. DOCUMENTS TABLE - Require NDA for investor access
-- ============================================================

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Users can view documents for assigned deals" ON documents;

-- Create new policies
CREATE POLICY "Admins and staff can view all documents"
ON documents FOR SELECT
TO authenticated
USING (
  get_user_role(auth.uid()) IN ('super_admin', 'admin', 'editor')
);

CREATE POLICY "Investors can view documents after NDA acceptance"
ON documents FOR SELECT
TO authenticated
USING (
  get_user_role(auth.uid()) = 'viewer'
  AND EXISTS (
    SELECT 1 FROM deals d
    JOIN companies c ON d.company_id = c.id
    WHERE d.id = documents.deal_id
    AND c.is_published = true
    AND user_has_accepted_nda(auth.uid(), c.id)
  )
);

-- ============================================================
-- 3. ACCESS REQUESTS TABLE - Already correct, add logging
-- ============================================================

-- Policies are already correct:
-- - "Users can create their own requests" (INSERT with user_id = auth.uid())
-- - "Users can view their own requests" (SELECT with user_id = auth.uid())
-- - "Admins can view all requests" (SELECT for admin/super_admin/editor)
-- - "Admins can update all requests" (UPDATE for admin/super_admin/editor)

-- Add comment for clarity
COMMENT ON TABLE access_requests IS 'Access requests table with RLS enforcing user isolation. Investors can only see/create their own requests. Admins have full access.';

-- ============================================================
-- 4. COMPANY NDA ACCEPTANCES TABLE - Already correct
-- ============================================================

-- Policies are already correct:
-- - "Users can create their own NDA acceptances" (INSERT with user_id = auth.uid())
-- - "Users can view their own NDA acceptances" (SELECT with user_id = auth.uid())
-- - "Admins can view all NDA acceptances" (SELECT for admin)
-- - "Admins can update NDA records" (UPDATE for admin/super_admin)

-- Add comment for clarity
COMMENT ON TABLE company_nda_acceptances IS 'NDA acceptances table with RLS enforcing user isolation. Investors can only see/create their own NDAs. Admins have full access.';

-- ============================================================
-- 5. COMPANIES TABLE - Restrict investor access
-- ============================================================

-- Drop investor-facing SELECT policy
DROP POLICY IF EXISTS "Investors can view published companies" ON companies;

-- Create new investor policy
CREATE POLICY "Investors can view published companies only"
ON companies FOR SELECT
TO authenticated
USING (
  get_user_role(auth.uid()) = 'viewer'
  AND is_published = true
  AND is_draft = false
  AND (publish_at IS NULL OR publish_at <= now())
);

-- Keep admin/staff policies as-is:
-- "Users can view companies based on access" - for admin/editor/owner
-- "Company creators and admins can update companies" - for admin/owner
-- "Admins and staff can create companies" - for admin/editor
-- "Admins can delete companies" - for admin