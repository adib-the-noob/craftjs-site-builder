/** @jsxImportSource @/lib/craftTemplate */
// Freelance portfolio: navbar, hero with photo, services, selected work,
// about, reviews, contact form and footer. Modelled on the folio sample site.

import {
  Badge,
  Card,
  Container,
  ContactForm,
  CtaButton,
  Grid,
  Heading,
  IconBox,
  ImageBlock,
  List,
  Navbar,
  Section,
  Text,
  template,
} from "@/lib/craftTemplate";

const INK = "#18181b";
const ACCENT = "#FF6B2B";
const PAPER = "#fafafa";

const services = [
  {
    icon: "Sparkles",
    title: "UI/UX Design",
    desc: "From wireframes to polished Figma prototypes — interfaces that convert and feel effortless.",
  },
  {
    icon: "Code",
    title: "Frontend Dev",
    desc: "Pixel-perfect, responsive builds in React and Tailwind. Fast, accessible, no bloat.",
  },
  {
    icon: "Palette",
    title: "Branding",
    desc: "Logo, type and colour systems that give your product a memorable, consistent voice.",
  },
];

const work = [
  {
    img: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=900&q=80",
    tag: "SaaS",
    title: "Novu — SaaS Dashboard",
    desc: "Redesign of a B2B notification platform. Cognitive load down 40%, conversion up.",
  },
  {
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&q=80",
    tag: "Fintech",
    title: "Finlo — Finance App",
    desc: "Marketing site and onboarding for a personal finance app. React + Tailwind.",
  },
  {
    img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=900&q=80",
    tag: "Agency",
    title: "Orea — Creative Studio",
    desc: "Editorial site with scroll-driven motion for a Paris branding studio.",
  },
];

const reviews = [
  {
    quote:
      "Eliott delivered our redesign in record time and the quality blew us away. Conversion jumped 28% in a month.",
    name: "Sarah Müller — CPO, Novu",
  },
  {
    quote:
      "Working with Eliott is a dream. He asks the right questions and the result always exceeds what we imagined.",
    name: "Thomas Renault — Founder, Finlo",
  },
  {
    quote:
      "Tight deadline, vague brief. Eliott turned both into a polished site in under two weeks. Zero hand-holding.",
    name: "Camille Dufresne — CD, Orea",
  },
];

