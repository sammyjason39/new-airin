# Sprint backlog — Laundry Innovation Summit demo & post-summit hardening

| Field | Value |
|---|---|
| Sprint | Laundry Innovation Summit (demo) + hardening |
| Product baseline | Airin (renamed from nakama) **v0.4.74** |
| As-is reference | [`docs/current-state-brd-prd.md`](./current-state-brd-prd.md) (track in git) |
| Repo state (as of planning) | `main`, ~**1,514** dirty paths from nakama→Airin rename; **not** a clean production baseline |
| Constraints | Keep full platform capability; simplify **Owner** UX for 40+ non-technical users; no payment/super-admin scope in P0 |
| Out of scope (P0) | Production payment rails, full super-admin productization, first-class finance/stock/GBP modules, self-serve signup from landing |
| External inputs | Composio connected; **Apify API key** incoming for visibility scraping |

**Estimates:** person-days (PD) for a single engineer unless noted; parallel work can compress calendar time.

**Owner legend:** **Human** roles for accountability; **Subagent** = suggested Cursor agent type for scoped execution (not a substitute for human sign-off on demo day).

---

## Parts

1. [P0 — Laundry Innovation Summit demo](./sprint-backlog-p0.md) (P0-0 … **P0-13**)
2. [P1 and cross-cutting](./sprint-backlog-p1.md) — post-summit, risks, hygiene

---

## Status (16 Nov 2026)

Status only from code or a production check. "Not verified" means nobody checked it against the acceptance criteria yet.

| ID | Item | Status | Evidence / gap |
|---|---|---|---|
| P0-0 | Demo environment | **Done (changed)** | Production at https://useairin.id, `/health` ok, provider set. Default reply language is **Bahasa Indonesia**, not English (product decision) |
| P0-1 | Laundry pack | **Partial** | Six laundry agents in `catalog-laundry.ts`. Re-import time (< 15 min) not measured |
| P0-2 | Social media agent | Not verified | Skills exist (`laundry-social-media`, `laundry-openrouter-image`) |
| P0-3 | WhatsApp support agent | Not verified | Skill `laundry-whatsapp-support` exists; production bridge not re-tested |
| P0-4 | Data analyst | **Partial** | Ardi answered the Business group forecast with sheet data. Weather API path not re-tested |
| P0-5 | Finance via Data View | **Done (limit)** | Dimas used Data View sheets. Tab **Transaksi** is too large for Data View |
| P0-6 | Visibility (Apify) | Not verified | Skill exists; Apify key not checked |
| P0-7 | Operations | **Partial** | Toni answered in the Business group |
| P0-8 | Simple UI (Owner mode) | **Done** | Mode renamed **Simple**; team sidebar with Groups and Marketplace; tool calls collapsed; last chat opens by default |
| P0-9 | Onboarding → vertical | Not verified | `business-vertical.ts` exists; flow not re-tested |
| P0-10 | Demo script | **Done (doc)** | `laundry-innovation-summit-demo-script.md` |
| P0-11 | Landing + waitlist | **Done** | `/` landing (ID/EN), `POST /v1/public/waitlist`, admin list `GET /v1/platform/waitlist` |
| P0-12 | Business profile | **Spec only** | No structured business-profile store in code yet |
| P0-13 | Role labels in sidebar | **Done** | `owner-agent-role-subtitle.ts`; fallback "Agen"; role also shows in group chat speaker line |
| — | Orchestrator (Jovan) + A2A | **Done (new)** | Not in original backlog. `send_to_bot` on every unrestricted turn; Jovan routes to specialists |
| — | HR Indonesia (Alya) | **Done (new)** | Skill `hr-uu-ketenagakerjaan` |
| — | Locked HTML report | **Done (new)** | `artifact-design/assets/report.html`, required in groups |
| P1-3 | Clean baseline commit | **Open** | Product changes are committed (`f986c3ba`), but there is no release tag after `v0.4.74` and no CHANGELOG entry |

