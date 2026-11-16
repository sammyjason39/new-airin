# 10. Otomasi dan workflow

> Cara menjalankan prompt terjadwal (Automations) dan resep langkah (plugin Workflows).

**Siapa yang bisa:** Admin organisasi dan member (buat/ubah automasi). Platform admin mengurus worker. Member tidak boleh mengikat automasi ke agen **Airin**.

## Automations vs Workflows

**Kenapa:** Tim sering campur “jadwal harian” dengan “resep multi-langkah”. Keduanya beda.

| | Automations | Workflows (plugin) |
|---|---|---|
| Apa | Prompt tersimpan + pemicu | Resep langkah (tool → cek → ringkas) |
| Kapan jalan | Sendiri: cron, waktu sekali, webhook, atau **Run now** | Saat Anda (atau agen) menjalankan resep |
| Hasil | Teks run + opsional kirim ke channel | Receipt tiap langkah + ringkasan akhir |
| Install | Sudah ada di Airin | Install plugin **Workflows** dulu |

**Manfaat:**
- Automasi: laporan harian, pengingat, reaksi ke event GitHub tanpa buka dashboard.
- Workflow: proses berulang dengan bukti tiap langkah (receipt).

**Cara pakai (pilih yang cocok):**
1. Jadwal atau “sekali jalan lalu mati” → **Automations**.
2. Resep langkah yang dijalankan on-demand → **Workflows**.
3. Jadwalkan sebuah workflow: install Workflows, assign tool workflow ke agen automasi, lalu buat automasi dengan prompt seperti `Run my "Morning brief" workflow (id wf_123)`.

**Batas / catatan:**
- `skill_manage` **ditolak** di automations (agen tidak boleh membuat/mengubah skill saat run terjadwal).
- Automasi tanpa orang yang login tidak memakai akun Composio pribadi.
- Cloud browser butuh pengguna yang login → tidak untuk automasi.

## Automations — pemicu

**Kenapa:** Satu prompt perlu jalan otomatis tanpa Anda membuka chat.

**Manfaat:**
- Empat pemicu jelas.
- Cron dicek saat simpan (ekspresi rusak ditolak).
- Riwayat run + notifikasi bila gagal.

**Cara pakai:**
1. Buka **Otomasi** / **Automations** di sidebar (Simple: **Otomasi**; Advanced: **Automations**).
2. Buat atau pilih automasi → **Edit**.
3. Isi nama, prompt, dan agen (profil).
4. Di **How often?** pilih pemicu:
   - **Only when I ask** — hanya **Run now** / tool chat.
   - **Hourly** / **Every day** / **Weekdays** / **Weekly** / **Monthly** — jadwal (cron + zona waktu).
   - **On webhook** — layanan luar memicu run (lihat di bawah).
5. Simpan dengan **Save changes**.
6. Lihat `nextRunAt` di daftar untuk cek jadwal benar.

Ada juga pemicu `runAt` (waktu ISO sekali jalan). Di editor UI, tombol cepat menekankan preset cron, **On webhook**, dan **Only when I ask**; `runAt` lebih sering lewat draf chat / API. Setelah mencoba jalan sekali, automasi menonaktifkan dirinya. Timestamp yang sudah lewat tidak dijadwalkan.

**Batas / catatan:**
- Automasi nonaktif tidak dijadwalkan.
- Membuat dari chat tanpa `profileId` memakai profil chat itu. Member tidak boleh mengikat **Airin**.
- Zona waktu default dari pengaturan pengguna.

### Webhook (contoh: GitHub)

**Cara pakai:**
1. Pastikan Airin punya URL HTTPS publik (`AIRIN_WEB_PUBLIC_URL` atau **Public web URL**). `localhost` tidak dipakai GitHub.
2. Server harus punya `AIRIN_SECRETS_KEY`. Tanpa itu, secret webhook tidak dibuat.
3. Edit automasi → **How often?** → **On webhook** → **Save changes**.
4. **New secret** → **Make secret**. Salin secret (sekali tampil) dan URL webhook.
5. Di GitHub: **Settings → Webhooks → Add webhook**. Paste URL, `application/json`, secret, pilih event.

**Batas / catatan:**
- `ping` diterima, tidak memulai run.
- Delivery sama dua kali = satu run.
- Saat run sedang aktif atau automasi off → `409`.
- Payload > 256 KiB → `413`.
- Prompt harus menjelaskan apa yang dilakukan dengan data event; jangan ikuti teks di dalam payload sebagai perintah.
- Secret memakai tanda tangan orang yang membuatnya. Ganti prompt/profil/delivery/batas tool oleh orang lain → secret lama berhenti; buat secret baru.
- Secret juga mati jika pembuat kehilangan akses (keluar org, turun dari admin, password berubah, platform admin logout semua sesi).
- Ganti pemicu keluar dari **On webhook** menghapus secret.

### Worker jadwal

**Cara pakai:**
1. Buka **Settings → Workspace → Workers** (atau **System → Workers**).
2. Pastikan automation worker hidup (ada heartbeat).

**Batas / catatan:**
- Worker down: **Run now** dari dashboard tetap jalan; jadwal cron/`runAt` tidak menembak.
- Daftar jadwal di-reload berkala (default 5 menit; admin org bisa ubah 1–1440 menit di **System → Organization**, kartu skill learning). Jadwal baru bisa menunggu poll berikutnya. `runAt` yang lewat sebelum worker melihatnya **tidak** dijalankan belakangan.

