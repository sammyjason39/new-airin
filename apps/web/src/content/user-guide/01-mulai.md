# 01. Mulai

> Bab ini menjelaskan apa itu Airin, cara masuk, setup pertama, undangan, mode Simple vs Advanced, sidebar, pintasan Cmd+K, bahasa, tema, notifikasi, serta landing dan waitlist.

**Siapa yang bisa:** semua (pengunjung landing, pengguna baru, Member, Admin organisasi, Platform admin)

## Apa itu Airin

**Kenapa:** Banyak usaha memakai satu asisten AI umum. Hasilnya campur dan sulit dibagi peran.

**Manfaat:**
- Satu server Airin bisa menampung banyak organisasi.
- Setiap organisasi punya anggota, agen (profil), alat, dan data sendiri.
- Setiap agen punya peran, instruksi, memori, dan akses alat yang jelas.
- Tim manusia tetap memutuskan; agen membantu mengerjakan.

**Cara pakai:**
1. Pikir Airin sebagai empat bagian: **organisasi** (batas data), **profil/agen** (bot yang diajak bicara), **akses alat** (apa yang boleh dilakukan agen), dan **channel** (web, CLI, Telegram, WhatsApp, Discord, Slack, Microsoft Teams).
2. Organisasi baru biasanya sudah punya **Default Bot** (di mode Simple sering berlabel **Asisten**) dan **Airin** (agen bantu admin).
3. Tambah agen spesialis lewat **Marketplace**, atau minta **Airin** membantu menyiapkan profil.

**Batas / catatan:**
- Airin adalah platform agen, bukan satu chat asisten tunggal.
- Data antar organisasi tidak dicampur.
- Demo publik dipakai untuk eksplorasi, bukan data nyata atau kunci API.

## Landing dan waitlist

**Kenapa:** Sebelum punya akun di instance produksi, pengunjung perlu tahu produk dan mendaftar minat.

**Manfaat:**
- Baca penjelasan produk tanpa login.
- Kirim form waitlist agar dihubungi.
- Ganti bahasa landing EN/ID.

**Cara pakai:**
1. Buka halaman beranda `/` (contoh produksi: situs yang dipakai instance Anda).
2. Di header, pilih **Fitur**, **Untuk bisnismu**, **Cara mulai**, **Join Waitlist**, atau **Masuk** (Log in).
3. Untuk daftar minat, buka **Join Waitlist** lalu isi:
   - **Nama PIC** (Contact name)
   - **Nama Perusahaan** (Company name)
   - **Jenis Usaha** (Business type)
   - **Nomor WhatsApp** (WhatsApp number)
   - **Email**
4. Klik **Kirim form** (Submit form). Jika sukses, muncul pesan bahwa form sudah masuk.
5. Ganti bahasa landing lewat kontrol **Bahasa** (Language) di halaman yang sama (**ID** / **EN**).

**Batas / catatan:**
- Waitlist tidak membuat akun dashboard dan tidak ada pembayaran di form itu.
- Beberapa instance self-hosted mungkin tidak memakai landing waitlist publik; langsung ke login atau setup.

## Onboarding di landing (Cara mulai)

**Kenapa:** Pemilik usaha perlu urutan singkat sebelum memakai agen.

**Manfaat:**
- Tahu langkah pertama yang realistis.
- Tidak langsung tenggelam di pengaturan teknis.

**Cara pakai:**
1. Di landing, buka bagian **Cara mulai** (How to start).
2. Ikuti tiga langkah yang ditampilkan:
   1. **Pilih tugas pertama.** (Pick the first job.)
   2. **Kenalkan bisnismu.** (Introduce your business.) — SOP, file, aplikasi.
   3. **Kerja bareng, makin cocok.** (Work together, get sharper.) — tinjau hasil, lalu tambah tugas.
3. Setelah punya akses dashboard, lanjut isi preferensi lewat menu akun **Personalisation** atau **Pengaturan** (Settings).

**Batas / catatan:**
- Bagian ini adalah panduan produk di landing, bukan wizard setup server.

