# 06. Kerja tim agen

> Bab ini menjelaskan grup agen, orkestrator Jovan dengan `send_to_bot`, tool `sub_agent`, kapan memakai masing-masing, dan tiga skenario bisnis.

**Siapa yang bisa:** Admin organisasi dan Member (grup, chat dengan Jovan). Assign tool `sub_agent`: pemilik agen / Platform admin. Install Jovan dari Marketplace: Admin organisasi.

## Grup agen

**Kenapa:** Beberapa peran harus baca brief yang sama dan bicara di satu ruang, tanpa copy-paste antar chat.

**Manfaat:**
- Satu chat, 2–12 agen, satu **Brief**.
- Anda pilih siapa menjawab dengan `@handle` atau `@all`.
- Thread privat ke satu agen; agen bisa saling teruskan (rantai terbatas); **Stop after this reply** menghentikan.
- Laporan/dashboard HTML dengan layout tetap.

**Cara pakai — buat grup:**
1. Buka **Grup** (Groups). Mode Simple: di sidebar di bawah tim.
2. Tekan **New group**.
3. Isi nama. Opsional: foto.
4. Tambah **2 sampai 12** agen.
5. Tulis **Brief** (maksimal 4000 karakter): tujuan grup. Semua anggota membacanya.
6. Tekan **Create group**.

**Cara pakai — ubah grup:**
1. Di daftar **Grup**, buka menu grup → **Edit group**.
2. Atau di chat grup terbuka: menu aksi → **Edit group** (tambah/kurangi anggota lewat dialog yang sama).
3. Menu grup juga punya **Files** dan **Memory** (panel samping).

**Cara pakai — bicara:**
1. Tiap agen punya `@handle` dari namanya. Ketik `@` di composer untuk memilih.
2. Contoh: `@writer draft the intro` → hanya writer.
3. `@all introduce yourselves` → semua agen, bergiliran.
4. Jika agen menyebut agen lain di balasan, agen itu menjawab berikutnya. Rantai hand-off terbatas. Tekan **Stop after this reply** untuk berhenti setelah balasan saat ini.
5. Balasan singkat; minta detail bila perlu. Nama dan peran agen tampil di pesan.

**Cara pakai — laporan:**
1. Minta dashboard, chart, atau laporan.
2. Agen menyimpan HTML (contoh path `artifacts/…-dashboard.html`).
3. Layout tetap: ringkasan eksekutif → 3–5 angka kunci → chart (jika ada angka) → tabel detail. Latar putih; ikut tema terang/gelap.
4. Buka dari path di balasan atau **Artifacts**.

**Cara pakai — chat & thread:**
1. **New chat** di grup: sesi baru; brief dan anggota sama.
2. Di pesan agen: **Reply in thread** → bicara privat dengan agen itu. Anggota lain tidak melihat thread.
3. Cari grup cepat (mode **Advanced** saja): **Cmd+K** (Mac) atau **Ctrl+K** (Windows/Linux), ketik nama grup. Di Simple, buka **Grup** di sidebar.
4. Atau minta Airin membuat grup; Airin minta konfirmasi nama, anggota, dan brief dulu.

**Batas / catatan:**
- Anggota grup: 2–12.
- Lampiran di pesan grup: maksimal **5** dokumen (bila dokumen diizinkan).
- Agen tidak bisa memakai `@all` untuk membangunkan semua orang — hanya pengguna.
- Sesi grup muncul di **Recents** untuk grup itu.

## Jovan dan `send_to_bot`

**Kenapa:** Satu pertanyaan pemilik sering butuh beberapa spesialis. Anda tidak ingin membuka lima chat.

**Manfaat:**
- **Jovan** (Orkestrator / Chief of Staff) = satu pintu.
- Tool `send_to_bot` mengirim tugas ke agen lain di organisasi yang sama; agen itu menjawab dengan instruksi, memori, dan tools-nya.
- Jovan merangkum satu jawaban dan menyebut siapa yang memberi tiap fakta.

**Cara pakai:**
1. Admin install **Jovan** dari **Marketplace** (lihat [04. Agen](./04-agen.md)).
2. Chat dengan **Jovan**. Tanyakan seperti biasa (contoh: “bandingkan omzet minggu ini dan risiko kontrak supplier”).
3. Jovan memanggil `send_to_bot` ke spesialis (Dimas, Nisa, dll.) — Anda tidak perlu membuka agen itu dulu.
4. Baca jawaban gabungan. Cek nama rekan yang disebut.

**Cara kerja `send_to_bot` (untuk Anda):**
- Nama target: tepat (huruf besar/kecil tidak penting), atau awalan/potongan nama yang unik.
- Timeout default: **5 menit**.
- Tidak bisa kirim ke diri sendiri.
- Rantai agen-ke-agen berhenti setelah **3** langkah.
- Nama tidak cocok → error memuat daftar agen di organisasi.
- Tersedia otomatis di hampir setiap giliran chat. Tidak di chat read-only atau giliran yang membatasi tools.

**Batas / catatan:**
- Spesialis harus sudah ada di organisasi (install Marketplace atau buat manual).
- Jovan tidak boleh mengarang angka/pasal — data dari spesialis.
- Alya/Nisa tetap mengingatkan: keputusan mengikat butuh Disnaker / lawyer.

## `sub_agent`

**Kenapa:** Satu agen butuh pekerja fokus (riset, review, rencana) tanpa ganti profil.

**Manfaat:**
- Delegasi **profil yang sama** (bukan spesialis lain).
- Beberapa `sub_agent` bisa jalan paralel dalam satu giliran.
- Mode background: chat anak di bawah chat Anda di **Recents**.

