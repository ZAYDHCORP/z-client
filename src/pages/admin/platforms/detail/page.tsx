import { useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Globe, BookOpen, FileText, Folder, Boxes, Webhook, ArrowLeft } from "lucide-react"
import { PageHeader, StatCard, StatusBadge } from "@/components/gate/ui"
import { useGate } from "@/lib/gate/store"
import { PLATFORMS, PLATFORM_MAP } from "@/lib/gate/platforms"
import type { PlatformId } from "@/lib/gate/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function PlatformPage() {
  const params = useParams<{ id: string }>()
  const id = (params.id ?? "") as PlatformId
  const {
    data,
    ensureContentLoaded,
    ensureUsersLoaded,
    ensureCategoriesLoaded,
    ensureServicesLoaded,
    ensureSocialLinksLoaded,
    ensureRssLoaded,
  } = useGate()

  useEffect(() => {
    ensureContentLoaded()
    ensureUsersLoaded()
    ensureCategoriesLoaded()
    ensureServicesLoaded()
    ensureSocialLinksLoaded()
    ensureRssLoaded()
  }, [
    ensureContentLoaded,
    ensureUsersLoaded,
    ensureCategoriesLoaded,
    ensureServicesLoaded,
    ensureSocialLinksLoaded,
    ensureRssLoaded,
  ])

  if (!PLATFORM_MAP[id]) {
    return (
      <div>
        <PageHeader title="Unknown Platform" description={`'${id}' is not a valid • Gate platform.`} />
        <div className="flex gap-2">
          {PLATFORMS.map((p) => (
            <Link key={p.id} to={`/admin/platforms/${p.id}`} className="text-sm text-primary underline">{p.name}</Link>
          ))}
        </div>
      </div>
    )
  }

  const meta = PLATFORM_MAP[id]
  const content = [...data.books, ...data.research, ...data.infographics, ...data.podcasts].filter((c) => c.platform === id)
  const categories = data.categories.filter((c) => c.platform === id)
  const services = data.services.filter((s) => s.platform === id)
  const links = data.socialLinks.filter((l) => l.platform === id || l.platform === "ALL")
  const rss = data.rss.filter((f) => f.platform === id)

  const stats = {
    content: content.length,
    published: content.filter((c) => c.status === "published").length,
    categories: categories.length,
    services: services.length,
    views: content.reduce((s, c) => s + c.views, 0),
    followers: data.users.filter((u) => u.followedCategories.some((c) => c.startsWith(id))).length,
  }

  return (
    <div>
      <Link to="/admin" className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
      </Link>
      <PageHeader
        title={meta.fullName}
        description={meta.description}
      />

      <div className="mb-4 flex items-center gap-3 rounded-xl border border-border p-4" style={{ background: meta.softColor }}>
        <span className="flex h-12 w-12 items-center justify-center rounded-xl text-white" style={{ background: meta.color }}>
          <Globe className="h-6 w-6" />
        </span>
        <div>
          <p className="text-lg font-semibold" style={{ color: meta.color }}>{meta.name}</p>
          <p className="text-sm text-muted-foreground">{meta.tagline}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Total Content" value={stats.content} icon={<FileText className="h-4 w-4" />} accent={meta.color} />
        <StatCard label="Published" value={stats.published} icon={<BookOpen className="h-4 w-4" />} accent={meta.color} />
        <StatCard label="Categories" value={stats.categories} icon={<Folder className="h-4 w-4" />} accent={meta.color} />
        <StatCard label="Services" value={stats.services} icon={<Boxes className="h-4 w-4" />} accent={meta.color} />
        <StatCard label="Total Views" value={stats.views.toLocaleString()} icon={<Globe className="h-4 w-4" />} accent={meta.color} />
        <StatCard label="Followers" value={stats.followers} icon={<Webhook className="h-4 w-4" />} accent={meta.color} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Categories</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-border p-2.5">
                <span className="text-sm font-medium">{c.name}</span>
                <span className="text-xs text-muted-foreground">{c.contentCount} items</span>
              </div>
            ))}
            {categories.length === 0 && <p className="text-sm text-muted-foreground">No categories yet.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Services</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {services.map((s) => (
              <div key={s.id} className="rounded-lg border border-border p-2.5">
                <p className="text-sm font-medium">{s.title}</p>
                <p className="line-clamp-1 text-xs text-muted-foreground">{s.shortDescription}</p>
              </div>
            ))}
            {services.length === 0 && <p className="text-sm text-muted-foreground">No services yet.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Social & Distribution</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {links.map((l) => (
              <div key={l.id} className="flex items-center justify-between rounded-lg border border-border p-2.5">
                <span className="text-sm font-medium">{l.label}</span>
                <StatusBadge status={l.active ? "active" : "archived"} />
              </div>
            ))}
            {rss.map((f) => (
              <div key={f.id} className="flex items-center justify-between rounded-lg border border-border p-2.5">
                <span className="text-sm font-medium">RSS · {f.totalEpisodes} eps</span>
                <StatusBadge status={f.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader><CardTitle className="text-base">Content</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Views</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {content.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.title}</TableCell>
                  <TableCell className="capitalize text-muted-foreground">{c.type}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.category}</TableCell>
                  <TableCell><StatusBadge status={c.status} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.views.toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {content.length === 0 && (
                <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No content for this platform.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
