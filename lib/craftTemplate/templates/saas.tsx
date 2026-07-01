/** @jsxImportSource @/lib/craftTemplate */
// A modern SaaS marketing page: navbar, hero, logo cloud, feature grid,
// testimonials, pricing, CTA and footer. Authored as JSX and compiled to the
// Craft.js tree at build time; shows up in the editor's Templates dropdown
// alongside the backend templates and the hand-written JSON starters.

import {
  Badge,
  Card,
  Container,
  CtaButton,
  Grid,
  Heading,
  IconBox,
  List,
  Navbar,
  Section,
  Text,
  template,
} from "@/lib/craftTemplate";

const INK = "#0b1120";
const ACCENT = "#6366f1";

const features = [
  {
    icon: "Zap",
    title: "Blazing fast",
    desc: "Edge-rendered pages that load in milliseconds. Your users never wait.",
  },
  {
    icon: "Shield",
    title: "Secure by default",
    desc: "SOC 2 controls, SSO, and audit logs baked in from day one.",
  },
  {
    icon: "Workflow",
    title: "Automations",
    desc: "Wire up triggers and actions without writing a line of glue code.",
  },
];

const testimonials = [
  {
    quote:
      "We replaced three tools with Lumen and shipped our MVP in nine days. The team velocity is unreal.",
    name: "Priya Nair",
    role: "CTO, Northwind",
  },
  {
    quote:
      "The developer experience is the best I've used in a decade. It just gets out of the way.",
    name: "Marcus Webb",
    role: "Staff Engineer, Cobalt",
  },
  {
    quote:
      "Onboarding took an afternoon. By the end of the week our whole org was running on it.",
    name: "Elena Rossi",
    role: "Head of Product, Vela",
  },
];

const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "free forever",
    features: "1 project\nCommunity support\nUp to 3 seats",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per seat / month",
    features: "Unlimited projects\nPriority support\nSSO & audit logs\nAutomations",
    highlight: true,
  },
  {
    name: "Scale",
    price: "$99",
    period: "per seat / month",
    features: "Everything in Pro\nDedicated manager\n99.99% SLA\nCustom integrations",
    highlight: false,
  },
];