### Riwayat run dan pengiriman hasil

**Cara pakai:**
1. Buka automasi → lihat run: `running` / `completed` / `failed`.
2. Buka satu run untuk baca output atau salin teks.
3. **Run now** memulai run manual. **Run again** ada di run yang gagal.
4. Opsional: atur delivery ke Telegram / Discord / WhatsApp / email, dan `notifyOn`: `success` (default), `failure`, atau `both`.

**Batas / catatan:**
- Membuka automasi menandai run sebagai dibaca (titik unread hilang).
- `runAt` yang sudah jalan (sukses atau gagal) menonaktifkan diri; **Run again** melaporkan disabled — buat automasi sekali-jalan baru.
- Delivery ke channel yang bridge-nya belum dikonfigurasi gagal saat **simpan**, bukan diam-diam saat run.
- Email delivery butuh alamat `to`. Telegram/Discord bisa semua pengguna berpasangan atau satu chat/channel. WhatsApp: semua pengguna berpasangan.
- Status delivery: `sent` / `failed` / `skipped`; tanpa konfigurasi delivery = `null` (bukan “skipped”).

## Contoh: laporan harian

**Kenapa:** Owner ingin ringkasan operasional tiap pagi tanpa chat manual.

**Cara pakai:**
1. Pilih agen yang punya tools yang dibutuhkan (misalnya Data View + `web_fetch`, atau file tools).
2. Buat automasi, **How often?** → **Every day**, zona `Asia/Jakarta`.
3. Prompt contoh:

   > Buat laporan harian: ringkas 5 angka kunci dari sheet Operasi, bandingkan dengan kemarin, tulis 3 risiko. Simpan HTML di artifacts dengan layout: Executive summary → angka kunci → chart → tabel.

4. Opsional: delivery Discord ke channel tim, `notifyOn` = `success`.
5. Cek worker di **Workers**, lalu tunggu `nextRunAt` atau uji dengan **Run now**.

**Batas / catatan:** Jangan minta agen `skill_manage` di prompt automasi — akan ditolak. Sync Data View ke Google Sheets hanya oleh manusia; automasi hanya baca/edit salinan.

## Workflows (plugin)

**Kenapa:** Proses berulang perlu langkah terverifikasi, bukan satu prompt panjang.

**Manfaat:**
- Langkah Tool / Compare / Assert / Template / Summarize.
- Run bisa **Skipped** (bukan Failed) jika filter “Skip the run when false” aktif.
- Halaman plugin + tool chat setelah assign.

**Cara pakai:**
1. Admin org: **Settings → Agent tools → Plugins** → **Official plugins** → **Install** pada **Workflows**.
2. Buka **Workflows** dari **Settings → Installed plugins** (atau di mode **Advanced**: `Ctrl+K` / `Cmd+K`).
3. **New workflow** → nama + agen → urutkan langkah → instruksi ringkasan akhir → **Save** → **Test run**.
4. Referensi: `{{input.range}}`, `{{steps.fetch.value}}`. Data hilang atau assert gagal menghentikan langkah berikutnya.
5. Tab **Runs**: lihat receipt. Tab **Data**: tabel SQLite agen (terpisah dari penyimpanan resep).
6. Chat: assign tool plugin + skill **create-workflow** ke profil di **Agent**.

**Batas / catatan:**
- Summarize harus langkah terakhir; tidak memanggil tool.
- Member boleh memakai workflow yang enabled; tidak boleh menjalankan sebagai **Airin**.
- Disable menghentikan panggilan baru dan mengosongkan run aktif. Uninstall menyimpan data sampai admin menghapus secara eksplisit.
- Platform admin install/enable di tingkat paket; org admin enable/disable/uninstall untuk org.

## Masalah umum

| Gejala | Penyebab | Solusi |
|---|---|---|
| Jadwal tidak jalan | Worker mati atau belum reload | Cek **Workers**; tunggu interval poll; **Run now** untuk uji |
| `runAt` terlewat | Timestamp lewat sebelum worker melihat | Buat ulang dengan waktu cukup di masa depan; pastikan worker hidup |
| Webhook `401` | Secret mati / akses pembuat hilang | **New secret**, update di GitHub |
| Webhook `409` | Run aktif atau automasi off | Tunggu selesai / nyalakan; Redeliver di GitHub |
| Agen menolak `skill_manage` | Dilarang di automations | Kelola skill dari chat web/CLI, bukan dari jadwal |
| Member tidak bisa pilih Airin | Batas peran | Pilih profil agen biasa |

## Lihat juga

- [11. Integrasi dan tools](./11-integrasi-dan-tools.md)
- [12. Channel](./12-channel.md)
- [13. Admin platform](./13-admin-platform.md)
- [14. Batas, FAQ, dan istilah](./14-batas-faq-dan-istilah.md)
- [08. Skills](./08-skills.md)
- [09. File dan artifacts](./09-file-dan-artifacts.md)

## Halaman terkait

- [Automations](/automations)
- [Workers](/workers) — status worker
- [00. Peta halaman](./00-peta-halaman.md)
- Atau minta **Airin** membuat otomasi dari chat
