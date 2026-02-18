
# Platform Improvement Master Plan — Implementation

This covers all approved batches plus your addition of **Digital Agency** to the business type options. The plan is organized in the same 6-batch sequence from the analysis.

---

## What's Being Added / Changed at a Glance

- Business type field in deal wizard (with Digital Agency included)
- Deal naming clarity: "Deal Code Name" vs "Legal / Trading Name"
- Filter alignment with workflow statuses
- Draft resume UX polish
- Data room upload pipeline fix (critical bug)
- Document viewer modal (PDF + Office + image)
- Inline upload from deal overview
- Diligence tracker ↔ data room navigation
- Sidebar design unification (token cleanup)
- Folder assignment rethink in wizard
- Deal overview: remove alarming elements, pipeline redesign, modular layout, header declutter
- Deal details panel inline editing
- Task delete confirmation + routing breadcrumbs
- Team: live user search by name/email + group assignment foundation
- Shareable link architecture
- Settings: wire auto-progression and DD threshold to persistence

---

## Batch 1 — Foundation

### 1A — Business Type Field in Deal Wizard

**File:** `src/components/deals/wizard/BasicInfoStep.tsx`

Add a new `Select` field for `business_type` in the grid below the Industry field. The full list of options:

- SaaS / Software
- **Digital Agency** ← user's addition
- Professional Services
- E-commerce / Retail
- Franchise / Multi-Unit
- Physical Product / Manufacturing
- Marketplace / Platform
- Media / Content
- Healthcare Services
- Holding Company / Portfolio
- Other

**File:** `src/components/deals/wizard/DealWizard.tsx`

- Add `business_type: string` to the `DealFormData` interface (line ~34)
- Add `business_type: ''` to `getInitialFormData()` (line ~104)
- Add `business_type: formData.business_type` to the Supabase insert call (line ~380 block)

**Database migration required:**
```sql
ALTER TABLE deals ADD COLUMN IF NOT EXISTS business_type text;
```

---

### 1B — Deal Naming Clarity

**File:** `src/components/deals/wizard/BasicInfoStep.tsx`

- Change the `Deal Title` label to **"Deal Code Name"** with helper text beneath: *"Internal reference name — not shown to sellers or investors"*
- Change the `Company Name` label to **"Legal / Trading Name"** with helper text: *"Shown on cards, investor views, and external facing pages"*

**File:** `src/pages/DealManagement.tsx` and card components

- In `DealListView.tsx` rows: confirm `company_name` is primary display, show `title` in muted 12px below it as the code name
- In `DealCardsView.tsx` / `UnifiedDealCard`: same — `company_name` as H3, `title` as subtle subtitle

---

### 1C — Filter System Alignment

**File:** `src/components/deals/DealFilters.tsx`

Add a second filter group labeled "Workflow Status" using a new `deal_status` field. All 8 values:

| Value | Label |
|---|---|
| `draft` | Draft |
| `data_gathering` | Data Gathering |
| `live` | Live |
| `active` | Active |
| `under_loi` | Under LOI |
| `closing` | Closing |
| `closed` | Closed |
| `dead` | Dead |

Update the `DealFilters` props interface to include `deal_status?: string`.

**File:** `src/hooks/useMyDeals.ts` (or wherever filter logic lives)

Add `deal_status` filtering to the Supabase query when the filter is set.

**File:** `src/components/deals/DealListView.tsx` and card components

Show `deal_status` as the primary human-readable badge (colored per the `STATUS_LABELS` pattern). Keep the enum `status` (draft/active/archived) as a smaller secondary chip.

---

### 1D — Draft Resume UX

**File:** `src/components/deals/wizard/DealWizard.tsx` (lines ~552–576 draft prompt area)

- Make "Resume Draft" a full-width primary `Button`
- Make "Start Fresh" a `variant="ghost"` with `text-destructive` color  
- Show company name in bold `text-base`
- Step indicator: *"Picked up at Step 4 of 9 — Founder & Team"*
- Timestamp: *"Auto-saved 2 hours ago"* using `formatDistanceToNow` (already imported)

---

## Batch 2 — Data Room Core

### 2A — Fix Upload Pipeline (Critical Bug)

