# 02. Akun dan keamanan

> Bab ini menjelaskan preferensi akun, kata sandi, reset sandi, MFA (TOTP), passkey, sesi browser, konteks pengguna (Personalisation), logout, dan Local API token untuk CLI/worker.

**Siapa yang bisa:** semua pengguna login; bagian Local API token dan kebijakan MFA platform hanya **Platform admin**

## Preferensi umum

**Kenapa:** Setiap orang perlu bahasa, zona waktu konteks, tampilan, dan notifikasi yang cocok tanpa mengubah data organisasi.

**Manfaat:**
- Atur bahasa UI dan default balasan agen.
- Atur tema dan notifikasi.
- Opsional tampilkan pemakaian token di chat (lebih relevan di Advanced).

**Cara pakai:**
1. Buka **Pengaturan** (Settings) dari footer sidebar, atau jalur preferensi di Advanced.
2. Di bagian **Umum** (General):
   - **Tampilan** (Appearance) — tema.
   - **Bahasa** (Language) — **ID** / **EN**.
   - **Personalisation** — buka editor **About you** (lihat bagian User context di bawah).
   - **Pemakaian token di chat** (Token usage in chat) — sakelar on/off.
   - **Notifikasi** (Notifications) — sakelar web push + **Uji notifikasi**.
3. Gulir ke **Active sessions** dan **Multi-factor authentication** di halaman yang sama (lihat bagian berikut).
4. Di Simple, tombol **Pengaturan lanjutan** (Advanced settings) membuka mode Advanced ke halaman customize.

**Batas / catatan:**
- Preferensi bahasa memengaruhi UI yang sudah diterjemahkan dan default bahasa balasan agen.
- Banyak label tombol tetap Inggris.
- Zona waktu instalasi (instance) diatur Platform admin di bagian **Instans** (Instance); zona waktu pribadi bisa ikut dari alur About you / konteks pengguna.

## Profil akun (nama, email, telepon, sandi)

**Kenapa:** Data identitas login harus bisa diperbarui oleh pemilik akun.

**Manfaat:**
- Ubah nama tampilan, email, telepon.
- Ganti kata sandi dari dialog yang sama.

**Cara pakai:**
1. Buka menu akun (avatar) di bawah sidebar.
2. Klik **Profile**.
3. Ubah **Name**, **Email**, dan **Phone** (opsional).
4. Untuk ganti email atau sandi, isi bagian **Password**:
   - **Current** — sandi sekarang (wajib jika ganti email atau sandi).
   - **New** — sandi baru.
   - **Confirm** — ulangi sandi baru.
5. Klik **Save changes**.
6. Jika sandi berubah, Airin mengeluarkan semua sesi; Anda harus **Sign in** lagi dengan sandi baru.

**Batas / catatan:**
- Sandi minimal 8 karakter (sama seperti setup dan undangan).
- Ganti email membutuhkan sandi saat ini.
- Jangan bagikan sandi ke orang lain; pakai undangan organisasi untuk anggota baru.

## Reset kata sandi

**Kenapa:** Pengguna bisa terkunci jika lupa sandi.

**Manfaat:**
- Minta tautan/token reset tanpa login.
- Set sandi baru lalu kembali masuk.

**Cara pakai:**
1. Di halaman login, klik **Forgot password?**.
2. Di halaman **Reset password**, isi **Email**.
3. Klik **Send reset link**.
4. Jika sistem menampilkan token di layar (install lokal tertentu), atau Anda punya token dari email, lanjut isi **Reset token** dan **New password**.
5. Jika belum punya token di URL, Anda bisa klik **Use reset token** lalu tempel token.
6. Setelah selesai (**Password reset**), klik **Return to sign in** dan masuk dengan sandi baru.

**Batas / catatan:**
- Di beberapa instalasi, email reset bergantung pada konfigurasi surat keluar server. Jika tidak ada email, admin platform/self-host harus memakai jalur token yang tersedia.
- Setelah reset berhasil, login ulang dengan sandi baru.
- Ganti sandi dari **Profile** juga mencabut sesi browser lain.

## Multi-factor authentication (MFA) — authenticator TOTP

**Kenapa:** Sandi saja rentan jika bocor; kode sekali pakai menambah lapisan.

**Manfaat:**
- Lindungi login dengan aplikasi autentikator.
- Backup codes untuk peulihan jika ponsel hilang.
- Platform bisa mewajibkan MFA untuk peran tertentu.

