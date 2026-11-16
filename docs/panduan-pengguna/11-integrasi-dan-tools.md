# 11. Integrasi dan tools

> Tool bawaan, tool kustom, Composio, MCP, plugin (Workflows, Supermemory, Meet, Data View), browser, gambar, dan coding agent.

**Siapa yang bisa:** Platform admin (assign tool, MCP, plugin package, kunci Composio). Admin organisasi (enable plugin/app, email mailbox, sebagian provider). Member memakai tool yang sudah di-assign; tiap orang menghubungkan akun Composio sendiri.

## Model mental

- Profil hanya memakai tool yang di-assign.
- Beri set tool paling kecil yang dibutuhkan.
- Skill + `bash` menambah kemampuan (browser lokal, coding CLI) tanpa tool builtin baru.

## Builtin tools

**Kenapa:** Tanpa tool, agen hanya bercakap. Tool menentukan risiko dan kemampuan.

**Manfaat:** Baca/tulis file, cari web, email, sub-agen, artefak, dan lainnya.

### Tabel tool bawaan

| Tool | Default Bot / Airin | Profil kustom baru | Catatan singkat |
|---|---|---|---|
| `write_file` | Ya | Ya | Teks di workspace profil |
| `save_artifact` | Ya | Ya | Simpan di `artifacts/` + pemilik |
| `write_docx` | Ya | Tidak | Word dari Markdown |
| `delete_file` | Ya | Tidak | |
| `edit_file` | Ya | Ya | Ganti teks exact |
| `read_file` | Ya | Ya | |
| `search_files` | Ya | Ya | Butuh `rg` di server |
| `knowledge_base_search` | Ya | Ya | Dokumen KB status ready |
| `web_search` | Ya | Tidak | OpenAI/Anthropic atau backend Exa/Firecrawl/Serply |
| `web_fetch` | Ya | Ya | URL publik; max body 1 MB; timeout 30 dtk |
| `email` | Ya | Tidak | Mailbox install; admin org di chat; ditolak di Telegram/Discord/WhatsApp |
| `extract_document_text` | Ya | Tidak | PDF/Word/Excel; tanpa OCR scan; lampiran ≤5 MB; teks ≤256 KB |
| `bash` | Airin (default) | Tidak | Shell di host; coding / agent-browser |
| `sub_agent` | Tidak (opt-in) | Tidak | Max 5 child chat; tidak bersarang |
| `list_profile_sessions` | Airin | Tidak | Baca daftar sesi profil lain (org sama) |
| `read_profile_session` | Airin | Tidak | Baca transkrip profil lain |
| `close_session` | Tidak (opt-in) | Tidak | Tutup chat milik pengguna |
| `generate_image` | Ya (agen baru) | Ya (seed) | PNG ≤5 MB; model dari **AI Providers** |
| `org_memory_search` / `org_memory_list` | Otomatis | Otomatis | Bukan dari picker dashboard |

**Parallel-safe** (bisa paralel dalam satu turn jika semua call parallel-safe): `read_file`, `search_files`, `knowledge_base_search`, `web_search`, `web_fetch`, `sub_agent`. Campur dengan `bash`/tulis → seluruh turn berurutan.

**Batas / catatan:**
- File tools: max ~10 MB; tidak baca `config.ini`; tidak keluar workspace / `tools/`.
- Memori profil: skill `update-profile-memory` / `archive-profile-memory` + file tools; `MEMORY.md` soft limit 4096 byte.
- `AIRIN_TENANT_BASH=0` mencabut bash dari tenant (CLI tidak terpengaruh).

**Cara assign:** Platform admin buka **Agent** → profil → **Tools**.

## Custom tools

**Kenapa:** Integrasi khusus tanpa menunggu builtin baru.

**Cara pakai:**
1. Platform admin daftarkan modul di **Settings → Agent tools → Tools** (file `.js` atau `.py` di folder tools install).
2. Assign ke profil seperti tool biasa.
3. Admin org isi kunci di **Configuration** playground (atau kartu di chat).

**Batas / catatan:**
- Timeout 30 detik per panggilan; proses terpisah (bukan di dalam server).
- Env anak hanya `PATH`, `AIRIN_CONFIG_DIR`, `AIRIN_WORKSPACE_ROOT` + setting tool yang disimpan (terenkripsi).
- Nama setting: `UPPER_SNAKE_CASE`; dilarang `PATH`, `NODE_OPTIONS`, `PYTHONPATH`, awalan `AIRIN_`.
- Python default sequential (tidak parallelSafe).

