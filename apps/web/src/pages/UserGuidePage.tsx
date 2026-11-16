import { Button } from "@airin/ui/button";
import { Input } from "@airin/ui/input";
import { cn } from "@airin/ui/utils";
import { BookOpen01Icon, Search01Icon } from "hugeicons-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MessageResponse } from "@/components/ai-elements/message";
import {
  adjacentUserGuideChapters,
  findUserGuideChapter,
  USER_GUIDE_CHAPTERS,
  userGuidePath,
} from "@/content/user-guide/catalog";

/**
 * In-app user guide (login required). GitBook-style: TOC + article + prev/next.
 */
export function UserGuidePage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();
  const chapter = findUserGuideChapter(slug);
  const { next, previous } = adjacentUserGuideChapters(chapter.id);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    if (!needle) {
      return USER_GUIDE_CHAPTERS;
    }

    return USER_GUIDE_CHAPTERS.filter(
      (item) =>
        item.title.toLowerCase().includes(needle) ||
        item.id.toLowerCase().includes(needle)
    );
  }, [query]);

  return (
    <div className="flex h-full min-h-0 w-full bg-background">
      <aside className="hidden w-72 shrink-0 flex-col border-border/60 border-r bg-muted/20 md:flex">
        <div className="border-border/60 border-b px-4 py-4">
          <div className="mb-3 flex items-center gap-2">
            <BookOpen01Icon aria-hidden className="size-5 text-primary" />
            <div>
              <p className="font-semibold text-sm tracking-tight">Panduan</p>
              <p className="text-2xs text-muted-foreground">
                Airin · User guide
              </p>
            </div>
          </div>
          <div className="relative">
            <Search01Icon
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              aria-label="Cari bab"
              className="h-9 bg-background pl-8 text-sm"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari bab…"
              value={query}
            />
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
          <nav
            aria-label="Daftar isi panduan"
            className="flex flex-col gap-0.5"
          >
            {filtered.map((item, index) => {
              const active = item.id === chapter.id;
              const isIndex = item.id === "index";

              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-background font-medium text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-background/70 hover:text-foreground",
                    isIndex && "mb-1"
                  )}
                  key={item.id}
                  to={userGuidePath(item.id)}
                >
                  {isIndex ? (
                    item.title
                  ) : (
                    <span className="flex gap-2">
                      <span className="w-5 shrink-0 text-muted-foreground/80 text-xs tabular-nums">
                        {String(index).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 leading-snug">{item.title}</span>
                    </span>
                  )}
                </Link>
              );
            })}
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-muted-foreground text-sm">
                Tidak ada bab yang cocok.
              </p>
            ) : null}
          </nav>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center gap-3 border-border/60 border-b px-4 py-3 md:px-8">
          <BookOpen01Icon
            aria-hidden
            className="size-4 shrink-0 text-muted-foreground md:hidden"
          />
          <div className="min-w-0 flex-1">
            <p className="text-2xs text-muted-foreground uppercase tracking-wider">
              Panduan pengguna
            </p>
            <h1 className="truncate font-semibold text-base tracking-tight md:text-lg">
              {chapter.title}
            </h1>
          </div>
          <select
            aria-label="Pilih bab"
            className="max-w-[50%] rounded-lg border border-border bg-background px-2 py-1.5 text-sm md:hidden"
            onChange={(event) => {
              navigate(userGuidePath(event.target.value));
            }}
            value={chapter.id}
          >
            {USER_GUIDE_CHAPTERS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <article className="mx-auto w-full max-w-3xl px-4 py-8 md:px-10 md:py-10">
            <MessageResponse
              className={cn(
                "user-guide-prose text-[15px] leading-7",
                "[&_h1]:mb-4 [&_h1]:font-semibold [&_h1]:text-3xl [&_h1]:tracking-tight",
                "[&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:border-border/70 [&_h2]:border-b [&_h2]:pb-2 [&_h2]:font-semibold [&_h2]:text-xl",
                "[&_h3]:mt-8 [&_h3]:mb-2 [&_h3]:font-semibold [&_h3]:text-base",
                "[&_blockquote]:my-4 [&_blockquote]:border-primary/40 [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground",
                "[&_table]:my-4 [&_table]:w-full [&_table]:text-sm",
                "[&_th]:border-border [&_th]:border-b [&_th]:px-2 [&_th]:py-2 [&_th]:text-left [&_th]:text-muted-foreground",
                "[&_td]:border-border/60 [&_td]:border-b [&_td]:px-2 [&_td]:py-2 [&_td]:align-top",
                "[&_a]:text-primary [&_a]:underline-offset-2 hover:[&_a]:underline",
                "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.85em]"
              )}
            >
              {chapter.body}
            </MessageResponse>

            <nav
              aria-label="Bab sebelumnya dan berikutnya"
              className="mt-12 flex flex-col gap-3 border-border border-t pt-6 sm:flex-row sm:justify-between"
            >
              {previous ? (
                <Button
                  className="h-auto justify-start whitespace-normal px-3 py-3 text-left"
                  nativeButton={false}
                  render={<Link to={userGuidePath(previous.id)} />}
                  variant="outline"
                >
                  <span className="block text-2xs text-muted-foreground uppercase tracking-wide">
                    Sebelumnya
                  </span>
                  <span className="font-medium text-sm">{previous.title}</span>
                </Button>
              ) : (
                <span />
              )}
              {next ? (
                <Button
                  className="h-auto justify-end whitespace-normal px-3 py-3 text-right sm:ml-auto"
                  nativeButton={false}
                  render={<Link to={userGuidePath(next.id)} />}
                  variant="outline"
                >
                  <span className="block text-2xs text-muted-foreground uppercase tracking-wide">
                    Berikutnya
                  </span>
                  <span className="font-medium text-sm">{next.title}</span>
                </Button>
              ) : null}
            </nav>
          </article>
        </div>
      </div>
    </div>
  );
}
