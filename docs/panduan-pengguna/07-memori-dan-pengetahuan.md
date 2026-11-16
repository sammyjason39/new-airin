# 07. Memori dan pengetahuan

> Bab ini menjelaskan cara Airin mengingat fakta: memori per agen, memori organisasi, memori grup, knowledge base (dokumen), plugin Supermemory, dan chat Cognito yang tidak menulis memori.

**Siapa yang bisa:** semua memakai memori di chat; Admin organisasi mengelola Org Memory dan proposal; Platform admin mengunggah ZIP knowledge; Member membaca/mencari Org Memory dan memakai knowledge yang sudah siap.

## Memori agen (`MEMORY.md`)

**Kenapa:** Agen perlu mengingat preferensi, nama, dan keputusan yang berharga lintas chat — tanpa mengisi prompt utama.

**Manfaat:**
- Fakta aktif ikut ke prompt sebagai bagian soul agen.
- Agen menulis sendiri lewat skill, bukan lewat form panjang.
- Fakta lama bisa diarsip tanpa hilang.

**Cara pakai:**
1. Buka agen di **Agent** (Advanced) atau pilih agen di sidebar (Simple).
2. Buka tab **Prompt** / soul untuk melihat atau mengedit `MEMORY.md` bila Anda ingin memperbaiki fakta secara manual.
3. Di chat biasa, sampaikan fakta yang ingin diingat. Agen memakai skill `update-profile-memory` bersama tool file (`read_file` / `edit_file` / `write_file`) untuk menambah bullet bertanggal.
4. Bila memori penuh atau Anda ingin “lupakan tapi simpan sejarah”, minta agen mengarsip. Skill `archive-profile-memory` memindahkan bullet ke arsip bulanan `memory-archive/YYYY-MM.md`, lalu menghapusnya dari `MEMORY.md` aktif.
5. Arsip bulanan **tidak** dimuat ke prompt chat. Hanya `MEMORY.md` aktif yang ikut.

**Batas / catatan:**
- Soft limit file aktif: **4096 byte**.
- Format tipikal: preamble `# Memory Log` plus bagian bertanggal `## YYYY-MM-DD` dan bullet `- …`.
- Skill sistem `update-profile-memory` dan `archive-profile-memory` tersembunyi dari picker `/skill`, tetapi tetap bisa dipanggil eksplisit.
- Clone agen memulai `MEMORY.md` kosong — kontinuitas tidak ikut tersalin.
- Chat **Cognito** menolak menulis ke `MEMORY.md` dan arsip memori (lihat bagian Cognito).
- Jangan simpan password atau rahasia di memori.

## Memori organisasi (Org Memory)

**Kenapa:** Semua agen di organisasi perlu fakta yang sama (jam support, nama pelanggan utama, kebijakan) tanpa menyalin ke tiap `MEMORY.md`.

**Manfaat:**
- Satu sumber fakta bersama, dikurasi admin.
- Member bisa mencari; agen bisa mengusulkan fakta baru.
- Riwayat perubahan bisa dibatalkan atau dipulihkan.

**Cara pakai:**
1. Admin organisasi buka **Pengaturan** (Settings) → **Workspace → Organization → Org Memory** (halaman Organization).
2. Tab **Live memory**: lihat fakta pinned + log terbaru. Pilih **Edit** untuk mengubah Markdown mentah. Pertahankan struktur `## Org Memory`, `## Pinned`, lalu bagian tanggal `## YYYY-MM-DD`.
3. Tab **Proposals**: tinjau usulan agen. **Approve** atau **Reject**. Centang **Pin on approve** bila fakta harus selalu masuk ringkasan prompt.
4. Tab **History**: lihat snapshot perubahan. **Undo latest** mengembalikan ke revisi sebelumnya. **Restore** pada baris lama memuat ulang snapshot itu sebagai memori hidup (dan mencatat restore sebagai entri baru).
5. Gunakan **Archive** bila daftar pinned membengkak — fakta lama pindah ke arsip bulanan, file hidup tetap dalam batas.
6. Member dan admin bisa membaca serta mencari. Hanya admin yang menulis lewat UI.
7. Agen (bila profil punya tool) memakai `org_memory_search`, `org_memory_list`, dan `propose_org_memory`. Usulan masuk antrian sampai admin menyetujui. Jangan usulkan rahasia, kredensial, atau data pribadi sensitif.
8. Saat approve, Airin menggabungkan fakta ke memori hidup (merge model bila provider tersedia; jika gagal, menambahkan secara mekanis dan membersihkan duplikat mirip).

