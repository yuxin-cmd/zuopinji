interface HeroSectionProps {
  name: string;
  title: string;
  bio: string;
}

export default function HeroSection({ name, title, bio }: HeroSectionProps) {
  return (
    <section className="relative bg-gradient-to-b from-primary-100 via-primary-50 to-white py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary-700 sm:text-5xl">
          {name || "你的姓名"}
        </h1>
        <p className="mt-4 text-xl font-medium text-primary-500">
          {title || "你的头衔"}
        </p>
        <p className="mt-6 text-lg leading-relaxed text-slate-600">
          {bio || "简短的个人介绍"}
        </p>
      </div>
    </section>
  );
}
