import { useMemo, useState } from "react"
import { ClipboardCheck, ExternalLink } from "lucide-react"
import { PageHeader, StatusBadge } from "@/components/gate/ui"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SpiritualEditor } from "@/components/gate/theocentric/spiritual-editor"
import { useTheo } from "@/lib/gate/theocentric/store"
import type { SpiritualContent } from "@/lib/gate/theocentric/types"

interface Issue {
  id: string
  title: string
  kind: string
  reasons: string[]
  severity: "high" | "medium" | "low"
}

export default function ContentAuditPage() {
  const { data } = useTheo()
  const [editing, setEditing] = useState<SpiritualContent | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const issues = useMemo<Issue[]>(() => {
    const seen = new Map<string, number>()
    data.content.forEach((c) => {
      if (c.arabic) seen.set(c.arabic, (seen.get(c.arabic) ?? 0) + 1)
    })
    const out: Issue[] = []
    data.content.forEach((c) => {
      const reasons: string[] = []
      if (!c.arabic.trim()) reasons.push("Missing Arabic text")
      if (!c.translation.trim()) reasons.push("Missing translation")
      if (!c.category) reasons.push("No category assigned")
      if (!c.source && !c.quranReference && !c.hadithReference)
        reasons.push("No source / reference")
      if (c.verification === "requires_correction") reasons.push("Requires correction")
      if (c.verification === "unverified") reasons.push("Unverified")
      if (c.arabic && (seen.get(c.arabic) ?? 0) > 1) reasons.push("Duplicate Arabic text")
      if (reasons.length === 0) return
      const severity: Issue["severity"] =
        reasons.some((r) => r.includes("Missing Arabic") || r.includes("Duplicate"))
          ? "high"
          : reasons.some((r) => r.includes("Requires correction") || r.includes("No source"))
            ? "medium"
            : "low"
      out.push({ id: c.id, title: c.title || "Untitled", kind: c.kind, reasons, severity })
    })
    return out
  }, [data.content])

  function openEdit(item: SpiritualContent) {
    setEditing(item)
    setEditOpen(true)
  }

  const severityColor: Record<Issue["severity"], string> = {
    high: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
    medium: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    low: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  }

  return (
    <div>
      <PageHeader
        title="Content Audit"
        description="Automated checks for missing fields, duplicates, missing references and verification gaps. Click a row to fix it."
      />

      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-2xl font-semibold text-rose-600">{issues.filter((i) => i.severity === "high").length}</p>
          <p className="text-xs text-muted-foreground">High severity</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-2xl font-semibold text-amber-600">{issues.filter((i) => i.severity === "medium").length}</p>
          <p className="text-xs text-muted-foreground">Medium severity</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-2xl font-semibold text-blue-600">{issues.filter((i) => i.severity === "low").length}</p>
          <p className="text-xs text-muted-foreground">Low severity</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Severity</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Kind</TableHead>
              <TableHead>Issues</TableHead>
              <TableHead className="w-16 text-right">Fix</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {issues.map((i) => (
              <TableRow key={i.id}>
                <TableCell>
                  <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${severityColor[i.severity]}`}>{i.severity}</span>
                </TableCell>
                <TableCell className="font-medium">{i.title}</TableCell>
                <TableCell>{i.kind}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {i.reasons.map((r) => (
                      <span key={r} className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{r}</span>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(data.content.find((c) => c.id === i.id)!)}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {issues.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  All content passed the audit. No issues found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <SpiritualEditor
        kind={editing ? editing.kind : "dua"}
        item={editing}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </div>
  )
}
