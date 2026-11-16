# Airin BRD — Product model

Parent: [current-state-brd-prd.md](./current-state-brd-prd.md)

## 1. Ringkasan produk (as-is)

Airin adalah **platform agen AI multi-tenant untuk tim**. Satu server melayani banyak organisasi. Setiap organisasi punya anggota, profil agen, tools, skills, MCP, plugin, saluran messaging, automations, dan memori bersama.

Janji produk (dari README / overview):

- Dashboard chat mirip ChatGPT, dengan agen yang punya identitas, tools, skills, dan memory sendiri
- Tim tetap memegang pekerjaan penting; Airin menjalankan agen
- Deploy: managed cloud, Docker satu container, Bun lokal, PM2, atau desktop Electron
- Kelas kemampuan mirip OpenClaw / Hermes, tanpa setup maze single-operator

**Bukan:** pengganti tim manusia; SaaS multi-region managed di dalam open-source core; marketplace publik pihak ketiga di luar katalog install.

---

## 2. Mental model (empat konsep inti)

1. **Organization (tenant)** — batas isolasi: members, profiles, sessions, tools, skills, MCP, usage, org memory, automations, plugins.
2. **Profile (agent)** — bot dengan soul files, model, tool/skill/MCP allowlist, knowledge base, channel settings.
3. **Tool / skill / MCP / plugin access** — profil tidak otomatis mendapat semua kemampuan; assignment eksplisit.
4. **Channel** — web, CLI, desktop, Telegram, WhatsApp, Discord, Slack, Microsoft Teams memakai profil yang sama; worker = bridge transport, bukan runtime agen terpisah.

Dua cara kerja sama antar agen:

- **Agent group** — owner bicara ke beberapa agen di satu chat grup (`@handle` / `@all`).
- **A2A (`send_to_bot`)** — satu agen (biasanya orkestrator **Jovan**) mengirim tugas ke agen lain di org, menunggu jawaban, lalu merangkum untuk owner. Owner cukup satu chat.

Dua mode UI web:

| Mode | Untuk | Isi |
|---|---|---|
| **Simple** (kode: `owner`) | Pemilik usaha non-teknis (default install baru) | Sidebar tim (agen + peran), Groups, Marketplace; chat membuka percakapan terakhir; detail tool disembunyikan |
| **Advanced** (kode: `advanced`) | Admin / operator | Rail profil penuh, Settings, Tools, MCP, Skills, usage token |

Istilah sesi (wajib dipakai konsisten — lihat `GLOSSARY.md`):

| Term | Arti |
|---|---|
| Session | Percakapan tersimpan antara orang dan profil |
| Chat | Session yang siap menerima turn (history + tools + prompt + model) |
| Turn | Satu pesan user + seluruh jawaban agen (termasuk tools); satu session = satu turn aktif |
| Branch | Salin session sampai satu message untuk jalur alternatif |
| Child chat | Session dari `sub_agent` (satu tingkat) |
| Cognito chat | Session **ephemeral** (hanya di memori, tidak ke DB) |

---

## 3. Aktor dan peran

### 3.1 Aktor manusia

| Aktor | Scope | Bisa | Tidak bisa (as-is) |
|---|---|---|---|
| **Platform admin** | Seluruh install | Buat/hapus org, providers, MCP registry, backup/import, upgrade, audit, plugin releases, local token rotate, disable user install-wide, cross-org agent search (command palette), buka chat via deep link untuk support | Tidak otomatis jadi anggota setiap team; chat history pribadinya tetap hanya miliknya |
| **Parent org admin** | Parent organization | Publish shared resources (knowledge, skills, agents, tools, models), buat team, lihat team summaries | Tidak otomatis baca chat/file team; nested teams tidak didukung |
| **Org / team admin** | Satu org (standalone atau team) | Invite members (admin/member), manage settings yang diizinkan, tools/usage/workers/plugins org, org memory, skills learning, import/export pack | Tidak manage install-wide providers/MCP (kecuali digabung platform admin); tidak create profile di UI tanpa platform admin (lihat §5.3) |
| **Org member** | Satu org | Chat, groups (integrasi), connectors, Google Meet (dengan syarat), artifacts milik sendiri, Simple mode UX, install agen Marketplace (bila diizinkan) | Tidak invite members; tidak system pages; artifacts orang lain tidak terlihat |
| **Pengunjung landing** | Publik | Baca landing `/`, isi form waitlist | Tidak login, tidak daftar akun, tidak bayar |
| **Invitee** | Pra-join | Terima invite token, set password | Tidak akses dashboard sebelum accept |
| **Unauthenticated public** | Token-scoped | Artifact share `/s/:token`, automation webhook, notification webhook, Teams inbound, MCP/Composio OAuth callback, Meet extension pair, setup/login/reset | Tidak akses data org |

