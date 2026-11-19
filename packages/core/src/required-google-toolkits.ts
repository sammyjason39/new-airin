/**
 * Google apps every research / Tapinall data workflow needs before scrape
 * results can land in the owner's sheet.
 */
export const REQUIRED_GOOGLE_TOOLKIT_SLUGS = [
  "gmail",
  "googledrive",
  "googlesheets",
] as const;

export type RequiredGoogleToolkitSlug =
  (typeof REQUIRED_GOOGLE_TOOLKIT_SLUGS)[number];

const REQUIRED_GOOGLE_TOOLKIT_SLUG_SET = new Set<string>(
  REQUIRED_GOOGLE_TOOLKIT_SLUGS
);

export function isRequiredGoogleToolkitSlug(slug: string): boolean {
  return REQUIRED_GOOGLE_TOOLKIT_SLUG_SET.has(slug.trim().toLowerCase());
}

export const REQUIRED_GOOGLE_TOOLKIT_TITLES: Record<
  RequiredGoogleToolkitSlug,
  string
> = {
  gmail: "Connect Gmail",
  googledrive: "Connect Google Drive",
  googlesheets: "Connect Google Sheets",
};