**Cara pakai (aktifkan di akun Anda):**
1. Buka **Pengaturan** → bagian keamanan / kartu **Multi-factor authentication**.
2. Di baris **Authenticator app**, klik **Add authenticator**.
3. Pindai QR di aplikasi autentikator (atau masukkan rahasia manual jika UI menampilkannya).
4. Masukkan kode verifikasi, lalu konfirmasi.
5. Simpan **Backup codes** yang ditampilkan sekarang — kode tidak ditampilkan ulang dengan aman setelah Anda meninggalkan layar.
6. Saat login berikutnya, setelah sandi, isi **Authentication code** lalu **Verify**.
7. Jika tidak bisa membuka autentikator, pilih **Use a backup code instead**.

**Cara pakai (nonaktifkan):**
1. Di kartu yang sama, klik **Disable authenticator**.
2. Konfirmasi dengan backup code atau metode yang diminta dialog.
3. Status MFA akun kembali ke belum terdaftar kecuali passkey masih aktif.

**Cara pakai (kebijakan platform — Platform admin):**
1. Buka **Pengaturan** → **Instans** (Instance).
2. Atur kartu kebijakan MFA platform:
   - **Off** — tidak diminta kode kedua.
   - **Optional** — pengguna boleh menambah sendiri.
   - **Required** — peran terpilih wajib enroll sebelum memakai Airin.
3. Pilih peran yang wajib: **Admins** dan/atau **Members**.
4. Konfirmasi dialog jika diminta (misalnya **Require** / **Turn off**).

**Batas / catatan:**
- Regenerasi backup codes membuat kode lama tidak berlaku.
- Jika MFA **Required** untuk peran Anda dan belum enroll, muncul peringatan **Multi-factor authentication required** dengan tombol **Set up authentication**.
- Passkey dan authenticator bisa dipakai sebagai metode MFA akun; status **Enabled** jika salah satu aktif.

## Passkey

**Kenapa:** Banyak perangkat mendukung kunci sandi (iCloud Keychain, Windows Hello, security key) tanpa mengetik kode.

**Manfaat:**
- Login atau verifikasi dengan biometrik/perangkat.
- Bisa digabung dengan alur MFA akun.

**Cara pakai:**
1. Buka **Pengaturan** → **Multi-factor authentication**.
2. Di baris **Passkey**, klik **Add passkey**.
3. Selesaikan prompt browser/OS.
4. Simpan backup codes jika ditampilkan.
5. Saat login, gunakan **Sign in with a passkey**, atau ikuti langkah verifikasi jika server meminta passkey setelah sandi.
6. Untuk menonaktifkan: **Disable passkey**, lalu konfirmasi dengan backup code atau metode yang diminta.

**Batas / catatan:**
- Perangkat dan browser harus mendukung WebAuthn/passkey.
- Jika passkey gagal, gunakan jalur fallback autentikator/backup code bila tersedia di layar login.

## Sesi browser (Active sessions)

**Kenapa:** Akun bisa terbuka di beberapa perangkat; sesi hilang/dicuri perlu bisa ditutup jarak jauh.

**Manfaat:**
- Lihat perangkat yang sedang masuk.
- Keluarkan sesi lain tanpa mengubah sandi (kecuali Anda juga ingin rotasi kredensial).

**Cara pakai:**
1. Buka **Pengaturan** → kartu **Active sessions**.
2. Tiap baris menampilkan perkiraan perangkat, waktu pakai/masuk, dan kedaluwarsa.
3. Sesi saat ini bertanda **This browser** — tidak ada tombol keluar di baris itu (pakai **Log out** di menu akun).
4. Di sesi lain, klik **Sign out** untuk mencabut sesi itu.

**Batas / catatan:**
- Ganti kata sandi dari **Profile** mencabut semua sesi dan memaksa login ulang.
- Akun **Disable** menolak semua permintaan termasuk sesi yang masih terbuka.

## User context (Personalisation / About you)

**Kenapa:** Agen menjawab lebih relevan jika mengenal peran, proyek, dan aturan Anda — tanpa membagikan itu ke semua anggota org.

**Manfaat:**
- Menyimpan catatan pribadi untuk percakapan Anda di organisasi aktif.
- Bisa diisi di wizard setup atau kapan saja kemudian.

