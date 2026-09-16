import { useLocation, useNavigate, Link } from "react-router-dom"
import { ThemeProvider, useTheme } from "next-themes"
import { useEffect, useState } from "react"
import {
  Activity,
  KeyRound,
  Archive,
  BadgeCheck,
  BarChart3,
  Bell,
  BookOpen,
  Boxes,
  CalendarClock,
  Folder,
  CreditCard,
  Database,
  FileText,
  Frame,
  Globe,
  HardDrive,
  Home,
  Image,
  Layers,
  LayoutDashboard,
  LineChart,
  Lock,
  type LucideIcon,
  Mic,
  Moon,
  Music,
  Newspaper,
  PanelLeft,
  PieChart,
  Podcast,
  Repeat,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Sunrise,
  Sunset,
  Tags,
  Upload,
  Users,
  Webhook,
  BookHeart,
  BookMarked,
  BookText,
  ClipboardCheck,
  Compass,
  Download,
  FileEdit,
  FolderTree,
  Heart,
  CheckCircle2,
  Wand2,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { GateLogo } from "./logo"
import { StoreProvider } from "@/lib/gate/store"
import { Toaster } from "@/components/ui/sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getCachedUser, logoutCurrentUser } from "@/lib/client-auth"

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: string
}
interface NavGroup {
  label: string
  items: NavItem[]
}

const NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/admin", icon: Home }],
  },
  {
    label: "Members & Money",
    items: [
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Memberships", href: "/admin/memberships", icon: CreditCard },
      { label: "Payments", href: "/admin/payments", icon: PieChart },
    ],
  },
  {
    label: "Platforms",
    items: [
      { label: "IPN", href: "/admin/platforms/IPN", icon: Globe },
      { label: "IGC", href: "/admin/platforms/IGC", icon: Globe },
      { label: "IFR", href: "/admin/platforms/IFR", icon: Globe },
      { label: "ISR", href: "/admin/platforms/ISR", icon: Globe },
    ],
  },
  {
    label: "Content CMS",
    items: [
      { label: "Books", href: "/admin/books", icon: BookOpen },
      { label: "Infographics", href: "/admin/infographics", icon: Image },
      { label: "Podcasts", href: "/admin/podcasts", icon: Mic },
      { label: "Research Reports", href: "/admin/research-reports", icon: FileText },
    ],
  },
  {
    label: "Taxonomy",
    items: [
      { label: "Categories", href: "/admin/categories", icon: Folder },
      { label: "Tags", href: "/admin/tags", icon: Tags },
      { label: "Regions", href: "/admin/regions", icon: Globe },
      { label: "Topics", href: "/admin/topics", icon: Layers },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Services", href: "/admin/services", icon: Boxes },
      { label: "Social Links", href: "/admin/social-links", icon: Webhook },
      { label: "Media Library", href: "/admin/media-library", icon: Image },
      { label: "RSS Manager", href: "/admin/rss-manager", icon: Podcast },
      { label: "Feed Ordering", href: "/admin/feed-ordering", icon: LineChart },
      { label: "Search", href: "/admin/search", icon: Search },
      { label: "Recommendations", href: "/admin/recommendations", icon: Frame },
    ],
  },
  {
    label: "Engagement",
    items: [
      { label: "Notifications", href: "/admin/notifications", icon: Bell },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      { label: "SEO / AEO", href: "/admin/seo-aeo", icon: FileText },
      { label: "Learning Analytics", href: "/admin/learning-analytics", icon: LineChart },
      { label: "Badges & Streaks", href: "/admin/badges-streaks", icon: BadgeCheck },
    ],
  },
      {
        label: "System",
        items: [
          { label: "Roles & Permissions", href: "/admin/roles", icon: Shield },
          { label: "Security", href: "/admin/security", icon: Lock },
          { label: "Audit Logs", href: "/admin/audit-logs", icon: Activity },
          { label: "API Management", href: "/admin/api-management", icon: KeyRound },
          { label: "Backups", href: "/admin/backups", icon: HardDrive },
          { label: "Settings", href: "/admin/settings", icon: Settings },
        ],
      },
    ]

    NAV.push({
      label: "Theocentric & Doxology",
      items: [
        { label: "Dashboard", href: "/admin/theocentric", icon: LayoutDashboard },
        { label: "Duas", href: "/admin/theocentric/duas", icon: Heart },
        { label: "Adhkars", href: "/admin/theocentric/adhkars", icon: Repeat },
        { label: "Quranic Reminders", href: "/admin/theocentric/quranic-supplications", icon: BookText },
        { label: "Categories", href: "/admin/theocentric/categories", icon: Folder },
        { label: "Subcategories", href: "/admin/theocentric/subcategories", icon: FolderTree },
        { label: "Collections / Routines", href: "/admin/theocentric/collections", icon: Layers },
        { label: "Daily Journey", href: "/admin/theocentric/daily-journey", icon: Compass },
        { label: "After Salah", href: "/admin/theocentric/after-salah", icon: Clock },
        { label: "Morning Adhkars", href: "/admin/theocentric/morning-adhkars", icon: Sunrise },
        { label: "Evening Adhkars", href: "/admin/theocentric/evening-adhkars", icon: Sunset },
        { label: "Before Sleep", href: "/admin/theocentric/before-sleep", icon: Moon },
        { label: "40 Rabbana", href: "/admin/theocentric/40-rabbana", icon: BookHeart },
        { label: "Ruqiyah", href: "/admin/theocentric/ruqiyah", icon: Wand2 },
        { label: "Tags", href: "/admin/theocentric/tags", icon: Tags },
        { label: "Featured Content", href: "/admin/theocentric/featured", icon: Star },
        { label: "Verification", href: "/admin/theocentric/verification", icon: BadgeCheck },
        { label: "Drafts", href: "/admin/theocentric/drafts", icon: FileEdit },
        { label: "Published", href: "/admin/theocentric/published", icon: CheckCircle2 },
        { label: "Archived", href: "/admin/theocentric/archived", icon: Archive },
        { label: "Settings", href: "/admin/theocentric/settings", icon: Settings },
      ],
    })

    NAV.push({
      label: "Doxology Alarms",
      items: [
        { label: "Dashboard", href: "/admin/doxology", icon: LayoutDashboard },
        { label: "Users", href: "/admin/doxology/users", icon: Users },
        { label: "Alarm Settings", href: "/admin/doxology/settings", icon: Clock },
        { label: "Audio Library", href: "/admin/doxology/audio", icon: Music },
      ],
    })

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [ready, setReady] = useState(false)
  useEffect(() => setReady(true), [])
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      {ready && theme === "dark" ? "☀" : "☾"}
    </Button>
  )
}

