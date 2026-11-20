import type { VaultNoteTypeContract } from "@airin/core/contract";

export const NOTE_TYPE_COLORS: Record<VaultNoteTypeContract, string> = {
  doc: "#34d399",
  meeting: "#f472b6",
  mom: "#fbbf24",
  note: "#60a5fa",
  sop: "#a78bfa",
};

export const NOTE_TYPES: {
  label: string;
  value: VaultNoteTypeContract;
}[] = [
  { label: "Note", value: "note" },
  { label: "MOM", value: "mom" },
  { label: "Meeting", value: "meeting" },
  { label: "Document", value: "doc" },
  { label: "SOP", value: "sop" },
];

export type VaultViewMode = "split" | "preview" | "edit" | "graph";
