---
name: tapinall-research
description: >-
  Live SEO, GEO, lead, outreach, hiring scout, competitor, and market research
  with Tapinall (catalog_search → catalog_get → call), then write every row into
  the owner's Google Sheet. Require Gmail, Google Drive, and Google Sheets first.
---

# Tapinall research → Google Sheets

## Gate (mandatory)

Before any Tapinall `call`:

1. Confirm Composio **gmail**, **googledrive**, and **googlesheets** are connected for this user. If any is missing, call `composio__connect_account` for that slug and stop until the user connects.
2. Find or create the workbook **Airin Research Data** in their Drive (Sheets). Keep one spreadsheet per org when possible.
3. Ensure tabs exist: `Leads`, `Competitors`, `Enrichment`, `SEO`, `Candidates`, `Outreach`, `Runs`. Create missing tabs.
4. Write the spreadsheet URL into org memory under Pinned as `Research sheet: <url>` so later turns reuse it.

## Tapinall tool order

1. `catalog_search` with a short query (for example `tiktok profile`, `company enrich`, `google maps`, `serp`, `linkedin`).
2. `catalog_get` on the chosen tool id — check price and required params.
3. `call` with `maxCostMicro` when the user set a budget.
4. Append results to the matching sheet tab via **googlesheets** (never invent rows).

## Which tab?

| Work | Tab |
|---|---|
| B2B / local leads | `Leads` |
| Competitor / brand map | `Competitors` |
| Field fill after enrich | `Enrichment` (+ patch source tab) |
| Keyword / SERP / backlink (SEO) | `SEO` |
| Hiring / candidate scout | `Candidates` |
| Outreach drafts / sequence rows | `Outreach` |
| Every run summary | `Runs` |

## Sheet columns (minimum)

### Leads

`fetched_at | source_tool | company | name | title | email | phone | city | country | website | notes | raw_json`

### Competitors

`fetched_at | source_tool | brand | website | city | category | rating | reviews | pricing_signal | notes | raw_json`

### Enrichment

`fetched_at | source_tool | input_key | field | value | notes | raw_json`

### SEO

`fetched_at | source_tool | keyword | locale | volume | difficulty | rank_url | rank_position | serp_feature | backlink_domain | notes | raw_json`

### Candidates

`fetched_at | source_tool | full_name | headline | location | profile_url | skills | years_signal | email | phone | notes | raw_json`

### Outreach

`fetched_at | channel | persona | to_name | to_email | company | subject | body | status | sheet_row_ref | notes`

### Runs

`fetched_at | agent | test_case | query | tools_used | rows_written | sheet_url | cost_note`

## Outreach note

Draft rows in **Outreach** first. Send via Gmail only when the owner confirms. Never invent emails.

## Output to the user

1. Short summary of what was found.
2. How many rows were written, and to which tab.
3. Clickable link to the Google Sheet.
4. Offer the next test case if useful.

## Test cases (examples)

Read `references/test-cases.md` in this skill folder and run the case the user names (or the closest match).
