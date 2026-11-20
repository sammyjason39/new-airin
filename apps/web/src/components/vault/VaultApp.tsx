import { matchVaultNoteByLinkTitle } from "@airin/core";
import type {
  VaultNoteResponse,
  VaultNoteTypeContract,
} from "@airin/core/contract";
import { Button } from "@airin/ui/button";
import { toast } from "@airin/ui/toast";
import { cn } from "@airin/ui/utils";
import {
  BookOpen01Icon,
  Delete02Icon,
  GitBranchIcon,
  LayoutGridIcon,
  PencilEdit01Icon,
  PlusSignIcon,
  Search01Icon,
  ViewIcon,
} from "hugeicons-react";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { VaultGraphView } from "@/components/vault/VaultGraphView";
import { VaultMarkdown } from "@/components/vault/VaultMarkdown";
import {
  NOTE_TYPES,
  type VaultViewMode,
} from "@/components/vault/vault-shared";
import { useAuth } from "@/context/use-auth";
import {
  useCreateVaultNote,
  useDeleteVaultNote,
  useUpdateVaultNote,
  useVaultNote,
  useVaultNotes,
} from "@/hooks/use-org-vault";
import { formatError } from "@/lib/client";
import { canAccessOrganizationPage } from "@/lib/navigation";

const VIEW_TABS: {
  icon: typeof ViewIcon;
  id: VaultViewMode;
  label: string;
}[] = [
  { icon: LayoutGridIcon, id: "split", label: "Split" },
  { icon: ViewIcon, id: "preview", label: "Read" },
  { icon: PencilEdit01Icon, id: "edit", label: "Write" },
  { icon: GitBranchIcon, id: "graph", label: "Graph" },
];

