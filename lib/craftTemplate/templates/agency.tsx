/** @jsxImportSource @/lib/craftTemplate */
// Creative agency / studio: bold navbar, editorial hero, stats, case studies,
// services, team, CTA and footer.

import {
  Badge,
  Card,
  Container,
  CtaButton,
  Grid,
  Heading,
  IconBox,
  ImageBlock,
  Navbar,
  Section,
  Text,
  template,
} from "@/lib/craftTemplate";

const INK = "#0a0a0a";
const ACCENT = "#FF3366";
const PAPER = "#f5f5f4";

const stats = [
  { n: "120+", l: "Projects shipped" },
  { n: "38", l: "Awards won" },
  { n: "14", l: "Years in business" },
  { n: "9", l: "Countries served" },
];

const cases = [
  {
    img: "https://images.unsplash.com/photo-1620912189865-1e3d2a7b8b2f?w=1000&q=80",
    tag: "Brand · Web",
    title: "Halcyon — rebranding a climate startup",
    desc: "Identity, site and pitch deck for a Series A carbon-removal company.",
  },
  {
    img: "https://images.unsplash.com/photo-1542435503-956c469947f6?w=1000&q=80",
    tag: "Product",
    title: "Mira — a calmer banking app",
    desc: "End-to-end product design and a marketing site for a neobank.",
  },
];

const services = [
  { icon: "Compass", title: "Brand Strategy", desc: "Positioning, naming and messaging that earns a category." },
  { icon: "PenTool", title: "Web & Product", desc: "Sites and apps designed in Figma, built to convert." },
  { icon: "Clapperboard", title: "Motion & Film", desc: "Title sequences, explainers and social cuts that move." },
];

