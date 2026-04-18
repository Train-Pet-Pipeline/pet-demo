import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Tabs } from "@/components/Tabs";
import { OverviewTab } from "@/components/OverviewTab";
import { ClipsTab } from "@/components/ClipsTab";
import { BenchmarksTab } from "@/components/BenchmarksTab";
import { loadNarrativesFromDisk, loadBenchmarksFromDisk } from "@/lib/load-artifacts";

export default async function DashboardPage() {
  const [narratives, benchmarks] = await Promise.all([
    loadNarrativesFromDisk(),
    loadBenchmarksFromDisk(),
  ]);

  return (
    <>
      <Header />
      <main>
        <Tabs
          panels={{
            overview: {
              label: "Overview",
              render: () => <OverviewTab narratives={narratives} benchmarks={benchmarks} />,
            },
            clips: { label: "Clips", render: () => <ClipsTab narratives={narratives} /> },
            benchmarks: { label: "Benchmarks", render: () => <BenchmarksTab benchmarks={benchmarks} /> },
          }}
        />
      </main>
      <Footer />
    </>
  );
}
