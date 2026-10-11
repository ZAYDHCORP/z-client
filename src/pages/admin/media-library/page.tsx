import { useEffect, useMemo, useState } from "react"
import { CrudTable } from "@/components/gate/crud-table"
import { useGate } from "@/lib/gate/store"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Image as ImageIcon, FileText, Music, Copy } from "lucide-react"
import type { MediaAsset } from "@/lib/gate/types"

export default function MediaLibraryPage() {
  const { data, addMedia, removeMedia, updateMedia, ensureMediaLoaded, loadMore, hasMore, isResourceLoading } = useGate()

  useEffect(() => {
    ensureMediaLoaded()
  }, [ensureMediaLoaded])

  const [folder, setFolder] = useState("all")

  const folders = useMemo(
    () => ["all", ...Array.from(new Set(data.mediaAssets.map((m) => m.folder)))],
    [data.mediaAssets],
  )

  const rows = data.mediaAssets.filter((m) => folder === "all" || m.folder === folder)

  // The server flags duplicates (same content hash) via `isDuplicate`.
  const duplicateCount = data.mediaAssets.filter((m) => m.isDuplicate).length

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {folders.map((f) => (
          <Button key={f} size="sm" variant={folder === f ? "default" : "outline"} onClick={() => setFolder(f)}>
            {f === "all" ? "All Folders" : f}
          </Button>
        ))}
        <Button size="sm" variant="outline" className="ml-auto" onClick={() => toast.info(duplicateCount ? `${duplicateCount} possible duplicate${duplicateCount > 1 ? "s" : ""} in the loaded items` : "No duplicates found in the loaded items")}>
          <Copy className="mr-1.5 h-3.5 w-3.5" /> Detect Duplicates
        </Button>
      </div>

      <CrudTable
        onLoadMore={() => loadMore("mediaAssets")}
        hasMore={hasMore("mediaAssets")}
        loadingMore={isResourceLoading("mediaAssets")}
        title="Media Library"
        description="Your uploaded images, PDFs and audio."
        rows={rows}
        searchKeys={["name", "altText", "folder"]}
        newRecord={(): MediaAsset => ({
          id: `md_${Date.now().toString(36)}`,
          name: "",
          folder: "General",
          type: "image",
          mime: "image/jpeg",
          sizeKB: 0,
          altText: "",
          url: "",
          uploadedAt: new Date().toISOString(),
          usedBy: 0,
          hash: Math.random().toString(36).slice(2, 8),
        })}
        onSave={(item) => {
          if (!item.url) { toast.error("Choose a file to upload."); return false }
          if (!item.name.trim()) { toast.error("Give the file a name."); return false }
          data.mediaAssets.some((m) => m.id === item.id) ? updateMedia(item.id, item) : addMedia(item)
        }}
        onDelete={removeMedia}
        addLabel="Upload"
        dialogTitle="Media Asset"
        fields={[
          { name: "url", label: "File", type: "file", accept: "image/*,application/pdf,audio/*" },
          { name: "name", label: "File Name", type: "text" },
          { name: "folder", label: "Folder", type: "text" },
          { name: "altText", label: "Alt Text", type: "text" },
                  ]}
        columns={[
          {
            header: "Asset",
            cell: (r) => (
              <span className="flex items-center gap-2 font-medium">
                {r.type === "image" ? <ImageIcon className="h-4 w-4 text-sky-500" /> : r.type === "pdf" ? <FileText className="h-4 w-4 text-rose-500" /> : <Music className="h-4 w-4 text-violet-500" />}
                {r.name}
              </span>
            ),
          },
          { header: "Folder", cell: (r) => r.folder },
          { header: "Alt Text", cell: (r) => <span className="text-muted-foreground">{r.altText || "—"}</span> },
          { header: "Used", cell: (r) => <span className="text-muted-foreground">{r.usedBy}</span> },
          {
            header: "Duplicate",
            cell: (r) => (r.isDuplicate ? <span className="text-amber-600">possible dup</span> : <span className="text-muted-foreground">—</span>),
          },
        ]}
      />
    </div>
  )
}