**Cara pakai:**
1. Dari menu akun, klik **Personalisation**, atau di **Pengaturan** buka baris **Personalisation**.
2. Dialog **About you** menampilkan editor konteks (isi Markdown yang disimpan untuk Anda).
3. Sunting teks sesuai peran, proyek, bahasa balasan, aturan Always/Never, dan zona waktu bila ditampilkan di formulir.
4. Simpan perubahan di dialog.
5. Konteks dipakai pada percakapan Anda di organisasi itu; anggota lain tidak otomatis melihatnya.

**Batas / catatan:**
- Ini bukan memori organisasi bersama (org memory terpisah).
- **Set up later** di wizard hanya menunda; Anda bisa mengisi kapan saja dari menu akun / pengaturan.
- Draf di browser bisa muncul lagi jika Anda pernah mengetik lalu menutup wizard tanpa selesai.

## Log out

**Kenapa:** Di perangkat bersama, keluar mencegah orang lain memakai sesi Anda.

**Manfaat:**
- Menutup sesi aktif di browser ini.

**Cara pakai:**
1. Buka menu akun di bawah sidebar.
2. Klik **Log out**.
3. Anda kembali ke halaman login.

**Batas / catatan:**
- **Log out** berbeda dari **Sign out** pada sesi lain di daftar **Active sessions**.
- Logout tidak menonaktifkan akun; admin yang men-**Disable** akun.

## Local API token (CLI dan worker lokal)

**Kenapa:** CLI serta bridge Telegram/WhatsApp di mesin yang sama dengan server memakai token lokal, bukan sandi UI.

**Manfaat:**
- Putar (rotate) token jika bocor atau setelah personel berubah.
- Salin token baru sekali saat ditampilkan.

**Cara pakai:**
1. Masuk sebagai **Platform admin**.
2. Buka **Pengaturan** → **Instans** (Instance) → bagian **Local API token**.
3. Klik **Rotate token**.
4. Konfirmasi dialog **Rotate the local API token?** dengan **Rotate**.
5. Salin token yang muncul (**Copy**). Token tidak ditampilkan lagi setelah Anda meninggalkan layar.
6. Pastikan CLI/worker memuat token baru. Bridge yang masih memakai token lama berhenti sampai di-reload/restart.

**Batas / catatan:**
- Hanya Platform admin yang bisa memutar token ini di UI.
- Rotasi memutus CLI/Telegram/WhatsApp bridge lokal sampai token baru dipakai.
- Jangan tempel token ke chat publik atau tiket tanpa kanal aman.
- Demo host tertentu bisa menyembunyikan bagian sensitif instance.

## Ringkas jalur keamanan

| Tujuan | Jalur UI |
|---|---|
| Ubah nama/email/sandi | Menu akun → **Profile** |
| Bahasa, tema, notifikasi, MFA, sesi | **Pengaturan** (Settings) |
| Konteks pribadi agen | Menu akun → **Personalisation** |
| Reset sandi (lupa) | Login → **Forgot password?** |
| Wajibkan MFA di instalasi | Platform admin → **Pengaturan** → **Instans** |
| Token CLI/worker | Platform admin → **Local API token** → **Rotate token** |
| Keluar | Menu akun → **Log out** |

## Masalah umum

| Gejala | Penyebab | Solusi |
|---|---|---|
| Diminta MFA terus | Kebijakan **Required** atau enroll belum selesai | Selesaikan **Add authenticator** / **Add passkey** |
| Backup code ditolak | Kode sudah dipakai atau diganti | Pakai kode lain; regenerate saat masih login |
| Tidak bisa ganti email | **Current** password kosong/salah | Isi sandi saat ini |
| Setelah ganti sandi langsung keluar | Perilaku normal (sesi dicabut) | Login ulang dengan sandi baru |
| **Rotate token** tidak muncul | Bukan Platform admin | Minta Platform admin |
| Bridge putus setelah rotate | Worker masih token lama | Restart/reload worker agar baca token baru |
| Notifikasi tidak muncul | Izin browser diblokir / iPhone tanpa Home Screen | Izinkan di browser; di iPhone tambahkan ke Home Screen |
| Personalisation 404 | Server terlalu lama | Restart/upgrade server Airin, coba lagi |

## Lihat juga

- [01. Mulai](./01-mulai.md)
- [03. Organisasi dan pengguna](./03-organisasi-dan-pengguna.md)
