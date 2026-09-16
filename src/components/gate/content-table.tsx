import { useMemo, useState } from "react"
import { toast } from "sonner"
import {
  Eye,
  Pencil,
  Plus,
  Star,
  Copy,
  Archive,
  Trash2,
  MoreVertical,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { StatusBadge } from "./ui"
import { ContentEditor } from "./content-editor"
import { useGate } from "@/lib/gate/store"
import { PLATFORMS, PLATFORM_MAP } from "@/lib/gate/platforms"
import type {
  AnyContent,
  BookContent,
  ContentType,
  InfographicContent,
  PlatformId,
  PodcastEpisode,
  ResearchContent,
} from "@/lib/gate/types"
import { cn } from "@/lib/utils"

const typeKey: Record<ContentType, keyof ReturnType<typeof useGate>["data"]> = {
  book: "books",
  research: "research",
  infographic: "infographics",
  podcast: "podcasts",
}

export function ContentTable({ type }: { type: ContentType }) {
  const {
    data,
    updateContent,
    setContentStatus,
    toggleFeatured,
    duplicateContent,
    removeContent,
    loadMore,
    hasMore,
    isResourceLoading,
  } = useGate()
  const [query, setQuery] = useState("")
  const [platform, setPlatform] = useState<string>("all")
  const [status, setStatus] = useState<string>("all")
  const [editing, setEditing] = useState<AnyContent | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [preview, setPreview] = useState<AnyContent | null>(null)

  const items = data[typeKey[type]] as AnyContent[]

  const filtered = useMemo(() => {
    return items
      .filter((x) => (platform === "all" ? true : x.platform === platform))
      .filter((x) => (status === "all" ? true : x.status === status))
      .filter((x) =>
        query
          ? x.title.toLowerCase().includes(query.toLowerCase()) ||
            x.tags.join(" ").toLowerCase().includes(query.toLowerCase())
          : true,
      )
      .slice()
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
        return a.displayOrder - b.displayOrder
      })
  }, [items, platform, status, query])

  const labels: Record<ContentType, { singular: string; plural: string }> = {
    book: { singular: "Book", plural: "Books" },
    research: { singular: "Research Report", plural: "Research Reports" },
    infographic: { singular: "Infographic", plural: "Infographics" },
    podcast: { singular: "Podcast Episode", plural: "Podcasts" },
  }

  function openNew() {
    setEditing(null)
    setEditorOpen(true)
  }
  function openEdit(item: AnyContent) {
    setEditing(item)
    setEditorOpen(true)
  }

  function doDelete(item: AnyContent) {
    if (!confirm(`Delete "${item.title}"? This cannot be undone.`)) return
    removeContent(item.id)
    toast.success("Deleted")
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder={`Search ${labels[type].plural.toLowerCase()}…`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger className="sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            {PLATFORMS.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {["draft", "scheduled", "published", "unpublished", "archived"].map(
              (s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
        <Button className="sm:ml-auto" onClick={openNew}>
          <Plus className="mr-1.5 h-4 w-4" /> New {labels[type].singular}
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Content</TableHead>
              <TableHead className="hidden md:table-cell">Platform</TableHead>
              <TableHead className="hidden lg:table-cell">Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell text-right">Views</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item, i) => (
              <TableRow key={item.id}>
                <TableCell>
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-xs font-semibold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Thumb item={item} />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{item.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.featured && "★ Featured · "}
                        {item.tags.slice(0, 3).join(", ")}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <PlatformPill p={item.platform} />
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                  {item.category}
                </TableCell>
                <TableCell>
                  <StatusBadge status={item.status} />
                </TableCell>
                <TableCell className="hidden sm:table-cell text-right text-sm tabular-nums">
                  {item.views.toLocaleString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => openEdit(item)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setPreview(item)}>
                        <Eye className="mr-2 h-4 w-4" /> Preview
                      </DropdownMenuItem>
                      {item.status !== "published" && (
                        <DropdownMenuItem
                          onClick={() => {
                            setContentStatus(item.id, "published")
                            toast.success("Published")
                          }}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" /> Publish
                        </DropdownMenuItem>
                      )}
                      {item.status === "published" && (
                        <DropdownMenuItem
                          onClick={() => {
                            setContentStatus(item.id, "unpublished")
                            toast.success("Unpublished")
                          }}
                        >
                          Unpublish
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => {
                          setContentStatus(item.id, "scheduled")
                          toast.success("Marked scheduled")
                        }}
                      >
                        Schedule
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setContentStatus(item.id, "archived")
                          toast.success("Archived")
                        }}
                      >
                        <Archive className="mr-2 h-4 w-4" /> Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          toggleFeatured(item.id)
                          toast.success(
                            item.featured ? "Unfeatured" : "Featured",
                          )
                        }}
                      >
                        <Star className="mr-2 h-4 w-4" />
                        {item.featured ? "Unfeature" : "Feature"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          duplicateContent(item.id)
                          toast.success("Duplicated")
                        }}
                      >
                        <Copy className="mr-2 h-4 w-4" /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-rose-600"
                        onClick={() => doDelete(item)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No {labels[type].plural.toLowerCase()} match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Books/research/infographics/podcasts all come from one shared,
          mixed-type /admin/content endpoint — "Load more" advances that one
          shared page cursor, so a click here may bring in mostly other
          content types before more of *this* type shows up. */}
      {hasMore("content") && !query && platform === "all" && status === "all" && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => loadMore("content")} disabled={isResourceLoading("content")}>
            {isResourceLoading("content") ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}

      <ContentEditor
        type={type}
        item={editing}
        open={editorOpen}
        onOpenChange={setEditorOpen}
      />

      <PreviewDialog item={preview} onClose={() => setPreview(null)} />
    </div>
  )
}

