# 04. Agen

> Bab ini menjelaskan agen bawaan, Marketplace, cara buat dan atur agen, soul, model, tools, skills, connectors, knowledge base, clone/export/import, pin/mute, subtitle peran, dan chat agent ACP.

**Siapa yang bisa:** Admin organisasi (install dari Marketplace, export/import), Member (chat, buat agen pribadi), pemilik agen / Platform admin (edit soul, tools, skills, connectors). Platform admin saja untuk Chat agent ACP.

## Default Bot dan Airin

**Kenapa:** Setiap organisasi baru butuh agen siap pakai, tanpa setup panjang.

**Manfaat:**
- **Default Bot** menjawab jika sesi atau channel tidak menunjuk agen lain.
- **Airin** membantu admin: buat agen, atur tools, buat grup (konfirmasi dulu di chat).
- Keduanya mendapat tools bawaan dan skills bundel standar.

**Cara pakai:**
1. Buat organisasi baru (atau install pertama). Airin membuat **Default Bot** dan **Airin** otomatis.
2. Mode **Simple**: buka **Tim Anda**. **Default Bot** muncul dengan subtitle **Asisten**. Profil **Airin** (super) disembunyikan di daftar Simple.
3. Mode **Advanced**: buka rail profil. Kedua agen terlihat. Pilih agen, lalu chat atau buka halaman **Profiles**.
4. Minta Airin di chat untuk membuat agen atau mengubah prompt tersimpan. Airin menampilkan draf, lalu menunggu **OK** Anda sebelum menyimpan.

**Batas / catatan:**
- Satu **Default Bot** per organisasi (`isDefault`). Anda boleh menghapusnya jika organisasi punya minimal 3 profil; profil non-Super lain menjadi default.
- **Airin** tidak bisa di-clone dan tidak bisa dihapus.
- Jika channel atau sesi tidak punya id profil yang valid, Airin memakai **Default Bot** organisasi itu.
- Soul **Default Bot** sudah terisi (identitas, gaya, aturan, memori). Edit di tab **Prompt**.

## Marketplace

**Kenapa:** Anda butuh agen siap peran (HR, finance, sales) tanpa menulis soul dari nol.

**Manfaat:**
- Satu klik install membuat profil di organisasi Anda.
- Bahasa default agen: Indonesia (ikut bahasa pengguna bila jelas).
- Pack laundry siap untuk demo toko laundry.

**Cara pakai:**
1. Mode **Simple**: buka **Marketplace** ([/marketplace](/marketplace)) di sidebar. Mode **Advanced**: buka halaman **Marketplace** ([/marketplace](/marketplace)).
2. Pilih agen. Baca deskripsi. Pilih foto bila diminta.
3. Admin organisasi: tekan **Install**. Member: tampilan meminta Anda minta admin meng-install.
4. Setelah install, agen muncul di **Tim Anda** / rail profil. Buka chat.

### Agen katalog inti

| Nama | Peran di sidebar (ID) | Isi singkat |
|---|---|---|
| **Jovan** | Orkestrator | Satu pintu; tarik jawaban spesialis lewat `send_to_bot` |
| **Alya** | HR · Ketenagakerjaan | UU/PP ketenagakerjaan + dokumen PKWT ke Google Docs (`hr-uu-ketenagakerjaan`, `google-workspace-docs`); bukan kuasa hukum |
| **Maya** | Rekrutmen | Lowongan, shortlist, skor wawancara |
| **Rani** | Payroll | Draft slip, checklist THR/absensi; bukan konsultan pajak |
| **Dimas** | Keuangan | Piutang, catatan kas, ringkasan sederhana |
| **Fajar** | Sales | Follow-up, outreach, checklist pipeline |
| **Hana** | Customer Success | Draft balasan pelanggan (WhatsApp/chat) |
| **Kezia** | Konten & media sosial | Caption dan rencana konten; Instagram via Connectors bila terhubung |
| **Bima** | Operasional | SOP, checklist, ide otomasi |
| **Nisa** | Legal | Flag risiko kontrak bahasa sederhana; bukan pengganti lawyer |

### Pack Laundry Innovation Summit

Install pack laundry (demo toko). Enam agen:

