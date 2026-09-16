import { useEffect, useMemo, useState } from "react"
import { Search } from "lucide-react"
import { PageHeader, StatusBadge } from "@/components/gate/ui"
import { useGate } from "@/lib/gate/store"
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
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AuditLogsPage() {
  const { data, ensureAuditLogsLoaded, loadMore, hasMore, isResourceLoading } = useGate()

  useEffect(() => {
    ensureAuditLogsLoaded()
  }, [ensureAuditLogsLoaded])

  const [q, setQ] = useState("")
  const [result, setResult] = useState("all")

  const filtered = useMemo(
    () =>
      data.auditLogs
        .filter((a) => (result === "all" ? true : a.result === result))
        .filter((a) =>
          q
            ? a.actor.toLowerCase().includes(q.toLowerCase()) ||
              a.action.toLowerCase().includes(q.toLowerCase()) ||
              a.resource.toLowerCase().includes(q.toLowerCase()) ||
              a.detail.toLowerCase().includes(q.toLowerCase())
            : true,
        ),
    [data.auditLogs, q, result],
  )

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        description="Immutable record of every administrative action across content, users, payments, RSS, backups and security."
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search actor, action, resource…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Select value={result} onValueChange={setResult}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Results</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failure">Failure</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Actor</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>When</TableHead>
                <TableHead>Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="text-sm font-medium">{a.actor}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{a.role}</TableCell>
                  <TableCell className="text-sm">{a.action}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{a.resource}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{a.ip}</TableCell>
                  <TableCell><StatusBadge status={a.result} /></TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{new Date(a.timestamp).toLocaleString()}</TableCell>
                  <TableCell className="max-w-xs text-xs text-muted-foreground">{a.detail}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">No audit entries found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {hasMore("auditLogs") && !q && result === "all" && (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={() => loadMore("auditLogs")} disabled={isResourceLoading("auditLogs")}>
            {isResourceLoading("auditLogs") ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}
    </div>
  )
}
