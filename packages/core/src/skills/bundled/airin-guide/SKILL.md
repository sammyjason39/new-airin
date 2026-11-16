---
name: airin-guide
description: >-
  Map of the Airin web app — each page path, who can open it, and how to answer
  "where / how do I…" questions with clickable Markdown links. Use for settings,
  providers, tools, skills, members, channels, Marketplace, Panduan, Simple vs
  Advanced, and any question about finding or changing something in Airin itself
  (Indonesian or English).
---

# Airin guide

Use this map when the user asks where something is in Airin. Do not guess from other products.

For longer FAQ examples, read `references/qna.md` in this skill folder after you load the skill.

## How to answer (mandatory)

1. **Always give a clickable link in web/desktop chat.** Use Markdown with the real path, for example [Pengaturan](/settings/preferences) or [AI Providers](/settings/providers). Paths open in the same tab. Never invent URLs.
2. Name the UI path in words too: **Sidebar → Panduan**, or **Settings → AI Providers**.
3. Say **who** can change it (everyone / org admin / platform admin).
4. Give **one or two steps**, then the link. Prefer short answers.
5. Point to the in-app user guide when helpful: [Panduan](/guide) or a chapter such as [Mulai](/guide/01-mulai).
6. On Telegram, Discord, or WhatsApp, write the path as plain text (no Markdown link required).
7. If the setting is not on this map, open [Panduan](/guide) or read `references/qna.md` in this skill. Do **not** fetch `ahmadrosid.github.io` or other upstream docs hosts. Prefer this skill, in-app paths, and the Conextlab-MIT/new-airin repository.

## One-point help (Airin / Super Airin)

When you are **Airin** (the super / platform helper agent):

- You are the **default place** for "how do I set up…", "manage the platform", invite people, add agents, connect channels, fix providers, and similar.
- Prefer **doing the work with your tools** when the user wants a change and you can (create profile, assign tools/skills, automation, etc.). Always also give the UI link so they can open the same page.
- For read-only "where is…" questions, answer with links; offer to make the change if you can.
- If the user is in **Simple** mode, tell them the Indonesian labels (**Tim Anda**, **Panduan**, **Pengaturan**, **Marketplace**). Advanced uses mostly English sidebar labels.

## Layout

### Simple mode (default for owners)

- Left: **Tim Anda** (agents). **Airin** is the platform helper at the top of the list when present.
- Footer links: **Marketplace** → `/marketplace`, **Panduan** → `/guide`, **Pengaturan** → `/settings/preferences`.
- Account avatar (bottom): Personalisation, Organization, Theme, Log out.

### Advanced mode

- Left rail: agent avatars. Sidebar: New chat, Agent (`/profiles`), Groups, Connections, Automations, Settings hub (`/settings`), Recents.
- Account avatar (bottom left): Profile, Personalisation, Organization, Theme, Log out (no Settings item).

**Settings hub** (`/settings`) groups Workspace, Agent tools, Integrations, and Installed plugins.

## Roles

- **Platform admin**: runs the install. Only role for AI Providers, Skills catalog, MCP.
- **Org admin**: manages one organization.
- **Member**: uses agents and most workspace pages; less admin edit rights.
- Role **viewer** was removed.

## Pages (use these paths in links)

| Page | Path | Who |
|---|---|---|
| Chat | `/chat` | Everyone |
| Panduan (user guide) | `/guide` | Everyone (login) |
| Guide chapter | `/guide/01-mulai` … `/guide/14-batas-faq-dan-istilah` | Everyone (login) |
| Marketplace | `/marketplace` | Org admin, member |
| Agent / Profiles | `/profiles` | Everyone; edit by role |
| Groups | `/groups` | Org admin, member |
| Connections (Composio) | `/connectors` | Platform admin, org admin, member |
| Automations | `/automations` | Everyone |
| Settings hub | `/settings` | Everyone (shows allowed pages) |
| Preferences | `/settings/preferences` | Everyone (sections by role) |
| Organization | `/organization` | Platform admin, org admin, member |
| Browse Files | `/files` | Platform admin, org admin, member |
| Usage | `/settings/usage` | Platform admin, org admin |
| Workers | `/workers` | Platform admin, org admin |
| Google Meet | `/google-meet` | Org admin, member |
| Notifications inbox | `/notifications` | Everyone |
| AI Providers | `/settings/providers` | Platform admin |
| Tools | `/settings/tools` | Platform admin, org admin |
| Skills | `/settings/skills` | Platform admin |
| MCP | `/settings/mcp` | Platform admin |
| Plugins | `/settings/plugins` | Platform admin, org admin |
| Notification delivery | `/settings/connections/notifications` | Platform admin, org admin |
| Coding agents | `/settings/connections/coding-agents` | Platform admin, org admin |
| Error tracking | `/settings/connections/error-tracking` | Platform admin |

### AI Providers anchors

Append to `/settings/providers`: `#image-parsing`, `#transcription`, `#image-generation`, `#web-search`, `#browser-runtime`.

## Common questions (short)

| User asks | Link / action |
|---|---|
| Open the user guide | [Panduan](/guide) |
| Theme, MFA, sessions | [Preferences](/settings/preferences) |
| Change UI / default reply language | Ask **Airin** (uses `set_user_language` with `id` or `en`), or [Preferences](/settings/preferences) |
| Change timezone | Ask **Airin** (`set_user_timezone`), or [Preferences](/settings/preferences) |
| Invite teammate / org | [Organization](/organization) |
| Install ready-made agents | [Marketplace](/marketplace) |
| Create / edit an agent | [Profiles](/profiles) — or ask Airin to create one |
| Image generation model | [Image generation](/settings/providers#image-generation) (platform admin) |
| API keys / ChatGPT / Grok | [AI Providers](/settings/providers) (platform admin) |
| Telegram / WhatsApp / Discord | [Profiles](/profiles) → pick agent → channels |
| Composio / SaaS apps | [Connections](/connectors) |
| Automations | [Automations](/automations) |
| Files / HTML reports | [Files](/files) |
| Workers / channel health | [Workers](/workers) |
| Plugins | [Plugins](/settings/plugins) |

More examples: `references/qna.md`.
