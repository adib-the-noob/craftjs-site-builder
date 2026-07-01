/** @jsxImportSource @/lib/craftTemplate */
// Local business / restaurant: navbar, hero, welcome, menu, hours & location,
// photo gallery, reservations and footer.

import {
  Badge,
  Card,
  Container,
  ContactForm,
  CtaButton,
  Grid,
  Heading,
  ImageBlock,
  List,
  Navbar,
  Section,
  Text,
  template,
} from "@/lib/craftTemplate";

const INK = "#1c1917";
const ACCENT = "#c2410c";
const PAPER = "#fafaf9";

const menu = [
  {
    heading: "Starters",
    items: "Wood-fired sourdough — $9\nBurrata & heirloom tomato — $14\nCharred octopus — $18",
  },
  {
    heading: "Mains",
    items: "Dry-aged ribeye — $42\nWild mushroom risotto — $26\nCedar-roasted salmon — $32",
  },
  {
    heading: "Desserts",
    items: "Olive oil cake — $11\nDark chocolate tart — $12\nSeasonal sorbet — $9",
  },
  {
    heading: "Drinks",
    items: "Natural wines by the glass\nLocal craft beer\nHouse cocktails — $14",
  },
];

const gallery = [
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80",
  "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&q=80",
  "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600&q=80",
];

