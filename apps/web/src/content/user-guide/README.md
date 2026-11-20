# Panduan Pengguna Airin

> Panduan lengkap untuk pemilik usaha, admin organisasi, dan anggota tim.
> Bahasa: Indonesia. Versi produk: 0.4.74. Produksi contoh: [useairin.id](https://useairin.id)
> Terakhir dipetakan ulang: **20 Nov 2026** (hub Accio Plugins \| Skills \| Connectors; Airin Library).

**Mulai cepat:** buka [Peta halaman](/guide/00-peta-halaman) (klik di mana) · tanya **Airin** di chat · atau buka [Pengaturan](/settings/preferences).

## Cara baca

1. Lihat screenshot dan tautan di [00. Peta halaman](./00-peta-halaman.md).
2. Mulai dari [01. Mulai memakai Airin](./01-mulai.md) jika Anda baru.
3. Pilih bab sesuai pekerjaan Anda (tabel di bawah).
4. Istilah teknis ada di [14. Batas, FAQ, dan istilah](./14-batas-faq-dan-istilah.md).

Setiap bab berisi: **siapa yang bisa**, **cara pakai** (langkah UI + tautan), **batas**, **masalah umum**, dan **lihat juga**.

## Daftar isi

| Bab | Isi | Untuk |
|---|---|---|
| [00. Peta halaman](./00-peta-halaman.md) | Hyperlink + screenshot menu krusial | Semua |
| [01. Mulai](./01-mulai.md) | Login, setup, mode Simple/Advanced, navigasi, bahasa, notifikasi, landing | Semua |
| [02. Akun dan keamanan](./02-akun-dan-keamanan.md) | Password, MFA, passkey, sesi browser, logout | Semua |
| [03. Organisasi dan pengguna](./03-organisasi-dan-pengguna.md) | Undang member, peran, team, shared resources | Admin |
| [04. Agen](./04-agen.md) | Marketplace, buat agen, soul, tools, skills, clone/export | Admin / owner |
| [05. Chat](./05-chat.md) | Kirim pesan, lampiran, slash, riwayat, New chat, Cognito | Semua |
| [06. Kerja tim agen](./06-kerja-tim-agen.md) | Grup, orkestrator Jovan, `send_to_bot`, skenario | Semua |
| [07. Memori dan pengetahuan](./07-memori-dan-pengetahuan.md) | Memory agen, org memory, knowledge base | Admin / owner |
| [08. Skills](./08-skills.md) | Skill bawaan, assign, buat, self-improving | Admin |
| [09. File dan artifacts](./09-file-dan-artifacts.md) | Files, laporan HTML, share publik, PDF | Semua |
| [10. Otomasi dan workflow](./10-otomasi-dan-workflow.md) | Jadwal, webhook, Workflows plugin | Admin |
| [11. Integrasi dan tools](./11-integrasi-dan-tools.md) | Builtin tools, Connectors (Composio + Airin Library + custom), Data View, Meet | Admin |
| [12. Channel](./12-channel.md) | Telegram, WhatsApp, Discord, Slack, Teams, CLI, Desktop | Admin |
| [13. Admin platform](./13-admin-platform.md) | Provider, workers, backup, audit, deploy | Platform admin |
| [14. Batas, FAQ, istilah](./14-batas-faq-dan-istilah.md) | Limit, FAQ, glosarium | Semua |

## Ringkasan cepat

**Airin** = platform agen AI untuk tim bisnis. Satu organisasi punya banyak agen (profil). Tiap agen punya peran, memori, tools, dan skills sendiri.

| Mode UI | Untuk | Yang terlihat |
|---|---|---|
| **Simple** | Pemilik usaha (default) | [Tim Anda](/chat) (termasuk **Airin**), Grup, [Marketplace](/marketplace), [Panduan](/guide), [Pengaturan](/settings/preferences). Chat terakhir dibuka otomatis |
| **Advanced** | Admin / operator | [Profiles](/profiles), hub [Plugins](/settings/plugins) \| [Skills](/settings/skills) \| [Connectors](/connectors), [Tools](/settings/tools), [Usage](/settings/usage) |

| Cara kerja sama agen | Kapan |
|---|---|
| Tanya **Airin** (bantu kelola platform) | Setup, settings, undang member, buat agen, “klik di mana?” — jawaban berisi hyperlink |
| Tanya **Jovan** (orkestrator) | Satu pertanyaan, beberapa spesialis; Jovan memakai `send_to_bot` |
| Buka **Grup** | Diskusi bersama 2–12 agen dengan brief yang sama |
| `sub_agent` | Satu agen mendelegasikan tugas ke “dirinya sendiri” (harus di-assign) |

## Dokumen terkait

- Ringkasan produk HTML: [`../airin-product-overview.html`](../airin-product-overview.html)
- BRD / baseline: [`../current-state-brd-prd.md`](../current-state-brd-prd.md)
- Docs teknis (bahasa Inggris): [`../website/content/docs/`](../website/content/docs/)

## Catatan

- Label tombol ditulis **tebal** persis seperti di UI. Mode Simple punya label Indonesia (contoh **Tim Anda**, **Chat baru**); banyak menu Advanced tetap bahasa Inggris.
- Role **viewer** sudah dihapus. Hanya **admin** dan **member**.
- Panduan ini untuk pengguna, bukan developer. Path kode dan tabel API tidak disertakan.
- **Cmd+K** / **Ctrl+K** (command palette) hanya di mode **Advanced**. Di Simple, pakai menu sidebar.
- Preferensi pribadi: menu akun → **Personalisation** / dialog **About you**, atau [Preferences](/settings/preferences).
- Salin agen: tombol UI **Duplicate**, dialog **Clone profile?** → **Clone**.
- Grup: ubah anggota lewat **Edit group**; hentikan hand-off dengan **Stop after this reply**.
- Backup dashboard: **Download backup** (bukan “Export ZIP”).
- Kunci API **Composio**: platform admin. Tiap user menghubungkan akun SaaS sendiri di [Connectors](/connectors).
- Audit: API platform saja; belum ada menu Audit di sidebar.
