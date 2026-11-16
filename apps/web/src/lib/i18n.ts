import type { AppLocale } from "@/lib/locale";

const messages = {
  en: {
    "mode.advanced": "Advanced",
    "mode.owner": "Simple",
    "owner.addAgent": "Add an agent",
    "owner.advanced": "Advanced",
    "owner.agent": "Agent",
    "owner.agentsCount": "{count} agents",
    "owner.automations": "Automations",
    "owner.deleteChat": "Delete",
    "owner.deleteChatBody":
      "This deletes the agent and wipes all of its memory and chat history. This cannot be undone.",
    "owner.deleteChatTitle": "Remove {name}?",
    "owner.deleteDanger": "Danger",
    "owner.emptyTeam": "Tap + to create a plain agent and start.",
    "owner.groups": "Groups",
    "owner.hideSidebar": "Hide sidebar",
    "owner.history": "Chat history",
    "owner.historyEmpty": "No earlier chats yet.",
    "owner.marketplace": "Marketplace",
    "owner.mute": "Mute notifications",
    "owner.newChat": "New chat",
    "owner.orchestrator": "Orchestrator",
    "owner.organization": "Organization",
    "owner.pin": "Pin chat",
    "owner.removeChat": "Remove chat",
    "owner.resumeConversations": "Resume conversations",
    "owner.role.assistant": "Assistant",
    "owner.role.chiefOfStaff": "Orchestrator",
    "owner.role.customerSuccess": "Customer Success",
    "owner.role.hr": "HR · Labor law",
    "owner.role.laundryAnalyst": "Data analyst",
    "owner.role.laundryFinance": "Finance",
    "owner.role.laundryOps": "Operations",
    "owner.role.laundrySocial": "Social media",
    "owner.role.laundrySupport": "WhatsApp support",
    "owner.role.laundryVisibility": "Visibility",
    "owner.role.legal": "Legal",
    "owner.role.payroll": "Payroll",
    "owner.role.recruiting": "Recruiting",
    "owner.role.sales": "Sales",
    "owner.settings": "Settings",
    "owner.showSidebar": "Show sidebar",
    "owner.unmute": "Unmute notifications",
    "owner.unpin": "Unpin chat",
    "owner.yourTeam": "Your team",
    "settings.advancedSettings": "Advanced settings",
    "settings.appearance": "Appearance",
    "settings.general": "General",
    "settings.instance": "Instance",
    "settings.language": "Language",
    "settings.languageHint":
      "UI language and default AI reply language. Agents reply in this language unless you ask otherwise.",
    "settings.notifications": "Notifications",
    "settings.notificationsHint":
      "Notify me when a reply is ready while I am away.",
    "settings.saved": "Saved",
    "settings.security": "Security",
    "settings.testNotification": "Test notification",
    "settings.testNotificationBody": "Airin notifications work on this device.",
    "settings.testNotificationSent": "Test notification sent",
    "settings.timezone": "Timezone",
    "settings.tokenUsage": "Token usage in chat",
  },
  id: {
    "mode.advanced": "Advanced",
    "mode.owner": "Simple",
    "owner.addAgent": "Tambah agen",
    "owner.advanced": "Advanced",
    "owner.agent": "Agen",
    "owner.agentsCount": "{count} agen",
    "owner.automations": "Otomasi",
    "owner.deleteChat": "Hapus",
    "owner.deleteChatBody":
      "Ini menghapus agen dan menghapus semua memory serta riwayat chat-nya. Tidak bisa dibatalkan.",
    "owner.deleteChatTitle": "Hapus {name}?",
    "owner.deleteDanger": "Bahaya",
    "owner.emptyTeam": "Ketuk + untuk membuat agen biasa dan mulai.",
    "owner.groups": "Grup",
    "owner.hideSidebar": "Sembunyikan sidebar",
    "owner.history": "Riwayat chat",
    "owner.historyEmpty": "Belum ada chat sebelumnya.",
    "owner.marketplace": "Marketplace",
    "owner.mute": "Matikan notifikasi",
    "owner.newChat": "Chat baru",
    "owner.orchestrator": "Orkestrator",
    "owner.organization": "Organisasi",
    "owner.pin": "Sematkan chat",
    "owner.removeChat": "Hapus chat",
    "owner.resumeConversations": "Lanjutkan percakapan",
    "owner.role.assistant": "Asisten",
    "owner.role.chiefOfStaff": "Orkestrator",
    "owner.role.customerSuccess": "Customer Success",
    "owner.role.hr": "HR · Ketenagakerjaan",
    "owner.role.laundryAnalyst": "Analis data",
    "owner.role.laundryFinance": "Keuangan",
    "owner.role.laundryOps": "Operasional",
    "owner.role.laundrySocial": "Konten & media sosial",
    "owner.role.laundrySupport": "Dukungan WhatsApp",
    "owner.role.laundryVisibility": "Visibilitas lokasi",
    "owner.role.legal": "Legal",
    "owner.role.payroll": "Payroll",
    "owner.role.recruiting": "Rekrutmen",
    "owner.role.sales": "Sales",
    "owner.settings": "Pengaturan",
    "owner.showSidebar": "Tampilkan sidebar",
    "owner.unmute": "Nyalakan notifikasi",
    "owner.unpin": "Lepas sematan",
    "owner.yourTeam": "Tim Anda",
    "settings.advancedSettings": "Pengaturan lanjutan",
    "settings.appearance": "Tampilan",
    "settings.general": "Umum",
    "settings.instance": "Instans",
    "settings.language": "Bahasa",
    "settings.languageHint":
      "Bahasa antarmuka dan bahasa balasan default AI. Agen membalas dalam bahasa ini kecuali Anda meminta sebaliknya.",
    "settings.notifications": "Notifikasi",
    "settings.notificationsHint":
      "Beri tahu saya saat balasan siap saat saya tidak di depan layar.",
    "settings.saved": "Tersimpan",
    "settings.security": "Keamanan",
    "settings.testNotification": "Uji notifikasi",
    "settings.testNotificationBody":
      "Notifikasi Airin berfungsi di perangkat ini.",
    "settings.testNotificationSent": "Notifikasi uji terkirim",
    "settings.timezone": "Zona waktu",
    "settings.tokenUsage": "Pemakaian token di chat",
  },
} as const satisfies Record<AppLocale, Record<string, string>>;

export type MessageKey = keyof (typeof messages)["en"];

export function translate(
  locale: AppLocale,
  key: MessageKey,
  vars?: Record<string, string | number>
): string {
  let text: string = messages[locale][key] ?? messages.en[key] ?? key;

  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }

  return text;
}
