# Airin BRD — Limits and gaps

Parent: [current-state-brd-prd.md](./current-state-brd-prd.md)

## 6. Matriks klien vs kemampuan (ringkas)

| Capability | Web | CLI | Desktop | Messaging |
|---|---|---|---|---|
| Chat streaming | Ya | Ya | Ya (web shell) | Ya (async/poll/push) |
| Soul editor UI | Ya | `/soul` limited | Ya | Tidak |
| Admin / providers / MCP | Ya | Tidak | Ya (local) | Tidak |
| Tool playground | Ya | Tidak | Ya | Tidak |
| `skill_manage` | Ya | Ya | Ya | Tidak |
| `ask_user_question` | Ya | Terbatas | Ya | Tidak |
| Composio OAuth | Ya | Tidak | Ya | Tidak |
| Cognito | Ya | — | Ya | — |
| Automations UI | Ya | Via agent tools | Ya | Trigger only |

---

## 7. Hard limits & feature flags (operasional)

### 7.1 Limits (selected)

| Area | Limit |
|---|---|
| Default JSON body | 10 MiB |
| Large / platform import body | 140 MiB |
| Platform import archive | hingga ~3.5 GiB (+ env) |
| Setup import archive | 100 MiB |
| Profile KB POST | 30 MiB |
| Chat attachment | 5 MB |
| KB zip | 20 MB |
| WhatsApp artifact | 16 MiB |
| Plugin upload | 20 MiB compressed / 100 MiB uncompressed / 2000 files |
| Plugin concurrent invocations | 4 |
| Session page size | 100 |
| Session pin order ids | 5000 |
| Child sessions | 5 |
| Rate limit | 600/min default; auth 10/min |
| Audit list | ≤200 |
| MCP tool result | 1M chars |
| Profile MEMORY.md | 4096 bytes |
| Org memory prompt summary | ~2048 bytes default |
| In-memory stored chats cache | 50 LRU (no active turn) |
| Core RSS strategy | ≤512 MB |
| `send_to_bot` depth | 3 hop |
| `send_to_bot` timeout | default 5 menit, max sama dengan `sub_agent` |
| Data View salinan per tab | 400 000 karakter (JSON grid) |
| Data View `read_sheet` | 200 baris per panggilan (default 50) |
| Waitlist body | 4 KB |
| Waitlist list (admin) | 50 per halaman |

### 7.2 Env gates (selected)

`AIRIN_SECRETS_KEY`, `AIRIN_SECRETS_KEY_NEXT`, `AIRIN_CONFIG_DIR`, `AIRIN_BACKUP_DIR`, `AIRIN_UPDATER_DIR`, `AIRIN_ENABLE_ONBOARDING`, `AIRIN_DISABLE_UPDATE_CHECK`, `AIRIN_METRICS`, `AIRIN_RATE_LIMIT_*`, `AIRIN_TRUST_PROXY`, `AIRIN_TENANT_BASH`, `AIRIN_BASH_BACKEND`, `AIRIN_BASH_SANDBOX_NETWORK`, `AIRIN_MCP_TOOL_DISCOVERY`, `AIRIN_DESKTOP`, `AIRIN_ACP_MCP_URL`, `AIRIN_TELEGRAM_MANAGER_URL`, `AIRIN_CHROME_*`, data-import size overrides.

---

## 8. Yang eksplisit tidak / sudah dihapus

| Item | Status |
|---|---|
| Org API keys `nk_live` / `nk_test` | Removed |
| External app-user integration sessions | Removed |
| Role `viewer` sebagai org role | Removed (invite 400); docs/pitch/skill masih drift |
| Nested teams / move existing org under parent | Not supported |
| Publish Default Bot / Airin as shared agents | Not allowed |
| Teams file delivery | Not supported |
| Slack pairing in channels | Not supported (DM only) |
| Email tool on Telegram/Discord/WhatsApp | Refused |
| `skill_manage` in automations | Refused |
| Nested `sub_agent` | Not supported |
| Plugin skill in-process `tool.ts` execution | Error path |
| Desktop mic/camera/notifications | Off |
| Desktop import of existing `~/.airin` on first launch | Does not import |
| Scanned PDF OCR | Not in `extract_document_text` |
| Playwright as default agent test path | Repo policy: jangan kecuali diminta |
| Unlimited org tree / general permission engine | Explicit non-goal of teams plan |
| Signup / payment dari landing | Not supported (waitlist only) |
| Tab Google Sheet > 400 000 karakter di Data View | Ditolak ("This sheet is too large for Data View.") |
| Simple mode lanjut chat lintas browser | Tidak — session terakhir disimpan di `localStorage` browser |

---

## 9. Drift dokumentasi vs kode (harus dibersihkan saat PRD follow-up)

