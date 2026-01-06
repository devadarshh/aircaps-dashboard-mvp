"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, TrendingDown, TrendingUp, Target } from "lucide-react";

interface MetricData {
  metric: string;
  value: number;
  ideal: number;
  fullMark: number;
}

export default function PerformanceCoach({
  keyMetricsData,
  className,
}: {
  keyMetricsData: MetricData[];
  className?: string;
}) {
  const hasAlerts = keyMetricsData.some(
    (m) =>
      (m.metric === "Pace" && m.value > 170) ||
      (m.metric === "Fillers" && m.value > 10)
  );

  return (
    <Card className={`shadow-sm border border-indigo-100 bg-indigo-50/30 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2 text-indigo-900">
          <Lightbulb className="h-5 w-5 text-indigo-600" />
          AirCaps Performance Coach
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {keyMetricsData.map((m) => {
          if (m.metric === "Pace" && m.value > 170) {
            return (
              <div
                key={m.metric}
                className="flex gap-4 p-4 bg-white rounded-xl border border-indigo-100 shadow-sm transition-all hover:shadow-md"
              >
                <TrendingUp className="h-6 w-6 text-amber-500 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-gray-900">Fast Pace Detected</p>
                  <p className="text-xs text-gray-600 leading-relaxed mt-1">
                    Your speaking pace is high. For optimal real-time captioning on AirCaps glasses, consider slowing down slightly to ensure maximum accuracy for your audience.
                  </p>
                </div>
              </div>
            );
          }
          if (m.metric === "Fillers" && m.value > 10) {
            return (
              <div
                key={m.metric}
                className="flex gap-4 p-4 bg-white rounded-xl border border-indigo-100 shadow-sm transition-all hover:shadow-md"
              >
                <Target className="h-6 w-6 text-indigo-500 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-gray-900">Filler Word Usage</p>
                  <p className="text-xs text-gray-600 leading-relaxed mt-1">
                    You used more filler words than ideal. Pausing briefly instead of using fillers improves the readability of the captions on-screen.
                  </p>
                </div>
              </div>
            );
          }
          return null;
        })}
        
        {!hasAlerts && (
          <div className="flex gap-4 p-4 bg-white rounded-xl border border-green-100 shadow-sm transition-all hover:shadow-md">
            <TrendingDown className="h-6 w-6 text-green-500 shrink-0" />
            <div>
              <p className="text-sm font-bold text-gray-900">Excellent Delivery</p>
              <p className="text-xs text-gray-600 leading-relaxed mt-1">
                Your metrics are well within the ideal range for clear captioning. Your audience should have no trouble following your conversation on their AirCaps glasses.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