**Cara pakai:**
1. Assign tool `sub_agent` ke profil (opt-in; tidak default di profil custom) — tab **Tools** di **Profiles**.
2. Minta agen memecah kerja (“riset A dan B secara terpisah”).
3. Di UI: baris khusus judul tugas + status hidup (contoh “Searching web…”, “Writing answer…”). Selesai: ringkasan + output penuh bisa dibuka.
4. Background: minta “buat 3 chat terpisah untuk X, Y, Z”. Chat anak menjawab sendiri; Anda tetap di chat induk. Buka lewat tautan **Open chat**.

**Batas / catatan:**
- Hanya profil yang sama — tidak menarget agen lain (itu `send_to_bot`).
- Tidak bersarang: sub-agen tidak memanggil `sub_agent` lagi.
- Maksimal **5** chat anak dari satu chat.
- Timeout default 5 menit, maks 10 menit.
- Efek samping di workspace profil tetap ada meski induk timeout.
- Automasi tanpa chat: run tidak disimpan sebagai chat; audit lewat hasil tool / log server.

## Kapan memakai yang mana

| Cara | Pakai bila | Jangan pakai bila |
|---|---|---|
| **Grup** | Anda ingin beberapa agen di **satu ruang**, brief bersama, `@` siapa menjawab, thread privat | Cukup satu spesialis, atau Anda hanya ingin ringkasan orkestrator tanpa diskusi terbuka |
| **Jovan + `send_to_bot`** | Satu pertanyaan, banyak spesialis, Anda ingin **satu jawaban** dengan atribusi | Anda ingin mendengar debat antar agen di thread yang sama |
| **`sub_agent`** | Satu agen memecah kerja internal (riset paralel, review) | Butuh tools/memori **agen lain** — pakai `send_to_bot` atau undang ke grup |

Ringkas:
1. **Tanya Jovan** → orkestrasi diam-diam ke spesialis.
2. **Buka Grup** → diskusi bersama yang Anda arahkan.
3. **`sub_agent`** → delegasi ke “diri sendiri” (tool harus di-assign).

## Tiga skenario bisnis

### 1. Owner laundry: omzet, cuaca, dan caption promo

**Situasi:** Minggu hujan. Owner ingin tahu beban mesin vs cuaca, lalu caption Instagram.

**Langkah disarankan:**
1. Chat **Jovan**: “Perkiraan beban 7 hari ke depan di Jakarta dan ide promo hujan.”
2. Jovan memakai `send_to_bot` ke **Ardi** (analis) dan **Sari** (sosial) bila keduanya terinstall.
3. Baca satu jawaban: angka dari Ardi, draft caption dari Sari.
4. Alternatif diskusi terbuka: buat **Grup** berisi Ardi + Sari + Toni, brief “promo hujan minggu ini”, lalu `@ardi` untuk angka dan `@sari` untuk copy.

**Hasil:** Satu keputusan (promo + kapasitas) tanpa copy-paste antar chat.

### 2. HR UMKM: cuti PKWT dan draft lowongan

**Situasi:** Owner bertanya pasal cuti kontrak dan butuh teks lowongan.

**Langkah disarankan:**
1. Tanya **Jovan** atau langsung **Alya** untuk pasal (skill `hr-uu-ketenagakerjaan`).
2. Jovan / Alya teruskan deep-dive rekrutmen ke **Maya** lewat `send_to_bot` bila perlu.
3. Owner mengedit draft; keputusan mengikat tetap ke Disnaker / penasihat.

**Hasil:** Kutipan pasal + draft lowongan, dengan batas “bukan kuasa hukum” tetap jelas.

### 3. Tim internal: riset kompetitor lalu laporan HTML

**Situasi:** Anda punya agen Operations sendiri dengan `sub_agent` dan `web_search`. Butuh tiga sudut (harga, ulasan, SOP) lalu satu laporan.

**Langkah disarankan:**
1. Di chat agen itu: “Jalankan 3 sub-agen background: harga, ulasan, checklist SOP. Lalu gabungkan jadi laporan HTML.”
2. Pantau baris `sub_agent` / chat anak di **Recents** (maks 5 anak).
3. Minta `save_artifact` laporan dengan layout ringkas (atau di **Grup** riset+writer: minta dashboard HTML standar grup).
4. **Share artifact** bila perlu kirim link ke rekan (lihat [05. Chat](./05-chat.md)).

**Hasil:** Riset paralel tanpa ganti profil; laporan tersimpan di Artifacts.

## Masalah umum

| Gejala | Penyebab | Solusi |
|---|---|---|
| Tidak bisa buat grup < 2 atau > 12 agen | Batas produk | Pilih 2–12 anggota |
| `@nama` tidak menjawab | Handle salah / agen bukan anggota | Ketik `@` dan pilih dari daftar; **Edit group** |
| Jovan bilang agen tidak ada | Spesialis belum di-install | Install dari Marketplace atau buat agen |
| `send_to_bot` error depth | Rantai > 3 langkah | Persingkat rantai; tanya spesialis langsung |
| Tidak ada baris sub-agen | Tool belum di-assign | Assign `sub_agent` di **Profiles → Tools** |
| Chat anak ke-6 gagal | Maks 5 child per chat | Tutup / selesaikan anak lama, atau chat baru |
| Hand-off grup terus jalan | Rantai belum habis | **Stop after this reply** |

## Lihat juga

- [04. Agen](./04-agen.md)
- [05. Chat](./05-chat.md)
- [07. Memori dan pengetahuan](./07-memori-dan-pengetahuan.md)
- [09. File dan artifacts](./09-file-dan-artifacts.md)
- [10. Otomasi dan workflow](./10-otomasi-dan-workflow.md)