// oxlint-disable-next-line react-doctor/no-high-complexity-react-function, react-doctor/no-giant-component -- Note list, editor, preview, and graph share one vault shell.
export function VaultApp() {
  const { user, activeOrg } = useAuth();
  const canWrite = canAccessOrganizationPage(
    user?.isPlatformAdmin === true,
    activeOrg?.role
  );
  const canDelete =
    user?.isPlatformAdmin === true || activeOrg?.role === "admin";

  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [noteType, setNoteType] = useState<VaultNoteTypeContract>("note");
  const [viewMode, setViewMode] = useState<VaultViewMode>("split");

  const { data: listData, isLoading } = useVaultNotes(query);
  const { data: detail } = useVaultNote(activeId);
  const createNote = useCreateVaultNote();
  const updateNote = useUpdateVaultNote();
  const deleteNote = useDeleteVaultNote();

  const notes = listData?.notes;

  const loadNote = useCallback(
    (note: VaultNoteResponse) => {
      setActiveId(note.id);
      setTitle(note.title);
      setContent(note.content);
      setNoteType(note.noteType);

      if (viewMode === "graph") {
        setViewMode("split");
      }
    },
    [viewMode]
  );

  const openByTitle = useCallback(
    (linkTitle: string) => {
      const hit = matchVaultNoteByLinkTitle(notes ?? [], linkTitle);

      if (hit) {
        loadNote(hit);
      }
    },
    [loadNote, notes]
  );

  // oxlint-disable react-doctor/no-event-handler react-doctor/exhaustive-deps -- One-shot deep link via ?open=; clear the param after the note loads.
  useEffect(() => {
    const open = searchParams.get("open")?.trim();

    if (!(open && notes && notes.length > 0)) {
      return;
    }

    const hit =
      notes.find((n) => n.id === open) ??
      matchVaultNoteByLinkTitle(notes, open);

    if (hit) {
      loadNote(hit);
      const next = new URLSearchParams(searchParams);
      next.delete("open");
      setSearchParams(next, { replace: true });
    }
  }, [loadNote, notes, searchParams, setSearchParams]);
  // oxlint-enable react-doctor/no-event-handler react-doctor/exhaustive-deps

  const handleNew = () => {
    setActiveId(null);
    setTitle("");
    setContent("");
    setNoteType("note");
    setViewMode("split");
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast("Title is required");

      return;
    }

    try {
      if (activeId) {
        const { note } = await updateNote.mutateAsync({
          noteId: activeId,
          request: { content, noteType, title },
        });
        setActiveId(note.id);
        toast("Saved");
      } else {
        const { note } = await createNote.mutateAsync({
          content,
          noteType,
          title,
        });
        setActiveId(note.id);
        toast("Created");
      }
    } catch (error) {
      toast(formatError(error));
    }
  };

  const handleDelete = async () => {
    if (!activeId) {
      return;
    }

    try {
      await deleteNote.mutateAsync(activeId);
      handleNew();
      toast("Deleted");
    } catch (error) {
      toast(formatError(error));
    }
  };

  const showEditor = viewMode === "edit" || viewMode === "split";
  const showPreview = viewMode === "preview" || viewMode === "split";
  const saving = createNote.isPending || updateNote.isPending;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] min-h-0 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="flex w-72 shrink-0 flex-col border-border border-r bg-background">
          <div className="shrink-0 space-y-2 border-border border-b p-3">
            <div className="flex items-center gap-2">
              <Search01Icon className="size-3.5 text-muted-foreground" />
              <input
                aria-label="Search notes"
                className="flex-1 bg-transparent text-xs outline-none"
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search notes…"
                value={query}
              />
            </div>
            {canWrite ? (
              <Button
                className="w-full"
                onClick={handleNew}
                size="sm"
                type="button"
                variant="secondary"
              >
                <PlusSignIcon className="size-3.5" />
                New note
              </Button>
            ) : null}
          </div>
          <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
            {isLoading ? (
              <p className="px-2 py-1 text-muted-foreground text-xs">
                Loading…
              </p>
            ) : null}
            {(notes ?? []).map((n) => (
              <button
                className={cn(
                  "w-full rounded-lg px-3 py-2 text-left text-xs",
                  activeId === n.id
                    ? "bg-secondary text-foreground"
                    : "hover:bg-muted/60"
                )}
                key={n.id}
                onClick={() => loadNote(n)}
                type="button"
              >
                <div className="truncate font-medium">{n.title}</div>
                <div className="text-[10px] opacity-60">{n.noteType}</div>
              </button>
            ))}
            {!isLoading && (notes ?? []).length === 0 ? (
              <p className="px-2 py-1 text-muted-foreground text-xs">
                No notes yet
              </p>
            ) : null}
          </div>
        </aside>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-muted/20">
          <div className="flex shrink-0 flex-wrap items-center gap-2 border-border border-b bg-background px-4 py-3">
            <BookOpen01Icon className="size-4 text-primary" />
            <input
              aria-label="Note title"
              className="min-w-[200px] flex-1 bg-transparent font-semibold text-sm outline-none disabled:opacity-60"
              disabled={viewMode === "graph" || !canWrite}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title"
              value={title}
            />
            {viewMode !== "graph" && canWrite ? (
              <>
                <select
                  aria-label="Note type"
                  className="rounded-lg border border-border bg-secondary px-2 py-1.5 text-xs"
                  onChange={(e) =>
                    setNoteType(e.target.value as VaultNoteTypeContract)
                  }
                  value={noteType}
                >
                  {NOTE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <Button
                  disabled={saving}
                  onClick={() => void handleSave()}
                  size="sm"
                  type="button"
                >
                  {saving ? "…" : "Save"}
                </Button>
                {activeId && canDelete ? (
                  <Button
                    aria-label="Delete note"
                    onClick={() => void handleDelete()}
                    size="icon-sm"
                    type="button"
                    variant="ghost"
                  >
                    <Delete02Icon className="size-4" />
                  </Button>
                ) : null}
              </>
            ) : null}

            <div className="ml-auto flex items-center gap-1 rounded-lg bg-secondary p-0.5">
              {VIEW_TABS.map(({ id, label, icon: Icon }) => (
                <button
                  className={cn(
                    "flex items-center gap-1 rounded-md px-2.5 py-1.5 font-medium text-[11px] transition-colors",
                    viewMode === id
                      ? "bg-background text-primary shadow-sm"
                      : "text-muted-foreground"
                  )}
                  key={id}
                  onClick={() => setViewMode(id)}
                  type="button"
                >
                  <Icon className="size-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {viewMode === "graph" ? (
            <VaultGraphView
              onSelectNote={(id) => {
                const n = (notes ?? []).find((x) => x.id === id);

                if (n) {
                  loadNote(n);
                }
              }}
            />
          ) : (
            <div className="flex min-h-0 flex-1 overflow-hidden">
              {showEditor ? (
                <div
                  className={cn(
                    "flex min-h-0 flex-col overflow-hidden",
                    showPreview ? "w-1/2 border-border border-r" : "flex-1"
                  )}
                >
                  <div className="shrink-0 bg-secondary px-3 py-1.5 font-medium text-[10px] text-muted-foreground uppercase tracking-wide">
                    Markdown
                  </div>
                  <textarea
                    aria-label="Note content"
                    className="min-h-0 flex-1 resize-none bg-background p-4 font-mono text-sm leading-relaxed outline-none disabled:opacity-60"
                    disabled={!canWrite}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write notes, SOPs, MOM… Use [[Note Title]] for links."
                    value={content}
                  />
                </div>
              ) : null}

              {showPreview ? (
                <div
                  className={cn(
                    "flex min-h-0 flex-col overflow-hidden bg-background",
                    showEditor ? "w-1/2" : "flex-1"
                  )}
                >
                  <div className="shrink-0 bg-secondary px-3 py-1.5 font-medium text-[10px] text-muted-foreground uppercase tracking-wide">
                    Preview
                  </div>
                  <div className="min-h-0 flex-1 overflow-y-auto">
                    {content.trim() ? (
                      <VaultMarkdown
                        content={content}
                        notes={notes ?? []}
                        onWikilinkClick={openByTitle}
                      />
                    ) : (
                      <p className="p-6 text-muted-foreground text-sm">
                        Preview appears here.
                      </p>
                    )}
                  </div>
                </div>
              ) : null}

              {detail ? (
                <div className="min-h-0 w-52 shrink-0 overflow-y-auto border-border border-l bg-background p-3 text-xs">
                  <div className="mb-2 flex items-center gap-1 font-semibold text-primary">
                    <LayoutGridIcon className="size-3" />
                    Backlinks
                  </div>
                  {detail.inboundLinks?.length ? (
                    detail.inboundLinks.map((l) => {
                      const source = (notes ?? []).find(
                        (n) => n.id === l.sourceId
                      );
                      const label = source?.title ?? l.targetSlug;

                      return (
                        <button
                          className="mb-1 block w-full text-left text-primary opacity-80 hover:opacity-100"
                          key={l.id}
                          onClick={() => {
                            if (source) {
                              loadNote(source);
                            }
                          }}
                          type="button"
                        >
                          ← [[{label}]]
                        </button>
                      );
                    })
                  ) : (
                    <p className="opacity-50">No backlinks</p>
                  )}
                  <div className="mt-4 mb-2 font-semibold text-primary">
                    Outgoing
                  </div>
                  {detail.outboundLinks?.length ? (
                    detail.outboundLinks.map((l) => (
                      <button
                        className={cn(
                          "mb-1 block w-full text-left",
                          l.targetId
                            ? "text-primary hover:opacity-100"
                            : "text-destructive"
                        )}
                        key={l.id}
                        onClick={() => openByTitle(l.targetSlug)}
                        type="button"
                      >
                        → [[{l.targetSlug}]]
                        {l.targetId ? "" : " (broken)"}
                      </button>
                    ))
                  ) : (
                    <p className="opacity-50">No wikilinks</p>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