function Thumb({ item }: { item: AnyContent }) {
  const src =
    item.type === "infographic"
      ? (item as InfographicContent).image
      : item.type === "podcast"
        ? (item as PodcastEpisode).artwork
        : item.type === "book"
          ? (item as BookContent).cover
          : (item as ResearchContent).cover
  const ratio = item.type === "infographic" ? "aspect-[4/5]" : "aspect-[16/25]"
  return (
    <div
      className={cn(
        "w-9 shrink-0 overflow-hidden rounded-md border border-border bg-muted",
        ratio,
      )}
    >
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center text-[8px] text-muted-foreground">
          {item.type === "podcast" ? "1:1" : item.type === "infographic" ? "4:5" : "16:25"}
        </div>
      )}
    </div>
  )
}

function PlatformPill({ p }: { p: PlatformId }) {
  const m = PLATFORM_MAP[p]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ background: m.softColor, color: m.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.color }} />
      {m.name}
    </span>
  )
}

function PreviewDialog({
  item,
  onClose,
}: {
  item: AnyContent | null
  onClose: () => void
}) {
  if (!item) return null
  const src =
    item.type === "infographic"
      ? (item as InfographicContent).image
      : item.type === "podcast"
        ? (item as PodcastEpisode).artwork
        : item.type === "book"
          ? (item as BookContent).cover
          : (item as ResearchContent).cover
  const ratio = item.type === "infographic" ? "aspect-[4/5]" : item.type === "podcast" ? "aspect-square" : "aspect-[16/25]"
  return (
    <Dialog open={!!item} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Preview · {item.title}</DialogTitle>
        </DialogHeader>
        <div className="flex gap-4">
          <div className={cn("w-40 shrink-0 overflow-hidden rounded-lg border border-border bg-muted", ratio)}>
            {src ? (
              <img src={src} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                No media
              </div>
            )}
          </div>
          <div className="min-w-0 space-y-2">
            <PlatformPill p={item.platform} />
            <p className="text-sm font-medium">{item.category}</p>
            <p className="text-sm text-muted-foreground line-clamp-4">
              {item.description}
            </p>
            <div className="flex flex-wrap gap-1">
              {item.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                >
                  #{t}
                </span>
              ))}
            </div>
            {item.type === "podcast" && (
              <p className="text-xs text-muted-foreground">
                Audio: {(item as PodcastEpisode).audioUrl || "—"}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