**Confirmed bug:** `DealWizard.tsx` lines 424–457 upload to the `deal-documents` bucket and insert into the `documents` table. The Data Room reads from `data_room_documents` table and `data-room-documents` bucket. These never connect.

**New file:** `src/lib/data/mapFileToFolder.ts`

A utility function `mapFileToFolder(fileName: string, folders: DataRoomFolder[]): string | null` that keyword-matches filenames to folder IDs:
- "p&l", "income", "financial", "revenue", "tax", "balance" → Financials folders
- "contract", "agreement", "nda", "legal", "articles" → Corporate & Legal folders
- "operations", "sop", "process", "workflow" → Operations folders
- "client", "customer", "contract" → Client Base & Contracts folders
- "marketing", "sales", "pitch", "deck" → Marketing & Sales folders
- Returns `null` if no match found

**File:** `src/components/deals/wizard/DealWizard.tsx` (lines 414–458)

Replace the upload block to:
1. Upload to `data-room-documents` bucket (not `deal-documents`)
2. Insert into `data_room_documents` table (not `documents` table)
3. Call `mapFileToFolder()` to assign `folder_id` where detectable
4. Leave `folder_id` as null if unmatched — these surface in the "Unassigned" tray

**File:** `src/components/data-room/EnhancedDataRoomContent.tsx`

Add an "Unassigned Documents" section at the top of the content area that shows files with `folder_id = null` for the current deal. Users can drag them to folders or assign via a dropdown.

---

### 2B — Document Viewer Modal

**New file:** `src/components/data-room/DocumentViewerModal.tsx`

A full-screen modal with:

- **Header:** file name, type badge, close button (X), download button
- **Body rendering logic:**
  - PDF files → signed URL (15 min) via `supabase.storage.from('data-room-documents').createSignedUrl(filePath, 900)` loaded in `<iframe>`
  - Office docs (xlsx, docx, pptx) → Google Docs Viewer: `https://docs.google.com/viewer?url={encodeURIComponent(signedUrl)}&embedded=true` in `<iframe>`
  - Images (png, jpg, gif, webp) → `<img>` tag with `object-contain` styling
  - Unsupported formats → "Preview not available" message with a download CTA button
- **Loading state:** centered spinner while iframe content loads
- **Footer:** file size, upload date, uploader name, status badge

**Files to wire up:**
- `src/components/data-room/DataRoomDocumentTable.tsx`: clicking a row opens the viewer (file name click = viewer; separate download icon = download action)
- `src/components/data-room/DataRoomDocumentGrid.tsx`: same pattern on card click

---

### 2C — Inline Upload from Deal Overview

**New file:** `src/components/deal-workspace/overview/InlineUploadPanel.tsx`

A collapsible slide-down panel with:
- Folder selector `Select` dropdown (populated from `useDataRoom({ dealId })`)
- `react-dropzone` drop zone accepting multiple files at once
- Per-file progress bars using the existing `useDocumentUpload` hook
- On success: brief "Uploaded successfully" toast + auto-collapse

**File:** `src/components/deal-workspace/tabs/DealOverviewTab.tsx`

- Add `showInlineUpload` boolean state
- Replace the "Upload Docs" Quick Action's `onTabChange('data-room')` call with `setShowInlineUpload(true)`
- Render `<InlineUploadPanel dealId={deal.id} onClose={() => setShowInlineUpload(false)} />` conditionally below the Quick Actions card
- On upload success, invalidate the `useDataRoom` query

---

### 2D — Diligence Tracker ↔ Data Room Navigation

**File:** `src/components/deal-workspace/DealDiligenceTracker.tsx`

- Add a **"View Data Room →"** button in the tracker header
- Accept an `onNavigateToDataRoom?: () => void` prop
- Call the prop when clicked

**File:** `src/components/deal-workspace/DealWorkspace.tsx`

- Pass `onNavigateToDataRoom={() => handleTabChange('data-room')}` when rendering `DealDiligenceTracker`
- Add support for `?tab=requests&requestId=xyz` in the URL search params — read `requestId` and pass it to the tracker to auto-open that specific request

---

### 2E — Sidebar Design Unification

**File:** `src/components/data-room/EnhancedCategorySidebar.tsx`

Replace all hardcoded color values with semantic design tokens:

