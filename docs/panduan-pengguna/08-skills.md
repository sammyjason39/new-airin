# 08. Skills

> Bab ini menjelaskan skill: resep kerja yang bisa dipakai ulang oleh agen — bawaan, khusus Airin, opt-in, paket laundry, cara memanggil, assign, membuat, belajar sendiri (off / ask / auto), dan izin.

**Siapa yang bisa:** semua memakai skill yang sudah di-assign ke agen; Platform admin mengelola pustaka skill di dashboard; Admin organisasi mengatur cara agen belajar skill; pemilik agen bisa mengatur sebagian perilaku di **Agent → Behavior**.

## Apa itu skill?

**Kenapa:** Prompt utama agen cepat penuh bila semua prosedur ditumpuk. Skill memisahkan “cara mengerjakan tugas X”.

**Manfaat:**
- Satu skill = satu alur kerja berulang (triage, laporan, SOP).
- Bisa di-assign ke banyak agen (skill global) atau hanya satu agen (profile-scoped).
- Agen memuat instruksi penuh hanya saat relevan (`load_skill`), sehingga katalog tetap ringan.

**Cara pakai (gambaran):**
1. Identitas & aturan selalu-on tetap di soul / system prompt.
2. Skill menambah prosedur spesifik.
3. Tool dan connectors menentukan aksi yang boleh dilakukan — skill memberi petunjuk kapan/bagaimana memakai tool.

**Batas / catatan:**
- Skill menyimpan **prosedur**, bukan fakta pengguna (fakta → memori; lihat [07. Memori dan pengetahuan](./07-memori-dan-pengetahuan.md)).
- Skill dengan `disable-model-invocation` tidak masuk katalog otomatis — hanya lewat `/skill <nama>`.

## Skill bawaan default

Setiap profil mendapat skill default berikut setelah sync di server (termasuk backfill ke profil lama):

| Skill | Fungsi singkat |
|-------|----------------|
| `create-automation` | Jadwal, pengingat, otomasi tersimpan |
| `manage-skills` | Buat/ubah/hapus skill di profil lewat `skill_manage` |
| `skill-installer` | Pasang skill dari repositori GitHub publik ke profil |
| `update-profile-memory` | Catat fakta ke `MEMORY.md` aktif |
| `archive-profile-memory` | Pindahkan fakta ke arsip bulanan |
| `artifact-design` | Aturan tata letak HTML laporan/dashboard |
| `slide-deck-design` | Template deck 16:9 (satu slide per halaman PDF) |
| `composio-integrations` | Panduan integrasi Composio |
| `airin-guide` | Peta halaman web Airin (di mana setting & siapa yang boleh) |
| `grounded-research` | Riset web dengan kutipan bernomor + daftar Sources |

Beberapa skill sistem (`create-automation`, `manage-skills`, `update-profile-memory`, `archive-profile-memory`, `artifact-design`) disembunyikan dari picker `/`, tetapi tetap bisa dipanggil eksplisit dengan `/skill …`.

## Skill khusus Airin (super)

Hanya agen **Airin** yang mendapat skill tambahan ini secara bawaan:

| Skill | Fungsi singkat |
|-------|----------------|
| `create-plugin` | Membuat plugin |
| `create-profile` | Membuat agen baru (draf dulu, konfirmasi, baru buat) |
| `create-skill` | Menulis/memperbaiki skill (draf di chat → konfirmasi → simpan) |
| `coding-agent` | Menyerahkan kerja repo ke coding agent lewat `bash` |

Ada juga skill backend coding runtime-only (`coding-backend-codex`, `coding-backend-claude-code`, `coding-backend-opencode`, `coding-backend-pi`, `coding-backend-cursor`) — dipakai saat alur coding agent aktif, bukan untuk di-assign manual sehari-hari.

## Skill opt-in (pasang manual)

Tidak auto-assign. Assign sendiri bila dibutuhkan:

| Skill | Fungsi singkat |
|-------|----------------|
| `agent-browser` | Otomasi browser interaktif lewat `bash` |
| `google-meet` | Alur Google Meet |
| `knowledge-base-wiki` | Compile dokumen knowledge jadi wiki Markdown |
| `hr-uu-ketenagakerjaan` | Jawab pertanyaan UU/PP ketenagakerjaan dari teks resmi di skill (dipakai agen Marketplace Alya) |

## Paket laundry (12 skill)

Skill paket Laundry Innovation Summit terpasang saat pack laundry diinstal (bukan default semua org):

| Skill | Fungsi singkat |
|-------|----------------|
| `laundry-local-context` | Konteks lokal usaha laundry |
| `laundry-promo-patterns` | Pola promo |
| `laundry-weather-triggers` | Pemicu cuaca untuk konten/ops |
| `laundry-openrouter-image` | Gambar lewat OpenRouter |
| `laundry-image-aspect-ratio` | Rasio aspek gambar |
| `laundry-content-writing-playbook` | Playbook menulis konten |
| `laundry-social-media` | Media sosial (agen Sari) |
| `laundry-whatsapp-support` | Dukungan WhatsApp (agen Rina) |
| `laundry-data-analyst` | Analis data (agen Ardi) |
| `laundry-finance-dataview` | Keuangan + Data View (agen Dimas) |
| `laundry-visibility-apify` | Visibilitas (agen Gilang) |
| `laundry-ops` | Operasional (agen Toni) |

## Memanggil skill di chat

**Kenapa:** Kadang Anda ingin memaksa skill tertentu, bukan menunggu agen memilih dari katalog.

**Manfaat:**
- Picker cepat di composer.
- `/learn` mengubah catatan/URL/folder/alur yang baru selesai menjadi skill.
- Slash tetap teks biasa — Airin membaca `/skill <nama>`.

**Cara pakai:**
1. Di composer chat web, ketik `/` untuk membuka daftar skill yang di-assign ke agen aktif.
2. Ketik untuk filter; panah atas/bawah; Enter untuk memilih; Escape untuk tutup.
3. Hasil sisipan: `/skill nama-skill` lalu lanjutkan instruksi Anda.
4. Perintah cadangan **`/learn`**: contoh `/learn cara klaim expense: buka portal, New > Expense, lampirkan struk, submit` atau `/learn https://…` atau bare `/learn` setelah percakapan selesai.
5. `/learn` dan `skill_manage` tersedia di **web** dan **CLI**. Tidak di Telegram / WhatsApp / Discord / Slack / automations.

**Batas / catatan:**
- Automations dan channel messaging **tidak** mendapat `skill_manage`.
- Bila write approval aktif, create/patch dari agen menunggu approval admin.

## Assign skill ke agen

**Kenapa:** Satu agen tidak perlu semua skill dunia — cukup yang relevan perannya.

**Manfaat:**
- Katalog skill di prompt tetap fokus.
- Skill yang sama bisa dipakai banyak agen.
- Penggunaan tercatat (last matched, unused).

**Cara pakai:**
1. Platform admin: buka **Agent**, pilih profil, bagian **Skills** — tambah, assign, unassign, atau inspeksi.
2. Di daftar skill, lihat petunjuk seperti **Last matched … · N uses**, badge **Unused** (bukan untuk skill sistem bawaan), dan detail: Created by, Catalog views, Matches, Updates.
3. Angka pemakaian berubah dari chat **web** dan **CLI** saja.

**Batas / catatan:**
- Skill bundled sistem tidak mendapat badge Unused — memang tetap di-assign by design.
- Statistik tidak berubah dari channel messaging atau automations.

## Install skill dari luar

**Kenapa:** Anda ingin memakai skill publik tanpa menulis dari nol.