| Nama | Peran di sidebar (ID) | Isi singkat |
|---|---|---|
| **Sari** | Konten & media sosial | Draft promo dan kalender konten laundry |
| **Rina** | Dukungan WhatsApp | FAQ siap WhatsApp (jam, harga, status) |
| **Ardi** | Analis data | Perkiraan beban vs cuaca + data sheet/CSV |
| **Dimas** | Keuangan | Baca sheet / Data View untuk arus kas (data demo) |
| **Gilang** | Visibilitas lokasi | Ringkasan listing/ulasan peta (demo Apify) |
| **Toni** | Operasional | SOP, SLA, checklist mesin |

**Batas / catatan:**
- Browse katalog: semua Member. Install: Admin organisasi saja.
- Composio (Instagram, Sheets, dll.) opsional; sambungkan di Connectors setelah install bila perlu.
- Pack laundry memakai data demo. Jangan anggap angka POS live benar tanpa konfirmasi Anda.

## Buat agen

**Kenapa:** Peran baru butuh agen sendiri (instruksi, tools, atau knowledge berbeda).

**Manfaat:**
- Satu agen = satu tujuan yang jelas.
- Member bisa buat agen pribadi; Platform admin bisa buat profil penuh.

**Cara pakai:**
1. Mode **Simple**: di **Tim Anda** tekan **+**. Dialog **New agent**: isi **Name**, opsional **First task**, lalu **Create**.
2. Mode **Advanced** (bukan Platform admin): di rail tekan **New agent**. Dialog **What do you need help with?** lalu **Create agent**.
3. Platform admin: **Manage profiles** / **New profile**, atau buka **Profiles** dengan create. Isi nama, tools, opsional Chat agent ACP.
4. Atau di halaman **Profiles** (kosong atau dialog create): tekan **Ask Airin**. Airin membuat draf di chat; konfirmasi sebelum disimpan.
5. Agen baru mendapat tools file/knowledge dasar. Tools ekstra perlu diminta atau di-assign di dashboard.

**Batas / catatan:**
- Satu profil = satu tujuan. Buat profil baru jika instruksi, tools, tone, atau knowledge berbeda.
- `MEMORY.md` agen baru mulai kosong.
- Shared agent dari organisasi induk: pilih di **System → Organization** (agen bersama). Tim tidak bisa mengubah identitas/style/model sumber; memori dan chat tim tetap terpisah.

## Soul, style, instructions, memory

**Kenapa:** Nama saja tidak cukup. Soul mengatur siapa agen itu dan cara bekerja.

**Manfaat:**
- Identitas, gaya tulis, aturan kerja, dan memori lintas sesi terpisah jelas.
- Memori penuh bisa diarsip tanpa hilang.

**Cara pakai:**
1. Buka **Profiles** (mode Advanced / URL Profiles). Pilih agen.
2. Buka tab **Prompt** (**Agent prompt**).
3. Edit file soul:
   - **SOUL.md** — identitas
   - **STYLE.md** — suara dan format tulis
   - **INSTRUCTIONS.md** — aturan operasi
   - **MEMORY.md** — fakta yang harus diingat antar sesi
4. Opsional: isi **System prompt** di database untuk override operasional singkat. Di install baru biasanya kosong; identitas di soul.
5. Arsip memori lama lewat skill agen (`archive-profile-memory`); file bulanan di arsip memori, tidak ikut stack soul chat.

**Batas / catatan:**
- `MEMORY.md` aktif: soft limit **4096 byte**. Penuh → arsip dulu, baru tambah.
- Hanya pemilik agen atau Platform admin yang mengelola soul di UI (bukan shared agent).
- Org memory (fakta bersama organisasi) beda dari `MEMORY.md` per agen — lihat [07. Memori dan pengetahuan](./07-memori-dan-pengetahuan.md).

## Model

**Kenapa:** Beberapa agen butuh model berbeda dari default workspace.

**Manfaat:**
- Satu agen bisa pakai model tetap.
- Di chat Advanced, Anda bisa ganti model untuk giliran itu.

**Cara pakai:**
1. Buka **Profiles** → pilih agen.
2. Di header, buka **Select model** (cari di **Search models…**).
3. Untuk agen ACP: pilih model dan **Reasoning effort** / **Effort** dari daftar agen eksternal (lihat bagian ACP di bawah).
4. Di chat mode **Advanced**, buka pemilih model di composer (`Select model and effort`). Mode **Simple** tidak menampilkan pemilih model di composer.

**Batas / catatan:**
- Model profil mengganti default workspace untuk agen itu.
- Pilihan manual di chat Advanced disimpan per agen di browser.

## Assign tools, skills, dan connectors

**Kenapa:** Agen hanya boleh memakai kemampuan yang Anda izinkan.

