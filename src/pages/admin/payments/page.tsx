import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Download, IndianRupee } from "lucide-react"
import { PageHeader, StatCard, StatusBadge } from "@/components/gate/ui"
import { useGate } from "@/lib/gate/store"
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

export default function PaymentsPage() {
  const { data } = useGate()
  const [q, setQ] = useState("")
  const [status, setStatus] = useState("all")

  const filtered = useMemo(() => {
    return data.payments
      .filter((p) => (status === "all" ? true : p.status === status))
      .filter((p) =>
        q ? p.userName.toLowerCase().includes(q.toLowerCase()) || p.transactionRef.includes(q) : true,
      )
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [data.payments, q, status])

  const totalRev = data.payments.filter((p) => p.status === "success").reduce((s, p) => s + p.amount, 0)
  const failed = data.payments.filter((p) => p.status === "failed").length
  const refunded = data.payments.filter((p) => p.status === "refunded").length
  const pending = data.payments.filter((p) => p.status === "pending").length

  return (
    <div>
      <PageHeader
        title="Payments"
        description="Transactions, successful payments, failures, refunds, renewals and revenue reporting."
        actions={<Button variant="outline" onClick={() => toast.success("Export queued")}><Download className="mr-1.5 h-4 w-4" /> Export</Button>}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Revenue" value={"₹" + totalRev.toLocaleString("en-IN")} icon={<IndianRupee className="h-4 w-4" />} accent="#10b981" />
        <StatCard label="Successful" value={data.payments.filter((p) => p.status === "success").length} delta="verified" accent="#0ea5e9" />
        <StatCard label="Pending" value={pending} accent="#f59e0b" />
        <StatCard label="Failed / Refunded" value={`${failed} / ${refunded}`} accent="#ec4899" />
      </div>

      <div className="mt-6 mb-4 flex flex-col gap-3 sm:flex-row">
        <Input placeholder="Search user or reference…" value={q} onChange={(e) => setQ(e.target.value)} className="sm:max-w-xs" />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {["success", "pending", "failed", "refunded", "cancelled"].map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border bg-card">
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
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-xs">{p.transactionRef}</TableCell>
                <TableCell>{p.userName}</TableCell>
                <TableCell>
                  {p.plan}
                  {p.membershipType === "lifetime" && <span className="ml-1 text-xs text-muted-foreground">(lifetime)</span>}
                </TableCell>
                <TableCell className="tabular-nums">₹{p.amount.toLocaleString()}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{p.method}</TableCell>
                <TableCell><StatusBadge status={p.status} /></TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Successful payment automatically activates the correct membership and unlocks premium access. Failed payments never grant access.
      </p>
    </div>
  )
}