| Drift | Evidence |
|---|---|
| ~~Overview channels list belum menyebut **Teams**~~ | Diperbaiki 16 Nov 2026 |
| Pitch deck & `airin-guide` masih sebut **viewer** | `docs/deck/pitch-deck-customers.md`, bundled skill; DB hanya admin/member. `agent-groups.mdx` dan `cloud-browser.mdx` sudah diperbaiki |
| Kode memakai `owner` / `chief-of-staff`, UI memakai **Simple** / **Orchestrator** | `apps/web/src/lib/ui-mode.ts`, `i18n.ts` |
| Routing Jovan menyebut nama agen tetap (Toni, Dimas, Ardi, …) | `catalog.ts`; org dengan nama lain bergantung pada pencocokan nama `send_to_bot` |
| UI route `/settings/skills` platform-admin-only vs org admin skill learning di Organization | `apps/web` routing vs OrganizationPanel |
| Root `AGENTS.md` satu baris workers tidak selalu sebut Slack/Teams | Diganti detail di ARCHITECTURE |
| Plan file `organization-teams-shared-foundation-plan.md` masih berisi teks “current code” lama di bagian atas | Implementasi teams sudah ada; treat plan Progress, bukan as-is |

---

## 10. Gap analysis — kandidat PRD yang belum tercover / perlu keputusan produk

Gunakan bagian ini sebagai backlog **intent PRD** (masalah → hipotesis → MVP), bukan spec engineering.

### 10.1 Identity & access

1. **Viewer / read-only org role** — dihapus di API; masih muncul di messaging produk. Putuskan: revive dengan RBAC jelas, atau hapus semua copy.
2. **Org-scoped API keys / machine auth** — dihapus; automation & partners butuh alternatif selain browser session / local token?
3. **SCIM / SSO / SAML / OIDC IdP** — tidak ada di inventory as-is.
4. **Fine-grained permissions** (per-resource ACL beyond admin/member/owner) — sengaja tidak dibangun; apakah cukup untuk enterprise?
5. **Cross-team membership UX** & sibling visibility edge cases — docs ada; audit completeness vs expectation customer.

### 10.2 Multi-tenant / commercial packaging

6. **Nested teams / org move into parent** — explicit non-support.
7. **Billing / seat metering / plan gates** di open-source core — usage ada; commercial packaging di managed cloud di luar baseline ini.
8. **Per-team provider keys** — models published; keys tetap platform-managed.
9. **Data residency / multi-region** — single-node SQLite model.

### 10.3 Agent quality & collaboration

10. **Shared team chat history** (bukan private-per-user) — hari ini private by design.
11. **Human-in-the-loop approvals** generik di luar skill/org-memory proposals — partial.
12. **Multi-level sub-agents / swarm orchestration** — child depth 1. A2A `send_to_bot` sudah ada (depth 3, sekuensial); belum ada UI untuk melihat jejak delegasi.
12a. **Routing orkestrator dinamis** — Jovan memakai daftar nama di instruksi; belum membaca roster/peran org secara otomatis.
12b. **Sheet besar untuk analisis** — tab > 400 000 karakter (contoh Transaksi ~7 950 baris) tidak bisa masuk Data View. Opsi: ringkasan bulanan di sheet, filter/paging di plugin, atau import ke `sqlite`.
12c. **Lanjut chat lintas device** — Simple mode memakai `localStorage`; belum disimpan di server per user.
13. **Eval / regression CI productization** — cases ada; pipeline produk?
14. **Cognito retention / audit** — ephemeral by design; compliance gap?

### 10.4 Channels & communications

15. **Teams file delivery** parity.
16. **Slack richer slash / channel pairing**.
17. **WhatsApp rich formatting / official Cloud API** vs Baileys tradeoffs.
18. **Unified inbox** across channels — tidak ada.
19. **Voice / realtime call agents** — Meet ada; general voice channel tidak.

### 10.5 Tools, skills, plugins ecosystem

20. **Public plugin marketplace** (beyond official catalog).
21. **Sandboxed plugins** — trusted today.
22. **OCR / multimodal KB**.
23. **First-class SSE MCP transport** jika customer butuh (hari ini streamable HTTP + stdio).
24. **Code-mode / WASM tools** — ada plan doc lama (`docs/plans/...code-mode...`); verify product intent.

### 10.6 Clients

25. **Windows desktop install path** first-class.
26. **Mobile native apps**.
27. **CLI admin parity** (providers, members) — sengaja thin.
28. **Offline desktop** tanpa server process assumptions.

### 10.7 Ops & security productization

29. **Secret managers integration** (docs page exists — validate completeness vs customer IdP vaults).
30. **Error tracking** as member-visible product vs platform-only.
31. **HA / multi-instance SQLite** story — single process model.
32. **Customer-facing audit log UI** (bukan hanya platform list).
33. **Penetration / SOC2 packaging** — threat model file ada; product commitments?

### 10.8 Docs & consistency debt (bukan fitur, tapi blokir PRD akurat)

34. Selaraskan overview, pitch, airin-guide dengan roles & channels aktual.
35. Satu **product glossary publik** yang mirror `GLOSSARY.md` (cognito, branch, child).

---

## 11. Evidence index (untuk audit ulang)

