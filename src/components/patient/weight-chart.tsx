"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown } from "lucide-react";

interface Measurement {
  measurementDate: string;
  weightKg: number;
}

interface WeightChartProps {
  measurements: Measurement[];
}

export function WeightChart({ measurements }: WeightChartProps) {
  if (measurements.length < 2) return null;

  const data = [...measurements]
    .sort(
      (a, b) =>
        new Date(a.measurementDate).getTime() -
        new Date(b.measurementDate).getTime()
    )
    .map((m) => ({
      date: new Date(m.measurementDate).toLocaleDateString("pt-BR"),
      peso: typeof m.weightKg === "number" ? m.weightKg : Number(m.weightKg),
    }));

  const weights = data.map((d) => d.peso);
  const minWeight = Math.floor(Math.min(...weights) - 1);
  const maxWeight = Math.ceil(Math.max(...weights) + 1);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">Evolucao de Peso</CardTitle>
        <TrendingDown className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                domain={[minWeight, maxWeight]}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                unit="kg"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  color: "hsl(var(--popover-foreground))",
                }}
                formatter={(value) => [`${Number(value).toFixed(1)} kg`, "Peso"]}
              />
              <Line
                type="monotone"
                dataKey="peso"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