## Login

**Kenapa:** Dashboard dan chat hanya untuk akun yang sah.

**Manfaat:**
- Masuk dengan email dan kata sandi.
- Opsional: passkey atau kode autentikator.
- Reset sandi jika lupa.

**Cara pakai:**
1. Buka halaman **Sign in to Airin** (atau klik **Masuk** di landing).
2. Isi **Email** dan **Password**.
3. Klik **Sign in**.
4. Jika diminta verifikasi:
   - Passkey: ikuti prompt browser (**Sign in with a passkey** atau alur verifikasi).
   - Kode autentikator: isi **Authentication code**, lalu **Verify**.
   - Atau pilih **Use a backup code instead** dan isi **Backup code**.
5. Setelah berhasil, Anda biasanya masuk ke chat (`/chat`).
6. Lupa sandi: klik **Forgot password?** — lihat bab [02. Akun dan keamanan](./02-akun-dan-keamanan.md).

**Batas / catatan:**
- Demo bersama (jika tersedia di host demo) menampilkan email/sandi contoh di halaman login. Jangan pakai untuk data nyata.
- Akun yang di-**Disable** tidak bisa login; sesi lama juga ditolak.
- Jika platform mewajibkan MFA, Anda akan diminta menyiapkan autentikator sebelum lanjut.

## Setup pertama (first-time setup)

**Kenapa:** Install baru belum punya admin, organisasi, dan penyedia model.

**Manfaat:**
- Satu wizard membuat akun admin platform pertama dan organisasi pertama.
- Memilih penyedia LLM agar chat bisa menjawab.
- Opsional mengisi konteks “About you”.

**Cara pakai:**
1. Buka dashboard instance Anda. Install baru mengarahkan ke wizard otomatis.
2. Langkah **Account**:
   - Isi **Name**, **Email**, **Phone** (opsional), **Password**, **Confirm Password** (minimal 8 karakter).
   - Klik **Continue**.
   - Atau pilih **Upload backup ZIP** untuk pulihkan dari cadangan, lalu restart dan login dengan akun dari backup.
3. Langkah **Organization**:
   - Isi nama organisasi dan **Slug** (huruf kecil, angka, tanda hubung).
   - Klik **Create Organization**.
4. Langkah **Provider**:
   - Tambah penyedia model dan pilih model default.
   - Penyedia lain bisa ditambah nanti di pengaturan penyedia AI.
5. Langkah **About You** (opsional):
   - Jawab pertanyaan singkat (peran, pekerjaan, gaya balasan, bahasa).
   - Atau klik **Set up later**.
   - Hasil disimpan sebagai konteks pribadi (`USER.md`) untuk Anda di organisasi itu — tidak dibagikan ke semua anggota.
6. Setelah provider siap, Airin membuka chat dengan profil default. Kirim pesan uji.

**Batas / catatan:**
- Orang pertama yang menyelesaikan wizard menjadi admin platform pada install itu.
- Beberapa install Docker/managed bisa melewati wizard lewat seed admin di environment — setelah itu, lengkapi preferensi di **Pengaturan**.
- Tanpa penyedia model yang valid, chat bisa gagal atau terbatas; periksa kembali pengaturan penyedia.

## Terima undangan (accept invite)

**Kenapa:** Anggota baru bergabung lewat tautan undangan, bukan daftar publik bebas.

**Manfaat:**
- Masuk organisasi yang mengundang Anda.
- Set kata sandi (baru atau yang sudah dipakai di instance yang sama).

**Cara pakai:**
1. Buka tautan undangan dari email atau admin (berisi token).
2. Di halaman **Accept invitation**, isi **Password** (minimal 8 karakter).
3. Klik **Join organization**.
4. Setelah berhasil, Anda masuk ke chat organisasi itu.

**Batas / catatan:**
- Tanpa token undangan, halaman mengalihkan ke login.
- Jika organisasi membatasi domain email (**Who can join**), alamat di luar daftar ditolak (kecuali kasus khusus Platform admin — lihat bab organisasi).
- Sebelum accept, undangan tidak memberi akses dashboard.