export default template(
  {
    id: "local-business",
    name: "Local Business / Restaurant",
    description:
      "Warm single-page site for a restaurant — hero, menu, hours, gallery and reservations.",
    metaTitle: "Olive & Ember — Wood-fired seasonal kitchen",
    metaDescription:
      "A farm-to-table kitchen serving seasonal, wood-fired plates. Book your table.",
  },
  <Container background="#ffffff" padding={0} maxWidth={0}>
    <Navbar
      brand="Olive & Ember"
      navItems={`Menu|#menu\nVisit|#visit\nGallery|#gallery\nReserve|#reserve`}
      ctaLabel="Reserve"
      ctaHref="#reserve"
      layout="brand-left-links-right"
      variant="solid"
      sticky={true}
      background={PAPER}
      textColor={INK}
      borderColor="#e7e5e4"
      height={68}
      maxWidth={1152}
    />

    {/* Hero */}
    <Section background={INK} paddingY={120} maxWidth={1152} customId="hero">
      <Badge text="Farm-to-table · Est. 2014" background="#292524" textColor="#fbbf24" size="sm" />
      <Heading
        text="Seasonal plates, wood-fired."
        level="h1"
        color="#fafaf9"
        align="left"
        fontWeight={700}
        letterSpacing={-1}
      />
      <Text
        text="A neighbourhood kitchen cooking with what's local, ripe and honest. Open for dinner, Wednesday to Sunday."
        fontSize={19}
        lineHeight={1.6}
        color="#d6d3d1"
        align="left"
      />
      <CtaButton
        text="Book a table"
        href="#reserve"
        variant="primary"
        size="lg"
        align="left"
        background={ACCENT}
        textColor="#ffffff"
        borderRadius={8}
      />
    </Section>

    {/* Welcome */}
    <Section background={PAPER} paddingY={96} maxWidth={1152} customId="about">
      <Grid columns={2} gap={48}>
        <Container>
          <ImageBlock
            src="https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80"
            alt="The dining room"
            height={460}
            width={100}
            rounded={true}
            borderRadius={16}
            objectFit="cover"
            align="left"
          />
        </Container>
        <Container>
          <Text text="WELCOME" fontSize={12} fontWeight={600} color={ACCENT} align="left" />
          <Heading text="Cooked with care, sourced close by" level="h2" color={INK} align="left" fontWeight={700} letterSpacing={-0.5} />
          <Text
            text="We work with a handful of farms within fifty miles and a baker up the road. The menu shifts with the seasons — come often, eat something new."
            fontSize={16}
            lineHeight={1.7}
            color="#57534e"
            align="left"
          />
          <Text text="— Mara & Tomas, owners" fontSize={15} italic={true} color="#78716c" align="left" />
        </Container>
      </Grid>
    </Section>

    {/* Menu */}
    <Section background="#ffffff" paddingY={96} maxWidth={1152} customId="menu">
      <Heading text="This week's menu" level="h2" color={INK} align="center" fontWeight={700} letterSpacing={-0.5} />
      <Text text="A small, changing list. Ask your server about tonight's specials." fontSize={15} color="#78716c" align="center" />
      <Grid columns={2} gap={32}>
        {menu.map((m) => (
          <Card key={m.heading} background={PAPER} borderRadius={12} padding={28} shadow="none">
            <Heading text={m.heading} level="h4" color={ACCENT} align="left" fontWeight={700} />
            <List items={m.items} ordered={false} spacing={10} fontSize={15} color={INK} />
          </Card>
        ))}
      </Grid>
    </Section>

    {/* Visit */}
    <Section background={PAPER} paddingY={96} maxWidth={1152} customId="visit">
      <Grid columns={2} gap={48}>
        <Container>
          <Text text="VISIT US" fontSize={12} fontWeight={600} color={ACCENT} align="left" />
          <Heading text="Find your seat" level="h2" color={INK} align="left" fontWeight={700} letterSpacing={-0.5} />
          <Text text="42 Mill Lane, Old Town" fontSize={16} color="#57534e" align="left" />
          <Heading text="Hours" level="h4" color={INK} align="left" fontWeight={600} />
          <List items="Wed – Fri · 5pm – 10pm\nSat · 4pm – 11pm\nSun · 4pm – 9pm\nMon – Tue · Closed" ordered={false} spacing={6} fontSize={15} color="#57534e" />
        </Container>
        <Container>
          <ImageBlock
            src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80"
            alt="The bar"
            height={420}
            width={100}
            rounded={true}
            borderRadius={16}
            objectFit="cover"
            align="left"
          />
        </Container>
      </Grid>
    </Section>

    {/* Gallery */}
    <Section background="#ffffff" paddingY={96} maxWidth={1152} customId="gallery">
      <Heading text="From our kitchen" level="h2" color={INK} align="center" fontWeight={700} letterSpacing={-0.5} />
      <Grid columns={4} gap={16}>
        {gallery.map((src, i) => (
          <ImageBlock key={i} src={src} alt={`Plate ${i + 1}`} height={180} width={100} objectFit="cover" align="center" borderRadius={12} />
        ))}
      </Grid>
    </Section>

    {/* Reserve */}
    <Section background={INK} paddingY={96} maxWidth={1152} customId="reserve">
      <Grid columns={2} gap={48}>
        <Container>
          <Badge text="Reservations" background="#292524" textColor="#fbbf24" size="sm" />
          <Heading text="Book a table" level="h2" color="#fafaf9" align="left" fontWeight={700} letterSpacing={-0.5} />
          <Text text="Parties of up to eight. For larger bookings or private events, call us — we'll sort it." fontSize={15} lineHeight={1.7} color="#d6d3d1" align="left" />
          <List items="☎  (555) 010-2233\n✉  hello@oliveandember.co" ordered={false} spacing={10} fontSize={15} color="#d6d3d1" />
        </Container>
        <Container>
          <ContactForm
            nameLabel="Name"
            emailLabel="Email"
            messageLabel="Date, time & party size"
            submitText="Request table →"
            background="#292524"
            accent={ACCENT}
            borderRadius={12}
          />
        </Container>
      </Grid>
    </Section>

    {/* Footer */}
    <Section background={INK} paddingY={40} maxWidth={1152} customId="footer">
      <Grid columns={2} gap={32}>
        <Text text="© 2026 Olive & Ember. All rights reserved." fontSize={13} color="#a8a29e" align="left" />
        <Text text="42 Mill Lane, Old Town" fontSize={13} color="#78716c" align="right" />
      </Grid>
    </Section>
  </Container>,
);
