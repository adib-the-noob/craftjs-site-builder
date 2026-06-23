import { SiteEditor } from "@/components/editor/SiteEditor";

type Props = {
  params: Promise<{ siteId: string }>;
};

export default async function EditorPage({ params }: Props) {
  const { siteId } = await params;
  return (
    <div className="h-screen overflow-hidden">
      <SiteEditor siteId={siteId} />
    </div>
  );
}