

# Data Room Visual Overhaul — Mirror the Requests Tab Sidebar + Professional Document Viewer

## Problem Summary

There are currently **two different data room sidebar components** with inconsistent styling, and the document viewer is a basic modal rather than the professional inline viewer seen in the ZKW reference images. Specifically:

1. **`DataRoomFolderSidebar.tsx`** (used by `DealDataRoomTab.tsx`) — still uses hardcoded `bg-gray-50`, `text-blue-700`, `bg-blue-50`, `border-gray-200` etc. This is the ugly one you see.
2. **`EnhancedDataRoomSidebar.tsx`** (used by `DealWorkspace.tsx`) — uses some semantic tokens but has its own style with motion animations and a search bar that differs from the Requests sidebar.
3. **Neither** matches the clean, token-based `EnhancedCategorySidebar.tsx` (Requests tab) which uses `bg-card`, `bg-primary/10`, `text-primary`, `border-border`, etc.
4. The **document viewer** is a dialog/modal popup — the ZKW reference shows an inline embedded PDF viewer with a comments panel alongside it.

---

## What Changes

### 1. Consolidate to One Sidebar Component

**Delete `DataRoomFolderSidebar.tsx`** and update `DealDataRoomTab.tsx` to use the `EnhancedDataRoomSidebar` instead (same component the DealWorkspace already uses).

### 2. Restyle `EnhancedDataRoomSidebar.tsx` to Match Requests Sidebar

Apply the exact same design language as `EnhancedCategorySidebar.tsx`:

| Element | Current (Data Room) | Target (Requests style) |
|---|---|---|
| Container | `bg-card rounded-xl border border-border` | `bg-card border-r border-border` (no rounded, flush to edge) |
| Header | `font-semibold text-foreground text-sm` + search bar | `text-xs font-bold text-muted-foreground uppercase tracking-wider` — "FOLDERS" label, no search |
| "All Documents" selected | `bg-primary text-primary-foreground` (solid fill) | `bg-primary/10 text-primary border border-primary/20 shadow-sm` (subtle tint) |
| Category selected | `bg-primary/10 text-primary` | Same (already matches) |
| Category name | Shows index number prefix | Keep as-is for data room context |
| Progress bar | Inline under category name | Move below category row, same `h-1.5` bar with `completed/total` count |
| Folder items | `ring-1 ring-primary/30` on select | `border-l-2 border-primary` on select (matches subcategory style) |
| Folder bullet | Folder icon | Simple `dot` bullet like requests subcategories |
| Folder count | Badge pill | Plain `text-xs tabular-nums` count like `0/0` |
| Status indicators | CheckCircle, AlertCircle, N/A badge | CheckCircle for complete, red dot for missing (same as requests) |
| Remove | Framer Motion hover animations (`whileHover`) | Simple CSS transitions (`transition-all duration-150`) |
| Remove | Search input in header | Remove — search lives in the content toolbar |
| Remove | Folder selection mode / bulk actions in sidebar | Keep folder management in content area only |

### 3. Restyle `DealDataRoomTab.tsx` Content Area

Replace all hardcoded gray/blue colors with semantic tokens:

- `bg-white` -> `bg-card`
- `border-gray-200` -> `border-border`
- `bg-gray-50/80` -> `bg-muted/50`
- `text-gray-400` -> `text-muted-foreground`
- `text-gray-900` -> `text-foreground`
- `bg-blue-600` -> `bg-primary`
- `bg-gray-100` -> `bg-muted`

### 4. Professional Inline Document Viewer

Replace the current modal-based `DocumentViewerModal` with an **inline viewer panel** inspired by the ZKW reference:

**New component: `InlineDocumentViewer.tsx`**

Layout when a document is selected (replaces the document list):

```text
+------------------+----------------------------+------------------+
|   Sidebar        |   Document Viewer          |  Comments Panel  |
|   (folders)      |                            |  (optional)      |
|                  |  [File name]    v1.0  [DL] |                  |
|                  |  [PDF/Office viewer]       |  Add comment...  |
|                  |  [iframe with toolbar]     |  [Post]          |
|                  |                            |                  |
|                  |                            |  No comments yet |
+------------------+----------------------------+------------------+
```

- **Header bar**: File icon + name + subtitle (filename.pdf) + version badge + Download button
- **Viewer body**: Same rendering logic as current `DocumentViewerModal` (PDF iframe, Google Docs viewer for Office, img tag for images)
- **Comments panel** (right, 280px): "Add a comment..." input + Post button + comment list (future — show "No comments yet" placeholder for now)
- **Back navigation**: Clicking a different folder or "back" returns to the document list view
- **Clicking a document row** in the table/list transitions to this inline view instead of opening a modal

### 5. Wire Document Click to Inline Viewer

**In `DealDataRoomTab.tsx`:**
- Add `viewingDocumentId` state
- When a document is clicked, set `viewingDocumentId` instead of opening a modal
- Render `InlineDocumentViewer` in place of the document list when `viewingDocumentId` is set
- Add a "Back to documents" breadcrumb/button above the viewer

**In `DealWorkspace.tsx` (data-room tab):**
- Same pattern — clicking a document in `DataRoomDocumentTable` sets a viewing state
- Render inline viewer instead of the table

---

## Files Changed

| File | Action |
|---|---|
| `src/components/data-room/EnhancedDataRoomSidebar.tsx` | Restyle to match `EnhancedCategorySidebar` design tokens and layout |
| `src/components/data-room/DataRoomFolderSidebar.tsx` | Delete (consolidated into EnhancedDataRoomSidebar) |
| `src/components/deals/tabs/DealDataRoomTab.tsx` | Use `EnhancedDataRoomSidebar`, replace hardcoded colors, wire inline viewer |
| `src/components/data-room/InlineDocumentViewer.tsx` | New — professional inline viewer with comments panel |
| `src/components/data-room/DocumentViewerModal.tsx` | Keep as fallback but primary UX moves to inline viewer |
| `src/pages/DealWorkspace.tsx` | Wire inline viewer for data room tab |
| `src/components/data-room/DataRoomDocumentTable.tsx` | Update click handler to support inline viewing |
| `src/components/data-room/EnhancedDataRoomContent.tsx` | Wire inline viewer state |

---

## Visual Result

After this change:
- The Data Room sidebar will be visually **identical** to the Requests tab sidebar — same spacing, tokens, progress bars, selection states, and typography
- Clicking a document opens a **professional inline viewer** (like ZKW) with the PDF/Office file rendered in-page alongside a comments panel, not a floating modal
- All hardcoded gray/blue values are eliminated across the data room UI
- One unified sidebar component serves both the standalone data room page and the deal workspace tab

