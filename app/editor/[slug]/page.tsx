import { SiteEditor } from "@/components/editor/SiteEditor";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function EditorPage({ params }: Props) {
  const { slug } = await params;
  return (
    <div className="h-screen overflow-hidden">
      <SiteEditor slug={slug} />
    </div>
  );
}