## Mode Simple vs Advanced

**Kenapa:** Pemilik usaha butuh tampilan sederhana; admin butuh kontrol penuh.

**Manfaat:**
- **Simple**: fokus tim agen, grup, marketplace.
- **Advanced**: pengaturan, tools, MCP, skills, usage.

**Cara pakai:**
1. Di bawah sidebar, buka menu akun (avatar).
2. Di baris **Mode**, pilih **Simple** atau **Advanced**.
3. Mode tersimpan di browser Anda.

| Mode | Untuk siapa | Yang terlihat |
|---|---|---|
| **Simple** (kode internal `owner`; default install baru) | Pemilik usaha | **Tim Anda** (agen + peran di bawah nama), **Grup** (Groups), **Marketplace**, **Pengaturan** (Settings). Detail tool dilipat. Membuka chat mengembalikan percakapan terakhir agen itu (disimpan per browser). |
| **Advanced** | Admin / operator | Rail profil penuh, **Settings**, Tools, MCP, Skills, **Usage**, switcher organisasi |

**Batas / catatan:**
- Di Simple, pilih **Chat baru** (New chat) atau jalur `/new` untuk percakapan kosong.
- Agen **Airin** (super) disembunyikan dari daftar Simple; tetap ada untuk admin di Advanced.
- Command palette (**⌘K** / **Ctrl K**) hanya aktif di mode **Advanced**.

## Sidebar

**Kenapa:** Navigasi utama berbeda antara Simple dan Advanced.

**Manfaat:**
- Simple: cepat pilih agen, grup, marketplace.
- Advanced: akses halaman sistem dan pengaturan.

**Cara pakai (Simple):**
1. Di kiri, lihat **Tim Anda** — daftar agen dengan peran di bawah nama.
2. Klik agen untuk membuka chat terakhir dengan agen itu.
3. Di bawah daftar agen, buka **Grup** bila ada grup agen.
4. Footer: **Marketplace**, **Pengaturan**, nama organisasi, dan menu akun.
5. Sembunyikan/tampilkan sidebar lewat kontrol sidebar jika tersedia (**Sembunyikan sidebar** / **Tampilkan sidebar**).

**Cara pakai (Advanced):**
1. Pakai rail profil dan sidebar aplikasi untuk halaman **Organization**, **Usage**, Tools, MCP, Skills, dan pengaturan lain.
2. Ganti organisasi lewat **Org switcher** di sidebar (lihat bab organisasi).

**Batas / catatan:**
- Mute notifikasi per agen tersedia dari menu konteks agen (**Matikan notifikasi** / **Nyalakan notifikasi**).
- Pin chat agen memakai **Sematkan chat** / **Lepas sematan**.

## Command palette (⌘K / Ctrl K)

**Kenapa:** Di Advanced, loncat cepat ke halaman, agen, atau grup tanpa klik banyak menu.

**Manfaat:**
- Cari agen dan grup.
- Loncat ke halaman navigasi.
- Platform admin bisa mencari agen lintas organisasi yang dia akses.

**Cara pakai:**
1. Pastikan mode **Advanced**.
2. Tekan **⌘K** (Mac) atau **Ctrl K** (Windows/Linux).
3. Ketik di kotak **Jump to a page, agent or group...**.
4. Pilih hasil di grup **Agents**, **Groups**, atau navigasi halaman.

**Batas / catatan:**
- Tidak tersedia di mode **Simple**.
- Hasil mengikuti organisasi aktif dan hak akses Anda.

## Bahasa antarmuka (EN / ID)

**Kenapa:** Tim Indonesia dan internasional bisa memakai UI yang sama.

**Manfaat:**
- Ganti bahasa UI.
- Bahasa juga menjadi default balasan agen (kecuali Anda minta lain).

**Cara pakai:**
1. Buka **Pengaturan** (Settings) → bagian **Umum** (General).
2. Di baris **Bahasa** (Language), pilih **ID** atau **EN**.
3. Perubahan disimpan ke preferensi akun Anda.

