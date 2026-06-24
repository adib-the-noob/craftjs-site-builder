import { SiteEditor } from "@/components/editor/SiteEditor";

type Props = {
  params: Promise<{ siteSlug: string }>;
};

export default async function EditorPage({ params }: Props) {
  const { siteSlug } = await params;
  return (
    <div className="h-screen overflow-hidden">
      <SiteEditor siteSlug={siteSlug} />
    </div>
  );
}