export default template(
  {
    id: "saas-landing",
    name: "SaaS Landing",
    description:
      "Marketing page for a software product — hero, features, testimonials, pricing.",
    metaTitle: "Lumen — Ship your SaaS faster",
    metaDescription:
      "The all-in-one platform to build, launch and scale your product.",
  },
  <Container background="#ffffff" padding={0} maxWidth={0}>
    <Navbar
      brand="Lumen"
      navItems={`Features|#features\nPricing|#pricing\nDocs|#`}
      ctaLabel="Start free"
      ctaHref="#cta"
      layout="brand-left-links-right"
      variant="solid"
      sticky={true}
      background="#ffffff"
      textColor={INK}
      borderColor="#e2e8f0"
      height={64}
      maxWidth={1152}
    />

    {/* Hero */}
    <Section background={INK} paddingY={112} maxWidth={1152} customId="hero">
      <Badge
        text="New · Lumen v2.0"
        background="#1e293b"
        textColor="#a5b4fc"
        size="sm"
      />
      <Heading
        text="The fastest way to launch your SaaS"
        level="h1"
        color="#ffffff"
        align="center"
        fontWeight={700}
        letterSpacing={-1}
      />
      <Text
        text="Ship a polished product in days, not quarters. Lumen brings your pages, data and automations together — so your team can focus on customers, not plumbing."
        fontSize={19}
        lineHeight={1.6}
        color="#cbd5e1"
        align="center"
      />
      <CtaButton
        text="Start free →"
        href="#cta"
        variant="primary"
        size="lg"
        align="center"
        background={ACCENT}
        textColor="#ffffff"
        borderRadius={10}
      />
      <Text
        text="No credit card required · 14-day Pro trial"
        fontSize={13}
        color="#94a3b8"
        align="center"
      />
    </Section>

    {/* Logo cloud */}
    <Section background="#ffffff" paddingY={56} maxWidth={1152}>
      <Text
        text="TRUSTED BY FAST-MOVING TEAMS"
        fontSize={12}
        fontWeight={600}
        color="#94a3b8"
        align="center"
      />
      <Grid columns={4} gap={32}>
        <Text text="Northwind" fontSize={20} fontWeight={700} color="#cbd5e1" align="center" />
        <Text text="Cobalt" fontSize={20} fontWeight={700} color="#cbd5e1" align="center" />
        <Text text="Vela" fontSize={20} fontWeight={700} color="#cbd5e1" align="center" />
        <Text text="Hyperion" fontSize={20} fontWeight={700} color="#cbd5e1" align="center" />
      </Grid>
    </Section>

    {/* Features */}
    <Section background="#ffffff" paddingY={96} maxWidth={1152} customId="features">
      <Heading
        text="Everything you need to ship"
        level="h2"
        color={INK}
        align="center"
        fontWeight={700}
        letterSpacing={-0.5}
      />
      <Text
        text="A focused toolkit that takes you from idea to production without the integration tax."
        fontSize={17}
        color="#64748b"
        align="center"
      />
      <Grid columns={3} gap={24}>
        {features.map((f) => (
          <Card
            key={f.title}
            background="#ffffff"
            borderRadius={16}
            padding={28}
            shadow="md"
          >
            <IconBox
              icon={f.icon}
              title={f.title}
              description={f.desc}
              iconColor={ACCENT}
              titleColor={INK}
              bodyColor="#475569"
              iconSize={30}
              align="left"
            />
          </Card>
        ))}
      </Grid>
    </Section>

    {/* Testimonials */}
    <Section background="#f8fafc" paddingY={96} maxWidth={1152} customId="testimonials">
      <Heading
        text="Loved by builders"
        level="h2"
        color={INK}
        align="center"
        fontWeight={700}
        letterSpacing={-0.5}
      />
      <Grid columns={3} gap={24}>
        {testimonials.map((t) => (
          <Card
            key={t.name}
            background="#ffffff"
            borderRadius={16}
            padding={28}
            shadow="sm"
          >
            <Text
              text={`“${t.quote}”`}
              fontSize={15}
              lineHeight={1.7}
              color="#334155"
              align="left"
            />
            <Text
              text={`${t.name} — ${t.role}`}
              fontSize={13}
              fontWeight={600}
              color={INK}
              align="left"
            />
          </Card>
        ))}
      </Grid>
    </Section>

    {/* Pricing */}
    <Section background="#ffffff" paddingY={96} maxWidth={1152} customId="pricing">
      <Heading
        text="Simple, transparent pricing"
        level="h2"
        color={INK}
        align="center"
        fontWeight={700}
        letterSpacing={-0.5}
      />
      <Text
        text="Start free. Upgrade when you’re ready. Cancel anytime."
        fontSize={17}
        color="#64748b"
        align="center"
      />
      <Grid columns={3} gap={24}>
        {plans.map((plan) => (
          <Card
            key={plan.name}
            background={plan.highlight ? INK : "#ffffff"}
            borderRadius={20}
            padding={32}
            shadow={plan.highlight ? "lg" : "sm"}
          >
            {plan.highlight ? (
              <Badge
                text="Most popular"
                background={ACCENT}
                textColor="#ffffff"
                size="sm"
              />
            ) : null}
            <Heading
              text={plan.name}
              level="h3"
              color={plan.highlight ? "#ffffff" : INK}
              align="left"
              fontWeight={700}
            />
            <Heading
              text={plan.price}
              level="h2"
              color={plan.highlight ? "#ffffff" : INK}
              align="left"
              fontWeight={700}
              letterSpacing={-1}
            />
            <Text
              text={plan.period}
              fontSize={13}
              color={plan.highlight ? "#94a3b8" : "#64748b"}
              align="left"
            />
            <List
              items={plan.features}
              ordered={false}
              spacing={8}
              fontSize={14}
              color={plan.highlight ? "#cbd5e1" : "#334155"}
            />
            <CtaButton
              text={plan.highlight ? "Start free" : "Choose plan"}
              href="#cta"
              variant={plan.highlight ? "primary" : "outline"}
              size="md"
              align="left"
              background={plan.highlight ? ACCENT : INK}
              textColor="#ffffff"
              borderRadius={10}
            />
          </Card>
        ))}
      </Grid>
    </Section>

    {/* CTA */}
    <Section background={INK} paddingY={96} maxWidth={1152} customId="cta">
      <Heading
        text="Ready to ship something great?"
        level="h2"
        color="#ffffff"
        align="center"
        fontWeight={700}
        letterSpacing={-0.5}
      />
      <Text
        text="Join 4,000+ teams building on Lumen. Your first project is live in minutes."
        fontSize={17}
        color="#cbd5e1"
        align="center"
      />
      <CtaButton
        text="Start free →"
        href="#"
        variant="primary"
        size="lg"
        align="center"
        background={ACCENT}
        textColor="#ffffff"
        borderRadius={10}
      />
    </Section>

    {/* Footer */}
    <Section background={INK} paddingY={56} maxWidth={1152} customId="footer">
      <Grid columns={4} gap={32}>
        <Container>
          <Heading text="Lumen" level="h3" color="#ffffff" align="left" fontWeight={700} />
          <Text
            text="The all-in-one platform to build, launch and scale your product."
            fontSize={13}
            color="#94a3b8"
            align="left"
          />
        </Container>
        <Container>
          <Heading text="Product" level="h4" color="#ffffff" align="left" />
          <List items="Features\nPricing\nChangelog\nRoadmap" ordered={false} spacing={6} fontSize={13} color="#94a3b8" />
        </Container>
        <Container>
          <Heading text="Company" level="h4" color="#ffffff" align="left" />
          <List items="About\nCareers\nBlog\nContact" ordered={false} spacing={6} fontSize={13} color="#94a3b8" />
        </Container>
        <Container>
          <Heading text="Legal" level="h4" color="#ffffff" align="left" />
          <List items="Privacy\nTerms\nSecurity\nStatus" ordered={false} spacing={6} fontSize={13} color="#94a3b8" />
        </Container>
      </Grid>
      <Text
        text="© 2026 Lumen, Inc. All rights reserved."
        fontSize={13}
        color="#64748b"
        align="center"
      />
    </Section>
  </Container>,
);
