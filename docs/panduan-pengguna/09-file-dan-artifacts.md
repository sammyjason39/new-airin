# 09. File dan artifacts

> Bab ini menjelaskan halaman **Files**: melihat, mempratinjau, mengedit, membagikan, dan mengirim hasil kerja agen (laporan HTML, Word, slide, gambar) — plus batas per channel.

**Siapa yang bisa:** Platform admin melihat **All files**, **Artifacts**, dan **Knowledge**; Member dan Admin organisasi melihat **Artifacts** milik mereka (file yang dibuat bersama agen), bisa preview / unduh / share / hapus; semua member organisasi yang berwenang bisa membaca artifact lewat lampiran chat.

## Halaman Files (Browse Files)

**Kenapa:** Hasil agen (laporan, skrip, gambar, dokumen) perlu satu tempat untuk dibuka ulang, diedit, dan dibagikan.

**Manfaat:**
- Tiga tampilan jelas: seluruh workspace, hanya artifacts, atau knowledge.
- Cari, filter tipe, list/grid, folder, pin.
- Halaman mengikuti agen chat aktif (atau default organisasi bila tidak ada).

**Cara pakai:**
1. Buka **Chat → Browse Files** (label navigasi **Browse Files**).
2. Pilih agen bila perlu (Files menukar agen di tempat).
3. Pilih tab:
   - **All files** — jelajah folder workspace profil (artifacts, soul/memory, tool kustom, dll.). File yang di-pin tampil dulu. (Platform admin.)
   - **Artifacts** — keluaran tersimpan; cari semua artifact (path penuh); list atau grid.
   - **Knowledge** — dokumen untuk `knowledge_base_search` (lihat [07. Memori dan pengetahuan](./07-memori-dan-pengetahuan.md)). (Platform admin di halaman ini.)
4. Daftar awal menampilkan **30** folder/file; **Show more** menambah 30 lagi.
5. Tiap file menampilkan tipe (dari ekstensi), ukuran, waktu ubah, dan di list view siapa yang membuat (**Created by** kosong untuk file lama / dari `bash` / coding agent).
6. Menu aksi artifact: **Rename**, **Download**, **Delete**, plus aksi share.

**Batas / catatan:**
- Member/org admin: hanya **Artifacts** milik mereka di halaman Files — bukan browse workspace penuh atau Knowledge.
- Nama ekstensi tidak dikenal: preview teks jika UTF-8 valid (contoh `Dockerfile`).

## Preview dan daftar isi

**Kenapa:** Anda ingin membaca hasil tanpa mengunduh dulu.

**Manfaat:**
- Preview sesuai tipe file.
- Markdown panjang punya **Contents** (daftar isi) yang sama di chat, Files, dan halaman share publik.

**Cara pakai:**
1. Klik file di **Artifacts** atau **All files**.
2. Preview:
   - Markdown — ter-render; toggle ke sumber mentah; **Contents** jika ≥2 heading (h1–h3)
   - HTML — frame tersandbox
   - Gambar — inline + unduh
   - Video — MP4, WebM, MOV, OGV
   - PDF — preview dokumen
   - Kode — highlight sesuai ekstensi
   - Teks / CSV / log — teks atau tabel
   - Word (`.docx`) — dikonversi ke Markdown untuk dibaca
3. Klik entri **Contents** untuk loncat ke heading (heading kembar ditangani per kemunculan).

**Batas / catatan:**
- Di **All files**, preview mentah gambar/video/PDF/teks hanya bila file ≤ **10 MB**. Di atas itu: **Download file**.
- Konversi preview `.docx` tidak memakai batas ukuran mentah yang sama.

## Edit artifact

**Kenapa:** Angka atau wording di laporan sering perlu perbaikan kecil tanpa minta agen ulang dari nol.

**Cara pakai:**
1. Buka preview artifact Markdown atau spreadsheet berbatas (delimited).
2. Edit sumber di tempat, lalu simpan. Timestamp diperbarui; gagal simpan tetap menyisakan isi editor untuk dicoba lagi.
3. Gunakan **Rename** / **Delete** dari menu aksi bila perlu.

**Batas / catatan:**
- Edit di tempat terbatas pada Markdown dan sumber spreadsheet delimited.
- `.docx` tidak bisa ditimpa dengan Markdown hasil preview — minta agen `write_docx` baru bila perlu revisi Word.

