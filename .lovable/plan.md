
## Add Delete Deal Functionality to /deals Page

### Problem Summary

There are currently **three non-functional buttons** in the deals section:
1. `MoreVertical` (three dots) in the `DealDetailPanel` header — imported but wired to nothing
2. `MoreVertical` in the `DealListView` row — has a comment saying `// Handle menu actions` but does nothing
3. `MoreVertical` in the `DealManagement` page header — also a placeholder

As an admin, there is no way to delete a deal from the `/deals` page at all.

---

### Recommendation

**Wire up the existing `MoreVertical` buttons as dropdown menus** using the already-installed `DropdownMenu` component from Radix UI. This is the cleanest pattern — no new UI paradigms, no extra pages, just making the buttons that already exist actually work.

The delete action should be **admin/super_admin only** and protected behind a **confirmation dialog** (`AlertDialog`) to prevent accidental deletion. This matches the RLS policy on the database: only `admin` and `super_admin` can delete deals.

---

### Where Delete Will Appear

**1. DealDetailPanel (the slide-out panel)**
- Wire the `MoreVertical` button to a `DropdownMenu` with:
  - Edit Deal
  - Archive Deal
  - Delete Deal (destructive, admin only)
- Clicking "Delete Deal" opens an `AlertDialog`: *"Are you sure? This cannot be undone."*
- On confirm: deletes the deal, closes the panel, refreshes the list

**2. DealListView (each row)**
- Wire the `MoreVertical` button in each row to a `DropdownMenu` with the same options
- Scoped to that specific deal row

**3. Cards View (optional/future)**
- The `UnifiedDealCard` currently doesn't have a kebab menu — can add one as a follow-up

---

### Technical Implementation

**Files to modify:**

- **`src/components/deals/DealDetailPanel.tsx`**
  - Import `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuTrigger`, `DropdownMenuSeparator` from `@/components/ui/dropdown-menu`
  - Import `AlertDialog`, `AlertDialogAction`, `AlertDialogCancel`, `AlertDialogContent`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogHeader`, `AlertDialogTitle` from `@/components/ui/alert-dialog`
  - Import `useUserProfile` to check `isAdmin()`
  - Add `showDeleteConfirm` state (boolean)
  - Add `handleDelete` async function that calls `supabase.from('deals').delete().eq('id', dealId)`, then calls `onClose()` and `onDealUpdated()`
  - Wrap the `MoreVertical` button in a `DropdownMenuTrigger` and add a `DropdownMenuContent` with Edit, Archive, and (admin-only) Delete options
  - Add `AlertDialog` at the bottom of the component controlled by `showDeleteConfirm`

- **`src/components/deals/DealListView.tsx`**
  - Same dropdown pattern for each row's `MoreVertical` button
  - Needs `onDealSelect` and a `onDealDeleted` callback prop passed from `DealManagement`
  - Scoped delete confirmation per row

- **`src/pages/DealManagement.tsx`**
  - Pass a `onDealDeleted` handler to `DealListView` that calls `refresh()`

---

### Role Guard Logic

```
const { isAdmin } = useUserProfile();

// Only render delete option if admin
{isAdmin() && (
  <DropdownMenuItem className="text-destructive" onClick={() => setShowDeleteConfirm(true)}>
    Delete Deal
  </DropdownMenuItem>
)}
```

This mirrors the existing `canCreateDeals` pattern already in `DealManagement.tsx`.

---

### Confirmation Dialog Copy

- **Title**: "Delete this deal?"
- **Description**: "This will permanently delete [deal title] and all associated data. This action cannot be undone."
- **Cancel**: "Cancel"
- **Confirm**: "Yes, delete deal" (destructive red button)
