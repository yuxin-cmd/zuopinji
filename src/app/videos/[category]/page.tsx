import { VIDEO_CATEGORIES } from "@/lib/types";
import VideoCategoryContent from "./VideoCategoryContent";

interface Props {
  params: Promise<{ category: string }>;
}

export function generateStaticParams() {
  return Object.keys(VIDEO_CATEGORIES).map((key) => ({ category: key }));
}

export default function VideoCategoryPage({ params }: Props) {
  return <VideoCategoryContent params={params} />;
}