## HTML → PDF

**Kenapa:** PDF lebih mudah dikirim, dicetak, atau dilampirkan daripada halaman HTML.

**Cara pakai:**
1. Di chat web: buka artifact HTML → menu aksi → **Download as PDF**. Browser membuka dialog print; pilih **Save as PDF**. Tampilan mengikuti preview (deck dengan ukuran cetak: satu slide per halaman).
2. Di Telegram / Discord / WhatsApp / Slack / Teams: minta agen “buat PDF”. Server mencetak HTML dengan Chrome headless dan menyimpan PDF sebagai artifact baru.

**Batas / catatan:**
- Server perlu Chrome/Chromium. Image Docker default tidak menyertakan Chrome; build dengan `INSTALL_CHROMIUM=true` dan jalankan dengan `AIRIN_CHROME_NO_SANDBOX=true` bila perlu. Atau set `AIRIN_CHROME_PATH`.
- Tanpa Chrome, agen meminta admin memasang headless Chrome.
- Slack dan Teams **belum mengirim file** — PDF tetap di folder artifacts.

## Share publik `/s/:token`

**Kenapa:** Penerima di luar Airin perlu membuka satu file tanpa login.

**Manfaat:**
- Link token tanpa akun.
- Snapshot saat publish (bukan selalu file hidup).
- HTML/SVG tidak dijalankan inline di origin aplikasi (aman terhadap skrip sesi Anda).

**Cara pakai:**
1. Menu artifact → **Share artifact**.
2. **Publish** → salin link (`/s/…`).
3. Edit artifact di dashboard menyegarkan snapshot. Rewrite oleh agen **tidak** otomatis — pakai **Update snapshot**.
4. Cabut share dari kontrol share bila link tidak lagi boleh dibuka.

**Batas / catatan:**
- Snapshot = salinan saat publish/update, bukan streaming file live kecuali Anda update.

## Dokumen Word (`write_docx`)

**Kenapa:** Klien meminta file Word sungguhan, bukan Markdown.

**Cara pakai:**
1. Pastikan agen punya tool `write_docx` (default pada profil sistem; assign manual ke agen kustom bila perlu).
2. Minta: “buat dokumen Word …” Agen mengirim Markdown ke `write_docx`; hasil `.docx` di workspace / `artifacts/`.
3. Jangan minta agen menulis HTML/XML mentah ke path `.docx` dengan `write_file` — Word akan menampilkan markup mentah.

**Batas / catatan:**
- Di bawah `artifacts/`, nama bentrok mendapat nama unik (tidak menimpa diam-diam).
- Preview Word di Files = konversi baca saja.

## Slide deck

**Kenapa:** Presentasi perlu layout tetap 16:9 yang rapi saat dibuka dan saat jadi PDF.

**Cara pakai:**
1. Minta agen membuat slide/deck/pitch. Agen memuat skill `slide-deck-design`.
2. Hasil: satu file HTML di `artifacts/` (contoh deck hasil kuartal).
3. Di layar: satu slide 16:9 per tampilan; catatan pembicara bila ada.
4. PDF: satu slide per halaman lewat **Download as PDF** / cetak server.

**Batas / catatan:**
- Skill deck mengganti aturan tema `artifact-design` untuk presentasi (tema light default; offline, tanpa CDN font).
- Satu ide per slide; fakta hanya dari Anda.

## Gambar (ringkas)

**Kenapa:** Butuh visual cepat dari prompt teks.

**Cara pakai:**
1. Siapkan backend di **Settings → AI Providers → Image generation** (ChatGPT subscription default, atau `gpt-image-2` / model OpenAI-compatible, atau **Off**).
2. Minta bahasa biasa, atau ketik `@image` di awal kata di composer web lalu deskripsikan.
3. Tool `generate_image` menyimpan PNG di artifacts dan menampilkannya di chat bila dalam sesi.

**Batas / catatan:**
- Ukuran: `1024x1024` (default), `1024x1536`, `1536x1024`, atau `auto`.
- Satu PNG per panggilan, maks **5 MB**. Timeout provider ~180 detik.
- Tidak ada edit/variasi gambar — hanya generate dari prompt.
- Model dipilih di Settings, bukan dari prompt agen.

## Laporan HTML dengan layout tetap

