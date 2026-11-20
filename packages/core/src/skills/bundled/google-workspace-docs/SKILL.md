---
name: google-workspace-docs
description: >-
  Deliver owner-facing documents in Google Workspace via Composio: contracts and
  PKWT as Google Docs, tables as Sheets, decks as Slides. Use when the owner asks
  for a document, perjanjian, PKWT, template HR, spreadsheet, or presentation —
  never ship HTML as the final file unless they ask for HTML.
---

# Google Workspace documents (Composio)

Create real Docs / Sheets / Slides the owner can open and edit. Do not end a document request with an HTML artifact or a `.html` file.

## Pick the format

| Owner ask | Toolkit | Deliverable |
| --- | --- | --- |
| Surat, perjanjian, PKWT, kebijakan, SOP, surat peringatan | **googledocs** | Google Doc + shareable link |
| Tabel, roster, daftar, payroll grid, checklist bertab | **googlesheets** | Google Sheet + link |
| Presentasi, onboarding deck, pitch singkat | **googleslides** | Google Slides + link |
| Word offline only (owner said “docx” / “Word”) | builtin `write_docx` | `.docx` artifact |

If several formats fit, prefer **Docs** for prose contracts, **Sheets** for tabular data, **Slides** for decks.

## Gate

1. Confirm the matching Composio toolkit is assigned and connected (`googledocs`, `googlesheets`, and/or `googleslides`). Keep **googledrive** connected when you need find/move/share.
2. If missing or `COMPOSIO_NOT_CONNECTED` / `oauth_in_progress`, call `composio__connect_account` with that slug once, send the connect link or Connect button, and stop until connected. Do not invent a successful create.
3. Discover action slugs with `composio__search_actions` (query: create document / create spreadsheet / create presentation / insert text / append values). Names vary — do not hard-code one slug forever.

## Create flow

1. Ask only for facts you do not have (nama pihak, tanggal, lokasi, upah, jabatan). Do not invent company-specific legal facts.
2. Create the file with a clear title (example: `PKWT - <Nama> - <YYYY-MM>`).
3. Write the body with structured headings and numbered pasal/klausul when it is a contract. Cite UU/PP pasal when the HR skill supplied them; do not invent pasal numbers.
4. Return the **open URL** to the owner. Offer one short note that a lawyer/Disnaker should review binding text.
5. Optional: share via Drive tools if the owner named a collaborator email.

## Hard rules

1. **No HTML deliverable** for PKWT / perjanjian / kebijakan unless the owner explicitly asks for HTML.
2. Do not paste the full contract only in chat when Docs is connected — put it in the Doc, then summarize in chat with the link.
3. If Docs/Sheets/Slides cannot connect after one connect attempt, fall back to `write_docx` for prose (or say Sheets is required for tables). Say what you delivered and why.
4. Never claim a Google file exists without a tool result that includes an id or URL.

## When not to use

- Quick Q&A about pasal (use `hr-uu-ketenagakerjaan` + search/read only).
- Images, Design page media, or chat-only drafts the owner did not ask to file.
