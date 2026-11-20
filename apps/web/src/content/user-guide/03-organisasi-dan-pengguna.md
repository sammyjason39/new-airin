# 03. Organisasi dan pengguna

> Bab ini menjelaskan organisasi, peran, undangan, ubah peran, hapus anggota, nonaktifkan akun, parent org + teams + shared resources, privasi riwayat chat, org switcher, usage/quota, dan matriks izin.

**Siapa yang bisa:** **Member** (pakai workspace); **Admin** organisasi/team (kelola orang & pengaturan org); **Platform admin** (kelola instalasi, disable user, hapus org dari pemakaian); **Parent org admin** (publish resource & buat team)

## Organisasi

**Kenapa:** Organisasi adalah batas utama data. Satu tim tidak boleh melihat data tim lain.

**Manfaat:**
- Memisahkan anggota, agen, sesi, tools, skills, connectors, usage, dan memori organisasi.
- Satu instalasi Airin bisa melayani banyak organisasi atau team di bawah parent.

**Cara pakai:**
1. Organisasi pertama dibuat di wizard setup (**Create Organization**).
2. Organisasi lain (bila diizinkan) dibuat dari **Org switcher** → **Create organization** (mode Advanced).
3. Admin membuka halaman **Organization** dari:
   - Menu akun → **Organization**, atau
   - Navigasi **System** → **Organization** (Advanced).
4. Di organisasi standalone/parent Anda melihat **Organization settings**; di team melihat **Current team settings**.

**Batas / catatan:**
- Organisasi berbagi sebagian pengaturan instalasi (provider keys, default sistem) yang hanya diubah Platform admin.
- Organisasi terakhir yang tersisa tidak bisa dihapus dari pemakaian.
- Parent tidak bisa diarsipkan selama masih ada team aktif.

## Peran

**Kenapa:** Hak akses harus jelas: siapa mengundang orang, siapa mengatur instalasi, siapa hanya memakai agen.

**Manfaat:**
- Dua peran organisasi saja: **Admin** dan **Member**.
- Platform admin adalah flag instalasi, bukan peran org.

**Cara pakai:**
1. Saat mengundang atau menambah anggota, pilih kartu peran:
   - **Admin** — “Manages members and settings”
   - **Member** — “Chats and uses agents”
2. Jangan mencari peran viewer — peran itu sudah dihapus.

| Aktor | Lingkup | Bisa | Tidak bisa (penting) |
|---|---|---|---|
| **Platform admin** | Seluruh install | Buat/hapus org dari pemakaian, provider, backup, upgrade, rotate **Local API token**, **Disable** user di seluruh install, cari agen lintas org (command palette), buka chat lewat deep link untuk support | Tidak otomatis jadi anggota setiap team; riwayat chat pribadinya tetap hanya miliknya |
| **Parent org admin** | Organisasi induk | Publish resource ke team, **Add team**, lihat ringkasan team | Tidak otomatis baca chat/file team |
| **Admin** org/team | Satu org | Invite, ubah peran, hapus anggota org, pengaturan org yang diizinkan, lihat usage/quota org, org memory, export/import pack agen | Tidak mengatur provider instalasi; tidak create profil umum tanpa Platform admin (kecuali jalur yang diizinkan produk) |
| **Member** | Satu org | Chat, Simple mode, Marketplace (bila diizinkan), grup/connector sesuai izin | Tidak invite anggota; tidak halaman sistem admin |

**Batas / catatan:**
- Tidak ada peran **viewer**.
- Satu orang bisa Admin di org A dan Member di org B.
- Platform admin + Admin org bisa mengecualikan batasan domain undangan dalam kasus kontraktor (lihat **Who can join**).

## Undang anggota (invite)

**Kenapa:** Anggota baru masuk lewat undangan terkontrol.

**Manfaat:**
- Kirim undangan email dengan peran **Admin** atau **Member**.
- Batasi domain email yang boleh bergabung.

**Cara pakai:**
1. Buka **Organization** (sebagai Admin).
2. Di kartu anggota, klik **Invite by email** (popover **Invite member**).
3. Isi email, pilih peran **Admin** atau **Member**, kirim undangan.
4. Opsional: **Add member** untuk menambah orang yang sudah ada di sistem (alur kredensial/anggota langsung sesuai dialog).
5. Penerima membuka tautan → halaman **Accept invitation** → set **Password** → **Join organization**.

