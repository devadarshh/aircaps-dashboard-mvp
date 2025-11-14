"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const TALK_TIME_COLORS = [
  "#4F46E5",
  "#818CF8",
  "#E0E7FF",
  "#C4B5FD",
  "#DDD6FE",
  "#A5B4FC",
  "#E9E6E2",
];

interface TalkTimeItem {
  speaker: string;
  durationSec: number;
}

interface PieData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

export default function TalkTimeDistribution({
  talkTimeDist,
}: {
  talkTimeDist: TalkTimeItem[];
}) {
  if (!talkTimeDist || talkTimeDist.length === 0) {
    return (
      <Card className="shadow-sm border border-border/50">
        <CardHeader>
          <CardTitle>Talk Time Distribution</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm italic">
            No speakers found in this conversation.
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalDuration =
    talkTimeDist.reduce((sum, item) => sum + item.durationSec, 0) || 1;

  const talkTimeData: PieData[] = talkTimeDist.map((item, index) => ({
    name: item.speaker || `Speaker ${index + 1}`,
    value: Math.round((item.durationSec / totalDuration) * 100),
    color: TALK_TIME_COLORS[index % TALK_TIME_COLORS.length],
  }));

  return (
    <Card className="shadow-sm border border-border/50 hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader>
        <CardTitle>Talk Time Distribution</CardTitle>
        <CardDescription>Who spoke and for how long</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col items-center">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={talkTimeData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
            >
              {talkTimeData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.color}
                  stroke="white"
                  strokeWidth={1.5}
                />
              ))}
            </Pie>

            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="space-y-2 w-full mt-4">
          {talkTimeData.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.name}</span>
              </div>
              <span className="font-medium">{item.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