## Composio (SaaS: Gmail, Slack, GitHub, …)

**Kenapa:** Agen bertindak di akun SaaS Anda tanpa API kustom.

**Cara pakai:**
1. Buat akun di composio.dev; salin **project API key** (bukan `ck_` MCP consumer key).
2. **Platform admin** (bukan Admin org): **Settings → Integrations → Composio** → paste project API key → **Save**. Kartu kunci ini hanya untuk platform admin.
3. Admin org: **Enable** app yang diizinkan.
4. Tiap member: **Connect** akun sendiri.
5. Admin: tombol **profiles** di baris app → centang agen yang boleh memakai.

**Batas / catatan:**
- Web chat memakai koneksi orang yang bicara. Channel/CLI memakai koneksi admin org paling awal.
- Automasi tanpa orang → tidak resolve tool Composio pribadi.
- OAuth di channel butuh **Public web URL** yang bukan loopback.
- ~200 app; agen memakai `composio__search_actions` + `composio__invoke_action` (bukan ratusan tool sekaligus).

## MCP servers

**Kenapa:** Tool eksternal (database, SaaS MCP) tanpa menulis kode Airin.

**Cara pakai:**
1. Platform admin: **Settings → Agent tools → MCP** → **Add server** (HTTP, Sign-in, atau Command).
2. **Test connection** → simpan.
3. **Agent** → profil → tab **MCP** → assign server.
4. Nama tool di chat: `{serverName}__{toolName}`.

**Batas / catatan:**
- Hanya platform admin yang mengelola server; org admin/member memakai setelah assign.
- Status: `connected` / `disconnected` / `needs_auth` (**Sign-in required**) / `error`.
- Preinstall: **exa**, **firecrawl**. Keyless Firecrawl berbagi kuota harian IP host.
- Sign-in MCP butuh URL publik; dynamic client registration saja (client_id/secret paste belum didukung).
- Hapus server custom: **Force delete** (lepas dari semua profil). Preinstalled tidak bisa dihapus.

## Plugins

**Kenapa:** Fitur utuh (halaman + tool + data) tanpa mengubah core.

**Cara pakai (umum):**
1. Platform admin: **Settings → Agent tools → Plugins** → preview/install paket (official skip approval terpisah).
2. Admin org: enable untuk organisasi.
3. Platform admin: assign tool/skill plugin ke profil.
4. Member: buka dari **Settings → Installed plugins**.

### Workflows

Lihat [10. Otomasi dan workflow](./10-otomasi-dan-workflow.md).

### Supermemory

**Cara pakai:**
1. Admin org: **Official plugins → Supermemory → Install** → enable.
2. Butuh provider OpenAI tersimpan (bukan ChatGPT subscription untuk worker).
3. Restart worker Supermemory di **Workers** setelah ganti provider OpenAI.

**Batas / catatan:** Konten lama migrasi saat dibaca/dicari; backup Airin tidak berisi dataset eksternal Supermemory; disable kembali ke salinan lokal.

### Data View (penuh)

**Kenapa:** Membaca Google Sheet lewat Composio tiap kali mahal. Data View menyimpan salinan gratis untuk baca/edit; Google berubah hanya saat **Sync**.

**Cara pakai:**
1. Admin org: install **Data View** → buka dari **Installed plugins** (atau di mode **Advanced**: `Ctrl+K` / `Cmd+K`).
2. Paste link Google Sheets → **Add**. Satu link = satu tab (`gid=` di URL).
3. Sheet **Anyone with the link** diunduh langsung (tanpa Composio). Sheet privat: connect **Google Sheets** di Composio dulu.
4. Edit sel (Enter simpan, Escape batal). **Add row** menambah baris kosong.
5. **Sync** menulis sel berubah ke Google (koneksi Google Anda). **Refresh** memuat ulang (edit belum sync hilang — ada konfirmasi).
6. Assign tool Data View + skill **data-view** ke profil untuk chat.

**Batas / catatan:**
- Max ~**400.000 karakter** per tab. Lebih besar → “This sheet is too large for Data View.”
- Agen baca max **200 baris** per panggilan (default 50).
- **Sync hanya oleh manusia** — agen tidak menekan Sync.
- Sync per posisi sel; jika baris digeser di Google setelah refresh terakhir, refresh dulu sebelum edit.
- Sel berubah bertinta kuning sampai sync.