**Who can join (batas domain):**
1. Di pengaturan anggota, temukan **Who can join**.
2. Jika daftar kosong: teks **Anyone can be invited**.
3. Tambah domain di kolom **Add a domain, e.g. acme.com**, lalu simpan.
4. Setelah ada domain, undangan dan penambahan langsung menolak email di luar daftar. Subdomain ikut induk (`acme.com` mengizinkan `jane@eng.acme.com`).
5. Team memakai daftar sendiri **dan** daftar parent — alamat baru harus lolos keduanya. Orang yang sudah di parent bisa masuk team jika daftar team mengizinkan.
6. Platform admin yang juga Admin org masih bisa menambah/mengundang di luar daftar bila perlu (misalnya kontraktor).

**Batas / catatan:**
- Invitee belum punya akses dashboard sebelum accept.
- Role selain admin/member ditolak sistem.

## Ubah peran

**Kenapa:** Orang yang sama bisa naik jadi Admin atau turun jadi Member tanpa undangan ulang.

**Manfaat:**
- Sesuaikan hak tanpa membuat akun baru.

**Cara pakai:**
1. Buka **Organization** → daftar anggota.
2. Buka menu **Actions** pada orang itu → **Edit**.
3. Di dialog, pilih kartu **Admin** atau **Member**.
4. Simpan perubahan.

**Batas / catatan:**
- Hanya Admin (dan jalur Platform admin yang relevan) yang mengubah peran.
- Pastikan organisasi tetap punya Admin aktif sebelum menurunkan Admin terakhir.

## Hapus anggota dari organisasi

**Kenapa:** Orang yang pindah tim tidak boleh tetap melihat agen dan data org.

**Manfaat:**
- Cabut akses ke organisasi itu.

**Cara pakai:**
1. Buka **Organization** → daftar anggota.
2. Menu **Actions** → **Remove**.
3. Konfirmasi dialog **Remove member?**.
4. Orang itu kehilangan akses ke organisasi tersebut.

**Batas / catatan:**
- Menghapus dari org tidak sama dengan **Disable** akun di seluruh instalasi.
- Pairing channel (Telegram/WhatsApp/Discord) terikat identitas aplikasi chat — cabut terpisah jika perlu.

## Nonaktifkan pengguna (Disable)

**Kenapa:** Saat orang keluar atau sandi diduga bocor, akun perlu dikunci tanpa menghapus riwayat sekaligus.

**Manfaat:**
- Cegah login dan semua request dari akun itu di seluruh install.
- Bisa diaktifkan lagi dengan **Enable**.

**Cara pakai:**
1. Sebagai **Platform admin**, buka **Organization** → daftar **Members**.
2. Menu aksi di samping nama → **Disable**.
3. Status di daftar menjadi **Disabled**.
4. Untuk memulihkan: **Enable**.

**Batas / catatan:**
- Disable berlaku instalasi-wide, bukan satu org saja.
- Airin menolak men-disable Admin satu-satunya di sebuah organisasi.
- Sesi yang sudah terbuka juga ditolak setelah disable.
- Hapus pairing channel secara terpisah.

## Parent organization, teams, dan shared resources

**Kenapa:** Satu perusahaan induk ingin berbagi template/agen/knowledge ke beberapa team tanpa mencampur chat dan kredensial team.

**Manfaat:**
- Parent publish resource; team memakai salinan/izin sesuai jenis resource.
- Team punya anggota, chat, file, memori, kredensial, automations, usage, dan agen lokal sendiri.

**Cara pakai — buat team:**
1. Beralih ke organisasi parent.
2. Buka **System** → **Organization**.
3. Klik **Add team**.
4. Isi **Team name** dan **Slug** (huruf kecil, angka, hubung).
5. Tetapkan **First admin** (user ID Anda atau user lain yang sudah ada).
6. Klik **Create team**.
7. Kartu **Teams** menampilkan ringkasan; buka baris team → **Work in this team** untuk beralih ke team itu.
8. Admin team memakai **Add person** untuk menambah orang yang sudah anggota organisasi (yang belum ada di team).

