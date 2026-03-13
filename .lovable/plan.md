

# Updated CRM QA Fix Plan

## User Constraints
1. **No separate Leads or Meetings modules** — Lead management stays within the Deals pipeline (Lead stage). No standalone modules.
2. **Consistent terminology** — Always use "Action Items" everywhere, never "Tasks."

## Priority Fixes (Updated)

### Critical
| # | Issue | File(s) | Effort |
|---|-------|---------|--------|
| 1 | XSS in email template preview — add DOMPurify sanitization | `TemplatePreviewModal.tsx` | Small |
| 2 | Dashboard data visibility — admins should see all records, not just own | `useDashboardData.tsx` | Medium |
| 3 | Add account selector to DealForm | `DealForm.tsx`, stage forms | Medium |
| 4 | Audit log data leak — restrict dashboard widget to admin role | `useDashboardData.tsx`, `RecentActivitiesWidget.tsx` | Small |

### High
| # | Issue | File(s) | Effort |
|---|-------|---------|--------|
| 5 | Re-add module_type filter to Action Items page | `ActionItems.tsx` | Small |
| 6 | Add contact filters (source, owner, region) | `Contacts.tsx` | Medium |
| 7 | Fix Email Analytics 1000-row Supabase limit | `EmailAnalyticsDashboard.tsx` | Medium |
| 8 | Rename any "Task/Tasks" labels to "Action Items" across entire UI (sidebar, buttons, tooltips, dashboard widgets, campaign tabs, settings) | Multiple files | Medium |

### Medium
| # | Issue | File(s) | Effort |
|---|-------|---------|--------|
| 9 | Standardize header/filter bar styling across all modules | Module pages | Small |
| 10 | Fix notification separator rendering when already read | `Notifications.tsx` | Small |
| 11 | Fix bulk account delete cascade (orphan deals) | `Accounts.tsx` | Medium |
| 12 | Add Forgot Password flow to Auth page | `Auth.tsx` | Medium |

### Low
| # | Issue | File(s) | Effort |
|---|-------|---------|--------|
| 13 | Remove `console.log` from UserManagement | `UserManagement.tsx` | Trivial |
| 14 | Fix Settings `h-screen` double scroll | `Settings.tsx` | Small |
| 15 | Add empty state for tables when no records match | Account/Contact tables | Small |

## Terminology Audit — "Tasks" → "Action Items"

Files to update (rename all user-facing "Task" references to "Action Items"):
- `AppSidebar.tsx` — sidebar menu label
- `QuickActionsWidget.tsx` — "Task" button label → "Action Item"
- `ActionItemsWidget.tsx` — verify title says "Action Items"
- `TodaysTasksPopup.tsx` — rename to "Today's Action Items" in heading
- `DashboardHeader.tsx` — any "task" references
- `CampaignActionItemsTab.tsx` — tab label verification
- `DealExpandedPanel.tsx` — section headers
- `ActionItemModal.tsx` — dialog titles/descriptions
- Campaign settings — any "task" labels

## Excluded from Plan
- **No separate Leads module** — Leads are managed as the first stage of the Deals pipeline (already implemented)
- **No separate Meetings module** — Not creating a standalone meetings page
- **No "Tasks" module** — The module is called "Action Items" everywhere

## Implementation Order
1. Fix #1 (XSS) + Fix #13 (console.log) — quick security wins
2. Fix #8 (rename Tasks → Action Items everywhere) — terminology consistency
3. Fix #2 + #4 (dashboard data/audit) — data visibility
4. Fix #3 (account selector in DealForm)
5. Fix #5 + #6 (missing filters)
6. Fix #7 + #9 + #10 (analytics limit, UI consistency)
7. Fix #11 + #12 (cascade, forgot password)
8. Fix #14 + #15 (low priority polish)