### Google Meet

**Kenapa:** Transkrip Meet tanpa bot peserta di panggilan.

**Cara pakai:**
1. Admin org: **Settings → Workspace → Google Meet** → enable.
2. Provider OpenAI di **AI Providers** (untuk speech→text).
3. Install ekstensi Chrome dari halaman Meet → Load unpacked → Connect ke alamat Airin → Approve kode.
4. Di tab Meet: ikon Airin → **Start transcription**.
5. Assign tool/skill Meet ke profil untuk tanya ringkasan di chat.
6. Opsional: **Import recording** (Composio Gmail/Drive; video ≤1 GiB / 2 jam). Upload Markdown ≤1 MiB atau audio ≤7 MiB.

**Batas / catatan:** Koneksi browser ~90 hari; agent read-only pada meeting yang diizinkan; beri tahu peserta sebelum rekam.

## Generate image

**Cara pakai:**
1. Set model di **Settings → AI Providers → Image generation** (ChatGPT subscription default, `gpt-image-2`, atau endpoint compatible), atau **Off**.
2. Minta di chat, atau tag **@image** di composer web.
3. Hasil: PNG di **Browse Files → Artifacts**; ditolak jika >5 MB.

**Batas / catatan:** Ukuran `1024x1024` / `1024x1536` / `1536x1024` / `auto`; timeout 180 dtk; tanpa edit/variasi; satu PNG per panggilan.

## Cloud browser vs agent-browser

| | Cloud browser (Kernel) | Agent-browser |
|---|---|---|
| Di mana | Browser di Kernel per pengguna | Chrome di server Airin |
| Login | Anda login di panel **Browser**; tersimpan antar chat | Segar tiap run (kecuali Anda atur sendiri) |
| Butuh | Platform admin set **AI Providers → Browser runtime → Kernel** | `bash` + skill `agent-browser` + CLI/Chrome di host |
| Automations | Tidak (tanpa user) | Bisa (skill docs menyebut chat atau automations) |
| Persetujuan | Agen minta “yes” sebelum kirim/post publik | Mengikuti prompt agen |

**Cloud browser — cara pakai:** **Agent → Tools → Add tool → Cloud browser** (enam tool sekaligus). Tonton panel **Browser**; **Stop browser** untuk menyimpan login (~10 menit idle juga menyimpan).

## Coding agent (ringkas)

**Kenapa:** Kerja repo besar lebih baik di Codex / Claude Code / OpenCode / pi / Cursor Agent.

**Cara pakai:**
1. Assign `bash` + skill `coding-agent` (Airin sudah default).
2. Minta tugas coding di chat; agen memilih/install CLI (Cursor Agent di-install operator sendiri).
3. Credential provider chat di-inject ke harness saat spawn (Cursor Agent memakai auth host).

**Batas / catatan:** Ini bukan `sub_agent`. Timeout bash bisa hingga 30 menit. Bash host tidak diisolasi OS — hanya untuk profil tepercaya.

## Masalah umum

| Gejala | Penyebab | Solusi |
|---|---|---|
| Agen “tidak punya” tool | Belum di-assign | **Agent → Tools** |
| Composio unreachable | Key salah / jaringan | Cek project key; internet server |
| Data View “too large” | Tab > ~400k karakter | Pakai tab ringkasan / `gid` benar |
| Sync tidak muncul di agen | Sync human-only | Tekan **Sync** sendiri di halaman plugin |
| Meet tanpa transkrip | Tidak ada OpenAI / mic | Cek **AI Providers** + izin Chrome |
| Cloud browser tidak di picker | Kernel belum diset | Platform admin: **Browser runtime** |

## Lihat juga

- [10. Otomasi dan workflow](./10-otomasi-dan-workflow.md)
- [08. Skills](./08-skills.md)
- [09. File dan artifacts](./09-file-dan-artifacts.md)
- [12. Channel](./12-channel.md)
- [13. Admin platform](./13-admin-platform.md)
- [14. Batas, FAQ, dan istilah](./14-batas-faq-dan-istilah.md)
- [07. Memori dan pengetahuan](./07-memori-dan-pengetahuan.md)