**Cara pakai — shared resources:**
1. Di parent, buka **Organization**.
2. Kartu **Shared with every team** punya baris: Knowledge, Skills, Agents, Tools, Models.
3. Klik **Manage** di baris resource.
4. Pilih item lalu **Publish document** / **Publish skill** / **Publish agent** / **Publish tool** / **Publish model**.
5. Untuk menarik: **Unpublish**.

**Batas / catatan:**
- Nested teams dan memindahkan org lama menjadi anak parent tidak didukung. Team hanya satu tingkat di bawah parent.
- Publish tidak otomatis menugaskan setiap tool/skill ke setiap agen — tetap lewat penugasan agen.
- **Default Bot** dan **Airin** tidak bisa dipublish.
- Published tools tidak membawa kredensial parent; hubungkan integrasi di team yang mengeksekusi.
- Parent admin tidak otomatis membaca chat/file team. Ringkasan team ≠ akses penuh.
- Unpublish menghentikan pemakaian baru; tidak menjamin membatalkan panggilan yang sedang berjalan.
- Parent tidak bisa dihapus/diarsipkan selama team aktif masih ada.

## Privasi riwayat chat

**Kenapa:** Pertanyaan ke agen sering berisi data sensitif; rekan kerja tidak boleh membaca chat orang lain secara default.

**Manfaat:**
- Riwayat web bersifat privat per pemilik chat.
- Platform admin tetap bisa bantu support lewat deep link tanpa mengubah daftar riwayat pribadinya.

**Cara pakai / perilaku:**
1. Di riwayat chat, Anda hanya melihat chat yang Anda mulai — termasuk Admin org.
2. Platform admin dapat membuka chat lewat tautan langsung untuk support; daftar riwayat mereka tetap hanya milik mereka.
3. Chat dari Telegram, Discord, Slack, dan WhatsApp mengikuti model channel messaging (bukan privat per orang Airin yang sama seperti chat web pribadi).
4. Chat lama tanpa pemilik, atau pemiliknya sudah dihapus, dapat jatuh ke Platform admin pertama; pemilik chat channel messaging tidak diubah oleh aturan itu.

**Batas / catatan:**
- Cognito / chat sementara (jika dipakai) tidak tersimpan di riwayat dan tidak menulis memory — lihat panduan chat bila ada bab khusus.
- Jangan menganggap Admin org bisa mengaudit semua chat anggota di web; itu tidak benar.

## Org switcher

**Kenapa:** Satu orang bisa anggota beberapa organisasi atau team.

**Manfaat:**
- Ganti konteks kerja dengan cepat.
- Buat organisasi baru (Platform admin / hak yang diizinkan).
- Melihat team di daftar yang sama.

**Cara pakai:**
1. Di mode **Advanced**, buka **Org switcher** di sidebar (menampilkan organisasi/team aktif).
2. Pilih organisasi atau team lain dari daftar.
3. Untuk membuat org baru: **Create organization**, isi nama dan slug, simpan.
4. Di halaman team, **Work in this team** juga memindahkan Anda ke konteks team itu.
5. Di mode **Simple**, nama organisasi aktif terlihat di footer sidebar; untuk switcher penuh, gunakan **Advanced** atau masuk team lewat halaman **Organization**.

**Batas / catatan:**
- Setelah ganti org, agen, file, dan pengaturan mengikuti org aktif.
- Org yang dihapus dari pemakaian hilang dari switcher.

## Usage dan kuota LLM

**Kenapa:** Biaya model perlu terlihat agar Admin tahu pemakaian bulan berjalan.

**Manfaat:**
- Lihat statistik pemakaian token/biaya di halaman **Usage**.
- Lihat status kuota bulanan organisasi (jika ada batas).

**Cara pakai:**
1. Mode **Advanced** → navigasi **Usage** (atau **Settings → Usage**).
2. Tinjau dasbor pemakaian (hari, model, grup statistik sesuai tampilan).
3. Sebagai Admin org, lihat kartu **LLM monthly quota**:
   - Tanpa batas: teks ringkas “This month: … turns · … tokens · no limit”.
   - Dengan batas: baris **Month**, **Status**, **Turns**, **Tokens**, plus peringatan persen dan reset **00:00 UTC**.
