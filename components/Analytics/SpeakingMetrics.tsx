"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Rectangle,
  TooltipProps,
} from "recharts";

const PRIMARY_COLOR = "#4F46E5";
const IDEAL_COLOR = "#C4B5FD";
const HOVER_BG_COLOR = "#E0E7FF";


interface MetricData {
  metric: string;
  value: number;
  ideal: number;
  fullMark: number;
}

interface NormalizedData extends MetricData {
  originalValue: number;
  valuePercent: number;
  idealPercent: number;
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  payload?: {
    payload: NormalizedData;
  }[];
}


const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div className="bg-white p-3 border border-indigo-100 shadow-xl rounded-lg text-xs">
        <p className="font-bold mb-2 text-gray-900">{data.metric}</p>

        <div className="space-y-1">
          <p
            className="flex justify-between gap-4"
            style={{ color: PRIMARY_COLOR }}
          >
            <span className="font-medium">Your Score:</span>
            <span className="font-bold text-base">{data.originalValue}</span>
          </p>

          <p className="text-gray-500 flex justify-between gap-4">
            <span>Ideal:</span>
            <span className="font-semibold">{data.ideal}</span>
          </p>

          <p className="text-gray-400 flex justify-between gap-4 border-t border-gray-100 pt-1 mt-1">
            <span>Max Possible:</span>
            <span>{data.fullMark}</span>
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default function SpeakingMetrics({
  keyMetricsData,
}: {
  keyMetricsData: MetricData[];
}) {
  const normalizedData: NormalizedData[] = keyMetricsData.map((item) => ({
    ...item,
    originalValue: item.value,
    valuePercent: Math.min((item.value / item.fullMark) * 100, 100),
    idealPercent: Math.min((item.ideal / item.fullMark) * 100, 100),
  }));

  return (
    <Card className="shadow-sm border border-border/50 hover:shadow-md transition-shadow cursor-pointer h-full">
      <CardHeader>
        <CardTitle>Your Speaking Metrics</CardTitle>
        <CardDescription>Performance vs. Ideal Targets</CardDescription>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={normalizedData}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            barGap={4}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E0E7FF"
            />

            <XAxis
              dataKey="metric"
              tick={{ fill: "#6B7280", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />

            <YAxis hide domain={[0, 100]} />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: HOVER_BG_COLOR, opacity: 0.4 }}
            />

            <Legend
              iconType="circle"
              wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
            />

            <Bar
              dataKey="valuePercent"
              name="Your Score"
              radius={[4, 4, 0, 0]}
              fill={PRIMARY_COLOR}
              activeBar={
                <Rectangle
                  fill={PRIMARY_COLOR}
                  stroke="#312E81"
                  strokeWidth={2}
                />
              }
            />

            <Bar
              dataKey="idealPercent"
              name="Ideal Target"
              radius={[4, 4, 0, 0]}
              fill={IDEAL_COLOR}
              activeBar={
                <Rectangle
                  fill={IDEAL_COLOR}
                  stroke="#818CF8"
                  strokeWidth={2}
                />
              }
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
