import AnalyticsClientPage from "@/components/Dashboard/AnalyticsClientPage";
import { getTotalTimeLast7Days } from "@/lib/action/analytics";

export default async function AnalyticsPage() {
  const totalTime = await getTotalTimeLast7Days();

  return <AnalyticsClientPage totalTimeLast7Days={totalTime} />;
}
