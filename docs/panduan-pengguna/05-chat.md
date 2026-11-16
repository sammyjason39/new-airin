# 05. Chat

> Bab ini menjelaskan cara mulai chat, lampiran, pemilih model, perintah slash, tasks, kuesioner, tampilan tools, riwayat, chat terakhir di Simple, chat baru, branch, Cognito, BTW, usage, dan share artifact.

**Siapa yang bisa:** Semua Member dan Admin organisasi di organisasi aktif. Beberapa kontrol (pemilih model, `/btw`, slash skills, usage) hanya mode **Advanced**. Perintah `/add-*`: Platform admin.

## Mulai chat

**Kenapa:** Anda ingin bicara dengan satu agen tentang satu topik.

**Manfaat:**
- Satu agen, satu ruang chat.
- Mode Simple membuka chat terakhir agen itu (disimpan per browser).

**Cara pakai:**
1. Mode **Simple**: di **Tim Anda** pilih agen. Chat terakhir agen itu terbuka (bukan selalu kosong).
2. Mode **Advanced**: pilih agen di rail, lalu buka chat dari **Recents** atau **New chat**.
3. Ketik pesan di composer. Kirim.
4. Riwayat chat privat per pengguna (pemilik chat). Platform admin bisa buka deep link untuk support.

**Batas / catatan:**
- Chat milik pengguna yang membuatnya. Anggota lain tidak melihat riwayat pribadi Anda.
- Mode Simple: membuka agen = lanjutkan percakapan terakhir di browser itu.

## Lampiran

**Kenapa:** Anda ingin agen membaca foto, PDF, atau spreadsheet.

**Manfaat:**
- Lampirkan file dari tombol lampiran di composer.
- Mode Simple dan Advanced sama-sama mendukung lampiran.

**Cara pakai:**
1. Di composer tekan **+** → **Files and photos** / **Attach images or documents**.
2. Pilih gambar atau dokumen.
3. Kirim bersama pesan.

**Jenis yang diterima:**
- Gambar: jpeg, png, gif, webp
- Dokumen: pdf, docx, xls/xlsx/xlsm/xlsb, csv, txt, md

**Batas / catatan:**
- Maksimal **5 MB** per file (gambar atau dokumen).
- Maksimal **10** lampiran per pesan.
- Upload folder: hingga 10 file, total **20 MB**.
- PDF hasil scan tanpa teks: tidak ada OCR — agen tidak bisa membaca gambar halaman.

## Pemilih model

**Kenapa:** Satu giliran butuh model atau tingkat “thinking” berbeda.

**Manfaat:**
- Ganti model tanpa mengubah profil permanen (pilihan tersimpan per agen di browser).
- Agen ACP menampilkan model dan effort dari agen eksternal.

**Cara pakai:**
1. Mode **Advanced** saja. Mode **Simple** memakai composer minimal — tanpa pemilih model.
2. Di composer buka kontrol **Select model and effort** (label fallback **Model**).
3. Opsional: atur **Thinking effort** bila tersedia.
4. Kirim pesan; giliran memakai pilihan itu.

**Batas / catatan:**
- Model default profil tetap di **Profiles** (lihat [04. Agen](./04-agen.md)).
- Profil ACP: model/effort dari sesi agen ACP, bukan daftar model workspace biasa.

## Perintah slash dan mention

**Kenapa:** Pintasan untuk skill, chat baru, pertanyaan samping, atau assign kemampuan.

**Manfaat:**
- Ketik `/` untuk daftar perintah dan skill.
- Ketik `@image` untuk minta generate gambar dari pesan.

**Cara pakai:**
1. Mode **Advanced** (penuh): ketik `/` di composer. Pilih dari daftar.
2. Mode **Simple**: composer minimal; `/new` tetap bisa dipakai jika dihubungkan. Slash skills, `/btw`, dan `/add-*` tidak di-wire di Simple.
3. Perintah utama:

| Perintah | Fungsi |
|---|---|
| `/new` | Mulai chat kosong dengan agen saat ini (hanya di klien; tidak dikirim ke model) |
| `/btw` atau `/btw …` | Buka **Side chat** untuk pertanyaan samping (Advanced, halaman chat utama) |
| `/skill nama-skill` | Panggil skill yang di-assign ke agen |
| `/learn` | Distil skill dari sumber (hanya jika agen punya skill `manage-skills`) |
| `/enable-learning-loop` | Nyalakan pembelajaran otomatis setelah giliran kompleks (setelan org) |
| `/add-plugin` | Dialog aktifkan plugin (Platform admin) |
| `/add-tool` | Dialog assign tool (Platform admin) |
| `/add-mcp` | Dialog assign/tambah MCP (Platform admin) |
| `/add-skill` | Dialog tambah skill dari GitHub atau ZIP (Platform admin) |
| `/open <plugin>` | Buka halaman plugin yang tersedia |
| `@image` | Minta generate gambar dari pesan Anda |

