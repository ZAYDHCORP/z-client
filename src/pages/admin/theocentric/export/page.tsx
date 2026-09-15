import { useState } from "react"
import { Download } from "lucide-react"
import { PageHeader } from "@/components/gate/ui"
import { Button } from "@/components/ui/button"
import { useTheo } from "@/lib/gate/theocentric/store"

export default function ExportPage() {
  const { data } = useTheo()
  const [copied, setCopied] = useState(false)
  const json = JSON.stringify(data, null, 2)

  function download() {
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "theocentric-export.json"
    a.click()
    URL.revokeObjectURL(url)
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(json)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }

  return (
    <div>
      <PageHeader
        title="Export"
        description="Download the full Theocentric & Doxology dataset as JSON for backup or migration."
        actions={
          <>
            <Button variant="outline" onClick={copy}>{copied ? "Copied!" : "Copy JSON"}</Button>
            <Button onClick={download}>
              <Download className="mr-1.5 h-4 w-4" /> Download
            </Button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-xl font-semibold">{data.content.length}</p>
          <p className="text-xs text-muted-foreground">Content</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-xl font-semibold">{data.categories.length}</p>
          <p className="text-xs text-muted-foreground">Categories</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-xl font-semibold">{data.collections.length}</p>
          <p className="text-xs text-muted-foreground">Collections</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-xl font-semibold">{data.references.length}</p>
          <p className="text-xs text-muted-foreground">References</p>
        </div>
      </div>

      <pre className="max-h-[60vh] overflow-auto rounded-xl border border-border bg-card p-4 text-xs">{json}</pre>
    </div>
  )
}
