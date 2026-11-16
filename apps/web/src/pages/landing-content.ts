/**
 * Landing page demo data. Every example is labelled as such in the UI.
 * Copy follows the active locale; Indonesian is the product default.
 */

import type { AppLocale } from "@/lib/locale";

const integrations = [
  { icon: "whatsapp.svg", name: "WhatsApp" },
  { icon: "gmail.svg", name: "Gmail" },
  { icon: "google-drive.svg", name: "Google Drive" },
  { icon: "google-sheets.svg", name: "Google Sheets" },
  { icon: "slack.svg", name: "Slack" },
  { icon: "telegram.svg", name: "Telegram" },
  { icon: "google-meet.png", name: "Google Meet" },
  { icon: "discord.svg", name: "Discord" },
  { icon: "teams.svg", name: "Microsoft Teams" },
  { icon: "n8n.png", name: "n8n" },
  { icon: "odoo.svg", name: "Odoo" },
  { icon: "wordpress.png", name: "WordPress" },
  { icon: "accurate.png", name: "Accurate" },
  { icon: "qontak.svg", name: "Qontak" },
  { icon: "cekat-ai.svg", name: "Cekat.AI" },
  { icon: "pos.svg", name: "POS" },
] as const;

type TeamMember = {
  app: string;
  avatar: string;
  file: string;
  kind: "support" | "finance" | "marketing";
  name: string;
  reply: string;
  role: string;
  task: string;
};

type FeaturedAgent = {
  avatar: string;
  name: string;
  role: string;
  task: string;
};

type Industry = {
  action: string;
  brand: string;
  credit: string;
  detail: string;
  headline: readonly [string, string, string];
  id: "laundry" | "carwash" | "restaurant" | "retail";
  job: string;
  label: string;
  offer: string;
  owner: string;
  photo: string;
  task: string;
  title: string;
};

type ComparisonRow = readonly [string, string, string];

const teamByLocale: Record<AppLocale, readonly TeamMember[]> = {
  en: [
    {
      app: "whatsapp.svg",
      avatar: "hana",
      file: "12 customer message drafts",
      kind: "support",
      name: "Hana",
      reply:
        "12 orders are ready for pickup. I matched the order numbers and drafted a message for each customer.",
      role: "Customer Support",
      task: "Help tell customers whose laundry is ready for pickup.",
    },
    {
      app: "google-sheets.svg",
      avatar: "dimas",
      file: "Finance & stock dashboard",
      kind: "finance",
      name: "Dimas",
      reply:
        "From Google Sheets: this week’s sales are Rp18.45M. Softener stock is low. Here is the follow-up summary.",
      role: "Finance",
      task: "Before closing, check sales, stock, and bills from the business sheet.",
    },
    {
      app: "google-drive.svg",
      avatar: "kezia",
      file: "Promo design & caption",
      kind: "marketing",
      name: "Kezia",
      reply:
        "I prepared a visual concept and caption for the lunch package. The team just needs to check price and stock before it goes live.",
      role: "Marketing",
      task: "Make a lunch promo for the usually quiet Tuesday.",
    },
  ],
  id: [
    {
      app: "whatsapp.svg",
      avatar: "hana",
      file: "12 draf pesan pelanggan",
      kind: "support",
      name: "Hana",
      reply:
        "Ada 12 pesanan siap diambil. Aku cocokkan nomor pesanan dan siapkan pesan untuk masing-masing pelanggan.",
      role: "Customer Support",
      task: "Bantu kabari pelanggan yang cuciannya sudah siap diambil.",
    },
    {
      app: "google-sheets.svg",
      avatar: "dimas",
      file: "Dashboard keuangan & stok",
      kind: "finance",
      name: "Dimas",
      reply:
        "Dari Google Sheets: penjualan minggu ini Rp18,45 juta. Stok pelembut menipis. Ini ringkasan yang perlu ditindaklanjuti.",
      role: "Finance",
      task: "Sebelum tutup toko, cek penjualan, stok, dan tagihan dari sheet bisnis.",
    },
    {
      app: "google-drive.svg",
      avatar: "kezia",
      file: "Desain promo & caption",
      kind: "marketing",
      name: "Kezia",
      reply:
        "Aku siapkan konsep visual dan caption untuk paket makan siang. Tim tinggal cek harga dan stok sebelum tayang.",
      role: "Marketing",
      task: "Bikin promo makan siang untuk hari Selasa yang biasanya sepi.",
    },
  ],
};

