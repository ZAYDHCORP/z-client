import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useTheme } from "next-themes"
import {
  Briefcase,
  Crown,
  Home as HomeIcon,
  LayoutDashboard,
  Menu,
  Moon,
  Rss,
  Search,
  Smartphone,
  Sun,
  X,
} from "lucide-react"
import { Logo } from "@/components/Logo"
import SocialLinks from "@/components/SocialLinks"
import { gateSocials } from "@/lib/gate-data"
import { nav } from "@/lib/home-data"
import { getCachedUser, getPostLoginPath } from "@/lib/client-auth"

const NAV_ICONS: Record<string, typeof HomeIcon> = {
  Home: HomeIcon,
  Services: Briefcase,
  "Gate Feed": Rss,
  Search: Search,
  Membership: Crown,
  Dashboard: LayoutDashboard,
  "Z Web App": Smartphone,
}

/**
 * The home page's top bar, for pages that live on their own route (e.g. /membership).
 * Section links jump back to the matching part of the home page; Membership and
 * Dashboard go to their own pages.
 */
export function SiteHeader() {
  const { resolvedTheme, setTheme } = useTheme()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const user = getCachedUser()
  const signedIn = Boolean(user?.email)
  const [menuOpen, setMenuOpen] = useState(false)
  const [closing, setClosing] = useState(false)

  const closeMenu = () => {
    setClosing(true)
    window.setTimeout(() => {
      setMenuOpen(false)
      setClosing(false)
    }, 200)
  }

  const slug = (item: string) => item.toLowerCase().replaceAll(" ", "-")
  const go = (item: string) => {
    if (item === "Dashboard") return navigate(signedIn ? getPostLoginPath(user) : "/signin")
    if (item === "Membership") return navigate("/membership")
    return navigate(item === "Home" ? "/" : `/#${slug(item)}`)
  }
  const isCurrent = (item: string) => item === "Membership" && pathname.startsWith("/membership")

  const pill =
    "rounded-full px-4 py-2 text-zinc-700 transition hover:bg-black hover:text-white dark:text-zinc-200 dark:hover:bg-white dark:hover:text-black"

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f4f0e8]/80 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-[#090908]/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault()
              navigate("/")
            }}
          >
            <Logo compact />
          </a>
          <nav className="hidden items-center gap-1 rounded-full border border-black/10 bg-white/55 p-1 text-sm dark:border-white/10 dark:bg-white/5 lg:flex">
            {nav.map((item) => (
              <a
                key={item}
                href={item === "Membership" ? "/membership" : item === "Home" ? "/" : `/#${slug(item)}`}
                aria-current={isCurrent(item) ? "page" : undefined}
                className={`${pill} ${isCurrent(item) ? "bg-black text-white dark:bg-white dark:text-black" : ""}`}
                onClick={(e) => {
                  e.preventDefault()
                  go(item)
                }}
              >
                {item}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <SocialLinks links={gateSocials} className="hidden lg:flex" />
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="hidden rounded-full border border-black/10 bg-white/70 p-3 dark:border-white/10 dark:bg-white/10 lg:block"
              aria-label="Toggle theme"
            >
              {resolvedTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {!signedIn && (
              <button
                onClick={() => navigate("/signin?callbackUrl=%2Fmembership")}
                className="hidden rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white dark:bg-white dark:text-black lg:block"
              >
                Sign In
              </button>
            )}
            <button
              onClick={() => setMenuOpen(true)}
              className="rounded-full border border-black/10 bg-white/70 p-3 transition hover:bg-black/5 dark:border-white/10 dark:bg-white/10 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      {(menuOpen || closing) && (
        <div
          className={`fixed inset-0 z-[100] flex flex-col bg-[#f4f0e8] text-zinc-950 dark:bg-[#090908] dark:text-[#f6f0e5] lg:hidden ${
            closing ? "animate-out fade-out duration-200" : "animate-in fade-in duration-200"
          }`}
        >
          <div className="flex items-center justify-between border-b border-black/10 px-4 py-3 dark:border-white/10">
            <Logo compact />
            <button
              onClick={closeMenu}
              className="rounded-full border border-black/15 bg-black/5 p-3 transition hover:bg-black/10 dark:border-white/15 dark:bg-white/10 dark:hover:bg-white/15"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto px-4 py-6">
            {nav.map((item) => {
              const Icon = NAV_ICONS[item] ?? HomeIcon
              return (
                <button
                  key={item}
                  onClick={() => {
                    closeMenu()
                    go(item)
                  }}
                  className="flex w-full items-center gap-4 rounded-2xl px-3 py-4 text-left font-serif text-xl font-semibold transition hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <Icon className="text-[#9a6d35] dark:text-[#d5a85c]" size={22} />
                  {item}
                </button>
              )
            })}
          </nav>
          <div className="space-y-3 border-t border-black/10 px-4 py-6 dark:border-white/10">
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-black/15 bg-black/5 px-5 py-3.5 text-sm font-bold transition hover:bg-black/10 dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
            >
              {resolvedTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
            </button>
            {!signedIn && (
              <button
                onClick={() => {
                  closeMenu()
                  navigate("/signin?callbackUrl=%2Fmembership")
                }}
                className="w-full rounded-full bg-zinc-950 px-5 py-3.5 text-sm font-bold text-white transition hover:opacity-90 dark:bg-white dark:text-black"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
