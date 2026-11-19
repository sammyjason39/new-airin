# Tapinall research — example test cases

Use these as demos and regression scripts. Each case assumes Gmail, Google Drive, and Google Sheets are connected, and Tapinall MCP is assigned.

## Quick copy prompts (Bahasa Indonesia)

| ID | Agent | Paste into chat |
|---|---|---|
| TC-SALES-01 | Sales (Fajar) | Saya jual POS laundry di Jakarta Selatan. Buatkan peta kompetisi: 15 kompetitor lokal (nama, alamat, rating, jumlah review). Simpan ke sheet Competitors. |
| TC-SALES-02 | Sales (Fajar) | Cari 20 leads pemilik laundry / usaha laundry di Bandung (nama bisnis, kota, website/telepon jika ada). Simpan ke sheet Leads. |
| TC-SALES-03 | Sales (Fajar) | Enrich 5 leads di sheet Leads yang belum punya website/email. Pakai company enrichment Tapinall. Tulis hasil ke Enrichment dan update kolom Leads jika ketemu. |
| TC-LEADS-01 | Sales (Fajar) | Cari 25 leads B2B: pemilik / manajer laundry di Surabaya (nama bisnis, kontak jika publik, website). Simpan ke Leads. Jangan mengarang email. |
| TC-GEO-01 | Sales / Analyst | GEO lokal: mapping 20 tempat "laundry kiloan" dalam radius 5 km dari Blok M, Jakarta. Simpan ke Competitors (kolom city/rating). |
| TC-SEO-01 | Sales / Social (Kezia) | SEO: riset keyword "software pos laundry" untuk Indonesia — volume, difficulty, 10 URL ranking. Simpan ke sheet SEO + Runs. |
| TC-COMP-01 | Analyst (Ardi) | Cari kompetitor digital untuk merek POS laundry kami: 10 domain, pricing signal jika ada, review ringkas. Simpan ke Competitors. |
| TC-RESEARCH-01 | Analyst (Ardi) | Research singkat: market map kategori "pos software" di Indonesia (keyword utama + siapa ranking). Simpan Competitors + SEO + Runs. |
| TC-OUTREACH-01 | Sales (Fajar) | Dari 5 leads di sheet Leads yang punya email, draft outreach singkat (Bahasa Indonesia) untuk demo POS. Tulis ke sheet Outreach. Jangan kirim email sebelum saya setuju. |
| TC-SCOUT-01 | Recruiting (Maya) | Scouting: cari 10 kandidat potential "customer support WhatsApp" di Jakarta (profil publik). Simpan ke Candidates. Jangan mengarang kontak. |
| TC-ANALYST-01 | Analyst (Ardi) | Buat market map untuk kategori "pos software" di Indonesia: volume keyword utama, siapa yang ranking di Google, dan 5 backlink domain kompetitor #1 jika tersedia. Simpan ringkasan ke Competitors + Runs. |
| TC-ANALYST-02 | Analyst (Ardi) | Ambil profil TikTok / Instagram publik untuk 3 brand kompetitor laundry di Jakarta (followers, bio). Simpan ke Competitors. |
| TC-VIEW-01 | Any / platform | Tunjukkan sheet Research Data saya dan pastikan Data View bisa membacanya. |

---

## TC-SALES-01 — Peta kompetisi lokal (Sales / Fajar)

**Prompt**

> Saya jual POS laundry di Jakarta Selatan. Buatkan peta kompetisi: 15 kompetitor lokal (nama, alamat, rating, jumlah review). Simpan ke sheet Competitors.

**Expected agent path**

1. Gate Google connections.
2. `catalog_search` → Google Maps / places tools.
3. `call` with query like `POS laundry` / `laundry` + location Jakarta Selatan.
4. Append rows to **Competitors**.
5. Log the run in **Runs**.
6. Return sheet link + short map summary (top 5 by reviews).

## TC-SALES-02 — Cari leads B2B (Sales / Fajar)

**Prompt**

> Cari 20 leads pemilik laundry / usaha laundry di Bandung (nama bisnis, kota, website/telepon jika ada). Simpan ke sheet Leads.

**Expected**

1. Search Tapinall for local business / maps / company tools.
2. Write to **Leads** with `source_tool` filled.
3. Do not invent emails — leave blank when missing.

## TC-SALES-03 — Enrich leads (Sales / Fajar)

**Prompt**

> Enrich 5 leads di sheet Leads yang belum punya website/email. Pakai company enrichment Tapinall. Tulis hasil ke Enrichment dan update kolom Leads jika ketemu.