| Current | Replace With |
|---|---|
| `bg-gray-50` | `bg-card` |
| `bg-white` | `bg-card` |
| `border-gray-200` | `border-border` |
| `bg-blue-50 text-blue-700` (selected) | `bg-primary/10 text-primary` |
| `bg-gray-100` (hover) | `bg-muted` |
| `text-gray-500` | `text-muted-foreground` |
| `text-gray-700` | `text-foreground` |
| `border-gray-300` | `border-border` |

Width, layout, and structure remain unchanged — only token replacements.

---

### 2F — Folder Assignment Redesign in Wizard

**File:** `src/components/deals/wizard/EnhancedDocumentsStep.tsx`

Redesign as a two-panel layout:

- **Left (60%):** Drag-and-drop zone — `react-dropzone` accepting multiple files; "Drop all files here" messaging
- **Right (40%):** File queue — each row shows:
  - Filename (truncated with tooltip)
  - Auto-detected folder shown as a colored badge (from `mapFileToFolder()`)
  - Dropdown to manually override folder assignment
  - Remove (×) button
- **Bottom:** Prominent "Skip for now — upload directly in the Data Room" skip button styled as ghost/muted

---

## Batch 3 — Deal Overview Rethink

### 3A — Remove Alarming / Premature Alerts

**File:** `src/components/deal-workspace/overview/AttentionRequiredCard.tsx`

- Add phase awareness — only show data room related alerts when `currentPhase` is `data_room_build` or later
- "No team members" alert only when past `listing_received`
- Move health percentage from the top of the overview to inside `DataRoomStatusCard`

**File:** `src/components/deal-workspace/DealStatusHeader.tsx`

- Wrap the workflow phase management dropdown in an `isAdmin()` check — non-admins see the status read-only

---

### 3B — Pipeline Progress Redesign

**File:** `src/components/deal-workspace/overview/DealPipelineProgress.tsx`

Replace the 11-item vertical list with a **horizontal stepper** using 5 macro phases:

```text
Intake → Preparation → Live → Offer → Closed
```

- Each macro phase wraps the relevant micro-phases (collapsed unless active)
- Only the active phase is expanded, showing its sub-steps
- Completed steps show timestamp via `format(date, 'MMM d, yyyy')`
- Remove the "blocked" state entirely from this component

**File:** `src/components/deal-workspace/tabs/DealOverviewTab.tsx`

- Replace the manual `milestones` object (lines 86–98) with `useDealStageManager(deal.id).stageInfo` fields directly
- This gives accurate timestamps for: `listing_received_at`, `listing_approved_at`, `data_room_complete_at`, `first_nda_signed_at`, `loi_submitted_at`, `loi_accepted_at`, `purchase_agreement_signed_at`, `closed_at`

---

### 3C — Modular Overview with User Personalization

**New hook:** `src/hooks/useOverviewPreferences.ts`

- Uses `localStorage` with key `deal-overview-prefs-{dealId}`
- Returns `{ visibleCards, toggleCard, resetPreferences }`
- 8 toggleable cards: Status Header, Attention Alerts, Pipeline Progress, Data Room Status, Key Information, Team, Recent Activity, Quick Actions

**File:** `src/components/deal-workspace/tabs/DealOverviewTab.tsx`

- Add a gear icon "Customize View" button in the overview header
- Opens a `Sheet` / slide-over drawer listing all 8 cards with `Switch` toggles
- Cards not in `visibleCards` simply don't render (no layout gaps)
- Prefs persist per deal per user via localStorage

---

### 3D — Header Declutter

**File:** `src/components/deal-workspace/DealWorkspace.tsx` (lines ~280–286)

- Remove the standalone "Edit Deal" button — this action now lives in the `MoreVertical` dropdown (implemented in the previous batch)
- Header right side: only "Share" icon button (admin only, Batch 6) + the `MoreVertical` dropdown
- Tab bar stays unchanged

---

### 3E — Deal Details Panel Inline Editing

**File:** `src/components/deals/DealDetailPanel.tsx`

Replace the single "Edit" button → modal pattern with **inline field editing**:

- Display mode: key-value pairs, clean and scannable
- Each field row shows a subtle pencil icon on hover
- Click any field to activate an inline `Input` / `Select` / `Textarea` for that field
- Save on blur or Enter key press — calls `supabase.from('deals').update(...)` immediately
- Show brief success toast on save
- Error reverts the field to its previous value