function SidebarContent({ pathname, onNav }: { pathname: string; onNav?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <GateLogo size="md" />
        <span className="ml-auto rounded-md bg-foreground px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-background">
          Admin
        </span>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={onNav}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-border p-3">
        <AdminIdentity />
      </div>
    </div>
  )
}

function AdminIdentity() {
  const user = getCachedUser()
  const name = user?.name ?? user?.email?.split("@")[0] ?? "Admin"
  const initials = name
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("") || "A"

  return (
    <div className="flex items-center gap-2 rounded-lg bg-accent/60 px-3 py-2">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="truncate text-xs text-muted-foreground">{user?.email ?? "Super Admin"}</p>
      </div>
    </div>
  )
}

const CRUMB_LABELS: Record<string, string> = {
  theocentric: "Theocentric & Doxology",
  "quranic-supplications": "Quranic Reminders",
}

function AdminShellInner({ children }: { children: React.ReactNode }) {
  const pathname = useLocation().pathname
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [q, setQ] = useState("")

  const crumbs = pathname
    .replace("/admin", "")
    .split("/")
    .filter(Boolean)

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-sidebar lg:block">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 border-r border-border bg-sidebar">
            <SidebarContent
              pathname={pathname}
              onNav={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
          <nav className="hidden items-center gap-1.5 text-sm text-muted-foreground md:flex">
            <Link to="/admin" className="text-foreground hover:text-foreground/70" aria-label="Dashboard">
              <Home className="h-3.5 w-3.5" />
            </Link>
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span>/</span>
                <span>{CRUMB_LABELS[c] ?? c.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase())}</span>
              </span>
            ))}
          </nav>

          <form
            className="ml-auto hidden max-w-sm flex-1 sm:block"
            onSubmit={(e) => {
              e.preventDefault()
              navigate(`/admin/search?q=${encodeURIComponent(q)}`)
            }}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search content, users, payments…"
                className="pl-9"
              />
            </div>
          </form>

          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Activity className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>System Health</DropdownMenuLabel>
              <SystemHealthMini />
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Admin</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/admin/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/admin/security">Security</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/admin/audit-logs">Audit Logs</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  logoutCurrentUser();
                  navigate("/");
                }}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}

import { useGate } from "@/lib/gate/store"
function SystemHealthMini() {
  const { data } = useGate()
  return (
    <div className="max-h-72 space-y-1.5 overflow-y-auto p-1">
      {data.systemHealth.map((h) => (
        <div
          key={h.name}
          className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm"
        >
          <span className="text-muted-foreground">{h.name}</span>
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              h.status === "operational"
                ? "bg-emerald-500"
                : h.status === "degraded"
                  ? "bg-amber-500"
                  : "bg-rose-500",
            )}
          />
        </div>
      ))}
    </div>
  )
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AdminShellInner>{children}</AdminShellInner>
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </StoreProvider>
  )
}
