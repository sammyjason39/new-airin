import { ArrowRight01Icon } from "hugeicons-react";
import { Link } from "react-router-dom";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLandingCopy } from "./use-landing-copy";

function LandingHeader() {
  const { m } = useLandingCopy();

  return (
    <header className="landing-header">
      <div className="landing-wrap landing-header-inner">
        <a aria-label={m.headerAria} href="/">
          <img
            alt="Airin"
            height={40}
            src="/airin-wordmark-light.png"
            width={414}
          />
        </a>
        <nav aria-label={m.headerNavAria}>
          <a className="landing-nav-section" href="#fitur">
            {m.headerFeatures}
          </a>
          <a className="landing-nav-section" href="#use-cases">
            {m.headerUseCases}
          </a>
          <a className="landing-nav-section" href="#onboarding">
            {m.headerOnboarding}
          </a>
          <div aria-label={m.langAria} className="landing-lang">
            <LanguageToggle className="landing-lang-toggle" />
          </div>
          <Link className="landing-login" to="/login">
            {m.headerLogin}
          </Link>
          <a className="landing-button landing-nav-cta" href="#daftar-tunggu">
            {m.headerWaitlist} <ArrowRight01Icon aria-hidden />
          </a>
        </nav>
      </div>
    </header>
  );
}

export { LandingHeader };
