# Airin Research Data — workbook schema

Title: **Airin Research Data**

## Tabs

| Order | Tab | Purpose |
|---|---|---|
| 1 | `Leads` | B2B / local business leads |
| 2 | `Competitors` | Brand / GEO / local rival maps |
| 3 | `Enrichment` | Field fills after company/person enrich |
| 4 | `SEO` | Keywords, volume, SERP URLs, backlinks |
| 5 | `Candidates` | Hiring scout public profiles |
| 6 | `Outreach` | Draft messages (status=`draft` until owner sends) |
| 7 | `Runs` | One summary row per agent run / tidy |
| 8 | `_Index` | Optional: tab roster + last tidy ISO time |

## Column lists (pipe = separate cells)

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

## Classification hints (messy Sheet1 → tab)

| Header / label signals | Target tab |
|---|---|
| company, email, website, lead | `Leads` |
| brand, rating, reviews, competitor, GEO, laundry place | `Competitors` |
| input_key, field, value, enrich | `Enrichment` |
| keyword, volume, difficulty, rank_url, SERP | `SEO` |
| full_name, headline, profile_url, candidate, scout | `Candidates` |
| subject, body, to_email, outreach, draft | `Outreach` |
| test_case, tools_used, rows_written, cost_note | `Runs` |

## Anti-patterns

- Multiple datasets stacked on `Sheet1` with text labels between them
- Writing `Competitors!…` ranges when the tab does not exist (fix → create tab first)
- Inventing emails, phones, ratings, volumes, or difficulty scores
- Overwriting headers mid-tab with a second header row
