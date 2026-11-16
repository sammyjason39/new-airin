# Airin — Current-State BRD / Product Baseline

| Field | Value |
|---|---|
| Document type | Brownfield BRD + as-is product inventory (bukan greenfield intent PRD) |
| Product | **Airin** (repo / package name: `airin`) |
| Code baseline | `package.json` version **0.4.74**; `main` @ `f986c3ba` (lihat §Perubahan) |
| Last updated | **16 Nov 2026** |
| Verified live | Lokal: `GET /health` → `ok: true` (localhost:4310). Produksi: **https://useairin.id** (Docker `airin:local`, nginx + Let's Encrypt) → `ok: true` |
| OpenAPI surface | **252** path entries (`/openapi.json`, diukur di 0.4.74; belum dihitung ulang) |
| Sources | `ARCHITECTURE.md`, `GLOSSARY.md`, `AGENTS.md`, `apps/{server,web,cli,desktop}`, `apps/platform/*`, `packages/{core,agent,db,client,plugins}`, `docs/website/content/docs/*`, live health + OpenAPI, uji produksi grup **Business** |
| Purpose | Baseline fitur/aktor/limitasi agar tim bisa menyusun **PRD lengkap untuk yang belum tercover** tanpa menebak kondisi sekarang |
| Out of scope here | Keputusan engineering baru, roadmap prioritas bisnis, hipotesa value (itu PRD intent terpisah) |

## Parts

1. [Product model](./current-state-brd-prd-model.md) — ringkasan, mental model, aktor, arsitektur
2. [Feature catalog](./current-state-brd-prd-catalog.md) — katalog fitur lengkap
3. [Limits and gaps](./current-state-brd-prd-gaps.md) — matriks klien, hard limits, drift, gap analysis, evidence
4. [Sprint backlog](./sprint-backlog.md) — P0/P1 dan status per item

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
