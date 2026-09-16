import { useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import {
  Users,
  CreditCard,
  IndianRupee,
  RefreshCw,
  FileCheck2,
  Rss,
  Plus,
  BookOpen,
  Image as ImageIcon,
  Mic,
  FileText,
  ArrowUpRight,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader, StatCard, StatusBadge } from "@/components/gate/ui"
import { useGate } from "@/lib/gate/store"
import { PLATFORMS, PLATFORM_MAP } from "@/lib/gate/platforms"
import type { AnyContent } from "@/lib/gate/types"
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

const inr = (n: number) =>
  "₹" + n.toLocaleString("en-IN")

export default function OverviewPage() {
  const {
    data,
    syncRssFeed,
    ensureContentLoaded,
    ensureUsersLoaded,
    ensureCategoriesLoaded,
    ensureRssLoaded,
  } = useGate()

  useEffect(() => {
    ensureContentLoaded()
    ensureUsersLoaded()
    ensureCategoriesLoaded()
    ensureRssLoaded()
  }, [ensureContentLoaded, ensureUsersLoaded, ensureCategoriesLoaded, ensureRssLoaded])

  const stats = useMemo(() => {
    const users = data.users
    const activeMembers = users.filter(
      (u) => u.membership === "active" || u.membership === "lifetime",
    ).length
    const revenue = data.payments
      .filter((p) => p.status === "success")
      .reduce((s, p) => s + p.amount, 0)
    const renewals = data.payments.filter(
      (p) => p.status === "success" && p.membershipType === "subscription",
    ).length
    const all = [
      ...data.books,
      ...data.research,
      ...data.infographics,
      ...data.podcasts,
    ]
    const published = all.filter((c) => c.status === "published").length
    return {
      users: users.length,
      activeMembers,
      revenue,
      renewals,
      published,
      total: all.length,
    }
  }, [data])

  const platformCounts = useMemo(() => {
    const all = [
      ...data.books,
      ...data.research,
      ...data.infographics,
      ...data.podcasts,
    ]
    return PLATFORMS.map((p) => ({
      name: p.name,
      value: all.filter((c) => c.platform === p.id).length,
      color: p.color,
    }))
  }, [data])

  const monthlyRevenue = useMemo(() => {
    const map = new Map<string, number>()
    data.payments
      .filter((p) => p.status === "success")
      .forEach((p) => {
        const m = new Date(p.createdAt).toLocaleDateString("en", {
          month: "short",
        })
        map.set(m, (map.get(m) ?? 0) + p.amount)
      })
    return Array.from(map, ([month, value]) => ({ month, value }))
  }, [data])

  const topViewed = useMemo(
    () =>
      [
        ...data.books,
        ...data.research,
        ...data.infographics,
        ...data.podcasts,
      ]
        .slice()
        .sort((a, b) => b.views - a.views)
        .slice(0, 5),
    [data],
  )
  const topShared = useMemo(
    () =>
      [
        ...data.books,
        ...data.research,
        ...data.infographics,
        ...data.podcasts,
      ]
        .slice()
        .sort((a, b) => b.shares - a.shares)
        .slice(0, 5),
    [data],
  )

  const topCategories = useMemo(
    () => data.categories.slice().sort((a, b) => b.contentCount - a.contentCount).slice(0, 6),
    [data],
  )

  const traffic = [
    { source: "Direct", value: 38 },
    { source: "Search", value: 27 },
    { source: "Social", value: 19 },
    { source: "Referral", value: 11 },
    { source: "RSS", value: 5 },
  ]

  const searchTerms = [
    { term: "ethical finance", count: 412 },
    { term: "tafsir", count: 388 },
    { term: "productivity", count: 301 },
    { term: "climate policy", count: 244 },
    { term: "hadith", count: 219 },
  ]

  return (
    <div>
      <PageHeader
        title="Command Centre"
        description="Unified control for IPN, IGC, IFR and ISR — content, members, payments and platform health."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/admin/rss-manager">
                <Rss className="mr-1.5 h-4 w-4" /> RSS Sync
              </Link>
            </Button>
            <Button asChild>
              <Link to="/admin/books">
                <Plus className="mr-1.5 h-4 w-4" /> Create Content
              </Link>
            </Button>
          </>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Users" value={stats.users.toLocaleString()} delta="+6.2%" icon={<Users className="h-4 w-4" />} accent="#0ea5e9" />
        <StatCard label="Active Members" value={stats.activeMembers.toLocaleString()} delta="+3.1%" icon={<CreditCard className="h-4 w-4" />} accent="#10b981" />
        <StatCard label="Revenue" value={inr(stats.revenue)} delta="+12.4%" icon={<IndianRupee className="h-4 w-4" />} accent="#f59e0b" />
        <StatCard label="Renewals" value={stats.renewals.toLocaleString()} delta="+4.8%" icon={<RefreshCw className="h-4 w-4" />} accent="#8b5cf6" />
        <StatCard label="Content Published" value={stats.published.toLocaleString()} delta="+18" icon={<FileCheck2 className="h-4 w-4" />} accent="#ec4899" />
        <StatCard
          label="RSS Sync"
          value={
            <span className="flex items-center gap-2 text-base">
              {data.rss.filter((r) => r.status === "healthy").length}/
              {data.rss.length}
              <StatusBadge status="healthy" label="healthy" />
            </span>
          }
          icon={<Rss className="h-4 w-4" />}
          accent="#14b8a6"
        />
      </div>

      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Revenue trend</CardTitle>
            <CardDescription>Successful payments by month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip formatter={(v: any) => inr(v)} />
                <Area type="monotone" dataKey="value" stroke="#f59e0b" fill="url(#rev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Content by platform</CardTitle>
            <CardDescription>All content types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={platformCounts} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                  {platformCounts.map((p) => (
                    <Cell key={p.name} fill={p.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {platformCounts.map((p) => (
                <span key={p.name} className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                  {p.name}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* RSS status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">RSS Sync Status</CardTitle>
            <CardDescription>Automatic podcast ingestion</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.rss.map((f) => (
              <div key={f.id} className="flex items-center justify-between rounded-lg border border-border p-2.5">
                <div>
                  <p className="text-sm font-medium">{PLATFORM_MAP[f.platform].name}</p>
                  <p className="text-xs text-muted-foreground">
                    {f.totalEpisodes} episodes · {f.newLastSync} new
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={f.status} />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      syncRssFeed(f.id)
                      toast.success(`Synced ${PLATFORM_MAP[f.platform].name}`)
                    }}
                  >
                    Sync
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Categories</CardTitle>
            <CardDescription>By content volume</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topCategories} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={120} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="contentCount" fill="#0ea5e9" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <CardDescription>Live admin events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.activity.slice(0, 6).map((a, i) => (
                <div key={i} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0">
                    <p className="truncate text-sm">{a.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.meta} · {new Date(a.ts).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top content + discovery */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Most Viewed Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topViewed.map((c: AnyContent, i) => (
              <Row key={c.id} rank={i + 1} item={c} metric={`${c.views.toLocaleString()} views`} />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Most Shared Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topShared.map((c: AnyContent, i) => (
              <Row key={c.id} rank={i + 1} item={c} metric={`${c.shares.toLocaleString()} shares`} />
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {traffic.map((t) => (
              <div key={t.source}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{t.source}</span>
                  <span className="text-muted-foreground">{t.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${t.value}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Search Analytics</CardTitle>
            <CardDescription>Trending terms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {searchTerms.map((s) => (
              <div key={s.term} className="flex items-center justify-between text-sm">
                <span>{s.term}</span>
                <span className="text-muted-foreground">{s.count} searches</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <QuickLink href="/admin/books" icon={<BookOpen className="h-4 w-4" />} label="Books" />
            <QuickLink href="/admin/infographics" icon={<ImageIcon className="h-4 w-4" />} label="Infographics" />
            <QuickLink href="/admin/podcasts" icon={<Mic className="h-4 w-4" />} label="Podcasts" />
            <QuickLink href="/admin/research-reports" icon={<FileText className="h-4 w-4" />} label="Reports" />
            <QuickLink href="/admin/users" icon={<Users className="h-4 w-4" />} label="Users" />
            <QuickLink href="/admin/payments" icon={<IndianRupee className="h-4 w-4" />} label="Payments" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Row({ rank, item, metric }: { rank: number; item: AnyContent; metric: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border p-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-xs font-semibold">
        {rank}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.title}</p>
        <p className="text-xs text-muted-foreground">
          {PLATFORM_MAP[item.platform].name} · {item.category}
        </p>
      </div>
      <span className="text-xs text-muted-foreground">{metric}</span>
    </div>
  )
}

function QuickLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={href}
      className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
    >
      {icon}
      {label}
      <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
    </Link>
  )
}
