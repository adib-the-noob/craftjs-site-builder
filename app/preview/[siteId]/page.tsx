import { SitePreview } from "@/components/preview/SitePreview";

type Props = {
  params: Promise<{ siteId: string }>;
};

export default async function PreviewPage({ params }: Props) {
  const { siteId } = await params;
  return <SitePreview siteId={siteId} />;
}