### 3.2 Peran resmi di kode

| Role | Status di kode |
|---|---|
| `admin`, `member` | **Aktif** — `ORG_ROLES` di `packages/db/src/constants.ts` |
| `viewer` | **Dihapus** — invite/member dengan `role: "viewer"` → **400**; sisa: pitch deck & skill `airin-guide` masih menyebut viewer (drift) |
| `isPlatformAdmin` | Flag user install-wide (bukan org role) |
| Profile **owner** | Member yang punya profil private; boleh manage profil miliknya dalam batas guard |

### 3.3 Aktor non-manusia

| Aktor | Peran |
|---|---|
| **Airin / Super Airin** (`super_airin`) | Profil admin bawaan: buat/kelola profil, tools, groups, plugin drafts |
| **Default Bot** | Profil default org baru (subtitle peran di Simple mode: **Asisten**) |
| **Jovan** (Marketplace `chief-of-staff`) | Orkestrator tim bisnis: satu pintu untuk owner, delegasi ke spesialis lewat `send_to_bot`, tidak mengarang angka |
| **Agen spesialis Marketplace** | HR (Alya, Maya, Rani), Finance (Dimas), Sales (Fajar), CS (Hana), Social (Kezia), Ops (Bima), Legal (Nisa); paket laundry (Sari, Rina, Ardi, Dimas, Gilang, Toni) |
| **Channel workers** | Telegram, WhatsApp, Discord, Slack, Teams, automation (+ plugin workers) via PM2 |
| **ACP coding agents** | Preset eksternal (Codex/Claude/OpenCode/…) lewat ACP MCP bridge |
| **Scheduler / curator** | Automation worker + skill curator ticks (internal routes + local token) |

---

## 4. Arsitektur runtime (as-is)

```
Clients: web | CLI | desktop
Channel workers: telegram | whatsapp | discord | slack | teams
        ↓  HTTP + SSE (+ X-Org-Id)
Server (Hono): rate limit → auth → (internal) → org → routes
        ↓
AgentService → @airin/agent + tools + MCP + plugins
        ↓
State: SQLite + ~/.airin soul/org MEMORY + config.ini + files
Workers: PM2 (opsional tapi jalur resmi)
```

- Apps boleh import `packages/*`; packages **tidak** import `apps/*`.
- Satu container Docker: API + web + workers; data `/airin/data` (`AIRIN_CONFIG_DIR`); dashboard **4310**.
- Strategi lean: **≤512 MB RSS** ceiling untuk core; fitur berat → plugin / skill / MCP.
- Web yang sama melayani landing publik `/` (waitlist) dan dashboard `/chat` setelah login.

### 4.1 Deploy produksi (as-is, Nov 2026)

| Item | Nilai |
|---|---|
| URL | https://useairin.id |
| Host | VPS Ubuntu; container `new-airin-agents-airin-1` dari image `airin:local` |
| Build | Source di VPS (`new-airin-src`), `docker buildx build -t airin:local .`, lalu `docker compose up -d` |
| TLS | nginx + Let's Encrypt |
| Data | Docker volume `new-airin-agents_airin-data` → `/airin/data` |
| Org uji | Grup **Business** (Toni Ops, Dimas Finance, Ardi Analyst, Alya HR) + Jovan orkestrator; Data View terhubung ke Google Sheet laundry |

---