**Cara pakai:**
1. Di chat web/CLI: minta **“Install this skill”** dan tempel tautan direktori GitHub publik atau `SKILL.md`.
2. Atau platform admin: **Add skill → Install new → skills.sh** (preview file + peringatan bila profil punya `bash`).
3. Referensi, skrip, dan aset ikut. Reinstall mengembalikan file yang hilang. Skill existing dengan isi berbeda tidak ditimpa.
4. Program eksternal yang dibutuhkan skill tetap dipasang terpisah di server.

## Membuat skill sendiri

**Kenapa:** Tim punya SOP unik — simpan sekali, pakai berulang.

**Manfaat:**
- Create otomatis di-assign ke profil saat itu.
- Bisa berisi tool lokal (`tool.js` / `tool.ts` / `tool.py`) atau beberapa skrip Python di `scripts:`.
- Riwayat versi `SKILL.md` bisa di-restore.

**Cara pakai:**
1. Tanya agen yang punya `manage-skills`: “buat skill untuk …”. Atau minta **Airin** memakai `create-skill` (draf → Anda OK → simpan).
2. Atau platform admin membuat/mengedit di dashboard **Agent → Skills**.
3. Format minimal: folder skill berisi `SKILL.md` dengan frontmatter `name` (huruf kecil, angka, tanda hubung) dan `description` (kapan dipakai).
4. Bila ada tool Python + `requirements.txt`, platform admin memasang paket lewat **Install Python packages** di halaman skill (bukan otomatis saat create).
5. **Version history**: buka skill → gulir ke **Version history**. Label: Created / Original / Updated / Restored / Suggested · Pending review. **Restore this version** menyimpan salinan lama sebagai versi baru. Opsional isi **Change note** sebelum **Save**.
6. Skill dengan kode di folder profil member: bila **Ask me before saving a skill** aktif, tulis menunggu approval; kode belum di-review tidak dijalankan sampai admin approve lewat alur `approve_code`.

**Batas / catatan:**
- Riwayat versi hanya untuk `SKILL.md`, bukan file pendukung.
- Bundled / plugin skill tidak bisa diedit atau di-restore di UI.
- Impor profile pack: file `.py` skill hanya ditulis bila platform admin yang impor; org-admin mendapat instruksi tanpa Python.

## Self-improving skills (agen belajar)

**Kenapa:** Setelah kerja rumit berhasil, alur itu sering hilang di satu chat. Self-improving menyimpan alur sebagai skill.

**Manfaat:**
- Kurangi jelaskan ulang langkah yang sama.
- Admin bisa mewajibkan review sebelum skill hidup.
- Opsi pembersihan skill usang dan penggabungan yang overlapping.

### Preset organisasi: Off / Ask me first / Automatic

Admin organisasi: **Pengaturan** ([/settings/preferences](/settings/preferences)) ([Settings / Preferences](/settings/preferences)) → **Workspace → Organization → How bots learn skills**.

| Preset | Label UI | Arti praktis |
|--------|----------|--------------|
| **off** | **Off** | Agen tidak menyimpan skill baru dari pembelajaran otomatis (post-turn & curator/consolidate mati; write approval mati). |
| **ask** | **Ask me first** | Agen belajar dari chat; tiap skill baru/ubah butuh Anda setujui (post-turn review + write approval nyala). |
| **auto** | **Automatic** | Agen belajar dan merapikan skill sendiri (post-turn on, curator + consolidate on, write approval off). |

Tombol **Customize** membuka sakelar terpisah bila setup Anda tidak cocok dengan satu preset.

### Write approval (opsional)

1. Org: **How bots learn skills → Customize → Ask me before a bot saves a skill**.
2. Atau per agen: **Agent → agen Anda → Behavior → Ask me before saving a skill** (atau ikuti org default).
3. Saat gate on: perubahan skill masuk **Proposals**. **Review** → **Approve** / **Reject**.
4. Platform admin juga bisa membuka **Agent → profil → Proposals**.

### Learn from chats (opsional)

