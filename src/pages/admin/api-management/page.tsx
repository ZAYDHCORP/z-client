import { useState } from "react"
import { toast } from "sonner"
import { KeyRound, Plus, Ban, Copy } from "lucide-react"
import { PageHeader, StatusBadge } from "@/components/gate/ui"
import { useGate } from "@/lib/gate/store"
import type { ApiKey } from "@/lib/gate/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

function genKey() {
  const r = () => Math.random().toString(36).slice(2)
  return `gt_live_${r()}${r()}${r()}`
}

export default function ApiManagementPage() {
  const { data, addApiKey, revokeApiKey } = useGate()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: "",
    scope: "read",
    rateLimit: 60,
  })

  function create() {
    if (!form.name.trim()) {
      toast.error("Name required")
      return
    }
    const key: ApiKey = {
      id: `ak_${Date.now().toString(36)}`,
      name: form.name,
      key: genKey(),
      scope: form.scope,
      status: "active",
      lastUsed: "—",
      createdAt: new Date().toISOString(),
      rateLimit: form.rateLimit,
    }
    addApiKey(key)
    toast.success("API key generated")
    setOpen(false)
    setForm({ name: "", scope: "read", rateLimit: 60 })
  }

  function copy(k: string) {
    navigator.clipboard?.writeText(k)
    toast.success("Copied to clipboard")
  }

  return (
    <div>
      <PageHeader
        title="API Management"
        description="Issue and revoke programmatic access keys for the .Gate public API, RSS ingestion and partner integrations."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Generate Key
          </Button>
        }
      />

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Scope</TableHead>
              <TableHead>Rate / min</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Used</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.apiKeys.map((k) => (
              <TableRow key={k.id}>
                <TableCell className="font-medium">{k.name}</TableCell>
                <TableCell>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{k.status === "revoked" ? "••••••••••••••••" : `${k.key.slice(0, 12)}…`}</code>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{k.scope}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{k.rateLimit}</TableCell>
                <TableCell><StatusBadge status={k.status} /></TableCell>
                <TableCell className="text-xs text-muted-foreground">{k.lastUsed}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copy(k.key)} disabled={k.status === "revoked"}><Copy className="h-4 w-4" /></Button>
                    {k.status === "active" && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600" onClick={() => { revokeApiKey(k.id); toast.success("Key revoked") }}><Ban className="h-4 w-4" /></Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Generate API Key</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Name</Label>
              <Input value={form.name} placeholder="Mobile App" onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Scope</Label>
              <Select value={form.scope} onValueChange={(v) => setForm({ ...form, scope: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="read">read</SelectItem>
                  <SelectItem value="write">write</SelectItem>
                  <SelectItem value="admin">admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Rate Limit (req/min)</Label>
              <Input type="number" value={form.rateLimit} onChange={(e) => setForm({ ...form, rateLimit: Number(e.target.value) })} />
            </div>
            <Button className="w-full" onClick={create}>Generate</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