**Batas / catatan:**
- Ringkasan yang disuntik ke prompt: maks **2048 byte** (pinned + hingga **20** bullet log terbaru).
- File hidup saat disimpan: maks **8192 byte**.
- Riwayat perubahan: hingga **50** revisi; yang lebih tua dibuang otomatis.
- Proposal disimpan di database; belum ikut ekspor ZIP workspace.
- Permintaan lintas organisasi ditolak (tidak ditemukan).
- Automasi dan sub-agen memakai konteks organisasi level member bila profil punya tool.

### Peran Org Memory

| Peran | Baca | Cari | Tulis (UI) | Masuk prompt | Tool agen |
|------|------|------|------------|--------------|-----------|
| Admin organisasi | Ya | Ya | Ya | Ya | Ya (bila profil punya tool) |
| Member | Ya | Ya | Tidak | Ya | Ya (bila profil punya tool) |

## Memori grup (group memory)

**Kenapa:** Keputusan di chat grup (nama proyek, preferensi yang disepakati) perlu diingat semua anggota grup di chat berikutnya.

**Manfaat:**
- Satu memori bersama untuk semua agen dalam grup itu.
- Agen menulis hanya setelah Anda setuju — bukan saran sepihak.
- Tidak mencampur dengan `MEMORY.md` per agen atau Org Memory.

**Cara pakai:**
1. Buka **Groups**, masuk ke grup, lalu chat seperti biasa.
2. Saat Anda menyatakan atau menyetujui fakta yang berharga (keputusan, nama, preferensi), agen boleh menyimpan lewat tool `update_group_memory`.
3. Untuk memperbaiki atau menghapus entri, agen mengganti teks yang sama persis (`replaces`) atau mengosongkan `entry` bersama `replaces`.
4. Semua anggota grup membaca memori itu di setiap chat grup tersebut.

**Batas / catatan:**
- Kapasitas sekitar **4096** karakter. Bila penuh, ganti atau hapus entri dulu.
- Hanya tersedia di chat grup (bukan chat 1:1 biasa).
- Jangan simpan rahasia. Saran agen yang belum Anda setujui tidak boleh disimpan.
- File bersama grup ada di panel file grup; terpisah dari memori teks.

## Knowledge base (dokumen)

**Kenapa:** Ada dokumen (kebijakan, katalog, SOP) yang harus bisa dicari agen, bukan dihafal di memori pendek.

**Manfaat:**
- Agen mencari dengan `knowledge_base_search` saat tool itu di-assign.
- Dokumen organisasi bisa dilampirkan ke beberapa agen.
- Skill opt-in `knowledge-base-wiki` menyusun wiki Markdown dari dokumen siap pakai.

**Cara pakai:**
1. Buka **Chat → Browse Files** (atau navigasi **Browse Files** / halaman **Files**).
2. Pilih tab **Knowledge**.
3. Platform admin: unggah file TXT, Markdown, CSV, PDF (dan lewat ZIP juga `.docx`) — tiap dokumen maks **20 MB**. ZIP knowledge maks **20 MB**.
4. Nama file ganda: pilih lewati atau ganti dokumen lama. ZIP tidak valid / terlalu besar: tidak ada dokumen yang ditambah.
5. Hasil impor menunjukkan dokumen baru, sudah ada, tidak terbaca, atau tidak didukung. Duplikat di ZIP tidak menimpa yang ada.
6. Agen hanya mencari dokumen berstatus **ready**.
7. Platform admin dapat melampirkan dokumen organisasi bersama ke profil; menghapus lampiran melepaskan tautan, bukan menghapus sumber organisasi.
8. Skill `knowledge-base-wiki` (opt-in): assign dulu ke agen, lalu minta “compile wiki”. Tidak otomatis saat upload. Wiki hidup di bawah knowledge base agen; dokumen organisasi bersama tidak ikut di-compile. Hapus folder wiki lalu compile ulang untuk membangun kembali.
9. Dokumentasi bawaan Airin (sumber warisan) muncul di Knowledge. Untuk pertanyaan tentang cara pakai Airin, agen sebaiknya mengambil indeks dokumentasi lalu halaman terkait — bukan mengandalkan `knowledge_base_search` untuk dokumen warisan itu.

