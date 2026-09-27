import { useId, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { BarChart3, Table2 } from 'lucide-react';
import { Card, Skeleton, ErrorState, IconButton } from '@/components/ui';
import { dashboardService } from '@/services';
import { useResource } from '@/hooks';
import { formatWeekday } from '@/utils/format';

const AXIS_TICK = { fill: 'var(--sp-muted)', fontSize: 12 };

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2 text-sm shadow-float">
      <p className="text-xs font-medium text-muted">{formatWeekday(row.date)}</p>
      <p className="mt-1 flex items-center gap-2 text-ink">
        <span className="size-2 rounded-full bg-brand" aria-hidden="true" />
        <span className="font-semibold tabular-nums">{row.matches}</span> matches
      </p>
      <p className="mt-0.5 pl-4 text-xs text-muted tabular-nums">{row.checks.toLocaleString('en-GB')} checks run</p>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-0.5 font-display text-xl font-bold tabular-nums text-ink">{value}</p>
    </div>
  );
}

/** "Matches detected — last 14 days" area chart with a table view toggle. */
export function MatchesChart({ days = 14 }) {
  const gid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [asTable, setAsTable] = useState(false);
  const { data, loading, error, reload } = useResource(() => dashboardService.getAnalytics(days), [days], { topics: ['slots'] });

  const series = data || [];
  const totalMatches = series.reduce((n, d) => n + d.matches, 0);
  const totalChecks = series.reduce((n, d) => n + d.checks, 0);
  const rate = totalChecks ? ((totalMatches / totalChecks) * 100).toFixed(1) : '0.0';

  return (
    <Card as="section" aria-labelledby="matches-chart-title">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="matches-chart-title" className="text-base font-semibold text-ink">
            Matches detected — last {days} days
          </h2>
          <p className="mt-0.5 text-sm text-muted">Matching slots found across all monitored learners.</p>
        </div>
        <IconButton
          icon={asTable ? BarChart3 : Table2}
          label={asTable ? 'Show chart' : 'Show data table'}
          size="sm"
          variant="ghost"
          onClick={() => setAsTable((v) => !v)}
          aria-pressed={asTable}
        />
      </div>

      {error && !data ? (
        <ErrorState className="mt-5 py-10" title="Couldn’t load analytics" error={error} onRetry={reload} />
      ) : loading && !data ? (
        <div className="mt-5" aria-busy="true">
          <div className="flex gap-8">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
          </div>
          <Skeleton className="mt-5 h-56 w-full rounded-2xl" />
        </div>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-3 gap-4 border-b border-line pb-5">
            <Metric label="Matches" value={totalMatches.toLocaleString('en-GB')} />
            <Metric label="Checks run" value={totalChecks.toLocaleString('en-GB')} />
            <Metric label="Match rate" value={`${rate}%`} />
          </div>

          {asTable ? (
            <div className="scrollbar-thin mt-4 max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Daily matches and checks</caption>
                <thead className="sticky top-0 bg-surface text-left text-xs text-muted">
                  <tr>
                    <th scope="col" className="py-2 font-medium">Day</th>
                    <th scope="col" className="py-2 text-right font-medium">Matches</th>
                    <th scope="col" className="py-2 text-right font-medium">Checks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {[...series].reverse().map((d) => (
                    <tr key={d.date}>
                      <th scope="row" className="py-2 text-left font-normal text-ink-soft">{formatWeekday(d.date)}</th>
                      <td className="py-2 text-right font-semibold tabular-nums text-ink">{d.matches}</td>
                      <td className="py-2 text-right tabular-nums text-muted">{d.checks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="-mx-2 mt-4 h-56 sm:h-64" role="img" aria-label={`Area chart: ${totalMatches} matches over the last ${days} days`}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                  <defs>
                    <linearGradient id={`${gid}-fill`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--sp-brand)" stopOpacity={0.22} />
                      <stop offset="100%" stopColor="var(--sp-brand)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="var(--sp-line)" strokeDasharray="3 4" />
                  <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={{ stroke: 'var(--sp-line)' }} interval="preserveStartEnd" minTickGap={24} tickMargin={8} />
                  <YAxis allowDecimals={false} tick={AXIS_TICK} tickLine={false} axisLine={false} width={48} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--sp-line-strong)', strokeWidth: 1 }} />
                  <Area
                    type="monotone"
                    dataKey="matches"
                    name="Matches"
                    stroke="var(--sp-brand)"
                    strokeWidth={2}
                    fill={`url(#${gid}-fill)`}
                    dot={false}
                    activeDot={{ r: 5, fill: 'var(--sp-brand)', stroke: 'var(--sp-surface)', strokeWidth: 2 }}
                    animationDuration={700}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
