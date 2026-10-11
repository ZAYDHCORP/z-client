import { useEffect, useState } from "react"
import { adminApi } from "./adminApi"
import { PLATFORMS } from "./platforms"
import type { PlatformId } from "./types"

export interface DashboardCounts {
  users?: number
  /** Members with an active or lifetime membership. */
  activeMembers?: number
  /** False when we stopped paging before reaching the last user (shown as "N+"). */
  activeExact?: boolean
  content?: number
  published?: number
  drafts?: number
  byPlatform: Partial<Record<PlatformId, number>>
  byType: Partial<Record<"book" | "research" | "infographic" | "podcast", number>>
}

/**
 * Headline numbers are counted by the server (one limit=1 request each), so
 * they stay correct once there are more records than the 25 we page in.
 * Anything that fails simply stays undefined and renders as "—".
 */
export function useDashboardCounts(): DashboardCounts {
  const [counts, setCounts] = useState<DashboardCounts>({ byPlatform: {}, byType: {} })

  useEffect(() => {
    let cancelled = false
    const set = (patch: Partial<DashboardCounts>) => !cancelled && setCounts((c) => ({ ...c, ...patch }))
    const ignore = () => {}

    adminApi.users.count().then((n) => set({ users: n })).catch(ignore)

    // Active members: walk the user list 25 at a time (the normal page size) and
    // count paid / lifetime memberships. Capped so a huge user base can't flood the API.
    ;(async () => {
      const MAX_PAGES = 8
      let active = 0
      for (let page = 1; page <= MAX_PAGES; page++) {
        const res = await adminApi.users.list<{ membership?: string }>(page)
        active += res.items.filter((u) => u.membership === "active" || u.membership === "lifetime").length
        if (!res.hasMore) return set({ activeMembers: active, activeExact: true })
        if (cancelled) return
      }
      set({ activeMembers: active, activeExact: false })
    })().catch(ignore)
    adminApi.content.count().then((n) => set({ content: n })).catch(ignore)
    adminApi.content.count({ status: "published" }).then((n) => set({ published: n })).catch(ignore)
    adminApi.content.count({ status: "draft" }).then((n) => set({ drafts: n })).catch(ignore)
    PLATFORMS.forEach((p) =>
      adminApi.content
        .count({ platform: p.id })
        .then((n) => !cancelled && setCounts((c) => ({ ...c, byPlatform: { ...c.byPlatform, [p.id]: n } })))
        .catch(ignore),
    )
    ;(["book", "research", "infographic", "podcast"] as const).forEach((t) =>
      adminApi.content
        .count({ type: t })
        .then((n) => !cancelled && setCounts((c) => ({ ...c, byType: { ...c.byType, [t]: n } })))
        .catch(ignore),
    )
    return () => {
      cancelled = true
    }
  }, [])

  return counts
}
