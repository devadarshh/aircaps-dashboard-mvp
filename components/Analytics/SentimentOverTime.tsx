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
  AreaChart,
  Area,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  TooltipProps,
} from "recharts";
import type { Payload } from "recharts/types/component/DefaultTooltipContent";

const CHART_COLOR = "#4F46E5";
const GRID_COLOR = "#E0E7FF";
const TEXT_COLOR = "#6B7280";

interface SentimentData {
  time: string;
  sentiment: number;
}
const CustomSentimentTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string> & {
  payload?: Payload<number, string>[];
  label?: string | number;
}) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;

    return (
      <div className="p-3 bg-white border border-indigo-100 shadow-xl rounded-lg text-xs">
        <p className="font-medium text-gray-500 mb-1">{label}</p>
        <p className="text-base font-bold" style={{ color: CHART_COLOR }}>
          Sentiment Score: {value}
        </p>
      </div>
    );
  }
  return null;
};

export default function SentimentOverTime({
  sentimentOverTime,
}: {
  sentimentOverTime: SentimentData[];
}) {
  return (
    <Card className="shadow-sm border border-border/50 hover:shadow-md transition-shadow cursor-pointer md:col-span-2 xl:col-span-1">
      <CardHeader>
        <CardTitle>Sentiment Over Time</CardTitle>
        <CardDescription>
          Emotional flow throughout the discussion
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={sentimentOverTime}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLOR} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLOR} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke={GRID_COLOR}
              vertical={false}
            />

            <XAxis
              dataKey="time"
              tick={{ fill: TEXT_COLOR, fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              dy={10}
            />

            <YAxis
              tick={{ fill: TEXT_COLOR, fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
            />

            <Tooltip
              content={<CustomSentimentTooltip />}
              cursor={{ stroke: GRID_COLOR, strokeWidth: 2 }}
            />

            <Area
              type="monotone"
              dataKey="sentiment"
              stroke={CHART_COLOR}
              fill="url(#colorSentiment)"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="sentiment"
              stroke={CHART_COLOR}
              strokeWidth={2}
              dot={{ fill: CHART_COLOR, stroke: "#fff", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
