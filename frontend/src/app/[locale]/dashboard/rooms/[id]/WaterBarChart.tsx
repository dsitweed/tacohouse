import { Droplet } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui';

const waterBarChartConfig = {
  consumption: {
    label: 'Consumption (m³)',
    color: 'var(--chart-3)',
  },
};

const waterBarChartData = [
  { month: 'Tháng 1', consumption: 20 },
  { month: 'Tháng 2', consumption: 18 },
  { month: 'Tháng 3', consumption: 22 },
  { month: 'Tháng 4', consumption: 21 },
  { month: 'Tháng 5', consumption: 23 },
  { month: 'Tháng 6', consumption: 25 },
];

export default function WaterBarChart() {
  const currentMonthConsumption = { month: 'MAY', consumption: 23 };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Droplet className="size-4 text-blue-500" />
          <h3 className="font-semibold">Water</h3>
        </div>
        <p className="text-muted-foreground">
          {currentMonthConsumption.consumption} m³
        </p>
      </div>
      <ChartContainer config={waterBarChartConfig} className="h-52 w-full">
        <BarChart accessibilityLayer data={waterBarChartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
          />
          <ChartTooltip content={<ChartTooltipContent hideIndicator />} />
          <Bar
            dataKey="consumption"
            strokeWidth={2}
            radius={8}
            fill="var(--color-consumption)"
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