**Batas / catatan:**
- ZIP knowledge ≤ **20 MB**; tiap dokumen ≤ **20 MB**.
- **Tidak ada OCR** untuk PDF hasil scan / hanya gambar. Hanya teks yang bisa diekstrak.
- Lampiran chat terpisah: batas umum **5 MB** per lampiran; ekstraksi teks lampiran juga tanpa OCR.
- Member/org admin di **Files** biasanya hanya melihat **Artifacts** milik mereka — mengelola Knowledge di halaman Files adalah wilayah platform admin.

## Supermemory (plugin)

**Kenapa:** Anda ingin pencarian memori/knowledge yang lebih semantik lewat layanan eksternal, tanpa mengganti alur upload dan approval yang sudah ada.

**Manfaat:**
- Tool memori, approval Org Memory, dan upload knowledge tetap sama.
- Konten lama pindah ke Supermemory saat dibaca/dicari berikutnya; upload baru ikut sync.
- Bisa kembali ke salinan lokal bila plugin dimatikan.

**Cara pakai:**
1. Admin organisasi: **Pengaturan** (Settings) → **Agent tools → Plugins → Official plugins → Supermemory → Install**, lalu enable.
2. Airin memakai provider OpenAI default (atau OpenAI tersimpan pertama). ChatGPT subscription tidak didukung worker ini. Tambah provider OpenAI di **Settings → Agent tools → AI Providers** bila belum ada.
3. Server terkelola sendiri: buka **Supermemory → Settings**, simpan URL + token API, lalu **Check saved connection**.
4. Setelah ganti provider, restart Supermemory di **Settings → Workspace → Workers**.
5. Tetap pakai memori dan knowledge seperti biasa. Fakta organisasi bersama tetap butuh approval admin.
6. Minta agen mencari knowledge dengan bahasa sehari-hari. Pencarian regex eksplisit tetap memakai teks lokal yang diekstrak.

**Batas / catatan:**
- Satu server Supermemory per organisasi; alamat dikunci setelah konten tersimpan (token masih bisa diganti).
- Backup Airin menyimpan koneksi/tracking, **bukan** dataset eksternal — backup server Supermemory terpisah.
- Disable/uninstall mempertahankan data eksternal. Restore ke organisasi yang sama untuk akses; pindah org perlu ingest ulang.
- Koleksi plugin **Memory** / **Knowledge** terpisah dari memori bawaan; install tidak otomatis merekam setiap percakapan.
- PDF: ekstraksi teks tetap lokal. Tidak ada OCR baru dari plugin ini.

## Cognito: chat tanpa jejak memori

**Kenapa:** Kadang Anda ingin bertanya tanpa menyimpan chat dan tanpa mengubah memori agen.

**Manfaat:**
- Chat tidak masuk History / URL.
- Tidak menulis `MEMORY.md` atau arsip memori.
- Cocok untuk uji coba cepat atau data yang tidak ingin diingat.

**Cara pakai:**
1. Di composer chat kosong (web), nyalakan kontrol **Cognito** (ikon incognito). Label: *Cognito: a chat that is not saved and never written to memory*.
2. Chat seperti biasa. Mode on: *Cognito is on. This chat is not saved and never written to memory.*
3. Mematikan Cognito memulai chat baru (dua mode tidak dicampur dalam satu sesi yang sama).