const featuredAgentsByLocale: Record<AppLocale, readonly FeaturedAgent[]> = {
  en: [
    {
      avatar: "jovan",
      name: "Jovan",
      role: "Chief of Staff",
      task: "Team coordination and task assignment.",
    },
    {
      avatar: "alya",
      name: "Alya",
      role: "Human Resources",
      task: "Team policy, onboarding, and work guides.",
    },
    {
      avatar: "maya",
      name: "Maya",
      role: "Recruiting",
      task: "Job posts, screening, and interview scorecards.",
    },
    {
      avatar: "rani",
      name: "Rani",
      role: "Payroll",
      task: "Payslips, holiday bonus, and attendance notes.",
    },
    {
      avatar: "dimas",
      name: "Dimas",
      role: "Finance",
      task: "Finance summaries and invoice follow-up.",
    },
    {
      avatar: "fajar",
      name: "Fajar",
      role: "Sales",
      task: "Offer prep and prospect follow-up.",
    },
    {
      avatar: "hana",
      name: "Hana",
      role: "Customer Support",
      task: "Customer replies that match your business guide.",
    },
    {
      avatar: "kezia",
      name: "Kezia",
      role: "Social Media",
      task: "Campaign ideas, captions, and content assets.",
    },
    {
      avatar: "bima",
      name: "Bima",
      role: "Operations",
      task: "SOPs, checklists, and ops coordination.",
    },
    {
      avatar: "nisa",
      name: "Nisa",
      role: "Legal Support",
      task: "Document drafts for legal counsel to review.",
    },
  ],
  id: [
    {
      avatar: "jovan",
      name: "Jovan",
      role: "Chief of Staff",
      task: "Koordinasi tim dan pembagian tugas.",
    },
    {
      avatar: "alya",
      name: "Alya",
      role: "Human Resources",
      task: "Kebijakan tim, onboarding, dan panduan kerja.",
    },
    {
      avatar: "maya",
      name: "Maya",
      role: "Recruiting",
      task: "Lowongan, screening, dan scorecard wawancara.",
    },
    {
      avatar: "rani",
      name: "Rani",
      role: "Payroll",
      task: "Slip gaji, THR, dan catatan absensi.",
    },
    {
      avatar: "dimas",
      name: "Dimas",
      role: "Finance",
      task: "Ringkasan keuangan dan tindak lanjut invoice.",
    },
    {
      avatar: "fajar",
      name: "Fajar",
      role: "Sales",
      task: "Persiapan penawaran dan follow-up prospek.",
    },
    {
      avatar: "hana",
      name: "Hana",
      role: "Customer Support",
      task: "Balasan pelanggan yang sesuai panduan bisnis.",
    },
    {
      avatar: "kezia",
      name: "Kezia",
      role: "Social Media",
      task: "Ide kampanye, caption, dan materi konten.",
    },
    {
      avatar: "bima",
      name: "Bima",
      role: "Operations",
      task: "SOP, checklist, dan koordinasi operasional.",
    },
    {
      avatar: "nisa",
      name: "Nisa",
      role: "Legal Support",
      task: "Draf dokumen untuk ditinjau penasihat hukum.",
    },
  ],
};