4. Skill tersembunyi dari picker `/` (tetap bisa lewat alur lain): `create-automation`, `manage-skills`, `update-profile-memory`, `archive-profile-memory`, `artifact-design`.
5. Menu **+** juga punya entri **Slash commands** (“Skills and shortcuts with /”).

**Batas / catatan:**
- `/learn` dan `/enable-learning-loop` butuh konteks skill/org yang sesuai.
- `/add-*` hanya Platform admin di UI.

## Tasks (todos)

**Kenapa:** Tugas panjang perlu daftar langkah yang terlihat saat agen bekerja.

**Manfaat:**
- Panel **Tasks** menampilkan progres `selesai/total`.
- Judul task aktif terlihat saat berjalan.

**Cara pakai:**
1. Mode **Advanced**: panel muncul di atas composer saat agen punya rencana tugas aktif (`aria-label` **Agent task plan**).
2. Ikuti status sampai selesai. Tidak perlu menekan apa pun kecuali Anda menghentikan giliran.

**Batas / catatan:**
- Composer **Simple** (minimal) tidak menumpuk panel Tasks seperti Advanced.
- Saat kuesioner aktif, daftar Tasks dikosongkan di composer.

## Kuesioner

**Kenapa:** Agen perlu jawaban terstruktur (pilihan) sebelum lanjut.

**Manfaat:**
- Navigasi **Question n of m**.
- Tombol **Continue** / **Submit**.

**Cara pakai:**
1. Agen memanggil tool `ask_user_question`. Setelah selesai, panel kuesioner muncul di thread.
2. Jawab tiap pertanyaan. **Continue** untuk lanjut; **Submit** di akhir.
3. Jawaban dikirim sebagai bagian pesan berikutnya.

**Batas / catatan:**
- Panel muncul setelah tool kuesioner selesai dan masih aktif.
- Jangan kirim pesan biasa yang bentrok saat panel menunggu jawaban — selesaikan kuesioner dulu.

## Tampilan tools

**Kenapa:** Anda ingin melihat apa yang agen lakukan (cari web, baca file, sub-agen).

**Manfaat:**
- Baris timeline: aksi tool + detail bisa dibuka.
- Baris khusus: web search, web fetch, generate gambar, workflow, thinking.
- `sub_agent`: judul tugas + status hidup, lalu ringkasan.

**Cara pakai:**
1. Kirim permintaan yang memicu tool.
2. Di balasan, buka baris tool untuk detail.
3. Mode **Simple**: detail tool dilipat (lebih ringkas). Mode **Advanced**: detail lebih terbuka.

**Batas / catatan:**
- Tool yang tidak di-assign tidak muncul.
- Chat read-only / giliran terbatas: beberapa tool (termasuk `send_to_bot`) tidak tersedia.

## Recents dan riwayat

**Kenapa:** Anda ingin kembali ke chat lama.

**Manfaat:**
- **Recents** (Advanced): daftar sesi, cari, pin, rename, hapus.
- Simple: panel **Riwayat chat** (Chat history) / **Lanjutkan percakapan**.

**Cara pakai:**
1. Mode **Advanced**: di sidebar lihat **Recents**. Cari nama chat. Buka, **Rename chat**, atau **Delete chat?**.
2. Mode **Simple**: buka riwayat dari UI agen → **Riwayat chat**. Tekan **Chat baru** untuk kosong.
3. Chat Cognito tidak masuk riwayat tersimpan (lihat Cognito).

**Batas / catatan:**
- Label **Recents** di Advanced tetap bahasa Inggris.
- Hapus dari UI menghilangkan dari daftar aktif; deep link / pencarian bisa masih menemukan sesi tertutup tertentu (tutup lewat tool `close_session` tidak menghapus permanen).

## Chat terakhir di Simple dan New chat

**Kenapa:** Pemilik usaha sering lanjut topik kemarin; kadang butuh halaman kosong.

**Manfaat:**
- Simple menghemat waktu: langsung ke chat terakhir.
- **Chat baru** / `/new` = sesi kosong, brief agen sama.

**Cara pakai:**
1. Simple: pilih agen → chat terakhir terbuka.
2. Tekan **Chat baru** (New chat) di riwayat / top bar, atau ketik `/new`.
3. Advanced: **New chat** di sidebar atau empty state, atau `/new`.

**Batas / catatan:**
- Chat terakhir disimpan per browser dan per agen.
- `/new` harus tepat `/new` (tanpa teks lain).

## Branch

**Kenapa:** Anda ingin cabang dari jawaban tertentu tanpa mengubah thread utama.

**Manfaat:**
- Percabangan di chat baru dari pesan asisten yang valid.

**Cara pakai:**
1. Pada pesan asisten (bukan gagal/streaming), buka menu ⋮.
2. Pilih **Branch in new chat**.
3. Lanjutkan di chat cabang.

