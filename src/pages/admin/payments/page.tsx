import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Download, IndianRupee } from "lucide-react"
import { PageHeader, StatCard, StatusBadge } from "@/components/gate/ui"
import { describeError, useGate } from "@/lib/gate/store"
import { adminApi } from "@/lib/gate/adminApi"
import { normalizePayment } from "@/lib/gate/billing"
import type { PaymentRecord } from "@/lib/gate/types"
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

/**
 * Read-only reporting. Filters (status / user name search) are applied by the
 * server so paging stays correct; the page never creates orders or touches the
 * payment gateway.
 */
export default function PaymentsPage() {
  const { data, ensurePaymentsLoaded } = useGate()
  const stats = data.paymentStats

  const [q, setQ] = useState("")
  const [status, setStatus] = useState("all")
  const [rows, setRows] = useState<PaymentRecord[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const requestId = useRef(0)

  useEffect(() => {
    ensurePaymentsLoaded()
  }, [ensurePaymentsLoaded])

  const fetchPage = useCallback(async (nextPage: number, query: string, st: string) => {
    const id = ++requestId.current
    setLoading(true)
    try {
      const res = await adminApi.memberships.payments.list<Record<string, unknown>>(nextPage, {
        status: st,
        q: query.trim() || undefined,
      })
      if (id !== requestId.current) return // a newer filter superseded this request
      const items = res.items.map(normalizePayment)
      setRows((cur) => (nextPage > 1 ? [...cur, ...items] : items))
      setPage(nextPage)
      setHasMore(res.hasMore)
    } catch (err) {
      if (id !== requestId.current) return
      toast.error(describeError(err) ?? "Could not load payments from the server.")
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [])

  // Re-query from page 1 whenever a filter changes (search is debounced).
  useEffect(() => {
    const t = setTimeout(() => void fetchPage(1, q, status), q ? 350 : 0)
    return () => clearTimeout(t)
  }, [q, status, fetchPage])

  const exportCsv = () => {
    if (rows.length === 0) return toast.info("Nothing to export")
    const head = ["Reference", "User", "Plan", "Amount", "Currency", "Method", "Status", "Date"]
    const lines = rows.map((p) =>
      [p.transactionRef, p.userName, p.plan, p.amount, p.currency, p.method, p.status, p.createdAt]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    )
    const url = URL.createObjectURL(new Blob([[head.join(","), ...lines].join("\n")], { type: "text/csv" }))
    const a = document.createElement("a")
    a.href = url
    a.download = "payments.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <PageHeader
        title="Payments"
        description="Transactions, refunds and revenue."
        actions={<Button variant="outline" onClick={exportCsv}><Download className="mr-1.5 h-4 w-4" /> Export</Button>}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total Revenue" value={stats ? "₹" + stats.totalRevenue.toLocaleString("en-IN") : "—"} icon={<IndianRupee className="h-4 w-4" />} accent="#10b981" />
        <StatCard label="Successful" value={stats?.successful ?? "—"} delta="verified" accent="#0ea5e9" />
        <StatCard label="Pending" value={stats?.pending ?? "—"} accent="#f59e0b" />
        <StatCard label="Failed / Refunded" value={stats ? `${stats.failed} / ${stats.refunded}` : "—"} accent="#ec4899" />
      </div>

      <div className="mt-6 mb-4 flex flex-col gap-3 sm:flex-row">
        <Input placeholder="Search by user name…" value={q} onChange={(e) => setQ(e.target.value)} className="sm:max-w-xs" />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {["success", "pending", "failed", "refunded"].map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="gate-surface overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-xs">{p.transactionRef}</TableCell>
                <TableCell>{p.userName}</TableCell>
                <TableCell>
                  {p.plan}
                  {p.membershipType === "lifetime" && <span className="ml-1 text-xs text-muted-foreground">(lifetime)</span>}
                </TableCell>
                <TableCell className="tabular-nums">
                  {p.currency === "INR" ? "₹" : `${p.currency} `}
                  {p.amount.toLocaleString()}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{p.method}</TableCell>
                <TableCell><StatusBadge status={p.status} /></TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  {loading ? "Loading payments…" : "No payments found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {hasMore && (
        <div className="mt-3 flex justify-center">
          <Button variant="outline" size="sm" disabled={loading} onClick={() => void fetchPage(page + 1, q, status)}>
            {loading ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}
    </div>
  )
}
