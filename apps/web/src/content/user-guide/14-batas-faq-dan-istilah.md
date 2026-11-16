# 14. Batas, FAQ, dan istilah

> Angka batas, yang tidak didukung, pertanyaan umum pemilik usaha, dan glosarium.

**Siapa yang bisa:** semua pembaca.

## Batas sistem (pilih yang sering kena)

| Area | Batas |
|---|---|
| Lampiran chat | 5 MB |
| Knowledge base ZIP | 20 MB |
| Profile MEMORY.md aktif | 4096 byte |
| Org memory inject / file live | ~2048 byte / 8192 byte |
| `sub_agent` | Max 5 child; tidak bersarang |
| `send_to_bot` | Depth 3; timeout default 5 menit |
| Data View per tab | ~400 000 karakter; baca max 200 baris/panggilan |
| Dokumen per pesan grup | 5 |
| Anggota grup | 2–12 agen |
| WhatsApp artifact | 16 MiB |
| Telegram file | ~5 MB |
| Plugin upload | 20 MB compressed / 100 MB uncompressed / 2000 files |
| Rate limit | 600/menit; auth 10/menit |
| Audit list | ≤ 200 |
| Setup import ZIP | 100 MiB |
| Core RSS (strategi) | ≤ 512 MB |

## Tidak didukung (sengaja / belum)

- Role **viewer** (sudah dihapus)
- Signup / pembayaran dari landing (waitlist saja)
- Nested teams; pindah org lama ke bawah parent
- Nested `sub_agent`
- Kirim file lewat Microsoft Teams
- Pairing Slack di channel (pairing DM saja)
- Email tool di Telegram / Discord / WhatsApp
- `skill_manage` di dalam automations
- OCR PDF hasil scan
- Plugin di-sandbox (plugin = trusted)
- Lanjut “chat terakhir” lintas browser/perangkat (hanya `localStorage`)
- Publish Default Bot / Airin sebagai shared agent

## FAQ (≥ 20)

**1. Apa bedanya Simple dan Advanced?**  
Simple untuk pemilik usaha (tim, grup, marketplace). Advanced untuk admin (tools, MCP, providers).

**2. Kenapa setiap buka Airin chat-nya kosong?**  
Di Simple seharusnya terbuka chat terakhir *di browser itu*. Jika storage dibersihkan atau browser lain, mulai lagi atau pilih dari riwayat. Pakai **Chat baru** hanya jika memang ingin kosong.

**3. Apakah admin bisa membaca chat saya?**  
Riwayat chat web privat per pemilik. Platform admin bisa buka lewat deep link untuk support. Chat channel mengikuti peserta channel.

**4. Bagaimana agen tahu data usaha saya?**  
Isi **Org memory** (pinned), unggah **Knowledge base**, dan/atau hubungkan **Data View** ke Google Sheet. Tanpa itu agen cenderung mengarang.

**5. Kenapa agen mengarang angka keuangan?**  
Sheet belum masuk Data View, tab salah `gid`, atau orkestrator belum memanggil spesialis. Minta Jovan memakai `send_to_bot` dan pastikan Dimas/Ardi punya tool sheet.

**6. Sheet sudah di-share “anyone with the link” tapi error?**  
Sering karena **gid tab salah**, bukan karena share. Buka tab yang benar, salin URL dari address bar, Add lagi.

**7. Kenapa tab Transaksi ditolak Data View?**  
Terlalu besar (> ~400 000 karakter). Buat tab ringkasan bulanan untuk agen.

**8. Apa itu Jovan?**  
Orkestrator Marketplace. Anda tanya satu pintu; ia menarik spesialis lewat `send_to_bot`.

**9. Kapan pakai Grup vs Jovan?**  
Jovan: satu jawaban ringkas dari banyak spesialis. Grup: Anda ingin melihat diskusi antar agen.

**10. Bagaimana menghapus chat?**  
Menu pada chat / agen → hapus chat. Menghapus **agen** menghapus memory dan semua chat-nya (tidak bisa dibatalkan).

**11. Kenapa WhatsApp tidak membalas?**  
Worker Stop, pairing belum selesai, atau pesan grup tanpa mention/reply. Cek **Workers** dan halaman channel profil.

**12. Bisakah satu nomor WhatsApp untuk dua agen?**  
Tidak. Satu bot/nomor untuk satu profil.

