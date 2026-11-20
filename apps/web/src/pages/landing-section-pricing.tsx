import {
  billingWhatsAppHref,
  ENTERPRISE_CONTACT,
  PAID_PLANS,
  type PaidPlanId,
  paidPlanWhatsAppTemplate,
} from "@airin/core/billing";
import { ArrowRight01Icon, CheckmarkCircle02Icon } from "hugeicons-react";
import { useLandingCopy } from "./use-landing-copy";

const IDR = new Intl.NumberFormat("id-ID", {
  currency: "IDR",
  maximumFractionDigits: 0,
  style: "currency",
});

function formatIdr(amount: number): string {
  return IDR.format(amount).replace(/\s/g, "");
}

type PlanCardId = PaidPlanId | "enterprise";

function PricingSection() {
  const { m } = useLandingCopy();

  const plans: Array<{
    ctaHref: string;
    ctaLabel: string;
    features: readonly string[];
    featured?: boolean;
    id: PlanCardId;
    label: string;
    name: string;
    price: string;
    priceNote: string;
  }> = [
    {
      ctaHref: billingWhatsAppHref(paidPlanWhatsAppTemplate("lite")),
      ctaLabel: m.pricingCta,
      features: m.pricingLiteFeatures,
      id: "lite",
      label: PAID_PLANS.lite.label,
      name: PAID_PLANS.lite.name,
      price: formatIdr(PAID_PLANS.lite.priceIdrPerMonth),
      priceNote: m.pricingPerMonth,
    },
    {
      ctaHref: billingWhatsAppHref(paidPlanWhatsAppTemplate("plus")),
      ctaLabel: m.pricingCta,
      featured: true,
      features: m.pricingPlusFeatures,
      id: "plus",
      label: PAID_PLANS.plus.label,
      name: PAID_PLANS.plus.name,
      price: formatIdr(PAID_PLANS.plus.priceIdrPerMonth),
      priceNote: m.pricingPerMonth,
    },
    {
      ctaHref: billingWhatsAppHref(paidPlanWhatsAppTemplate("pro")),
      ctaLabel: m.pricingCta,
      features: m.pricingProFeatures,
      id: "pro",
      label: PAID_PLANS.pro.label,
      name: PAID_PLANS.pro.name,
      price: formatIdr(PAID_PLANS.pro.priceIdrPerMonth),
      priceNote: m.pricingPerMonth,
    },
    {
      ctaHref: billingWhatsAppHref(ENTERPRISE_CONTACT.template),
      ctaLabel: m.pricingEnterpriseCta,
      features: m.pricingEnterpriseFeatures,
      id: "enterprise",
      label: m.pricingEnterpriseLabel,
      name: m.pricingEnterpriseName,
      price: m.pricingEnterprisePrice,
      priceNote: m.pricingEnterprisePriceNote,
    },
  ];

  return (
    <section
      aria-labelledby="landing-pricing-title"
      className="landing-section landing-pricing"
      id="harga"
    >
      <div className="landing-wrap">
        <div className="landing-section-heading" data-reveal="rise">
          <h2 id="landing-pricing-title">
            {m.pricingTitleLead}
            <br />
            <em>{m.pricingTitleEm}</em>
          </h2>
          <p>{m.pricingBody}</p>
        </div>

        <ul className="landing-pricing-grid">
          {plans.map((plan) => (
            <li
              className="landing-pricing-card"
              data-featured={plan.featured ? "true" : undefined}
              data-reveal="rise"
              key={plan.id}
            >
              {plan.featured ? (
                <p className="landing-pricing-badge">{m.pricingPopular}</p>
              ) : null}
              <p className="landing-pricing-label">{plan.label}</p>
              <h3>{plan.name}</h3>
              <p className="landing-pricing-amount">
                <span>{plan.price}</span>
                <small>{plan.priceNote}</small>
              </p>
              <ul className="landing-pricing-features">
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <CheckmarkCircle02Icon aria-hidden />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                className={
                  plan.featured
                    ? "landing-button landing-pricing-cta"
                    : "landing-button landing-pricing-cta landing-pricing-cta-quiet"
                }
                href={plan.ctaHref}
                rel="noreferrer"
                target="_blank"
              >
                {plan.ctaLabel} <ArrowRight01Icon aria-hidden />
              </a>
            </li>
          ))}
        </ul>

        <p className="landing-pricing-note" data-reveal="rise">
          {m.pricingNote}
        </p>
      </div>
    </section>
  );
}

export { PricingSection };
