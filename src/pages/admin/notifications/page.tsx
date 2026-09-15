import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Bell, Plus, Send, Pencil, Trash2 } from "lucide-react"
import { PageHeader, StatusBadge } from "@/components/gate/ui"
import { useGate } from "@/lib/gate/store"
import { PLATFORMS, PLATFORM_MAP } from "@/lib/gate/platforms"
import type { NotificationRecord } from "@/lib/gate/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function NotificationsPage() {
  const { data, addNotification, updateNotification, removeNotification, sendNotification } = useGate()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<NotificationRecord | null>(null)

  const list = useMemo(() => data.notifications.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [data.notifications])

  function openNew() {
    setForm({
      id: `nt_${Date.now().toString(36)}`,
      type: "book",
      title: "",
      body: "",
      target: "members",
      status: "draft",
      createdAt: new Date().toISOString(),
    })
    setOpen(true)
  }
  function openEdit(n: NotificationRecord) { setForm(n); setOpen(true) }
  function save() {
    if (!form) return
    if (data.notifications.find((n) => n.id === form.id)) updateNotification(form.id, form)
    else addNotification(form)
    toast.success("Notification saved")
    setOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="New books, podcasts, reports, renewals, workshops, certificates and personalised recommendations."
        actions={<Button onClick={openNew}><Plus className="mr-1.5 h-4 w-4" /> Compose</Button>}
      />

      <div className="rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="p-3 font-medium">Title</th>
              <th className="p-3 font-medium">Type</th>
              <th className="p-3 font-medium">Target</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((n) => (
              <tr key={n.id} className="border-b border-border last:border-0">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{n.title}</p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">{n.body}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3">{n.type}</td>
                <td className="p-3">{n.target}</td>
                <td className="p-3"><StatusBadge status={n.status} /></td>
                <td className="p-3">
                  <div className="flex justify-end gap-1">
                    {n.status !== "sent" && (
                      <Button size="sm" variant="outline" onClick={() => { sendNotification(n.id); toast.success("Sent") }}>
                        <Send className="mr-1 h-3.5 w-3.5" /> Send
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(n)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600" onClick={() => { removeNotification(n.id); toast.success("Deleted") }}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Compose Notification</DialogTitle></DialogHeader>
          {form && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Body</Label>
                <Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={3} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as NotificationRecord["type"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["book", "podcast", "research", "infographic", "renewal", "workshop", "certificate", "platform", "featured", "recommendation"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Platform</Label>
                  <Select value={form.platform ?? "ALL"} onValueChange={(v) => setForm({ ...form, platform: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All</SelectItem>
                      {PLATFORMS.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Target</Label>
                  <Select value={form.target} onValueChange={(v) => setForm({ ...form, target: v as NotificationRecord["target"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["all", "members", "free"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full" onClick={save}>Save Notification</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
