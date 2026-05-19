import type { AboutImage } from "@/lib/types";

interface AboutSectionProps {
  text: string;
  images: AboutImage[];
}

export default function AboutSection({ text, images }: AboutSectionProps) {
  return (
    <section className="py-16 sm:py-20 bg-slate-50">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-8 text-center text-2xl font-bold text-slate-800 sm:text-3xl">
          关于我
        </h2>

        <div className="grid gap-10 lg:grid-cols-2 items-start">
          <div className="text-base leading-relaxed text-slate-600 whitespace-pre-line">
            {text || "暂无介绍内容"}
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200"
                >
                  <img
                    src={img.image_url}
                    alt={img.caption || ""}
                    className="h-48 w-full object-cover"
                  />
                  {img.caption && (
                    <p className="px-3 py-2 text-xs text-slate-500">{img.caption}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