**Batas / catatan:**
- Banyak label tombol tetap bahasa Inggris (misalnya **Sign in**, **Profile**, **Organization**).
- Mode Simple punya beberapa label Indonesia (**Pengaturan**, **Grup**, **Chat baru**, **Tim Anda**, dan lain-lain).
- Landing memakai salinan ID/EN sendiri; default produk landing cenderung Indonesia.

## Tema tampilan

**Kenapa:** Kenyamanan baca di siang atau malam.

**Manfaat:**
- Pilih terang, gelap, atau ikut sistem.

**Cara pakai:**
1. Buka menu akun di bawah sidebar.
2. Di baris **Theme**, pilih **Light**, **Dark**, atau **System**.
3. Atau di **Pengaturan** → **Tampilan** (Appearance), pakai sakelar tema yang sama.

**Batas / catatan:**
- Preferensi tema disimpan di browser/akun sesuai implementasi tampilan setempat.

## Notifikasi

**Kenapa:** Balasan agen bisa selesai saat Anda tidak di depan layar.

**Manfaat:**
- Dapat pemberitahuan browser saat balasan siap.
- Uji notifikasi di perangkat ini.

**Cara pakai:**
1. Buka **Pengaturan** (Settings) → **Notifikasi** (Notifications).
2. Aktifkan sakelar dengan teks petunjuk: beri tahu saat balasan siap saat Anda tidak di depan layar.
3. Izinkan notifikasi di dialog browser jika diminta.
4. Opsional: klik **Uji notifikasi** (Test notification).
5. Di daftar agen (Simple), Anda juga bisa **Matikan notifikasi** / **Nyalakan notifikasi** per agen.

**Batas / catatan:**
- Browser yang tidak mendukung web push tidak menampilkan sakelar penuh; di iPhone biasanya perlu menambah Airin ke Home Screen dulu.
- Jika notifikasi diblokir di pengaturan browser, aktifkan lagi di sana.

## Setelah setup: langkah praktis pertama

**Kenapa:** Setup selesai belum berarti tim siap dipakai.

**Manfaat:**
- Urutan kerja yang aman untuk pemilik usaha.

**Cara pakai:**
1. Kirim pesan uji ke **Default Bot** atau agen di **Marketplace**.
2. Buka **Marketplace** → **Install** pada agen yang dibutuhkan (contoh: Jovan sebagai orkestrator).
3. Undang anggota tim (bab organisasi) jika Anda Admin.
4. Isi **Personalisation** / **About you** agar agen mengenal konteks Anda.
5. Hubungkan channel (WhatsApp/Telegram/dll.) bila perlu — lihat panduan channel terpisah.

**Batas / catatan:**
- Install agen Marketplace mengikuti izin organisasi.
- Jangan masukkan kunci API atau data sensitif ke demo bersama.

## Masalah umum

| Gejala | Penyebab | Solusi |
|---|---|---|
| Langsung ke wizard, bukan login | Install masih kosong | Selesaikan setup akun → organisasi → provider |
| Login gagal | Sandi salah, akun disabled, atau MFA salah | Cek sandi/reset; minta admin **Enable**; isi kode/backup MFA |
| Chat tidak menjawab | Provider belum benar | Periksa penyedia AI di pengaturan; uji lagi |
| Tidak ada ⌘K | Mode Simple | Ganti ke **Advanced** di menu akun |
| Label campur EN/ID | Banyak tombol masih Inggris | Normal; ganti **Bahasa** untuk bagian yang sudah diterjemahkan |
| Waitlist gagal tersimpan | Jaringan atau validasi form | Cek isian, kirim ulang |
| Undangan ditolak | Domain email dibatasi atau token kedaluwarsa | Minta admin perbarui undangan atau daftar domain |

## Lihat juga

- [02. Akun dan keamanan](./02-akun-dan-keamanan.md)
- [03. Organisasi dan pengguna](./03-organisasi-dan-pengguna.md)
