import { useLandingCopy } from "./use-landing-copy";

function LandingFooter() {
  const { m } = useLandingCopy();

  return (
    <footer className="landing-footer">
      <div className="landing-wrap landing-footer-inner">
        <div className="landing-footer-brand">
          <p className="landing-footer-created">{m.footerCreated}</p>
          <div className="landing-footer-logos">
            <a
              aria-label="Conextlab.ai"
              href="https://conextlab.net"
              rel="noreferrer"
              target="_blank"
            >
              <img
                alt="Conextlab"
                height={40}
                src="/icons/conextlab.png"
                width={40}
              />
            </a>
            <a
              aria-label="Ralali Group"
              href="https://ralaligroup.com"
              rel="noreferrer"
              target="_blank"
            >
              <img
                alt="Ralali Group"
                height={36}
                src="/icons/ralali-group.svg"
                width={67}
              />
            </a>
          </div>
          <p className="landing-footer-note">{m.footerNote}</p>
        </div>
        <div className="landing-footer-contact">
          <p>
            Capital Cove Business Loft, BSD City
            <br />
            Jl. BSD Grand Boulevard No.26, Cilenggang
            <br />
            Kec. Serpong, Kota Tangerang Selatan
            <br />
            Banten 15310
          </p>
          <p>
            <a href="mailto:hello@conextlab.ai">hello@conextlab.ai</a>
            <span>{m.footerContact}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

export { LandingFooter };
