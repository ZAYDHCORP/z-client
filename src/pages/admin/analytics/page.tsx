import { useMemo } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { PageHeader, StatCard } from "@/components/gate/ui"
import { useGate } from "@/lib/gate/store"
import { PLATFORMS, PLATFORM_MAP } from "@/lib/gate/platforms"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AnalyticsPage() {
  const { data } = useGate()
  const all = [...data.books, ...data.research, ...data.infographics, ...data.podcasts]

  const platformPerf = useMemo(
    () =>
      PLATFORMS.map((p) => {
        const items = all.filter((c) => c.platform === p.id)
        return {
          name: p.name,
          views: items.reduce((s, c) => s + c.views, 0),
          content: items.length,
          color: p.color,
        }
      }),
    [all],
  )

  const consumption = useMemo(() => {
    const by = (t: string) => all.filter((c) => c.type === t).reduce((s, c) => s + c.views, 0)
    return [
      { type: "Books", views: by("book") },
      { type: "Research", views: by("research") },
      { type: "Infographics", views: by("infographic") },
      { type: "Podcasts", views: by("podcast") },
    ]
  }, [all])

  const planDist = useMemo(
    () =>
      data.membershipPlans.map((p) => ({
        name: p.name,
        value: data.payments.filter((x) => x.plan === p.name && x.status === "success").length,
      })),
    [data],
  )

  const growth = [
    { m: "Apr", users: 40 },
    { m: "May", users: 68 },
    { m: "Jun", users: 95 },
    { m: "Jul", users: 132 },
    { m: "Aug", users: 178 },
  ]

  const totalViews = all.reduce((s, c) => s + c.views, 0)
  const totalShares = all.reduce((s, c) => s + c.shares, 0)

  return (
    <div>
      <PageHeader title="Analytics & Reporting" description="Platform-wide analytics: users, revenue, content performance, RSS health and discovery." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Users" value={data.users.length} icon={<span>👥</span>} accent="#0ea5e9" />
        <StatCard label="Active Members" value={data.users.filter((u) => u.membership === "active" || u.membership === "lifetime").length} accent="#10b981" />
        <StatCard label="Total Views" value={totalViews.toLocaleString()} accent="#f59e0b" />
        <StatCard label="Total Shares" value={totalShares.toLocaleString()} accent="#ec4899" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">User Growth</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={growth}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="users" stroke="#0ea5e9" fill="url(#g)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Content Consumption by Type</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={consumption}>
                <XAxis dataKey="type" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip />
                <Bar dataKey="views" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Platform Performance</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={platformPerf}>
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="views" radius={[6, 6, 0, 0]}>
                  {platformPerf.map((p) => <Cell key={p.name} fill={p.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Membership Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={planDist} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                  {planDist.map((_, i) => <Cell key={i} fill={PLATFORMS[i % 4].color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader><CardTitle className="text-base">RSS Health</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {data.rss.map((f) => (
            <div key={f.id} className="flex items-center justify-between rounded-lg border border-border p-2.5">
              <span className="text-sm font-medium">{PLATFORM_MAP[f.platform].name}</span>
              <span className="text-xs text-muted-foreground">{f.totalEpisodes} episodes · {f.newLastSync} new this sync</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
