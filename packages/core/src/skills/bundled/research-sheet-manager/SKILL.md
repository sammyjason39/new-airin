---
name: research-sheet-manager
description: >-
  Keep the Airin Research Data Google workbook tidy with real tabs (Leads,
  Competitors, Enrichment, SEO, Candidates, Outreach, Runs). Use when sheets look
  messy, data landed on Sheet1, tabs are missing, or the owner asks to tidy /
  reorganize / create multiple tabs.
---

# Research workbook manager (multi-tab)

One workbook per org: **Airin Research Data**. Never dump labeled blocks into a single `Sheet1`.

## Gate

1. Confirm Composio **googlesheets** is connected. Creating, renaming, or deleting tabs needs Sheets — Drive value tools alone cannot add tabs. If missing, call `composio__connect_account` with `googlesheets` and stop until connected.
2. Keep **googledrive** connected for find/create workbook and cell writes when useful.
3. Resolve the spreadsheet id:
   - Prefer org memory Pinned line `Research sheet: <url>`.
   - Else search Drive for title **Airin Research Data**.
   - Else create a new Google Sheet with that title via **googlesheets** (not a blank Drive file that only has `Sheet1` forever).
4. Pin `Research sheet: <url>` after create/find.

## Required tabs (exact names)

Create every missing tab. Keep this order when possible:

1. `Leads`
2. `Competitors`
3. `Enrichment`
4. `SEO`
5. `Candidates`
6. `Outreach`
7. `Runs`
8. `_Index` (optional cover: tab list + last tidy timestamp)

Delete or leave empty the default `Sheet1` only after its useful rows moved. Do not leave research data on `Sheet1`.

## Header row (row 1, frozen when the toolkit allows)

Write headers once. Append data from row 2. Never invent values. Leave cells blank when tools return nothing.

| Tab | Columns |
|---|---|
| `Leads` | `fetched_at \| source_tool \| company \| name \| title \| email \| phone \| city \| country \| website \| notes \| raw_json` |
| `Competitors` | `fetched_at \| source_tool \| brand \| website \| city \| category \| rating \| reviews \| pricing_signal \| notes \| raw_json` |
| `Enrichment` | `fetched_at \| source_tool \| input_key \| field \| value \| notes \| raw_json` |
| `SEO` | `fetched_at \| source_tool \| keyword \| locale \| volume \| difficulty \| rank_url \| rank_position \| serp_feature \| backlink_domain \| notes \| raw_json` |
| `Candidates` | `fetched_at \| source_tool \| full_name \| headline \| location \| profile_url \| skills \| years_signal \| email \| phone \| notes \| raw_json` |
| `Outreach` | `fetched_at \| channel \| persona \| to_name \| to_email \| company \| subject \| body \| status \| sheet_row_ref \| notes` |
| `Runs` | `fetched_at \| agent \| test_case \| query \| tools_used \| rows_written \| sheet_url \| cost_note` |

Full detail: `references/workbook-schema.md`.

## Tool choice

1. Prefer **googlesheets** tools for: create workbook, add/rename/delete sheet, batch update, append rows, clear range.
2. Discover exact slugs from the connected toolkit (names vary). Prefer actions that mention add/create sheet, append, batch update, get spreadsheet.
3. **googledrive** `*_SPREADSHEET_VALUES` tools may write cells **only** with an A1 range that includes a real tab name, for example `Competitors!A1:K1`. Never use bare `A1` / `Sheet1` for new research rows.
4. If a write fails with `Unable to parse range` or missing sheet, create the tab with **googlesheets**, then retry. Do not fall back to labeled dumps on `Sheet1`.

## Append rules

1. Read the tab header first. If empty, write the standard header row.
2. Append below the last non-empty row. Do not overwrite prior research unless the owner asks to replace a run.
3. Write one dataset per sheet. One Airin Library research run → matching sheet + one `Runs` row.
4. Prefer stable A1 ranges with the tab title quoted when it has spaces (these titles have none).

## Tidy a messy workbook (Sheet1 dumps)

When `Sheet1` has mixed blocks (GEO / SEO / Candidates / Competitors labels, multiple header rows, or overlapping ranges):

1. Gate **googlesheets**. Stop if not connected — tell the owner tidy needs Sheets.
2. Ensure all required tabs exist with correct headers.
3. Classify each contiguous block on `Sheet1` by its header keywords (`brand`/`rating` → Competitors, `keyword`/`rank_url` → SEO, `full_name`/`headline` → Candidates, etc.).
4. Copy rows into the matching tab (map columns; drop unknown columns into `notes` or `raw_json`). Skip pure label/title rows.
5. Append a `Runs` row: `test_case=tidy`, `query=migrate Sheet1 blocks`, `rows_written=<n>`.
6. Clear migrated ranges on `Sheet1`, or replace `Sheet1` with a short pointer: `Data lives on tabs Leads, Competitors, …` plus the sheet URL.
7. Report to the owner: tabs created, rows moved per tab, sheet URL.

## When tapinall-research calls this skill

Before any Airin Library research write:

1. Ensure workbook + required sheets + headers exist (this skill).
2. Only then append research rows to the correct sheet.
3. Refuse Sheet1 labeled-block workarounds.

## User-facing voice

Never say Tapinall, tool ids, or per-call prices. Say **Airin Library** / sheet names only. Same in group chat.

## Output to the user

1. Spreadsheet URL.
2. Sheet list (existing vs created) — plain words, not “tab.” jargon unless the user said it.
3. Rows moved or written per sheet.
4. Any column that stayed blank because tools returned nothing.