const industriesByLocale: Record<AppLocale, readonly Industry[]> = {
  en: [
    {
      action: "Book a laundry pickup",
      brand: "PUTAR LAUNDRY",
      credit: "Mathias Reding",
      detail: "Time for something more fun.",
      headline: ["LAUNDRY DONE.", "WEEKEND", "EASY."],
      id: "laundry",
      job: "Hana drafts laundry status replies. Kezia helps build a pickup-delivery promo from the team brief.",
      label: "Laundry",
      offer: "Wash. Fold. Deliver.",
      owner: "Counter staff check orders and handle special customer requests.",
      photo: "https://www.pexels.com/photo/11213210/",
      task: "Prepare a laundry pickup promo for nearby customers.",
      title: "Laundry done. Customers get the update.",
    },
    {
      action: "Book on WhatsApp",
      brand: "KILAP GARAGE",
      credit: "Tima Miroshnichenko",
      detail: "Car ready. Back on the road.",
      headline: ["CLEAN.", "BACK", "SHINING."],
      id: "carwash",
      job: "Hana summarizes booking requests. Kezia prepares promo assets for the wash-and-vacuum package.",
      label: "Car wash",
      offer: "Exterior wash + interior vacuum",
      owner:
        "The team checks slots, confirms times, and owns the wash quality.",
      photo: "https://www.pexels.com/photo/6873122/",
      task: "Make a wash-and-vacuum package promo for the weekend.",
      title: "Team focuses on the wash. Bookings stay tidy.",
    },
    {
      action: "Check today’s menu",
      brand: "DAPUR SORE",
      credit: "Tuğba Özsoy",
      detail: "A short break. A proper meal.",
      headline: ["HUNGRY HOUR.", "HOUSE", "FAVORITES."],
      id: "restaurant",
      job: "Dimas reads the sales report. Kezia turns those findings into a promo concept for quiet hours.",
      label: "Restaurant",
      offer: "Lunch package",
      owner:
        "Owners and kitchen staff set prices, stock, and which promos are worth running.",
      photo: "https://www.pexels.com/photo/37431302/",
      task: "Help fill the lunch hour with a favorite-menu promo.",
      title: "From the sales report to a house favorite.",
    },
    {
      action: "Ask the cashier about stock",
      brand: "RAK LOKAL",
      credit: "ha ha",
      detail: "Long shopping list? Stop here.",
      headline: ["RESTOCK.", "SHOP", "SMART."],
      id: "retail",
      job: "Dimas summarizes thinning stock. Kezia prepares promo assets from the team’s product shortlist.",
      label: "Retail",
      offer: "Home essentials, nearby",
      owner:
        "Store staff check physical stock, pick products, and approve supplier orders.",
      photo: "https://www.pexels.com/photo/16211537/",
      task: "Make a weekly essentials promo from products that are in stock.",
      title: "Stock is readable. Promos aim better.",
    },
  ],
  id: [
    {
      action: "Pesan jemput cucian",
      brand: "PUTAR LAUNDRY",
      credit: "Mathias Reding",
      detail: "Waktumu untuk hal yang lebih seru.",
      headline: ["CUCIAN RAPI.", "WEEKEND", "SANTAI."],
      id: "laundry",
      job: "Hana menyiapkan balasan status cucian. Kezia bantu bikin promo jemput antar dari brief tim.",
      label: "Laundry",
      offer: "Cuci. Lipat. Antar.",
      owner:
        "Tim loket memeriksa pesanan dan menangani kebutuhan khusus pelanggan.",
      photo: "https://www.pexels.com/photo/11213210/",
      task: "Siapkan promo jemput cucian untuk pelanggan sekitar toko.",
      title: "Cucian beres. Pelanggan dapat kabar.",
    },
    {
      action: "Booking lewat WhatsApp",
      brand: "KILAP GARAGE",
      credit: "Tima Miroshnichenko",
      detail: "Mobil siap. Jalan lagi.",
      headline: ["BERSIH.", "BALIK", "KILAP."],
      id: "carwash",
      job: "Hana merangkum permintaan booking. Kezia siapkan materi promo paket cuci dan vakum.",
      label: "Car wash",
      offer: "Cuci luar + vakum interior",
      owner:
        "Tim mengecek slot, mengonfirmasi jadwal, dan memastikan hasil cucian.",
      photo: "https://www.pexels.com/photo/6873122/",
      task: "Bikin promo paket cuci dan vakum untuk akhir pekan.",
      title: "Tim fokus cuci. Booking tetap tertata.",
    },
    {
      action: "Cek menu hari ini",
      brand: "DAPUR SORE",
      credit: "Tuğba Özsoy",
      detail: "Istirahat sebentar. Makan yang benar.",
      headline: ["JAM LAPAR.", "MENU", "ANDALAN."],
      id: "restaurant",
      job: "Dimas membaca laporan penjualan. Kezia mengubah temuan itu jadi konsep promo untuk jam sepi.",
      label: "Restoran",
      offer: "Paket makan siang",
      owner:
        "Pemilik dan tim dapur menentukan harga, stok, dan promo yang layak dijalankan.",
      photo: "https://www.pexels.com/photo/37431302/",
      task: "Bantu isi jam makan siang dengan promo menu favorit.",
      title: "Dari laporan penjualan ke menu andalan.",
    },
    {
      action: "Tanya stok ke kasir",
      brand: "RAK LOKAL",
      credit: "ha ha",
      detail: "Daftar belanja panjang? Mampir sini.",
      headline: ["ISI ULANG.", "BELANJA", "HEMAT."],
      id: "retail",
      job: "Dimas merangkum stok yang menipis. Kezia siapkan materi promo dari daftar produk pilihan tim.",
      label: "Retail",
      offer: "Kebutuhan rumah, dekat rumah",
      owner:
        "Tim toko mengecek stok fisik, memilih produk, dan menyetujui pesanan ke pemasok.",
      photo: "https://www.pexels.com/photo/16211537/",
      task: "Bikin promo kebutuhan mingguan dari produk yang stoknya tersedia.",
      title: "Stok terbaca. Promo lebih terarah.",
    },
  ],
};