**Expected**

1. Read existing Leads via googlesheets.
2. Pick rows missing website/email.
3. Tapinall company enrich tools.
4. Append **Enrichment** + patch **Leads**.

## TC-LEADS-01 — Lead list B2B (Sales)

**Prompt**

> Cari 25 leads B2B: pemilik / manajer laundry di Surabaya (nama bisnis, kontak jika publik, website). Simpan ke Leads. Jangan mengarang email.

**Expected**

1. Maps / company directory tools.
2. Rows in **Leads**; blank contact fields when unknown.
3. **Runs** row.

## TC-GEO-01 — GEO / local area map (Sales or Analyst)

**Prompt**

> GEO lokal: mapping 20 tempat "laundry kiloan" dalam radius 5 km dari Blok M, Jakarta. Simpan ke Competitors (kolom city/rating).

**Expected**

1. Google Maps / places radius query via Tapinall.
2. **Competitors** rows with city + rating when available.
3. Short geo summary in chat.

## TC-SEO-01 — SEO keyword + SERP (Sales / Social)

**Prompt**

> SEO: riset keyword "software pos laundry" untuk Indonesia — volume, difficulty, 10 URL ranking. Simpan ke sheet SEO + Runs.

**Expected**

1. Keyword / SERP tools via Tapinall.
2. Rows in **SEO**.
3. Label missing volume/difficulty clearly; never invent metrics.

## TC-COMP-01 — Cari kompetitor digital (Analyst)

**Prompt**

> Cari kompetitor digital untuk merek POS laundry kami: 10 domain, pricing signal jika ada, review ringkas. Simpan ke Competitors.

**Expected**

1. SERP / company / review tools.
2. **Competitors** rows; pricing blank if unknown.

## TC-RESEARCH-01 — Market research map (Analyst)

**Prompt**

> Research singkat: market map kategori "pos software" di Indonesia (keyword utama + siapa ranking). Simpan Competitors + SEO + Runs.

**Expected**

1. Combine keyword + competitor signals.
2. Write both **SEO** and **Competitors** as needed.
3. One owner-facing summary table.

## TC-OUTREACH-01 — Outreach drafts (Sales)

**Prompt**

> Dari 5 leads di sheet Leads yang punya email, draft outreach singkat (Bahasa Indonesia) untuk demo POS. Tulis ke sheet Outreach. Jangan kirim email sebelum saya setuju.

**Expected**

1. Read **Leads** with email present.
2. Draft bodies; write **Outreach** with `status=draft`.
3. Do **not** call Gmail send until the owner confirms.

## TC-SCOUT-01 — Hiring scouting (Maya / Recruiting)

**Prompt**

> Scouting: cari 10 kandidat potential "customer support WhatsApp" di Jakarta (profil publik). Simpan ke Candidates. Jangan mengarang kontak.

**Expected**

1. Public profile / job tools via Tapinall only.
2. **Candidates** rows; blank email/phone when not public.
3. Fair, non-discriminatory framing in chat.

## TC-ANALYST-01 — Market map kategori (Analyst / Ardi)

**Prompt**

> Buat market map untuk kategori "pos software" di Indonesia: volume keyword utama, siapa yang ranking di Google, dan 5 backlink domain kompetitor #1 jika tersedia. Simpan ringkasan ke Competitors + Runs.

**Expected**

1. Keyword / SERP tools via Tapinall.
2. Tables in chat + rows in Sheets.
3. Label uncertain data clearly.

## TC-ANALYST-02 — Social proof scan (Analyst)

**Prompt**

> Ambil profil TikTok / Instagram publik untuk 3 brand kompetitor laundry di Jakarta (followers, bio). Simpan ke Competitors.

**Expected**

1. `catalog_search` social profile tools.
2. Respect public-data only tools.
3. Sheet rows + chat table.

## TC-VIEW-01 — Lihat data di aplikasi

**Prompt (to Airin / platform helper)**

> Tunjukkan sheet Research Data saya dan pastikan Data View bisa membacanya.

**Expected**

1. Open / quote Research sheet URL.
2. If Data View is installed, `add_sheet` with that URL so the owner can browse in-app.
3. Point to Settings Tapinall panel for catalog browse.

## Pass / fail checklist (every case)

- [ ] Refused Tapinall `call` until Google trio connected
- [ ] Rows written to the correct tab
- [ ] `Runs` row added
- [ ] Sheet URL returned to the user
- [ ] No invented contact fields or SEO metrics
