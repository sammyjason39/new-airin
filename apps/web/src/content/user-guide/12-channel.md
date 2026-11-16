# 12. Channel

> Chat Airin lewat Web, Telegram, WhatsApp, Discord, Slack, Teams, CLI, dan Desktop — setup, perintah, dan perbandingan.

**Siapa yang bisa:** Admin organisasi atau platform admin menghubungkan channel per agen. Pengguna channel harus berpasangan (pairing) atau masuk daftar allowed, kecuali opsi “semua workspace” di Slack.

## Model mental

- Channel = pintu chat ke **satu profil agen** di **satu organisasi**.
- Setup di **Agent → [agen] → Channels → …** (route profil). Di mode Simple, pilih agen dari **Tim Anda**, lalu buka channel agen itu.
- Bridge worker harus **Start** agar pesan masuk.
- Satu bot/app/akun channel tidak boleh dipakai dua profil.

## Web

**Kenapa:** Dashboard penuh — chat, file, settings, automations.

**Manfaat:** Streaming, lampiran, Cognito, preview artifact, admin UI.

**Cara pakai:** Login di dashboard (contoh produksi: https://useairin.id). Mode **Simple** / **Advanced** dari menu user di bawah sidebar.

**Batas / catatan:** Riwayat chat privat per pemilik. Cognito = sementara, tidak tersimpan, tidak menulis memory.

## Telegram

**Kenapa:** Chat dari HP / grup dengan bot Telegram.

**Cara pakai:**
1. **Agent → Channels → Telegram**.
2. Buat bot: **Create with QR** (manager getairin.cloud) atau tempel token dari `@BotFather`.
3. Salin pairing code → kirim di chat privat ke bot.
4. Opsional: **Allowed users** (ID numerik).
5. **Start** bridge. Untuk grup: matikan Group Privacy di BotFather, lalu keluarkan+masukkan bot lagi.
6. Transkrip voice: set model audio OpenAI di **AI Providers**.

**Perintah:** `/start` `/help` `/stop` `/clear` `/compact` `/new` `/org` `/profile` `/status` (laporkan pemilik tetap; tidak mengganti org/profil).

**Batas / catatan:** Input: teks, foto, voice (jika Whisper), dokumen pdf/docx/txt/csv. Artifact: share link + lampiran native ≤5 MB. Grup hanya jawab mention / reply ke bot / slash (kecuali Anda ubah kebijakan sejenis).

## WhatsApp

**Kenapa:** Chat pribadi atau grup dari nomor yang dilink.

**Cara pakai:**
1. **Agent → Channels → WhatsApp** → **Connect WhatsApp**.
2. **Start** bridge → pairing code atau QR (**Linked Devices** di HP).
3. Owner otomatis paired; tambah **Allowed numbers** (dengan kode negara, contoh `+628…`).
4. Grup: default jawab jika mention nomor / reply bot / `/command`. Matikan **Only reply when mentioned in groups** untuk jawab semua; **Reply to unpaired group members** untuk pengirim belum paired.

**Perintah:** `/help` `/status` `/org` `/clear` `/new` `/compact` `/stop` `/attach`.

**Batas / catatan:** Satu akun WhatsApp = satu profil di seluruh install. Artifact/dokumen ≤16 MiB. Org nomor tetap ( `/org` tidak pindah org). **Disconnect** hapus kredensial+pairing; **Stop** menyimpan link.

## Discord

**Kenapa:** DM dan server/thread Discord.

**Cara pakai:**
1. Discord Developer Portal: buat bot, salin token, nyalakan **Message Content Intent**.
2. Invite dengan scopes `bot` + `applications.commands` dan izin kirim pesan/file/thread.
3. Tempel token di **Agent → Channels → Discord** → Save → pairing di DM bot.
4. **Start** bridge. Opsional **Allowed users** (snowflake).

**Perintah (slash Discord `/`):** `/start` `/help` `/stop` `/clear` `/compact` `/new` `/sessions` `/resume` `/close` `/status` `/org` `/profile`. Di server: mention/reply membuka thread baru.

**Batas / catatan:** Gambar masuk ≤10 × 5 MB (jpeg/png/gif/webp); attachment lain/voice belum. Artifact: share link; native hingga ~8 MB (docs). Tanpa Intent → log `Used disallowed intents`.

## Slack (pairing hanya DM)

**Kenapa:** Socket Mode — tidak butuh URL publik inbound.

**Cara pakai:**
1. **Channels → Slack** → **Copy manifest** → buat app From a manifest di Slack.
2. Salin bot token `xoxb-` dan app token `xapp-` (`connections:write`) → **Save**.
3. **Start** worker.
4. Pairing: buka app **Airin** → tab **Messages** → kirim kode (bukan di channel).
5. Opsional: **Everyone in the workspace** (butuh `users:read`; tamu/Connect tetap perlu pairing) atau **Allowed users** (ID `U…`/`W…`).
6. Channel: `/invite @Airin`, lalu `@mention` → lanjut di thread.

**Perintah (awalan `!`):** `!help` `!new` `!clear` `!stop` `!status`.

**Batas / catatan:** Teks saja — gambar/file/artifact belum. Satu Slack app = satu profil. Pairing di channel diabaikan.

## Microsoft Teams (tanpa file)

**Kenapa:** Tanya agen di personal chat / mention channel.

**Cara pakai:**
1. URL HTTPS publik + `AIRIN_WEB_PUBLIC_URL`; salin **Messaging endpoint** dari Airin.
2. Daftar app Entra (single tenant) + client secret; buat Azure Bot; enable channel Teams.
3. Tempel Tenant ID / Client ID / Client secret di **Channels → Microsoft Teams** → **Save** → **Start** worker.
4. Upload app paket di Teams (Personal + Team scopes).
5. Pairing: kode di personal chat (10 menit, sekali pakai). Atau **Allowed users** (Object ID Entra).

**Perintah (`!`, di channel mention dulu):** `!help` `!new` `!clear` `!stop` `!status`.

**Batas / catatan:** Teks saja — **tidak ada file, gambar, voice, meeting, group chat**. Reply split ≤6000 karakter. Max ~16 aktivitas antre/aktif (4 per conversation). Satu bot = satu koneksi agen.

## CLI

**Kenapa:** Chat di terminal; coding agent dari folder proyek lokal.

**Cara pakai:**
1. Jalankan server Airin.
2. `bun run cli` (atau binary setara di deploy Anda).
3. Flag: `--org` / `--profile` / `--theme`. Remote harus HTTPS.

**Perintah slash:** `/help` `/profile` `/model` `/thinking` `/compact` `/clear` `/status` `/soul` `/user` `/create` `/learn` `/paste` `/debug` `/org` `/exit`.

**Batas / catatan:** Gambar PNG/JPEG/GIF/WebP ≤5 MB, max 10 per pesan. `bun run cli -- rotate-token` untuk rotasi token lokal.

## Desktop

**Kenapa:** App lokal dengan server+web bawaan (tanpa Docker terpisah).

**Cara pakai:** Unduh rilis desktop → buka → wizard akun/org → set provider. macOS 15+ Apple Silicon; Windows installer saat tersedia (cek rilis).

**Batas / catatan:** Data di store desktop sendiri (tidak auto-import `~/.airin`). **File → Export/Import recovery key** sebelum pindah backup. Mic/kamera/notifikasi off di preview. Tutup app = hentikan server, automasi, channel workers.

## Matriks perintah (ringkas)

| Aksi | Web | Telegram | WhatsApp | Discord | Slack | Teams | CLI |
|---|---|---|---|---|---|---|---|
| Bantuan | UI | `/help` | `/help` | `/help` | `!help` | `!help` | `/help` |
| Chat baru | **New chat** / `/new` | `/new` | `/new` | `/new` | `!new` | `!new` | (sesi baru) |
| Hapus riwayat | UI | `/clear` | `/clear` | `/clear` | `!clear` | `!clear` | `/clear` |
| Stop jawaban | Stop | `/stop` | `/stop` | `/stop` | `!stop` | `!stop` | — |
| Status | UI / Workers | `/status` | `/status` | `/status` | `!status` | `!status` | `/status` |
| Compact | UI | `/compact` | `/compact` | `/compact` | — | — | `/compact` |
| Attach artifact | chip / Files | minta kirim | `/attach` | minta / `/attach` | — | — | — |

## Tabel perbandingan channel

| | Web | Telegram | WhatsApp | Discord | Slack | Teams | CLI | Desktop |
|---|---|---|---|---|---|---|---|---|
| Setup utama | Login | Bot token / QR | Link perangkat | Bot token + Intent | Manifest + 2 token | Azure + HTTPS | Server + CLI | Installer |
| URL publik | Untuk OAuth/share | Disarankan share | Disarankan share | Disarankan share | Tidak wajib (Socket) | **Wajib** | Remote: HTTPS | Lokal |
| Pairing | Akun Airin | DM kode | Link + allowed | DM kode | **DM saja** | Personal chat | Login CLI | Akun lokal |
| File masuk | Ya (≤5 MB chat) | Ya (terbatas) | Ya (≤16 MiB keluar) | Gambar saja | Tidak | Tidak | Gambar | Seperti web |
| Artifact keluar | Preview/download | Link + ≤5 MB | ≤16 MiB | Link + ≤8 MB | Tidak | Tidak | — | Seperti web |
| Grup / channel | — | Mention | Mention/opsi | Mention/thread | Mention/thread | Mention tiap pesan | — | — |
| Email tool | Admin org | Ditolak | Ditolak | Ditolak | — | — | Sesuai sesi | Seperti web |

## Masalah umum

| Gejala | Penyebab | Solusi |
|---|---|---|
| Channel diam | Worker stop / token salah | **Start** di Channels; cek token |
| Discord tidak reply di server | Intent off / belum pair | Nyalakan Message Content Intent; pair di DM |
| Slack kode tidak nyambung | Dikirim di channel | Kirim di DM app **Messages** |
| Teams tidak reply | Endpoint / HTTPS | Samakan Messaging endpoint; cek proxy WebSocket/HTTPS |
| WhatsApp grup diam | Kebijakan mention | Mention nomor / ubah toggle grup |
| Bot “sudah dipakai” | Akun terikat profil lain | Disconnect di profil lama atau buat bot baru |

## Lihat juga

- [05. Chat](./05-chat.md)
- [04. Agen](./04-agen.md)
- [10. Otomasi dan workflow](./10-otomasi-dan-workflow.md)
- [11. Integrasi dan tools](./11-integrasi-dan-tools.md)
- [13. Admin platform](./13-admin-platform.md)
- [14. Batas, FAQ, dan istilah](./14-batas-faq-dan-istilah.md)

## Halaman terkait

- [Profiles](/profiles) → pilih agen → Channels
- [Workers](/workers)
- [00. Peta halaman](./00-peta-halaman.md)