**Manfaat:**
- Tools = aksi (baca file, web, email, dll.).
- Skills = instruksi siap pakai yang agen `load_skill` saat relevan.
- Connectors = app SaaS, Airin Library, atau custom connector.

**Cara pakai:**
1. Buka **Profiles** → pilih agen.
2. Tab **Tools**: **Add tool**. Subtab Tools / Plugins / Apps sesuai kebutuhan.
3. Tab **Connectors**: **Add custom connector** atau **Add** untuk memakai connector organisasi yang sudah ada.
4. Tab **Skills**: **Add skill** atau **Create skill**.
5. Di chat Advanced (Platform admin): ketik `/add-tool`, `/add-mcp`, `/add-skill`, atau `/add-plugin` untuk membuka dialog assign (slash lama `/add-mcp` = custom connector).
6. Mode Advanced: menu agen → **Edit agent** jika Anda pemilik, Admin organisasi, atau Platform admin.

**Batas / catatan:**
- Assign di dashboard: pemilik agen atau Platform admin (`canManage`).
- `sub_agent` opt-in — tidak default di profil custom. Lihat [06. Kerja tim agen](./06-kerja-tim-agen.md).
- `send_to_bot` otomatis di hampir setiap giliran chat (bukan di chat read-only / giliran tools terbatas).

## Knowledge base (KB)

**Kenapa:** Agen perlu dokumen referensi (SOP, harga, kebijakan) yang bisa dicari.

**Manfaat:**
- Upload dokumen; agen mencari dengan `knowledge_base_search` bila tool di-assign dan dokumen **ready**.
- ZIP banyak file sekaligus.

**Cara pakai:**
1. Platform admin: buka **Chat → Browse Files** (atau **Browse Files**) → tab **Knowledge**.
2. Tekan **Add document or ZIP**. Format: txt, md, csv, pdf, docx, zip.
3. Tunggu status **ready**. Lalu chat dengan agen yang punya `knowledge_base_search`.
4. Skill opsional `knowledge-base-wiki`: minta agen menyusun wiki dari dokumen ready (tidak otomatis saat upload).

**Batas / catatan:**
- ZIP maksimal **20 MB**. Tiap dokumen maksimal **20 MB**.
- Tab **Knowledge** di Files: Platform admin. Upload API: pemilik profil atau Platform admin.
- Member/Admin organisasi di Files melihat **Artifacts** (file yang mereka buat), bukan kelola KB profil.
- Duplikat nama: lewati atau ganti. ZIP invalid/terlalu besar: tidak menambah dokumen.
- Tidak ada OCR untuk PDF hasil scan (hanya teks yang bisa diekstrak).
- Dokumentasi Airin bawaan (URL `llms.txt`): agen memakai `web_fetch`, bukan `knowledge_base_search`.

## Clone, export, import

**Kenapa:** Anda ingin varian agen, atau memindahkan satu agen antar organisasi/install.

**Manfaat:**
- Clone = salinan cepat di org yang sama.
- Pack `.zip` = pindah satu agen tanpa backup penuh.

**Cara pakai — Clone:**
1. Buka **Profiles** → pilih agen → tab **Prompt**.
2. Di footer tekan **Duplicate**. Dialog **Clone profile?** → **Clone**.
3. Hasil: `{nama} (copy)` terpilih. Soul, avatar, KB, prompt, model, tools, skills, connectors, toolkit Composio ikut. `MEMORY.md` kosong. Bukan default org.

**Cara pakai — Export / Import:**
1. Export: **Profiles** → agen → **Export agent** → konfirmasi **Export**. Unduh `.zip`.
2. Import: **Profiles** → **Import agent** / **Import profile**. Preview isi yang dibuat atau dilewati → konfirmasi.
3. Import selalu membuat profil **baru**. Tidak menimpa yang sudah ada.

**Batas / catatan:**
- **Airin** tidak bisa di-clone.
- Pack **tidak** berisi: API key, token, config provider, artifacts tersimpan, riwayat chat, lampiran, assignment plugin.
- Nama tool/connector yang tidak ada di tujuan: tampil di preview dan dilewati — assign ulang setelah import.
- Export: Admin organisasi / Platform admin / pemilik (sesuai UI pack). Import UI pack: Admin organisasi atau Platform admin; server bisa menerima import Member sebagai agen pribadi owned.
- Pack ≠ backup install penuh.

## Pin dan mute

**Kenapa:** Agen penting di atas daftar; notifikasi push bisa diheningkan per agen.

