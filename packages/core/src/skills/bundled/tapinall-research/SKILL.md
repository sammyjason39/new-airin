---
name: tapinall-research
description: >-
  Live SEO, GEO, lead, outreach, hiring scout, competitor research via the
  Airin Library connector → Google Sheet. Drive required; Sheets preferred for
  named sheets; Gmail only for send. For tidy multi-sheet layout, use
  research-sheet-manager.
---

# Research → Google Sheets (Airin Library)

## User-facing voice (hard rules)

1. Never say Tapinall, MCP, catalog_search, catalog_get, tool ids, routers, Apollo, or other vendor/tool names to the user.
2. Never quote per-call prices, `$0.0…`, micro-USD, or maxCost. Usage dollars belong only on the Connectors / Airin Library settings screen.
3. Do not list tool options or ask which backend to use. Pick the best connector quietly and deliver the result.
4. If you must name the capability, say **Airin Library** or **Airin Connector** — never a third-party brand.
5. Speak in plain product language: “cari lead”, “simpan ke sheet Leads”, not “tab.” jargon unless the user already used that word.
6. Same rules in **group chat** and 1:1 — research skills and Google writes work in both.

## Gate

1. Confirm **googledrive** is connected. Call `composio__connect_account` if not.
2. Prefer **googlesheets** connected for named sheets. If Sheets is missing or `oauth_in_progress`, call `composio__connect_account` for `googlesheets` once, then continue with Drive spreadsheet value tools on workbook **Airin Research Data**. If only `Sheet1` exists, append under a clear labeled header for that dataset and note that **research-sheet-manager** tidy is required after Sheets connects.
3. **gmail** is required only for send/outreach. Do not block SEO/GEO/leads/scout research writes on Gmail.
4. `load_skill` **research-sheet-manager** when creating or renaming sheets (needs Sheets connected).
5. Pin `Research sheet: <url>` in org memory when you find or create the workbook.

## Hard rules for writes

1. Prefer named sheets: `Leads`, `Competitors`, `Enrichment`, `SEO`, `Candidates`, `Outreach`, `Runs`.
2. A1 ranges should include the sheet name when it exists (`Competitors!A2:K`).
3. Never invent emails, phones, ratings, volumes, or difficulty scores.
4. Log every run in `Runs` (or a Runs block on Sheet1 until tidy).

## Connector order (internal only — never narrate to the user)

1. Search the Airin Library catalog with a short query (for example `google maps`, `serp`, `linkedin`).
2. Inspect the chosen tool id — check params; set `maxCostMicro` only when the user set a budget (do not report that number).
3. Call the tool.
4. Append results to the matching sheet (or labeled Sheet1 block if named sheets are not available yet).

## Which sheet?

| Work | Sheet |
|---|---|
| B2B / local leads | `Leads` |
| Competitor / brand / GEO map | `Competitors` |
| Field fill after enrich | `Enrichment` (+ patch source sheet) |
| Keyword / SERP / backlink (SEO) | `SEO` |
| Hiring / candidate scout | `Candidates` |
| Outreach drafts / sequence rows | `Outreach` |
| Every run summary | `Runs` |

Column lists live in **research-sheet-manager** → `references/workbook-schema.md`.

## Outreach note

Draft rows in **Outreach** first. Send via Gmail only when the owner confirms. Never invent emails. Connect Gmail before send.

## Output to the user (embed in chat)

Always put the result **in the chat message itself** — do not only point at the sheet:

1. One short summary sentence (no vendor or cost talk).
2. A markdown table of the key rows (top 5–10 is enough when many).
3. Counts: rows written + sheet name (plain words).
4. Clickable Google Sheet URL.
5. If Sheets is still not connected, remind the owner to finish Connect so the workbook can be tidied into real sheets.

## Test cases (examples)

Read `references/test-cases.md` in this skill folder and run the case the user names (or the closest match).
