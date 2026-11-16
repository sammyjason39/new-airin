import { useLocale } from "@/context/use-locale";
import { getLandingContent } from "./landing-content";
import { getLandingMessages } from "./landing-messages";

/** Landing chrome + demo data for the active locale (default Indonesian). */
export function useLandingCopy() {
  const { locale } = useLocale();

  return {
    content: getLandingContent(locale),
    locale,
    m: getLandingMessages(locale),
  };
}