**Manfaat:**
- Pin mengatur urutan di sidebar.
- Mute mengurangi gangguan push (bukan mematikan chat di layar).

**Cara pakai:**
1. Mode **Simple**: klik kanan / menu baris agen di **Tim Anda**.
2. **Sematkan chat** (Pin chat) atau **Lepas sematan** (Unpin).
3. **Matikan notifikasi** (Mute) atau **Nyalakan notifikasi** (Unmute).
4. Mode **Advanced**: menu rail → **Pin to top** / **Unpin**.

**Batas / catatan:**
- Mute disimpan di browser (`localStorage`) dan sinkron ke cache service worker untuk push.
- Mute tidak menutup chat di aplikasi.

## Subtitle peran

**Kenapa:** Di daftar tim, Anda ingin lihat peran di bawah nama, bukan hanya nama.

**Manfaat:**
- Marketplace dan pack laundry punya label peran siap pakai (Bahasa Indonesia di mode Simple).
- Di grup, nama pembicara bisa menyertakan peran.

**Cara pakai:**
1. Install agen dari Marketplace atau pack laundry.
2. Di **Tim Anda**, baca baris di bawah nama (contoh: **Jovan** → **Orkestrator**; **Alya** → **HR · Ketenagakerjaan**).
3. **Default Bot** → **Asisten**. Agen custom tanpa pemetaan → label generik agen.

**Batas / catatan:**
- Subtitle UI berasal dari pemetaan id/nama agen, bukan field terpisah yang Anda edit di form.
- Teks `roleOneLiner` di katalog masuk ke instruksi saat install, bukan label terpisah di layar.

## Chat agent ACP (ringkas)

**Kenapa:** Tim coding sudah bayar Claude / Codex / OpenCode dan ingin model itu menjawab di profil Airin, tetap dengan tools Airin.

**Manfaat:**
- Loop model di agen ACP; chat, profil, dan tools tetap di Airin.
- Pilih model dan tingkat reasoning dari composer.

**Cara pakai:**
1. Hanya **Platform admin**.
2. Buat atau edit agen: di **Chat agent** pilih **Claude**, **Codex**, atau **OpenCode** (default **Airin** = loop bawaan).
3. Pastikan kredensial agen ada di server (API key / sign-in di mesin Airin).
4. Buka chat. Composer menampilkan model dan effort yang didukung agen itu.
5. Kembali ke loop Airin: set **Chat agent** ke **Airin**.

**Batas / catatan:**
- ACP butuh proses child di server; image Docker default mungkin belum berisi binary — ikuti setup admin platform.
- Agen ACP memakai workspace profil; shell/edit di luar workspace ditolak.
- Detail operasional server: tanya Platform admin / lihat docs ACP.

## Masalah umum

| Gejala | Penyebab | Solusi |
|---|---|---|
| Tombol Install di Marketplace tidak ada / diminta minta admin | Hanya Admin organisasi yang install | Minta admin, atau naikkan peran |
| Tidak bisa edit soul / Tools | Bukan pemilik agen dan bukan Platform admin; atau agen shared | Minta pemilik/Platform admin; shared: ubah di sumber induk |
| Clone tidak membuka dialog | UI clone penuh untuk Platform admin | Minta Platform admin, atau export/import |
| KB tidak terbaca agen | Dokumen belum **ready**, atau tool belum di-assign | Tunggu ready; assign `knowledge_base_search` |
| Airin tidak muncul di Simple | Super profil disembunyikan di mode Simple | Ganti ke Advanced, atau pakai alur **Ask Airin** dari Profiles |
| ACP error di chat | Binary/kredensial agen belum di server | Platform admin pasang & autentikasi agen di host |

## Lihat juga

- [01. Mulai](./01-mulai.md)
- [05. Chat](./05-chat.md)
- [06. Kerja tim agen](./06-kerja-tim-agen.md)
- [07. Memori dan pengetahuan](./07-memori-dan-pengetahuan.md)
- [08. Skills](./08-skills.md)
- [09. File dan artifacts](./09-file-dan-artifacts.md)
- [11. Integrasi dan tools](./11-integrasi-dan-tools.md)

## Halaman terkait

- [Marketplace](/marketplace)
- [Profiles](/profiles)
- [Skills](/settings/skills)
- [Tools](/settings/tools)
- Tanya **Airin** di [chat](/chat) untuk buat agen baru
- [00. Peta halaman](./00-peta-halaman.md)