---

## Batch 4 — Task System & Navigation

### 4A — Task Delete Confirmation

**File:** `src/components/dashboard/TaskDetailDialog.tsx`

- Add `showDeleteConfirm` boolean state
- Replace the direct "Delete" button with one that sets `showDeleteConfirm = true`
- Add `AlertDialog` (already in the project):
  - Title: "Delete this task?"
  - Description: "This will permanently remove this task and cannot be undone."
  - "Cancel" / "Yes, delete" (destructive variant)
- Only call `deleteMutation.mutate()` on confirm

---

### 4B — "View Task" Routing + Breadcrumbs

**File:** `src/components/dashboard/TaskDetailDialog.tsx`

- Add a **"Go to Deal"** button next to the Related Deal field when `task.dealId` is set — calls `navigate(\`/deals/${task.dealId}\`)`
- Add breadcrumb in dialog header: `Dashboard > My Tasks > {task.title}`

**File:** `src/components/dashboard/MyTasksWidget.tsx`

- Add a subtle `→ {dealName}` link next to task rows that have a deal attached
- Clicking navigates directly to `/deals?deal={dealId}`

---

## Batch 5 — Team Management

### 5A — Team Group Assignment Foundation

**Database migrations:**
```sql
CREATE TABLE IF NOT EXISTS team_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS team_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES team_groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  role text,
  permissions jsonb DEFAULT '{}'::jsonb
);
```

**New files:**
- `src/hooks/useTeamGroups.ts` — fetch, create, update groups + their members
- `src/components/team/AddGroupModal.tsx` — lists existing groups; on select, bulk-adds all members to the deal
- `src/pages/TeamGroups.tsx` — admin-only settings page at `/settings/team-groups` for managing named groups

**File:** `src/components/deal-workspace/tabs/TeamTab.tsx`

- Add **"Add Group"** button alongside the existing "Add Member" button
- Opens `AddGroupModal`

**File:** `src/components/deals/wizard/SystemSetupStep.tsx`

- Add optional "Assign Team Group" `Select` dropdown at the bottom
- When a group is selected, all its members are automatically added to the deal on creation

---

### 5B — Live User Search

**File:** `src/components/team/InviteMemberModal.tsx`

- Change the exact-match `eq('email', email)` lookup to a partial, multi-field `ilike` search:
  ```
  .or(`email.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
  .limit(5)
  ```
- Change the static `Input` to a live combobox — debounce 300ms on keystroke
- Show a dropdown list of up to 5 matching users: avatar initials + full name + email
- Selecting from the dropdown populates `foundUser` — existing role selection flow is unchanged

---

## Batch 6 — Shareable Links & Settings

### 6A — Secure Shareable Link Architecture

**Database migration:**
```sql
CREATE TABLE IF NOT EXISTS deal_share_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  token uuid DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  expires_at timestamptz,
  access_level text DEFAULT 'teaser',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE deal_share_tokens ENABLE ROW LEVEL SECURITY;
