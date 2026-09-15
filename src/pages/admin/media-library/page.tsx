import { useMemo, useState } from "react"
import { CrudTable } from "@/components/gate/crud-table"
import { useGate } from "@/lib/gate/store"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Image as ImageIcon, FileText, Music, Copy } from "lucide-react"
import type { MediaAsset } from "@/lib/gate/types"

export default function MediaLibraryPage() {
  const { data, removeMedia, updateMedia } = useGate()
  const [folder, setFolder] = useState("all")

  const folders = useMemo(
    () => ["all", ...Array.from(new Set(data.mediaAssets.map((m) => m.folder)))],
    [data.mediaAssets],
  )

  const rows = data.mediaAssets.filter((m) => folder === "all" || m.folder === folder)

  const duplicates = useMemo(() => {
    const seen = new Map<string, number>()
    data.mediaAssets.forEach((m) => seen.set(m.hash, (seen.get(m.hash) ?? 0) + 1))
    return seen
  }, [data.mediaAssets])

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {folders.map((f) => (
          <Button key={f} size="sm" variant={folder === f ? "default" : "outline"} onClick={() => setFolder(f)}>
            {f === "all" ? "All Folders" : f}
          </Button>
        ))}
        <Button size="sm" variant="outline" className="ml-auto" onClick={() => toast.success("Duplicate scan complete")}>
          <Copy className="mr-1.5 h-3.5 w-3.5" /> Detect Duplicates
        </Button>
      </div>

      <CrudTable
        title="Media Library"
        description="Central media with folders, search, alt text, optimisation and duplicate detection."
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
        onSave={(item) => updateMedia(item.id, item)}
        onDelete={removeMedia}
        addLabel="Upload"
        dialogTitle="Media Asset"
        fields={[
          { name: "name", label: "File Name", type: "text" },
          { name: "folder", label: "Folder", type: "text" },
          { name: "type", label: "Type", type: "select", options: [{ value: "image", label: "Image" }, { value: "pdf", label: "PDF" }, { value: "audio", label: "Audio" }] },
          { name: "altText", label: "Alt Text", type: "text" },
          { name: "url", label: "URL", type: "text" },
          { name: "sizeKB", label: "Size (KB)", type: "number" },
          { name: "usedBy", label: "Used By (count)", type: "number" },
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
            cell: (r) => (duplicates.get(r.hash)! > 1 ? <span className="text-amber-600">possible dup</span> : <span className="text-muted-foreground">—</span>),
          },
        ]}
      />
    </div>
  )
}