**Batas / catatan:**
- Hanya pesan asisten yang branchable (punya indeks history dan `createdAt`).
- Branch tidak menghapus chat asli.

## Cognito

**Kenapa:** Anda ingin bertanya tanpa menyimpan ke riwayat atau memori.

**Manfaat:**
- Chat sementara: tidak di History, tidak menulis memory.
- Cocok untuk uji coba atau data sensitif singkat.

**Cara pakai:**
1. Nyalakan kontrol **Cognito mode** (tooltip: tidak disimpan, tidak ditulis ke memory).
2. Chat seperti biasa.
3. Matikan Cognito → sesi dibersihkan; mulai chat normal baru.

**Batas / catatan:**
- Kontrol terlihat di empty state atau saat sudah di Cognito.
- **Side chat** BTW selalu Cognito.
- Cognito tidak mengusulkan org-memory dan tidak menjalankan `skill_manage`.

## BTW (Side chat)

**Kenapa:** Anda ingin pertanyaan samping tanpa meninggalkan chat utama.

**Manfaat:**
- Panel **Side chat** di samping.
- Bisa kirim pertanyaan langsung lewat `/btw pertanyaan`.

**Cara pakai:**
1. Mode **Advanced**, di halaman chat utama.
2. Ketik `/btw` atau `/btw apa bedanya X dan Y?`.
3. Panel samping terbuka; kirim / lanjutkan di situ.
4. Tutup panel setelah selesai.

**Batas / catatan:**
- Tidak di-wire di composer Simple.
- Side chat = Cognito (tidak masuk riwayat utama).

## Usage (pemakaian)

**Kenapa:** Anda ingin melihat token / biaya per balasan dan sisa konteks.

**Manfaat:**
- Badge **Usage** di bawah aksi pesan asisten (In / Out / Total / Cost).
- Cincin **Context Usage** di composer Advanced (% Full; System prompt / Tool definitions / Conversation).
- Setelan: **Pemakaian token di chat** (Token usage in chat).

**Cara pakai:**
1. Mode **Advanced**. Nyalakan **Pemakaian token di chat** di **Pengaturan** ([/settings/preferences](/settings/preferences)) ([Settings / Preferences](/settings/preferences)) bila perlu.
2. Setelah balasan, buka badge **Usage**.
3. Lihat cincin konteks di composer atau panel status **Context**.

**Batas / catatan:**
- Mode **Simple** (owner): badge usage disembunyikan meski setelan nyala.
- Cincin konteks hanya composer penuh (Advanced).

## Share artifact

**Kenapa:** Anda ingin memberi link publik ke laporan/file tanpa login penerima.

**Manfaat:**
- **Share artifact** menerbitkan snapshot + link salin.
- **Update snapshot** menyegarkan salinan publik setelah Anda edit di dashboard.

**Cara pakai:**
1. Buka preview artifact dari chip di chat atau dari **Browse Files → Artifacts**.
2. Menu aksi → **Share artifact**.
3. Konfirmasi **Publish artifact link?** → **Publish**. Salin link.
4. Setelah edit manual artifact: **Update snapshot** agar link publik ikut.
5. Cabut share lewat kontrol share bila perlu.

**Batas / catatan:**
- Publish = **snapshot** saat publish. Rewrite agen tidak otomatis update snapshot.
- HTML/SVG publik tidak dijalankan inline di origin app (aman dari script terhadap sesi Anda).
- Batas kirim file per channel (Telegram ≤5 MB native, WhatsApp ≤16 MiB, dll.) beda dari share link — lihat [09. File dan artifacts](./09-file-dan-artifacts.md) dan [12. Channel](./12-channel.md).

## Masalah umum

| Gejala | Penyebab | Solusi |
|---|---|---|
| File ditolak | > 5 MB, jenis tidak didukung, atau > 10 file | Kecilkan / ubah format / kurangi jumlah |
| Tidak ada pemilih model | Mode Simple | Ganti ke Advanced, atau set model di Profiles |
| `/btw` tidak jalan | Simple, atau bukan halaman chat utama | Advanced + chat utama |
| Chat kosong padahal kemarin ada | Browser lain, atau **Chat baru**/Cognito | Cek **Riwayat chat** / **Recents** di browser yang sama |
| Usage tidak muncul | Simple, atau setelan token mati | Advanced + nyalakan **Pemakaian token di chat** |
| Link share lama | Snapshot belum di-update setelah edit | **Update snapshot** |

## Lihat juga

- [01. Mulai](./01-mulai.md)
- [04. Agen](./04-agen.md)
- [06. Kerja tim agen](./06-kerja-tim-agen.md)
- [08. Skills](./08-skills.md)
- [09. File dan artifacts](./09-file-dan-artifacts.md)
- [14. Batas, FAQ, dan istilah](./14-batas-faq-dan-istilah.md)

## Halaman terkait

- [Chat](/chat)
- [Groups](/groups)
- [Panduan](/guide)
- [00. Peta halaman](./00-peta-halaman.md)
