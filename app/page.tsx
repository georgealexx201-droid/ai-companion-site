import HomeFeatureShowcase from "@/app/components/HomeFeatureShowcase";

export default async function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-[#fff8fc] to-[#ffeef7] text-[#2b1330]">
      <div className="mx-auto max-w-7xl px-6 py-6 md:py-8">
        <HomeFeatureShowcase />
      </div>
    </main>
  );
}