import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Pencil, Plus, Search, ShieldAlert, Trash2 } from "lucide-react"
import { PageHeader, StatusBadge } from "@/components/gate/ui"
import { useGate } from "@/lib/gate/store"
import { PLATFORM_MAP } from "@/lib/gate/platforms"
import type { UserRecord } from "@/lib/gate/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function UsersPage() {
  const { data, updateUser, removeUser } = useGate()
  const [q, setQ] = useState("")
  const [role, setRole] = useState("all")
  const [editing, setEditing] = useState<UserRecord | null>(null)
  const [open, setOpen] = useState(false)

  const filtered = useMemo(() => {
    return data.users
      .filter((u) =>
        q
          ? u.name.toLowerCase().includes(q.toLowerCase()) ||
            u.email.toLowerCase().includes(q.toLowerCase())
          : true,
      )
      .filter((u) => (role === "all" ? true : u.role === role))
  }, [data.users, q, role])

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage accounts, membership state, roles and account status."
        actions={
          <Button onClick={() => toast.info("Bulk import available via API")}>
            <Plus className="mr-1.5 h-4 w-4" /> Invite User
          </Button>
        }
      />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="analyst">Analyst</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Membership</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Activity</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback style={{ background: u.avatarColor }} className="text-white text-xs">
                        {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{u.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="capitalize">{u.membership}</span>
                  {u.plan && <span className="text-xs text-muted-foreground"> · {u.plan}</span>}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1 text-sm capitalize">
                    {u.role === "admin" && <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />}
                    {u.role}
                  </span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={u.accountStatus} />
                </TableCell>
                <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                  {u.bookmarks} bm · {u.readingHours}h read
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(u); setOpen(true) }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-rose-600"
                      onClick={() => {
                        if (confirm(`Suspend ${u.name}?`)) { removeUser(u.id); toast.success("User removed") }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {editing && (
            <UserForm
              user={editing}
              onSave={(patch) => {
                updateUser(editing.id, patch)
                toast.success("User updated")
                setOpen(false)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function UserForm({ user, onSave }: { user: UserRecord; onSave: (p: Partial<UserRecord>) => void }) {
  const [form, setForm] = useState(user)
  const set = (patch: Partial<UserRecord>) => setForm((f) => ({ ...f, ...patch }))
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs">Name</Label>
        <Input value={form.name} onChange={(e) => set({ name: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Email</Label>
        <Input value={form.email} onChange={(e) => set({ email: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Membership</Label>
          <Select value={form.membership} onValueChange={(v) => set({ membership: v as UserRecord["membership"] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["none", "active", "expired", "lifetime"].map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Role</Label>
          <Select value={form.role} onValueChange={(v) => set({ role: v as UserRecord["role"] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["user", "editor", "analyst", "admin"].map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Account Status</Label>
          <Select value={form.accountStatus} onValueChange={(v) => set({ accountStatus: v as UserRecord["accountStatus"] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["active", "suspended", "pending"].map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 pt-6">
          <Switch checked={form.verified} onCheckedChange={(v) => set({ verified: v })} />
          <span className="text-sm">Verified email</span>
        </div>
      </div>
      <Button className="w-full" onClick={() => onSave(form)}>Save Changes</Button>
    </div>
  )
}