const comparisonByLocale: Record<AppLocale, readonly ComparisonRow[]> = {
  en: [
    [
      "How work is split",
      "Specialists with their own roles and instructions.",
      "One assistant follows directions in the conversation.",
    ],
    [
      "Business context",
      "Guides and memory for each agent.",
      "Context comes through chat or attachments.",
    ],
    [
      "Working together",
      "Agents share briefs and hand off tasks in a group.",
      "You carry results from one chat into the next job.",
    ],
    [
      "Routines",
      "Schedules for summaries and reminders.",
      "Work starts when you open chat and ask.",
    ],
    [
      "App access",
      "Apps and tools are set per agent.",
      "Follows whatever tools the assistant already has.",
    ],
  ],
  id: [
    [
      "Pembagian kerja",
      "Spesialis dengan peran dan instruksi masing-masing.",
      "Satu asisten mengikuti arahan di percakapan.",
    ],
    [
      "Konteks bisnis",
      "Panduan dan memori untuk tiap agen.",
      "Konteks diberikan lewat chat atau lampiran.",
    ],
    [
      "Kerja bersama",
      "Agen berbagi brief dan meneruskan tugas dalam grup.",
      "Kamu membawa hasil dari satu percakapan ke pekerjaan berikutnya.",
    ],
    [
      "Rutinitas",
      "Jadwal untuk ringkasan dan pengingat.",
      "Tugas dimulai saat kamu membuka chat dan meminta.",
    ],
    [
      "Akses aplikasi",
      "Aplikasi dan alat diatur untuk tiap agen.",
      "Mengikuti alat yang tersedia pada asisten.",
    ],
  ],
};

export type LandingIndustry = Industry;

export type LandingTeamMember = TeamMember;

export function getLandingContent(locale: AppLocale) {
  return {
    comparison: comparisonByLocale[locale] ?? comparisonByLocale.id,
    featuredAgents: featuredAgentsByLocale[locale] ?? featuredAgentsByLocale.id,
    industries: industriesByLocale[locale] ?? industriesByLocale.id,
    integrations,
    team: teamByLocale[locale] ?? teamByLocale.id,
  };
}

/** Default Indonesian snapshots for static imports in tests and posters. */
const { comparison, featuredAgents, industries, team } =
  getLandingContent("id");

export { comparison, featuredAgents, industries, integrations, team };