1. Org: kartu **Bots learn from chats**. Atau **Agent → Behavior → Learn from chats**.
2. Default **off**. Saat on: setelah turn sukses yang terlihat kompleks (banyak tool / recovery error) dan agen belum menyimpan skill di turn itu, Airin mereview di latar belakang.
3. Write approval **off**: kartu saran di chat + tombol **Apply** (tidak menulis diam-diam).
4. Write approval **on**: proposal untuk admin; chat memberi tahu menunggu approval.
5. Channel messaging ikut review bila diaktifkan; **Apply** paling nyaman di web. Automations: tidak.

### `/learn` dari sumber

Lihat bagian memanggil skill. `/learn` memakai `skill_manage` (create/patch) dengan aturan skill yang sama; topik yang sama sebaiknya memperbarui skill existing, bukan menduplikasi.

### Auto clean-up (curator) & Merge similar skills

1. **Customize → Auto clean-up of skills**: default off. Freshness: stale **30** hari, archive **90** hari (bisa diubah; stale harus sebelum archive).
2. Pass pertama setelah enable hanya baseline; lalu sekitar tiap **7** hari. **Dry run** / **Run now** tersedia.
3. Archive **memindahkan** folder skill (bukan hapus). Restore UI belum ada di rilis ini: kembalikan folder lalu assign lagi.
4. **Merge similar skills**: opt-in LLM untuk skill buatan agen yang overlapping. Bundled/hub/human-authored tidak disentuh. Bila write approval on, merge menjadi proposal edit; archive curator tetap tidak dihalangi write approval.

### Di mana bisa update skill?

| Channel | Agen update skill? | Learn from chats? |
|---------|--------------------|-------------------|
| Web chat | Ya | Ya (bila on) |
| CLI chat | Ya | Ya (Apply web-first) |
| Discord / Telegram / WhatsApp / Slack | Tidak | Ya (bila on) |
| Automations | Tidak | Tidak |

## Izin (permissions)

| Aktor | Kelola skill di dashboard/API | Pakai agen ber-skill | Ubah gate belajar org | Approve proposal skill | Apply saran setelah turn |
|------|-------------------------------|----------------------|------------------------|------------------------|--------------------------|
| Platform admin | Ya | Ya | Ya | Ya | Ya |
| Admin organisasi | Tidak (pustaka global) | Ya | Ya | Ya | Ya |
| Member | Tidak | Ya | Hanya agen sendiri di **Behavior** | Tidak | Ya |

Skill vs Org Memory: skill = cara kerja satu bot; Org Memory = fakta bersama org (proposal selalu perlu admin).

## Masalah umum

| Gejala | Penyebab | Solusi |
|--------|----------|--------|
| `/skill` tidak muncul di picker | Skill sistem tersembunyi atau belum di-assign | Assign skill, atau ketik `/skill nama` manual |
| Skill baru tidak hidup | Write approval on | Admin buka **Proposals** → Approve |
| `skill_manage` gagal di otomasi | Ditolak di automations | Buat/ubah skill dari web/CLI |
| Kode Python skill error | Belum di-review / paket belum diinstal | Approve code; **Install Python packages** |
| Skill Unused menumpuk | Tidak pernah matched | Nyalakan Auto clean-up atau unassign manual |
| `/learn` di WhatsApp tidak jalan | Channel messaging tidak mendukung | Pakai web atau CLI |

## Lihat juga

- [04. Agen](./04-agen.md)
- [05. Chat](./05-chat.md)
- [07. Memori dan pengetahuan](./07-memori-dan-pengetahuan.md)
- [09. File dan artifacts](./09-file-dan-artifacts.md)
- [10. Otomasi dan workflow](./10-otomasi-dan-workflow.md)
- [11. Integrasi dan tools](./11-integrasi-dan-tools.md)

## Halaman terkait

- [Skills](/settings/skills) (katalog org, platform admin)
- [Profiles](/profiles) → Skills per agen
- [00. Peta halaman](./00-peta-halaman.md)