export default template(
  {
    id: "freelancer-portfolio",
    name: "Freelancer Portfolio",
    description:
      "Single-page freelance portfolio — hero, services, work, about, reviews and contact.",
    metaTitle: "Eliott — Freelance UI/UX Designer & Developer",
    metaDescription:
      "Freelance designer and frontend developer building fast, clean, accessible products.",
  },
  <Container background="#ffffff" padding={0} maxWidth={0}>
    <Navbar
      brand="eliott"
      navItems={`Work|#work\nServices|#services\nAbout|#about\nReviews|#reviews\nContact|#contact`}
      ctaLabel="Hire me"
      ctaHref="#contact"
      layout="brand-left-links-right"
      variant="solid"
      sticky={true}
      background="#ffffff"
      textColor={INK}
      borderColor="#e4e4e7"
      height={64}
      maxWidth={1152}
    />

    {/* Hero */}
    <Section background="#ffffff" paddingY={96} maxWidth={1152} customId="hero">
      <Grid columns={2} gap={48}>
        <Container>
          <Badge text="AVAILABLE FOR WORK" background="#fff1e8" textColor={ACCENT} size="sm" />
          <Heading
            text={"Hi, I'm Eliott.\nI design & build for the web."}
            level="h1"
            color={INK}
            align="left"
            fontWeight={700}
            letterSpacing={-1}
          />
          <Text
            text="Freelance UI/UX designer & frontend developer. I design and build digital products people love to use — fast, clean and accessible."
            fontSize={18}
            lineHeight={1.6}
            color="#52525b"
            align="left"
          />
          <CtaButton
            text="View my work"
            href="#work"
            variant="primary"
            size="md"
            align="left"
            background={INK}
            textColor="#ffffff"
            borderRadius={999}
          />
          <CtaButton
            text="Get in touch"
            href="#contact"
            variant="outline"
            size="md"
            align="left"
            background={INK}
            textColor="#ffffff"
            borderRadius={999}
          />
        </Container>
        <Container>
          <ImageBlock
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80"
            alt="Eliott — Freelance designer"
            height={460}
            width={100}
            rounded={true}
            borderRadius={24}
            objectFit="cover"
            align="left"
          />
        </Container>
      </Grid>
    </Section>

    {/* Services */}
    <Section background={PAPER} paddingY={96} maxWidth={1152} customId="services">
      <Heading text="Services" level="h2" color={INK} align="left" fontWeight={700} letterSpacing={-1} />
      <Grid columns={3} gap={24}>
        {services.map((s) => (
          <Card key={s.title} background="#ffffff" borderRadius={16} padding={28} shadow="sm">
            <IconBox
              icon={s.icon}
              title={s.title}
              description={s.desc}
              iconColor={ACCENT}
              titleColor={INK}
              bodyColor="#52525b"
              iconSize={28}
              align="left"
            />
          </Card>
        ))}
      </Grid>
    </Section>

    {/* Work */}
    <Section background="#ffffff" paddingY={96} maxWidth={1152} customId="work">
      <Heading text="Selected work" level="h2" color={INK} align="left" fontWeight={700} letterSpacing={-1} />
      <Grid columns={3} gap={24}>
        {work.map((w) => (
          <Card key={w.title} background="#ffffff" borderRadius={16} padding={0} shadow="sm">
            <ImageBlock src={w.img} alt={w.title} height={200} width={100} objectFit="cover" align="center" borderRadius={0} />
            <Container boxModel={{ padding: { top: 16, right: 24, bottom: 8, left: 24 } }}>
              <Badge text={w.tag} background="#fff1e8" textColor={ACCENT} size="sm" />
            </Container>
            <Heading text={w.title} level="h3" color={INK} align="left" fontWeight={700} />
            <Text text={w.desc} fontSize={14} lineHeight={1.6} color="#52525b" align="left" />
            <CtaButton text="View case study →" href="#" variant="ghost" size="sm" align="left" background={INK} textColor="#ffffff" borderRadius={8} />
          </Card>
        ))}
      </Grid>
    </Section>

    {/* About */}
    <Section background={PAPER} paddingY={96} maxWidth={1152} customId="about">
      <Grid columns={2} gap={48}>
        <Container>
          <ImageBlock
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=700&q=80"
            alt="Eliott at work"
            height={460}
            width={90}
            rounded={true}
            borderRadius={24}
            objectFit="cover"
            align="left"
          />
        </Container>
        <Container>
          <Text text="ABOUT ME" fontSize={12} fontWeight={600} color={ACCENT} align="left" />
          <Heading text="A bit about who I am" level="h2" color={INK} align="left" fontWeight={700} letterSpacing={-1} />
          <Text
            text="I'm Eliott, a freelance designer and developer based in Paris with 5 years shipping products for startups and agencies across Europe. I thrive where great design meets clean code."
            fontSize={16}
            lineHeight={1.7}
            color="#52525b"
            align="left"
          />
          <Text text="STACK & TOOLS" fontSize={12} fontWeight={600} color="#71717a" align="left" />
          <List items="Figma\nReact & Next.js\nTailwind CSS\nFramer Motion\nWebflow" ordered={false} spacing={8} fontSize={14} color="#3f3f46" />
        </Container>
      </Grid>
    </Section>

    {/* Reviews */}
    <Section background="#ffffff" paddingY={96} maxWidth={1152} customId="reviews">
      <Heading text="What clients say" level="h2" color={INK} align="left" fontWeight={700} letterSpacing={-1} />
      <Grid columns={3} gap={24}>
        {reviews.map((r) => (
          <Card key={r.name} background={PAPER} borderRadius={16} padding={28} shadow="sm">
            <Text text={`“${r.quote}”`} fontSize={14} lineHeight={1.7} color="#52525b" align="left" italic={true} />
            <Text text={r.name} fontSize={13} fontWeight={600} color={INK} align="left" />
            <Text text="★★★★★" fontSize={12} color={ACCENT} align="left" />
          </Card>
        ))}
      </Grid>
    </Section>

    {/* Contact */}
    <Section background={PAPER} paddingY={96} maxWidth={1152} customId="contact">
      <Grid columns={2} gap={48}>
        <Container>
          <Text text="GET IN TOUCH" fontSize={12} fontWeight={600} color={ACCENT} align="left" />
          <Heading text="Let's work together" level="h2" color={INK} align="left" fontWeight={700} letterSpacing={-1} />
          <Text
            text="Open to UI/UX and frontend missions, short or long-term. Drop a few lines about what you're building."
            fontSize={15}
            lineHeight={1.7}
            color="#52525b"
            align="left"
          />
          <List items="✉  hello@eliott.dev\nin  linkedin.com/in/eliott\ngh  github.com/eliott" ordered={false} spacing={12} fontSize={14} color="#52525b" />
        </Container>
        <Container>
          <ContactForm
            nameLabel="Name"
            emailLabel="Email"
            messageLabel="Message"
            submitText="Send message →"
            background="#ffffff"
            accent={INK}
            borderRadius={12}
          />
        </Container>
      </Grid>
    </Section>

    {/* Footer */}
    <Section background={INK} paddingY={40} maxWidth={1152} customId="footer">
      <Grid columns={2} gap={32}>
        <Text text="© 2026 Eliott. All rights reserved." fontSize={13} color="#a1a1aa" align="left" />
        <Text text="Built with React & Tailwind CSS" fontSize={12} color="#71717a" align="right" />
      </Grid>
    </Section>
  </Container>,
);