**Kenapa:** Dashboard/laporan metrik harus konsisten dan mudah dibaca di grup maupun chat biasa.

**Manfaat:**
- Urutan terkunci dari skill `artifact-design`.
- Latar putih; mengikuti tema terang/gelap sistem.
- Di grup, agen menyimpan HTML dan menyebut path — tidak menempel isi penuh di chat.

**Cara pakai:**
1. Minta “laporan”, “dashboard”, atau “chart” dengan angka yang Anda punya.
2. Agen memuat `artifact-design` dan mengisi template laporan terkunci, lalu `save_artifact` ke `artifacts/*.html`.
3. Buka dari path di balasan atau tab **Artifacts**.

**Urutan wajib:**
1. Judul + **Executive summary**
2. **3–5** angka kunci (KPI)
3. Chart bila ada deret angka
4. Tabel detail

**Batas / catatan:**
- Layout panel/radius template tidak diganti sembarangan.
- Deck presentasi memakai `slide-deck-design`, bukan template laporan ini.

## Kirim artifact ke channel

**Kenapa:** Tim bekerja di WhatsApp/Telegram/Discord — file perlu sampai di channel, bukan hanya di dashboard.

**Cara pakai:**
1. Simpan artifact berhasil dulu (hanya save sukses yang masuk antrean kirim).
2. Perilaku per channel:

| Channel | Yang dikirim | Batas lampiran native |
|---------|--------------|------------------------|
| **WhatsApp** | Dokumen native (bukan share link) untuk file non-scratch baru | ≤ **16 MiB**; di atas itu: instruksi unduh. Retry bahasa alami = set deliverable; `/attach` = file deliverable terbaru saja |
| **Telegram** | Share link setelah save; lampiran dokumen native opsional | ≤ **5 MB** |
| **Discord** | Share link; lampiran native didukung bila muat | ≤ **8 MB** (terlalu besar/unsupported → tetap share link). Minta “send the file” / `/attach` |
| **Slack** | Teks; **belum kirim file** | PDF/HTML tetap di artifacts |
| **Teams** | **Tidak bisa kirim file** | Simpan di artifacts / share web |

3. Gagal kirim **tidak** menghapus artifact yang sudah tersimpan.
4. Telegram & Discord mempublish share link setelah save sukses (selain aturan lampiran di atas).

**Batas / catatan:**
- Gambar hasil `generate_image` mengikuti aturan channel yang sama (WhatsApp hingga 16 MiB native; Telegram share + cap 5 MB; Discord hingga 8 MB).
- Detail pairing/perintah channel: [12. Channel](./12-channel.md).

## Masalah umum

| Gejala | Penyebab | Solusi |
|--------|----------|--------|
| Tab All files / Knowledge tidak ada | Akun member/org admin | Pakai **Artifacts**; minta platform admin untuk Knowledge |
| Preview kosong, hanya Download | File >10 MB (All files) atau tipe tidak didukung | Unduh, atau minta agen pecah file |
| Share masih menampilkan versi lama | Agen menulis ulang tanpa update snapshot | **Update snapshot** |
| PDF dari HTML gagal di server | Chrome/Chromium belum siap | Admin set Chrome / image dengan Chromium |
| WhatsApp tidak menerima file | >16 MiB atau save gagal | Perkecil file; pastikan save sukses dulu |
| Teams/Slack tidak dapat lampiran | Channel belum mendukung kirim file | Kirim link share `/s/…` atau unduh dari Files |
| Word rusak di Word desktop | Ditulis sebagai teks HTML via `write_file` | Minta ulang dengan `write_docx` |
| Gambar ditolak | Tool off / >5 MB / ukuran tidak valid | Cek Image generation; kurangi kompleksitas prompt |

## Lihat juga

- [05. Chat](./05-chat.md)
- [06. Kerja tim agen](./06-kerja-tim-agen.md)
- [07. Memori dan pengetahuan](./07-memori-dan-pengetahuan.md)
- [08. Skills](./08-skills.md)
- [11. Integrasi dan tools](./11-integrasi-dan-tools.md)
- [12. Channel](./12-channel.md)

## Halaman terkait

- [Files](/files) — browse artifacts
- [Chat](/chat) — minta agen buat laporan HTML
- [00. Peta halaman](./00-peta-halaman.md)
