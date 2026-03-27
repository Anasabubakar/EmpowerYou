'use client';

import { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/app-context';
import type { HealthMetric } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { toDate } from '@/lib/date-utils';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, BarChart, Bar } from 'recharts';
import { Droplets, Footprints, HeartPulse, MoonStar, Activity, Sparkles } from 'lucide-react';

const moodLabels = ['Very low', 'Low', 'Steady', 'Good', 'Great'];
const energyLabels = ['Exhausted', 'Low', 'Balanced', 'High', 'Energized'];
const stressLabels = ['Calm', 'Mild', 'Moderate', 'High', 'Overloaded'];

const emptyForm = {
  date: format(new Date(), 'yyyy-MM-dd'),
  mood: 3,
  energy: 3,
  sleepHours: '',
  waterIntake: '',
  steps: '',
  stressLevel: 3,
  systolic: '',
  diastolic: '',
};

export default function HealthMetricsPage() {
  const { toast } = useToast();
  const { healthMetrics, setHealthMetrics } = useAppContext();
  const [form, setForm] = useState(emptyForm);

  const sortedMetrics = useMemo(
    () =>
      [...healthMetrics].sort(
        (a, b) => (toDate(a.createdAt)?.getTime() ?? 0) - (toDate(b.createdAt)?.getTime() ?? 0)
      ),
    [healthMetrics]
  );

  const latestMetric = sortedMetrics[sortedMetrics.length - 1];

  const chartData = useMemo(
    () =>
      sortedMetrics.slice(-14).map((metric) => ({
        date: toDate(metric.createdAt) ? format(toDate(metric.createdAt)!, 'MMM d') : '',
        mood: metric.mood,
        energy: metric.energy,
        sleep: metric.sleepHours ?? null,
        water: metric.waterIntake ?? null,
        steps: metric.steps ?? null,
        stress: metric.stressLevel ?? null,
      })),
    [sortedMetrics]
  );

  const averages = useMemo(() => {
    const avg = (values: number[], digits = 0) => {
      if (values.length === 0) return '—';
      const total = values.reduce((sum, value) => sum + value, 0) / values.length;
      return digits > 0 ? total.toFixed(digits) : Math.round(total).toString();
    };

    return {
      sleep: avg(sortedMetrics.map((m) => m.sleepHours).filter(Boolean) as number[], 1),
      water: avg(sortedMetrics.map((m) => m.waterIntake).filter(Boolean) as number[], 1),
      steps: avg(sortedMetrics.map((m) => m.steps).filter(Boolean) as number[], 0),
      stress: avg(sortedMetrics.map((m) => m.stressLevel).filter(Boolean) as number[], 1),
    };
  }, [sortedMetrics]);

  const updateForm = (key: keyof typeof emptyForm, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!form.date) {
      toast({
        title: 'Add a date',
        description: 'Please select a date for this check-in.',
        variant: 'destructive',
      });
      return;
    }

    const metric: HealthMetric = {
      date: form.date,
      mood: form.mood,
      energy: form.energy,
      sleepHours: form.sleepHours ? Number(form.sleepHours) : undefined,
      waterIntake: form.waterIntake ? Number(form.waterIntake) : undefined,
      steps: form.steps ? Number(form.steps) : undefined,
      stressLevel: form.stressLevel,
      bloodPressure:
        form.systolic && form.diastolic
          ? {
              systolic: Number(form.systolic),
              diastolic: Number(form.diastolic),
            }
          : undefined,
      createdAt: new Date().toISOString(),
    };

    setHealthMetrics([...healthMetrics, metric]);
    setForm(emptyForm);
    toast({
      title: 'Health check-in saved',
      description: 'Your metrics are logged.',
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" />
          Health
        </div>
        <h1 className="text-4xl font-headline font-semibold">Health Metrics</h1>
        <p className="text-muted-foreground max-w-xl">
          Track the signals that shape your day: sleep, hydration, stress, and more.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Daily Check-In</CardTitle>
            <CardDescription>Log a quick snapshot of how your body feels.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="metric-date">Date</Label>
                <Input
                  id="metric-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => updateForm('date', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Blood Pressure (optional)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Systolic"
                    value={form.systolic}
                    onChange={(e) => updateForm('systolic', e.target.value)}
                  />
                  <Input
                    placeholder="Diastolic"
                    value={form.diastolic}
                    onChange={(e) => updateForm('diastolic', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-3">
                <Label>Mood</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[form.mood]}
                    max={5}
                    min={1}
                    step={1}
                    onValueChange={(value) => updateForm('mood', value[0])}
                    className="flex-1"
                  />
                  <div className="w-20 text-right text-sm font-medium">
                    {form.mood}/5
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{moodLabels[form.mood - 1]}</p>
              </div>
              <div className="space-y-3">
                <Label>Energy</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[form.energy]}
                    max={5}
                    min={1}
                    step={1}
                    onValueChange={(value) => updateForm('energy', value[0])}
                    className="flex-1"
                  />
                  <div className="w-20 text-right text-sm font-medium">
                    {form.energy}/5
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{energyLabels[form.energy - 1]}</p>
              </div>
              <div className="space-y-3">
                <Label>Stress Level</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[form.stressLevel]}
                    max={5}
                    min={1}
                    step={1}
                    onValueChange={(value) => updateForm('stressLevel', value[0])}
                    className="flex-1"
                  />
                  <div className="w-20 text-right text-sm font-medium">
                    {form.stressLevel}/5
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{stressLabels[form.stressLevel - 1]}</p>
              </div>
              <div className="grid gap-3">
                <div className="space-y-2">
                  <Label htmlFor="sleep-hours">Sleep Hours</Label>
                  <Input
                    id="sleep-hours"
                    type="number"
                    step="0.5"
                    placeholder="e.g., 7.5"
                    value={form.sleepHours}
                    onChange={(e) => updateForm('sleepHours', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="water-intake">Water Intake (L)</Label>
                  <Input
                    id="water-intake"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 2.3"
                    value={form.waterIntake}
                    onChange={(e) => updateForm('waterIntake', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="steps">Steps</Label>
                  <Input
                    id="steps"
                    type="number"
                    placeholder="e.g., 6800"
                    value={form.steps}
                    onChange={(e) => updateForm('steps', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Button onClick={handleSave} size="lg">
              Save Health Metrics
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest Snapshot</CardTitle>
            <CardDescription>Quick glance at your most recent log.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {latestMetric ? (
              <>
                <div className="text-sm text-muted-foreground">
                  {toDate(latestMetric.createdAt) ? format(toDate(latestMetric.createdAt)!, 'PPP') : ''}
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-2">
                      <HeartPulse className="h-4 w-4 text-primary" />
                      Mood
                    </span>
                    <span className="font-medium">{latestMetric.mood}/5</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" />
                      Energy
                    </span>
                    <span className="font-medium">{latestMetric.energy}/5</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-2">
                      <MoonStar className="h-4 w-4 text-primary" />
                      Sleep
                    </span>
                    <span className="font-medium">
                      {latestMetric.sleepHours ? `${latestMetric.sleepHours}h` : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-primary" />
                      Water
                    </span>
                    <span className="font-medium">
                      {latestMetric.waterIntake ? `${latestMetric.waterIntake} L` : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-2">
                      <Footprints className="h-4 w-4 text-primary" />
                      Steps
                    </span>
                    <span className="font-medium">
                      {latestMetric.steps ? latestMetric.steps.toLocaleString() : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-2">
                      <HeartPulse className="h-4 w-4 text-primary" />
                      Stress
                    </span>
                    <span className="font-medium">
                      {latestMetric.stressLevel ? `${latestMetric.stressLevel}/5` : '—'}
                    </span>
                  </div>
                  {latestMetric.bloodPressure && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="inline-flex items-center gap-2">
                        <HeartPulse className="h-4 w-4 text-primary" />
                        BP
                      </span>
                      <span className="font-medium">
                        {latestMetric.bloodPressure.systolic}/
                        {latestMetric.bloodPressure.diastolic}
                      </span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Log a check-in to see your latest snapshot.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Average Sleep</CardTitle>
            <CardDescription>Last check-ins</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{averages.sleep}h</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Water</CardTitle>
            <CardDescription>Hydration trend</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{averages.water} L</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Steps</CardTitle>
            <CardDescription>Movement pace</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{averages.steps}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Stress</CardTitle>
            <CardDescription>Emotional load</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{averages.stress}/5</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Mood &amp; Energy Trend</CardTitle>
            <CardDescription>Recent check-ins across the last 14 logs.</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ChartContainer
                config={{
                  mood: { label: 'Mood', color: 'hsl(var(--primary))' },
                  energy: { label: 'Energy', color: 'hsl(var(--accent))' },
                }}
                className="h-[260px]"
              >
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="mood" stroke="var(--color-mood)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="energy" stroke="var(--color-energy)" strokeWidth={2} dot={false} />
                </LineChart>
              </ChartContainer>
            ) : (
              <p className="text-sm text-muted-foreground">Log a few check-ins to see trends.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recovery &amp; Hydration</CardTitle>
            <CardDescription>Sleep hours and water intake side by side.</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ChartContainer
                config={{
                  sleep: { label: 'Sleep', color: 'hsl(var(--primary))' },
                  water: { label: 'Water', color: 'hsl(var(--accent))' },
                }}
                className="h-[260px]"
              >
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="sleep" fill="var(--color-sleep)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="water" fill="var(--color-water)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <p className="text-sm text-muted-foreground">Log water and sleep to build this chart.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Logs</CardTitle>
          <CardDescription>Your most recent health check-ins.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {sortedMetrics.length === 0 ? (
            <p className="text-sm text-muted-foreground">No metrics logged yet.</p>
          ) : (
            sortedMetrics
              .slice(-5)
              .reverse()
              .map((metric) => (
                <div
                  key={metric.createdAt}
                  className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-background/70 p-4 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{toDate(metric.createdAt) ? format(toDate(metric.createdAt)!, 'PPP') : ''}</span>
                    <span className="text-xs text-muted-foreground">
                      Mood {metric.mood}/5 · Energy {metric.energy}/5
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {metric.sleepHours ? (
                      <span className="rounded-full bg-secondary/60 px-2 py-1">Sleep {metric.sleepHours}h</span>
                    ) : null}
                    {metric.waterIntake ? (
                      <span className="rounded-full bg-secondary/60 px-2 py-1">Water {metric.waterIntake} L</span>
                    ) : null}
                    {metric.steps ? (
                      <span className="rounded-full bg-secondary/60 px-2 py-1">Steps {metric.steps}</span>
                    ) : null}
                    {metric.stressLevel ? (
                      <span className="rounded-full bg-secondary/60 px-2 py-1">Stress {metric.stressLevel}/5</span>
                    ) : null}
                    {metric.bloodPressure ? (
                      <span className="rounded-full bg-secondary/60 px-2 py-1">
                        BP {metric.bloodPressure.systolic}/{metric.bloodPressure.diastolic}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