**13. Bahasa balasan salah?**  
Ubah **Bahasa** di Pengaturan. Agen Marketplace default Indonesia; minta eksplisit jika ingin bahasa lain.

**14. Apa itu Cognito?**  
Chat sementara: tidak tersimpan, tidak menulis memori.

**15. Bagaimana menyimpan laporan cantik?**  
Minta dashboard/HTML; agen memakai template artifact-design (ringkasan → KPI → chart → tabel). Buka di Artifacts.

**16. Siapa yang menekan Sync di Data View?**  
Manusia. Agen mengedit salinan lokal; Sync menulis ke Google Sheets.

**17. Member bisa undang orang?**  
Tidak. Hanya admin org.

**18. Apa bedanya org memory dan MEMORY agen?**  
Org = fakta bersama semua agen (admin). MEMORY agen = catatan khusus agen itu.

**19. Skills “belajar sendiri” aman?**  
Tergantung preset org: off / ask / auto. Untuk bisnis hati-hati, mulai dari **ask**.

**20. Di mana melihat orang yang daftar waitlist?**  
Platform admin — daftar waitlist admin (bukan di sidebar member).

**21. Teams tidak bisa kirim file?**  
Benar, batas channel Teams saat ini.

**22. Bagaimana backup sebelum upgrade?**  
Export / backup terjadwal; simpan `AIRIN_SECRETS_KEY`. Lihat [13](./13-admin-platform.md).

**23. Agen HR menjawab pasal UU?**  
Pasang Alya + skill `hr-uu-ketenagakerjaan`. Tetap review manusia untuk keputusan hukum.

**24. Chat terakhir hilang di HP?**  
Disimpan per browser. Di perangkat baru, buka dari riwayat atau lanjutkan manual.

## Troubleshooting singkat

| Gejala | Cek |
|---|---|
| Tidak ada balasan sama sekali | Provider, API key, health |
| Channel diam | Workers Start, pairing |
| Tool error “not assigned” | Assign tool/skill di profil |
| 403 / CSRF | Login ulang; jangan blokir cookie |
| Upload gagal | Ukuran vs batas tabel di atas |

## Glosarium

| Istilah | Arti |
|---|---|
| **Organization** | Batas tenant: members, agen, data |
| **Team** | Org di bawah parent (satu tingkat) |
| **Profile / Agen** | Bot dengan soul, tools, skills |
| **Soul** | SOUL, STYLE, INSTRUCTIONS, MEMORY |
| **Session** | Percakapan tersimpan orang ↔ profil |
| **Chat** | Session siap menerima giliran |
| **Turn** | Satu pesan user + seluruh jawaban agen (termasuk tools) |
| **Branch** | Salinan session sampai satu pesan untuk jalur lain |
| **Child chat** | Session dari `sub_agent` |
| **Cognito** | Chat ephemeral (tidak ke DB / memory) |
| **Artifact** | File hasil agen di workspace / Artifacts |
| **Skill** | Resep kerja (SKILL.md) yang bisa di-load |
| **Tool** | Fungsi yang dipanggil agen (baca file, sheet, …) |
| **MCP** | Server tool eksternal (Model Context Protocol) |
| **Plugin** | Paket kemampuan org (Data View, Meet, …) |
| **Composio** | Hub OAuth ke aplikasi SaaS |
| **Data View** | Salinan lokal Google Sheet + Sync |
| **A2A / `send_to_bot`** | Agen mengirim tugas ke agen lain |
| **Orkestrator** | Agen (Jovan) yang mendelegasikan ke spesialis |
| **Simple / Advanced** | Mode UI owner vs admin |
| **Brief** | Instruksi bersama di agent group |
| **Knowledge base** | Dokumen untuk pencarian agen |
| **Org memory** | Fakta bersama organisasi |
| **Marketplace** ([/marketplace](/marketplace)) | Katalog agen siap install |
| **Pairing** | Menghubungkan akun messaging ke profil |
| **Worker** | Proses bridge channel / automation |

## Lihat juga

- [README](./README.md) — daftar isi
- [`../airin-product-overview.html`](../airin-product-overview.html) — ringkasan BRD/PRD visual
- [`../current-state-brd-prd-gaps.md`](../current-state-brd-prd-gaps.md) — gap produk

## Halaman terkait

- [Panduan index](/guide)
- [00. Peta halaman](./00-peta-halaman.md)
- Tanya **Airin** di [chat](/chat)