**Batas / catatan:**
- Tidak tersimpan di riwayat; tidak menulis memori.
- Tool file menolak menulis `MEMORY.md` dan `memory-archive/YYYY-MM.md` di sesi Cognito.
- Side chat **BTW** juga berjalan sebagai Cognito terkunci.

## Tabel perbandingan: pakai yang mana?

| Jenis | Isi | Siapa menulis | Masuk prompt? | Kapan dipakai |
|------|-----|---------------|---------------|---------------|
| Memori agen (`MEMORY.md`) | Preferensi & fakta per agen | Agen (skill) / edit soul | Ya (soul) | “Agen ini ingat saya suka ringkas” |
| Org Memory | Fakta seluruh organisasi | Admin UI; agen propose | Ya (ringkasan ≤2048 B) | Jam support, nama pelanggan utama |
| Memori grup | Keputusan di grup itu | Agen via `update_group_memory` | Ya di chat grup | Keputusan proyek bersama 2–12 agen |
| Knowledge base | Dokumen panjang / SOP | Upload (platform admin) | Lewat pencarian tool | Katalog, kebijakan, PDF berteks |
| Riwayat chat | Percakapan per pengguna | Pengguna & agen di sesi | Konteks sesi aktif | Detail percakapan, bukan fakta abadi |
| Cognito | Sementara saja | Tidak menulis memori | Tidak tersimpan | Uji coba / tanpa jejak |

Skills menyimpan **prosedur** (cara kerja). Memori menyimpan **fakta**. Jangan campur SOP panjang ke `MEMORY.md`.

## Tips menjaga memori tetap bersih

1. Simpan fakta pendek satu baris. Hindari paragraf panjang di `MEMORY.md`.
2. Bila mendekati 4096 byte, arsipkan bullet lama dulu.
3. Fakta untuk semua agen → Org Memory (pin yang wajib selalu terlihat).
4. Dokumen panjang → Knowledge, bukan memori.
5. Tolak proposal Org Memory yang berisi rahasia atau data pribadi tidak perlu.
6. Pakai Cognito saat menguji data yang tidak boleh diingat.
7. Setelah clone agen, isi memori baru dari nol — jangan mengandalkan salinan lama.
8. Setelah isi Org Memory, uji dengan pertanyaan yang sama ke beberapa agen.

## Masalah umum

| Gejala | Penyebab | Solusi |
|--------|----------|--------|
| Agen “lupa” fakta lama | Sudah diarsip atau melebihi ringkasan Org Memory | Cari arsip / `org_memory_search`; pin fakta penting |
| Tidak bisa menambah Org Memory | Akun member | Minta admin menulis, atau biarkan agen `propose_org_memory` |
| PDF tidak terbaca | Scan / hanya gambar (tanpa OCR) | Unggah PDF berteks atau salin teks ke `.md`/`.txt` |
| ZIP knowledge gagal | >20 MB atau rusak | Perkecil ZIP; pastikan isi `.txt`/`.md`/`.csv`/`.pdf`/`.docx` |
| Cognito tetap “mengingat” di chat berikutnya | Chat baru non-Cognito, atau fakta ada di Org Memory/KB | Matikan Cognito hanya bila ingin sesi tersimpan; cek Org Memory |
| Supermemory error setelah migrate | Worker/backend tidak siap | Restart worker atau disable plugin untuk kembali lokal sementara |
| Wiki kosong setelah upload | Skill belum di-assign / belum di-compile | Assign `knowledge-base-wiki`, minta compile |
| Agen masih mengarang nama usaha | Org Memory kosong / tidak di-pin | Isi **Pinned** di Org Memory |

## Lihat juga

- [03. Organisasi dan pengguna](./03-organisasi-dan-pengguna.md)
- [04. Agen](./04-agen.md)
- [05. Chat](./05-chat.md)
- [06. Kerja tim agen](./06-kerja-tim-agen.md)
- [08. Skills](./08-skills.md)
- [09. File dan artifacts](./09-file-dan-artifacts.md)
- [11. Integrasi dan tools](./11-integrasi-dan-tools.md)
