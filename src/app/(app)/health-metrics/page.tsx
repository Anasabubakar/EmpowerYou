'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { mockHealthMetrics } from '@/lib/data';
import type { HealthMetric } from '@/lib/types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useState } from 'react';

const chartConfig = {
  mood: {
    label: 'Mood',
    color: 'hsl(var(--chart-1))',
  },
  energy: {
    label: 'Energy',
    color: 'hsl(var(--chart-2))',
  },
};

const moodEmojis = ['😭', '😟', '😐', '😊', '😁'];
const energyEmojis = ['😴', '☕', '⚡️', '⚡️⚡️', '🚀'];

export default function HealthMetricsPage() {
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(4);
  
  const formattedChartData = mockHealthMetrics.map(item => ({
    ...item,
    date: item.date.split(' ')[0]
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold">Health Metrics</h1>
        <p className="text-muted-foreground">
          Log and visualize your personal health data.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Trends Over Time</CardTitle>
            <CardDescription>
              Your mood and energy levels over the last 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <AreaChart
                accessibilityLayer
                data={formattedChartData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                 <YAxis
                    domain={[0, 5]}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Area
                  dataKey="mood"
                  type="natural"
                  fill="var(--color-mood)"
                  fillOpacity={0.4}
                  stroke="var(--color-mood)"
                  stackId="a"
                />
                <Area
                  dataKey="energy"
                  type="natural"
                  fill="var(--color-energy)"
                  fillOpacity={0.4}
                  stroke="var(--color-energy)"
                  stackId="b"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Log Today&apos;s Metrics</CardTitle>
            <CardDescription>
              How are you feeling right now?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="font-medium">Mood</p>
                <span className="text-4xl">{moodEmojis[mood - 1]}</span>
              </div>
              <Slider
                defaultValue={[mood]}
                max={5}
                min={1}
                step={1}
                onValueChange={(value) => setMood(value[0])}
              />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="font-medium">Energy Level</p>
                <span className="text-2xl">{energyEmojis[energy - 1]}</span>
              </div>
              <Slider
                defaultValue={[energy]}
                max={5}
                min={1}
                step={1}
                onValueChange={(value) => setEnergy(value[0])}
              />
            </div>
            <Button className="w-full">Save Today&apos;s Log</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
