import { Zap } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui';

const electricityBarChartConfig = {
  consumption: {
    label: 'Consumption (kWh)',
    color: 'var(--chart-5)',
  },
};

const electricityBarChartData = [
  { month: 'Tháng 1', consumption: 200 },
  { month: 'Tháng 2', consumption: 180 },
  { month: 'Tháng 3', consumption: 220 },
  { month: 'Tháng 4', consumption: 210 },
  { month: 'Tháng 5', consumption: 230 },
  { month: 'Tháng 6', consumption: 250 },
];

export default function ElectricityBarChart() {
  const currentMonthConsumption = { month: 'MAY', consumption: 230 };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Zap className="size-4 text-yellow-500" />
          <h3 className="font-semibold">Electricity</h3>
        </div>
        <p className="text-muted-foreground">
          {currentMonthConsumption.consumption} kWh
        </p>
      </div>
      <ChartContainer
        config={electricityBarChartConfig}
        className="h-52 w-full"
      >
        <BarChart accessibilityLayer data={electricityBarChartData}>
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