```

**New files:**

- `src/pages/DealShareView.tsx` — read-only branded deal summary at `/share/:token`:
  - Validates token via Supabase (check `is_active`, `expires_at`)
  - Shows: company name, industry, financials teaser, key metrics
  - No edit or admin controls
  - "Interested? Contact us" CTA at the bottom

- `src/components/deals/ShareLinkButton.tsx`:
  - Button that generates a token (if none) or copies the existing link
  - Expiry options: 7 days / 30 days / No expiry
  - Shows the generated URL with copy-to-clipboard icon and checkmark feedback

**File:** `src/App.tsx`
- Add route: `<Route path="/share/:token" element={<DealShareView />} />`

**File:** `src/components/deal-workspace/DealWorkspace.tsx`
- Add `<ShareLinkButton dealId={deal.id} />` in the header actions area (admin only)

---

### 6B — Settings Architecture Fixes

**Database migration:**
```sql
ALTER TABLE deals ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{}'::jsonb;
```

**File:** `src/components/deal-workspace/tabs/DealSettingsTab.tsx`

- Wire `autoProgressionEnabled` toggle to `deals.settings.auto_progression` — load on mount, persist on toggle
- Wire `ddThreshold` slider to `deals.settings.dd_threshold` — load on mount, persist on change (debounced)
- Wire `emailNotifications` to `deals.settings.email_notifications`
- Add a sub-label under the Stage vs Status controls clarifying: *"Stage is your workflow position. Status is what's shown on cards and filters."*

**File:** `src/components/deal-workspace/tabs/DealOverviewTab.tsx`

- Replace the manual `milestones` object built from individual deal fields (lines 86–98) with direct consumption of `useDealStageManager(deal.id).stageInfo` — eliminates all the `null` entries and syncs the overview with settings

---

## File Change Summary

| Batch | File | Action |
|---|---|---|
| 1A | `BasicInfoStep.tsx` | Add business_type Select + Digital Agency option |
| 1A | `DealWizard.tsx` | Add business_type to interface + initial state + insert |
| 1B | `BasicInfoStep.tsx` | Rename labels with helper text |
| 1B | `DealListView.tsx`, `DealCardsView.tsx` | company_name primary, title secondary |
| 1C | `DealFilters.tsx` | Add deal_status filter group |
| 1C | `useMyDeals.ts` | Add deal_status query filter |
| 1D | `DealWizard.tsx` | Draft prompt UX polish |
| 2A | `DealWizard.tsx` | Fix upload to data_room_documents |
| 2A | `mapFileToFolder.ts` | New utility |
| 2A | `EnhancedDataRoomContent.tsx` | Unassigned tray |
| 2B | `DocumentViewerModal.tsx` | New modal |
| 2B | `DataRoomDocumentTable.tsx` | Wire viewer |
| 2B | `DataRoomDocumentGrid.tsx` | Wire viewer |
| 2C | `InlineUploadPanel.tsx` | New component |
| 2C | `DealOverviewTab.tsx` | Wire inline upload |
| 2D | `DealDiligenceTracker.tsx` | Add "View Data Room" button |
| 2D | `DealWorkspace.tsx` | Pass nav callback + requestId support |
| 2E | `EnhancedCategorySidebar.tsx` | Token cleanup |
| 2F | `EnhancedDocumentsStep.tsx` | Two-panel redesign |
| 3A | `AttentionRequiredCard.tsx` | Phase awareness |
| 3A | `DealStatusHeader.tsx` | Admin-only guard |
| 3B | `DealPipelineProgress.tsx` | Horizontal stepper |
| 3B | `DealOverviewTab.tsx` | Use stageInfo directly |
| 3C | `useOverviewPreferences.ts` | New hook |
| 3C | `DealOverviewTab.tsx` | Customize View drawer |
| 3D | `DealWorkspace.tsx` | Remove standalone Edit button |
| 3E | `DealDetailPanel.tsx` | Inline field editing |
| 4A | `TaskDetailDialog.tsx` | Delete confirmation |
| 4B | `TaskDetailDialog.tsx` | Go to Deal button + breadcrumb |
| 4B | `MyTasksWidget.tsx` | Deal link on task rows |
| 5A | `TeamTab.tsx` | Add Group button |
| 5A | `SystemSetupStep.tsx` | Group selector |
| 5A | `AddGroupModal.tsx` | New component |
| 5A | `useTeamGroups.ts` | New hook |
| 5A | `TeamGroups.tsx` | New settings page |
| 5B | `InviteMemberModal.tsx` | Live search with ilike |
| 6A | `DealShareView.tsx` | New page |
| 6A | `ShareLinkButton.tsx` | New component |
| 6A | `App.tsx` | Add /share/:token route |
| 6A | `DealWorkspace.tsx` | Add ShareLinkButton to header |
| 6B | `DealSettingsTab.tsx` | Wire auto-progression + DD threshold |
| 6B | `DealOverviewTab.tsx` | Replace milestones with stageInfo |

**DB Migrations required (5 total):**
1. `deals.business_type text`
2. `deals.settings jsonb`
3. `team_groups` table
4. `team_group_members` table
5. `deal_share_tokens` table

---

## Execution Order

Batches will be executed sequentially. Each is self-contained and testable independently before moving on. Batch 1 first (no risk, pure UX), then Batch 2A as the critical bug fix, followed by the rest of the data room work, then the overview, task, team, and shareable links batches in order.