const team = [
  { img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80", name: "Mara Vance", role: "Founder, ECD" },
  { img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80", name: "Idris Cole", role: "Design Lead" },
  { img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80", name: "Sana Iqbal", role: "Motion Director" },
  { img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80", name: "Leo Park", role: "Engineering" },
];

export default template(
  {
    id: "agency-studio",
    name: "Agency / Studio",
    description:
      "Bold editorial site for a creative studio — hero, stats, case studies, team and CTA.",
    metaTitle: "Studio Halcyon — Brand, Web & Motion",
    metaDescription:
      "An independent creative studio building brands, products and films.",
  },
  <Container background="#ffffff" padding={0} maxWidth={0}>
    <Navbar
      brand="STUDIO/H"
      navItems={`Work|#work\nServices|#services\nStudio|#team\nContact|#contact`}
      ctaLabel="Start a project"
      ctaHref="#contact"
      layout="brand-left-links-right"
      variant="solid"
      sticky={true}
      background={INK}
      textColor="#ffffff"
      borderColor="#27272a"
      height={68}
      maxWidth={1152}
    />

    {/* Hero */}
    <Section background={INK} paddingY={128} maxWidth={1152} customId="hero">
      <Badge text="Independent creative studio" background="#1f1f1f" textColor={ACCENT} size="sm" />
      <Heading
        text="We build brands that move."
        level="h1"
        color="#ffffff"
        align="left"
        fontWeight={800}
        letterSpacing={-2}
      />
      <Text
        text="Strategy, design and film for ambitious teams. From the first sketch to the final cut — one studio, end to end."
        fontSize={20}
        lineHeight={1.5}
        color="#a1a1aa"
        align="left"
      />
      <CtaButton
        text="See our work →"
        href="#work"
        variant="primary"
        size="lg"
        align="left"
        background={ACCENT}
        textColor="#ffffff"
        borderRadius={999}
      />
    </Section>

    {/* Stats */}
    <Section background={INK} paddingY={64} maxWidth={1152}>
      <Grid columns={4} gap={32}>
        {stats.map((s) => (
          <Container key={s.l}>
            <Heading text={s.n} level="h2" color="#ffffff" align="left" fontWeight={800} letterSpacing={-1} />
            <Text text={s.l} fontSize={14} color="#a1a1aa" align="left" />
          </Container>
        ))}
      </Grid>
    </Section>

    {/* Case studies */}
    <Section background={PAPER} paddingY={112} maxWidth={1152} customId="work">
      <Heading text="Selected case studies" level="h2" color={INK} align="left" fontWeight={800} letterSpacing={-1} />
      <Grid columns={2} gap={32}>
        {cases.map((c) => (
          <Card key={c.title} background="#ffffff" borderRadius={20} padding={0} shadow="md">
            <ImageBlock src={c.img} alt={c.title} height={280} width={100} objectFit="cover" align="center" borderRadius={0} />
            <Container boxModel={{ padding: { top: 24, right: 28, bottom: 28, left: 28 } }}>
              <Badge text={c.tag} background="#fee7ef" textColor={ACCENT} size="sm" />
              <Heading text={c.title} level="h3" color={INK} align="left" fontWeight={700} />
              <Text text={c.desc} fontSize={15} lineHeight={1.6} color="#52525b" align="left" />
              <CtaButton text="Read the case study →" href="#" variant="ghost" size="sm" align="left" background={ACCENT} textColor="#ffffff" borderRadius={8} />
            </Container>
          </Card>
        ))}
      </Grid>
    </Section>

    {/* Services */}
    <Section background="#ffffff" paddingY={112} maxWidth={1152} customId="services">
      <Heading text="What we do" level="h2" color={INK} align="left" fontWeight={800} letterSpacing={-1} />
      <Grid columns={3} gap={24}>
        {services.map((s) => (
          <Card key={s.title} background="#ffffff" borderColor="#e7e5e4" borderWidth={1} borderRadius={16} padding={28} shadow="none">
            <IconBox icon={s.icon} title={s.title} description={s.desc} iconColor={ACCENT} titleColor={INK} bodyColor="#52525b" iconSize={30} align="left" />
          </Card>
        ))}
      </Grid>
    </Section>

    {/* Team */}
    <Section background={PAPER} paddingY={112} maxWidth={1152} customId="team">
      <Heading text="The studio" level="h2" color={INK} align="left" fontWeight={800} letterSpacing={-1} />
      <Grid columns={4} gap={24}>
        {team.map((m) => (
          <Card key={m.name} background="#ffffff" borderRadius={16} padding={0} shadow="sm">
            <ImageBlock src={m.img} alt={m.name} height={220} width={100} objectFit="cover" align="center" borderRadius={0} />
            <Container boxModel={{ padding: { top: 16, right: 20, bottom: 20, left: 20 } }}>
              <Heading text={m.name} level="h4" color={INK} align="left" fontWeight={600} />
              <Text text={m.role} fontSize={13} color="#78716c" align="left" />
            </Container>
          </Card>
        ))}
      </Grid>
    </Section>

    {/* CTA */}
    <Section background={INK} paddingY={112} maxWidth={1152} customId="contact">
      <Heading text="Have a project in mind?" level="h2" color="#ffffff" align="center" fontWeight={800} letterSpacing={-1} />
      <Text text="We take on a handful of partners each quarter. Tell us what you're building." fontSize={18} color="#a1a1aa" align="center" />
      <CtaButton text="Start a project →" href="#" variant="primary" size="lg" align="center" background={ACCENT} textColor="#ffffff" borderRadius={999} />
    </Section>

    {/* Footer */}
    <Section background={INK} paddingY={48} maxWidth={1152} customId="footer">
      <Grid columns={2} gap={32}>
        <Container>
          <Heading text="STUDIO/H" level="h4" color="#ffffff" align="left" fontWeight={700} />
          <Text text="© 2026 Studio Halcyon. All rights reserved." fontSize={13} color="#71717a" align="left" />
        </Container>
        <Container>
          <Heading text="Studio" level="h4" color="#ffffff" align="right" fontWeight={600} />
          <Text text="hello@studioh.co" fontSize={13} color="#a1a1aa" align="right" />
        </Container>
      </Grid>
    </Section>
  </Container>,
);
