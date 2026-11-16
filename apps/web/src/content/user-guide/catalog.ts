import ch01 from "./01-mulai.md?raw";
import ch02 from "./02-akun-dan-keamanan.md?raw";
import ch03 from "./03-organisasi-dan-pengguna.md?raw";
import ch04 from "./04-agen.md?raw";
import ch05 from "./05-chat.md?raw";
import ch06 from "./06-kerja-tim-agen.md?raw";
import ch07 from "./07-memori-dan-pengetahuan.md?raw";
import ch08 from "./08-skills.md?raw";
import ch09 from "./09-file-dan-artifacts.md?raw";
import ch10 from "./10-otomasi-dan-workflow.md?raw";
import ch11 from "./11-integrasi-dan-tools.md?raw";
import ch12 from "./12-channel.md?raw";
import ch13 from "./13-admin-platform.md?raw";
import ch14 from "./14-batas-faq-dan-istilah.md?raw";
import readme from "./README.md?raw";

export interface UserGuideChapter {
  /** Markdown body (links rewritten for in-app routes). */
  body: string;
  id: string;
  /** Short label for the sidebar. */
  title: string;
}

function titleFromMarkdown(markdown: string, fallback: string): string {
  const match = /^#\s+(.+)$/m.exec(markdown);

  if (!match?.[1]) {
    return fallback;
  }

  return match[1]
    .replace(/^\d+\.\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Turn repo-relative .md links into /guide/:id routes. */
export function rewriteUserGuideLinks(markdown: string): string {
  return markdown
    .replace(/\]\(\.\/([^)#]+)\.md(#[^)]*)?\)/g, (_full, file, hash) => {
      const id = String(file).replace(/^README$/i, "index");

      return `](/guide/${id}${hash ?? ""})`;
    })
    .replace(
      /\]\(\.\/README\.md(#[^)]*)?\)/gi,
      (_full, hash) => `](/guide${hash ?? ""})`
    )
    .replace(/\]\(\.\.\/airin-product-overview\.html\)/g, "](/guide)")
    .replace(/\]\(\.\.\/current-state-brd-prd[^)]*\)/g, "](/guide)");
}

function chapter(
  id: string,
  raw: string,
  fallbackTitle: string
): UserGuideChapter {
  return {
    body: rewriteUserGuideLinks(raw),
    id,
    title: titleFromMarkdown(raw, fallbackTitle),
  };
}

export const USER_GUIDE_CHAPTERS: readonly UserGuideChapter[] = [
  chapter("index", readme, "Panduan Pengguna"),
  chapter("01-mulai", ch01, "Mulai memakai Airin"),
  chapter("02-akun-dan-keamanan", ch02, "Akun dan keamanan"),
  chapter("03-organisasi-dan-pengguna", ch03, "Organisasi dan pengguna"),
  chapter("04-agen", ch04, "Agen"),
  chapter("05-chat", ch05, "Chat"),
  chapter("06-kerja-tim-agen", ch06, "Kerja tim agen"),
  chapter("07-memori-dan-pengetahuan", ch07, "Memori dan pengetahuan"),
  chapter("08-skills", ch08, "Skills"),
  chapter("09-file-dan-artifacts", ch09, "File dan artifacts"),
  chapter("10-otomasi-dan-workflow", ch10, "Otomasi dan workflow"),
  chapter("11-integrasi-dan-tools", ch11, "Integrasi dan tools"),
  chapter("12-channel", ch12, "Channel"),
  chapter("13-admin-platform", ch13, "Admin platform"),
  chapter("14-batas-faq-dan-istilah", ch14, "Batas, FAQ, dan istilah"),
];

export function findUserGuideChapter(
  slug: string | undefined
): UserGuideChapter {
  const id = !slug || slug === "readme" ? "index" : slug;

  return (
    USER_GUIDE_CHAPTERS.find((chapter) => chapter.id === id) ??
    USER_GUIDE_CHAPTERS[0]
  );
}

export function userGuidePath(chapterId: string): string {
  return chapterId === "index" ? "/guide" : `/guide/${chapterId}`;
}

export interface AdjacentUserGuideChapters {
  next: UserGuideChapter | null;
  previous: UserGuideChapter | null;
}

export function adjacentUserGuideChapters(
  chapterId: string
): AdjacentUserGuideChapters {
  const index = USER_GUIDE_CHAPTERS.findIndex(
    (chapter) => chapter.id === chapterId
  );

  if (index < 0) {
    return { next: null, previous: null } satisfies AdjacentUserGuideChapters;
  }

  return {
    next: USER_GUIDE_CHAPTERS[index + 1] ?? null,
    previous: USER_GUIDE_CHAPTERS[index - 1] ?? null,
  } satisfies AdjacentUserGuideChapters;
}
