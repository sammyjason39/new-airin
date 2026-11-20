import {
  matchVaultNoteByLinkTitle,
  preprocessVaultWikilinks,
} from "@airin/core";
import type { VaultNoteResponse } from "@airin/core/contract";
import { useMemo } from "react";
import { MessageResponse } from "@/components/ai-elements/message";

type Props = {
  content: string;
  notes: VaultNoteResponse[];
  onWikilinkClick: (title: string) => void;
};

export function VaultMarkdown({ content, notes, onWikilinkClick }: Props) {
  const prepared = useMemo(
    () =>
      preprocessVaultWikilinks(content, (title) => {
        const hit = matchVaultNoteByLinkTitle(notes, title);

        return hit
          ? `#vault-open-${encodeURIComponent(hit.id)}`
          : `#vault-open-title-${encodeURIComponent(title)}`;
      }),
    [content, notes]
  );

  // oxlint-disable react-doctor/click-events-have-key-events react-doctor/no-static-element-interactions -- Wikilink anchors receive native keyboard activation; this wrapper only routes #vault-open-* clicks.
  return (
    <div
      className="p-6"
      onClick={(event) => {
        // SAFETY: Clicks inside MessageResponse bubble from rendered anchor descendants.
        const target = (event.target as HTMLElement).closest("a");

        if (!target) {
          return;
        }

        const href = target.getAttribute("href") ?? "";

        if (!href.startsWith("#vault-open-")) {
          return;
        }

        event.preventDefault();

        const raw = decodeURIComponent(
          href.replace(/^#vault-open-(?:title-)?/, "")
        );

        if (href.startsWith("#vault-open-title-")) {
          onWikilinkClick(raw);

          return;
        }

        const note = notes.find((n) => n.id === raw);

        if (note) {
          onWikilinkClick(note.title);
        }
      }}
    >
      <MessageResponse>{prepared}</MessageResponse>
    </div>
  );
}
