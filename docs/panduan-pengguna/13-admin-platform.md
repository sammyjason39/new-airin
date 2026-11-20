# 13. Admin platform

> Provider AI, workers, backup, audit, waitlist, dan operasi instalasi.

**Siapa yang bisa:** **Platform admin** untuk hampir semua di bab ini. Admin organisasi untuk usage org, workers channel per profil, dan sebagian export.

## Provider AI

**Kenapa:** tanpa provider, agen tidak bisa menjawab.

1. Buka **Settings → Agent tools → AI Providers** (atau System / Providers di Advanced).
2. Tambah provider (OpenAI-compatible, Anthropic, dll.).
3. Simpan API key (terenkripsi dengan `AIRIN_SECRETS_KEY`).
4. Pilih model default; atur routing vision / transcription / image / web search / browser bila ada kartu terpisah.
5. Device OAuth (xAI, ChatGPT) mengikuti alur di layar.

Uji dengan chat singkat. Jika gagal: cek key, base URL, dan model per agen.

## Usage dan kuota

- Admin org: halaman **Usage** / LLM usage — grafik pemakaian.
- Kuota org (jika dikonfigurasi) membatasi pemakaian bersama.

## Workers

Channel dan automation berjalan sebagai worker (PM2).

1. Buka **Status** / **Workers**.
2. **Start** / **Stop** / **Restart**; lihat logs.
3. Worker channel biasanya butuh **profileId**; automation sering platform admin.

Tanpa worker **Start**, WhatsApp/Telegram tidak menerima pesan.

## Status, versi, upgrade

- **Health:** `/health`, `/up`, `/readyz`.
- Di UI: system status, nomor versi.
- Upgrade dari Settings bila tidak dinonaktifkan (`AIRIN_DISABLE_UPDATE_CHECK`).
- Baca CHANGELOG sebelum naik versi minor/pre-1.0.

## Backup dan export/import

| Jenis | Siapa | Catatan |
|---|---|---|
| Backup terjadwal terenkripsi | Platform | Butuh `AIRIN_BACKUP_DIR` |
| Unduh backup dari dashboard | Platform | Tombol UI: **Download backup** (bukan “Export ZIP”) |
| Import / restore | Platform / setup | Setup: **Upload backup ZIP** → **Restore ZIP**; setelah setup ikut panel Data portability |
| Export org / user | Admin / user | Ikuti wizard di UI; archive besar hingga ~3.5 GiB (+ override env) |
| Setup import ZIP | Setup wizard | ≤ 100 MiB default |

Uji restore di lingkungan non-produksi sebelum mengandalkannya.

Lihat juga docs *Backup and restore*.

## Audit

Belum ada halaman **Audit** di sidebar. Platform admin membaca audit lewat API (`/v1/platform/audit-events`, ≤ **200** baris per query) atau alat operasional. Catat aksi sensitif (disable user, restore, waitlist summit).

## Kebijakan MFA dan disable user

- Wajibkan MFA install-wide bila diperlukan.
- **Disable user** — user tidak bisa login ke instalasi.
- Putar **local auth token** CLI dari panel platform.

## Waitlist landing

1. Pengunjung mengisi form di `/` → `POST /v1/public/waitlist`.
2. Platform admin membuka daftar waitlist (endpoint admin / halaman platform).
3. Halaman summit terpisah bisa menulis audit event waitlist laundry.

Tidak ada signup otomatis dari waitlist.

## Plugins rilis

Platform admin memasang plugin dari npm lokal / release resmi. Org admin meng-enable untuk organisasinya. Plugin = kode terpercaya (tidak di-sandbox).

## Deploy ringkas

| Item | Nilai tipikal |
|---|---|
| Image | Docker satu container (API + web + workers) |
| Port dashboard | **4310** |
| Data | `/airin/data` (`AIRIN_CONFIG_DIR`) |
| Secrets | `AIRIN_SECRETS_KEY` di env file (izin ketat) |
| Produksi contoh | https://useairin.id (nginx + Let's Encrypt) |

Lean: jaga RSS core ≤ **512 MB**; fitur berat lewat plugin/skill/custom connector.

Panduan lebih dalam: docs *Docker*, *Deployment hardening*, *Secret managers*, *Supported deployments*.

## Masalah umum

| Gejala | Penyebab | Solusi |
|---|---|---|
| Channel diam | Worker stop | Start di Workers |
| Key “hilang” setelah pindah server | Secrets key beda | Sama-kan `AIRIN_SECRETS_KEY` atau re-enter key |
| Upgrade tidak muncul | Update check dimatikan | Cek env / changelog manual |
| Disk penuh saat build | Image/cache Docker | Prune builder; pantau `df` |

## Lihat juga

- [03. Organisasi dan pengguna](./03-organisasi-dan-pengguna.md)
- [11. Integrasi dan tools](./11-integrasi-dan-tools.md)
- [12. Channel](./12-channel.md)
- [14. Batas, FAQ, dan istilah](./14-batas-faq-dan-istilah.md)

## Halaman terkait

- [AI Providers](/settings/providers)
- [Usage](/settings/usage)
- [Workers](/workers)
- [Skills](/settings/skills)
- [Custom connectors](/settings/mcp)
- [Connectors](/connectors)
- [Plugins](/settings/plugins)
- [Plugins](/settings/plugins)
- [Preferences](/settings/preferences) (backup / instance)
- [00. Peta halaman](./00-peta-halaman.md)