| Area | Path |
|---|---|
| Architecture | `ARCHITECTURE.md` |
| Glossary | `GLOSSARY.md` |
| Roles constants | `packages/db/src/constants.ts` |
| Schema | `packages/db/sql/schema.sql` |
| HTTP app | `apps/server/src/http/app.ts` |
| OpenAPI live | `GET /openapi.json` (252 paths) |
| Web routes | `apps/web/src/App.tsx`, `apps/web/src/lib/navigation.ts` |
| Turn kinds | `apps/server/src/services/turn-kinds.ts` |
| Tool reference (user) | `docs/website/content/docs/tool-reference.mdx` |
| Multi-tenancy (user) | `docs/website/content/docs/multi-tenancy.mdx` |
| Plugins | `docs/plugins.md`, `packages/plugins/*` |
| Channels | `apps/platform/{telegram,whatsapp,discord,slack,teams,automation}` |
| Threat model | `THREAT_MODEL.md` |
| UI mode / Simple | `apps/web/src/lib/ui-mode.ts`, `apps/web/src/components/OwnerTeamSidebar.tsx`, `apps/web/src/lib/profile-switch.ts`, `apps/web/src/pages/chat/use-chat-page.ts` |
| Marketplace | `packages/core/src/agent-marketplace/{catalog,catalog-laundry,characters}.ts`, `apps/server/src/services/agent-marketplace-service.ts` |
| A2A | `apps/server/src/tools/send-to-bot-tool.ts`, `packages/agent/src/chat-prompt.ts` |
| Landing / waitlist | `apps/web/src/pages/LandingPage.tsx`, `landing-*.tsx`, `apps/server/src/http/routes/demo-waitlist.ts` |
| Data View | `packages/plugins/data-view/src/actions.ts` |

---

## 12. Cara memakai dokumen ini untuk PRD berikutnya

1. Pilih gap ID dari §10 (atau tulis masalah baru yang **tidak** bentrok dengan §8).
2. Tulis **intent PRD** terpisah: problem → evidence → hypothesis → users → MVP → success metrics → non-goals → open questions.
3. Jangan ulangi as-is sebagai requirement baru; tautkan ke section ini sebagai baseline.
4. Bila fitur terlihat di docs tapi tidak di §5, anggap **TBD — needs validation** sampai ada bukti kode/test/live.

---

## 13. Verification notes (session ini)

- Live `GET http://localhost:4310/health` → version `0.4.74`, builtin tool list matched §5.7.
- Live OpenAPI path count **252**; domain groups include auth, orgs, profiles, sessions, agent-groups, automations, mcp, meet, plugins, platform, skills, tools, workers, settings.
- `viewer` invite → confirmed removed via `org-members.test.ts` (“removed viewer role…”).
- Tidak menjalankan full E2E UI matrix semua channel di session ini; channel limits diambil dari code + docs + platform handlers. Untuk channel spesifik yang kritis ke PRD, jalankan smoke pairing di environment target sebelum lock requirement.

### Update 14–16 Nov 2026 (produksi useairin.id)

- Grup **Business** (Toni, Dimas, Ardi, Alya): dashboard income vs expense + forecast bulan depan selesai; keempat agen menjawab; artifact HTML tersimpan.
- Data View: 10 tab masuk (Expenses, HR, Jurnal Kas, Pelanggan, Pembelian, Stok, Mesin, Supplier, Ops harian, Laundry Operations). **Transaksi** ditolak (terlalu besar). Error "share link" sebelumnya karena `gid` salah, bukan izin share.
- Jovan terpasang sebagai orkestrator; `send_to_bot` diuji lewat chat.
- Simple mode lanjut chat terakhir: unit test `use-chat-page.test.tsx` lulus; build + deploy ke produksi.

### Update 19–20 Nov 2026 (Stage-1 + Accio hub Stage-2)

**Verified on https://useairin.id (20 Nov):**

- Deploy: rsync → `new-airin-src`, `docker buildx build -t airin:local`, compose `new-airin-agents` healthy.
- API smoke 19/19: login, plugins, 37 skills, Composio catalog ~1829 + logos, Tapinall configured, 4 custom connectors, marketplace 10 agents, SPA hub routes, bundle hub copy.
- Browser E2E Advanced: Plugins \| Skills \| Connectors pill tabs; Connectors search Gmail; Custom connectors page tanpa chrome “MCP”; Marketplace My agents \| Marketplace; sidebar **Plugins** saja; profil tab **Connectors**.

**Residual / open (bukan regresi P0):**

| ID | Gap | Catatan |
|---|---|---|
| G-ACCIO-1 | Shell home/chat Advanced Accio | Belum: empty chat / home masih layout lama |
| G-ACCIO-2 | Nama server `Tapinall` di list profil | Hub Connectors memetakan ke Airin Library; baris profil masih `Tapinall` |
| G-ACCIO-3 | Kata “MCP” di nama produk Composio | Vendor catalog (contoh “Ahrefs MCP”) — jangan diubah; bukan chrome Airin |
| G-ACCIO-4 | DOM Connectors sangat besar | ~1800 kartu Apps; soft-nav kadang lag; hard navigation OK |
| G-ACCIO-5 | Docs website MDX plugins/skills penuh Accio | `mcp`/`composio`/`integrations` sudah pointer Accio; `plugins.mdx` / `skills.mdx` belum rewrite layout hub |

---

*End of current-state BRD / product baseline.*