4. Sakelar **Pemakaian token di chat** di preferensi hanya mengatur tampilan usage di composer chat, bukan kuota org.

**Batas / catatan:**
- Kartu kuota hanya untuk Admin organisasi aktif.
- Angka kuota mengikuti org/team yang mengeksekusi; pemakaian team tidak digabung ke parent.
- Mengatur nilai batas (`tokenLimit` / `turnLimit`) dilakukan di sisi instalasi/admin yang berwenang; UI anggota biasanya menampilkan status, bukan form bebas untuk semua orang.

## Hapus organisasi dari pemakaian

**Kenapa:** Org uji atau sisa bisa tetap muncul di switcher dan menjalankan pekerjaan terjadwal.

**Manfaat:**
- Sembunyikan org dari switcher, chat, dan worker.

**Cara pakai:**
1. Sebagai **Platform admin**, switch ke org yang akan dihapus dari pemakaian.
2. Buka **System** → **Organization**.
3. Konfirmasi **Delete organization** / **Delete organization?**.

**Batas / catatan:**
- Admin org biasa tidak bisa melakukan ini.
- Anggota, profil, dan file tetap di disk; org hanya dikeluarkan dari pemakaian aktif.
- Org terakhir tidak bisa dihapus. Parent dengan team aktif tidak bisa diarsipkan dulu.

## Matriks izin (ringkas)

| Tindakan | Member | Admin org/team | Parent admin | Platform admin |
|---|---|---|---|---|
| Chat dengan agen di org-nya | Ya | Ya | Jika anggota org itu | Jika anggota / jalur support |
| Invite / ubah peran / hapus anggota | Tidak | Ya | Di parent sesuai peran | Ya (plus jalur khusus) |
| Atur **Who can join** | Tidak | Ya | Ya (di org yang dikelola) | Ya |
| **Disable** / **Enable** user install-wide | Tidak | Tidak | Tidak | Ya |
| **Add team** / publish shared resources | Tidak | Tidak* | Ya | Ya (jika kapasitas parent) |
| **Work in this team** / **Add person** | Sesuai keanggotaan | Ya (admin team) | Ringkasan + jika anggota | Sesuai keanggotaan |
| Lihat **Usage** / kuota org | Terbatas | Ya (kuota) | Sesuai org aktif | Ya |
| **Delete organization** (dari pemakaian) | Tidak | Tidak | Tidak | Ya |
| Rotate **Local API token** | Tidak | Tidak | Tidak | Ya |
| Ubah provider keys instalasi | Tidak | Tidak | Tidak | Ya |
| Baca chat web milik orang lain dari riwayat | Tidak | Tidak | Tidak | Deep link support saja |
| Mode Simple / Personalisation | Ya | Ya | Ya | Ya |

\*Admin org standalone menjadi parent admin setelah membuat team pertama; sebelum itu tidak ada publish team.

## Masalah umum

| Gejala | Penyebab | Solusi |
|---|---|---|
| Undangan ditolak | Domain tidak ada di **Who can join** | Tambah domain, atau minta Platform admin |
| Tidak ada opsi viewer | Peran dihapus | Pakai **Member** |
| Tidak bisa Disable seseorang | Orang itu Admin tunggal org | Tunjuk Admin lain dulu |
| Team tidak melihat resource parent | Belum di-**Publish** | Parent admin → **Shared with every team** → **Manage** → Publish |
| Tidak bisa hapus parent | Masih ada team aktif | Kosongkan/arsipkan team dulu sesuai prosedur |
| Riwayat rekan tidak terlihat | Privasi by design | Normal; support lewat Platform admin + deep link |
| Org switcher tidak ada | Mode Simple | Ganti **Advanced**, atau buka **Organization** |
| Kuota menolak turn | Batas bulanan tercapai | Tunggu reset UTC, atau minta admin instalasi naikkan batas |

## Lihat juga

- [01. Mulai](./01-mulai.md)
- [02. Akun dan keamanan](./02-akun-dan-keamanan.md)

## Halaman terkait

- [Organization](/organization) — undang member, team, org memory
- [Preferences](/settings/preferences) — preferensi pribadi
- [00. Peta halaman](./00-peta-halaman.md) — screenshot klik di mana
- Tanya **Airin** di [chat](/chat) untuk dibantu langkah demi langkah
