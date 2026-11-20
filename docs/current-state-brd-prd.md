# Airin — Current-State BRD / Product Baseline

| Field | Value |
|---|---|
| Document type | Brownfield BRD + as-is product inventory (bukan greenfield intent PRD) |
| Product | **Airin** (repo / package name: `airin`) |
| Code baseline | `package.json` version **0.4.74** (deploy produksi 20 Nov 2026 = image `airin:local` dari source tree lokal) |
| Last updated | **20 Nov 2026** |
| Verified live | Produksi: **https://useairin.id** — `GET /health` → `ok: true`; hub Accio E2E (Plugins \| Skills \| Connectors) + API smoke 19/19 |
| OpenAPI surface | **252** path entries (`/openapi.json`, diukur di 0.4.74; belum dihitung ulang) |
| Sources | `ARCHITECTURE.md`, `GLOSSARY.md`, `AGENTS.md`, `apps/{server,web,cli,desktop}`, `apps/platform/*`, `packages/{core,agent,db,client,plugins}`, `docs/website/content/docs/*`, `docs/panduan-pengguna/*`, live health + uji produksi org **Aire** |
| Purpose | Baseline fitur/aktor/limitasi agar tim bisa menyusun **PRD lengkap untuk yang belum tercover** tanpa menebak kondisi sekarang |
| Out of scope here | Keputusan engineering baru, roadmap prioritas bisnis, hipotesa value (itu PRD intent terpisah) |

## Parts

1. [Product model](./current-state-brd-prd-model.md) — ringkasan, mental model, aktor, arsitektur
2. [Feature catalog](./current-state-brd-prd-catalog.md) — katalog fitur lengkap
3. [Limits and gaps](./current-state-brd-prd-gaps.md) — matriks klien, hard limits, drift, gap analysis, evidence
4. [Sprint backlog](./sprint-backlog.md) — P0/P1 dan status per item

## Peta dokumen terkait (20 Nov 2026)

| Dokumen | Peran | Status remap |
|---|---|---|
| `docs/current-state-brd-prd*.md` | BRD as-is | Updated Stage-1/2 |
| `docs/sprint-backlog.md` | Status sprint | Updated Accio rows |
| `docs/panduan-pengguna/*` + `apps/web/src/content/user-guide/*` | Panduan ID in-app | Updated hub bahasa |
| `docs/website/content/docs/{mcp,composio,integrations}.mdx` | Docs EN operator | Pointer Accio / Custom connectors |
| `docs/website/content/docs/plugins.mdx`, `skills.mdx` | Docs EN | Belum rewrite penuh Accio (isi protokol masih valid) |
| `ARCHITECTURE.md` / `GLOSSARY.md` | Engineering | MCP/Tapinall internal OK; tidak diganti di remap ini |

## Perubahan sejak baseline 0.4.74

| Area | Perubahan | Commit |
|---|---|---|
| UI mode | **Owner → Simple**, **Advanced** tetap. Sidebar Simple: roster tim, Groups, Marketplace, subtitle peran agen | `7a4a74e0`, `4a4c5802` |
| Simple mode chat | `/chat` membuka **chat terakhir** agen itu (bukan draft kosong). **New chat** tetap draft kosong | `f986c3ba` |
| Landing publik | Route `/` = landing + form waitlist; `POST /v1/public/waitlist`; admin baca di `GET /v1/platform/waitlist` | `9751e427`, `f986c3ba` (copy ID/EN) |
| Marketplace agen | Katalog umum (Jovan, Alya, Maya, Rani, Dimas, Fajar, Hana, Kezia, Bima, Nisa) + paket laundry (Sari, Rina, Ardi, Dimas, Gilang, Toni). Default **Bahasa Indonesia** | `7a4a74e0`, `4a4c5802`, `f986c3ba` |
| Orchestrator | **Jovan** (`chief-of-staff`) = orkestrator: tarik data ke spesialis lewat `send_to_bot` | `f986c3ba` |
| A2A `send_to_bot` | Selalu ada di turn yang tidak dibatasi / tidak read-only. Cocok nama: exact → prefix unik → contains unik. Error menampilkan daftar agen | `f986c3ba` |
| Artifact HTML | Skill `artifact-design` punya **template laporan terkunci** (`assets/report.html`): Executive summary, KPI rounded berwarna, chart, tabel; ikut tema terang/gelap. Group chat wajib pakai | `4a4c5802` |
| HR Indonesia | Skill opt-in `hr-uu-ketenagakerjaan` (UU 13/2003, UU 6/2023 Bab IV, PP 35/2021, PP 36/2021) | `4a4c5802` |
| Data View | Batas lama yang baru didokumentasikan: salinan max **400 000** karakter per tab; `read_sheet` max **200** baris per panggilan. Tab besar (contoh Transaksi ~977 KB) ditolak | `66166fe7` (sejak plugin dibuat) |
| i18n | Peran: "Chief of Staff" → **Orchestrator / Orkestrator** | `f986c3ba` |
| **Stage-1 UX (Simple)** | Branding Tapinall → **Airin Library** di UI; label tool `tap.*` disanitasi; chat Simple tanpa opsi tool / harga per-call; band **plan usage** di composer; riset tetap di chat (termasuk group) | deploy produksi Nov 2026 |
| **Stage-2 Accio hub (Advanced)** | Satu shell **Plugins \| Skills \| Connectors** (pill tabs). Sidebar Advanced: satu item **Plugins** (bukan Connections / MCP terpisah). Connectors = Composio apps (icon wajib) + Airin Library + **Custom connectors** (protokol MCP di bawah, UI tidak bilang MCP). Marketplace: **My agents \| Marketplace**. Profil agen: tab **Connectors** | deploy produksi 20 Nov 2026 |

## Bahasa produk (UI vs internal)

| Di UI (wajib) | Internal / API (boleh tetap) |
|---|---|
| **Plugins** | Plugin lifecycle, `/settings/plugins` |
| **Skills** | Skills, `/settings/skills` |
| **Connectors** | Composio toolkits + Tapinall catalog + MCP servers |
| **Custom connectors** | MCP servers (`/settings/mcp` route tetap; judul UI bukan MCP) |
| **Airin Library** | Tapinall MCP / catalog (`tapinall` server name) |
| **Simple** / **Advanced** | `uiMode` `owner` / `advanced` |

Dokumen engineering boleh menyebut MCP/Tapinall; panduan pengguna dan copy dashboard memakai kolom kiri.
