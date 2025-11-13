"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipLoader } from "react-spinners";

interface Props {
  title: string;
  value?: string | number;
  subText?: string;
  loading?: boolean;
}

const InsightCard = ({ title, value, subText, loading }: Props) => {
  return (
    <Card className="hover:shadow-md hover:scale-[1.01] transition-all duration-200 ease-in-out cursor-pointer">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[60px]">
            <ClipLoader color="#4f46e5" size={28} speedMultiplier={0.8} />
            <p className="text-xs text-muted-foreground mt-2">
              Fetching data...
            </p>
          </div>
        ) : (
          <>
            <div className="text-3xl font-bold text-foreground">{value}</div>
            {subText && <p className="text-sm text-primary mt-2">{subText}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default InsightCard;
