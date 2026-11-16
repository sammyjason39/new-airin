# Panduan Pengguna Airin

> Panduan lengkap untuk pemilik usaha, admin organisasi, dan anggota tim.
> Bahasa: Indonesia. Versi produk: 0.4.74 (`f986c3ba`). Produksi contoh: https://useairin.id

## Cara baca

1. Mulai dari [01. Mulai memakai Airin](./01-mulai.md) jika Anda baru.
2. Pilih bab sesuai pekerjaan Anda (lihat tabel di bawah).
3. Istilah teknis ada di [14. Batas, FAQ, dan istilah](./14-batas-faq-dan-istilah.md).

Setiap bab berisi: **siapa yang bisa**, **cara pakai** (langkah UI), **batas**, **masalah umum**, dan **lihat juga**.

## Daftar isi

| Bab | Isi | Untuk |
|---|---|---|
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
| [11. Integrasi dan tools](./11-integrasi-dan-tools.md) | Builtin tools, Composio, MCP, Data View, Meet | Admin |
| [12. Channel](./12-channel.md) | Telegram, WhatsApp, Discord, Slack, Teams, CLI, Desktop | Admin |
| [13. Admin platform](./13-admin-platform.md) | Provider, workers, backup, audit, deploy | Platform admin |
| [14. Batas, FAQ, istilah](./14-batas-faq-dan-istilah.md) | Limit, FAQ, glosarium | Semua |

## Ringkasan cepat

**Airin** = platform agen AI untuk tim bisnis. Satu organisasi punya banyak agen (profil). Tiap agen punya peran, memori, tools, dan skills sendiri.

| Mode UI | Untuk | Yang terlihat |
|---|---|---|
| **Simple** | Pemilik usaha (default) | Tim Anda, Grup, Marketplace, Pengaturan. Chat terakhir dibuka otomatis |
| **Advanced** | Admin / operator | Semua menu: Profiles, Tools, MCP, Skills, Usage |

| Cara kerja sama agen | Kapan |
|---|---|
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
- Preferensi pribadi: menu akun → **Personalisation** / dialog **About you** (bukan “Workspace → Preferences”).
- Salin agen: tombol UI **Duplicate**, dialog **Clone profile?** → **Clone**.
- Grup: ubah anggota lewat **Edit group**; hentikan hand-off dengan **Stop after this reply**.
- Backup dashboard: **Download backup** (bukan “Export ZIP”).
- Kunci API **Composio**: platform admin. Tiap user menghubungkan akun SaaS sendiri.
- Audit: API platform saja; belum ada menu Audit di sidebar.
