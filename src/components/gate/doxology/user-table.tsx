import { useState } from "react"
import { Bell } from "lucide-react"
import { StatusBadge } from "@/components/gate/ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
import { useDoxology } from "@/lib/gate/doxology/store"
import {
  ALARM_DEFS,
  COMPULSORY,
  type AlarmType,
  type CompulsoryKey,
  type DoxologyUser,
} from "@/lib/gate/doxology/types"

const SHORT: Record<CompulsoryKey, string> = {
  salah: "Salah",
  tahajjud: "Tahajjud",
  morning_adhkar: "Morning",
  evening_adhkar: "Evening",
  before_sleep: "Sleep",
}

function CompletionChip({ done }: { done: boolean }) {
  return (
    <span
      className={
        done
          ? "inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400"
          : "inline-flex items-center rounded-full bg-rose-500/15 px-2 py-0.5 text-[11px] font-medium text-rose-600 dark:text-rose-400"
      }
    >
      {done ? "Done" : "Missed"}
    </span>
  )
}

function UserAlarmDialog({ user, onClose }: { user: DoxologyUser; onClose: () => void }) {
  const { data, updateUserAlarm, resetUserAlarm, resetUserAlarms, toggleEnrolled } = useDoxology()
  const defaultAudioId = data.audio.find((a) => a.isDefault)?.id ?? null

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[92vh] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="flex shrink-0 flex-row items-center justify-between border-b border-border px-6 py-4 text-left">
          <div>
            <DialogTitle>Alarms — {user.name}</DialogTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Set, enable/disable, or reset reminders. Times are local device time.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={user.enrolled} onCheckedChange={() => toggleEnrolled(user.id)} />
            Enrolled
          </label>
        </DialogHeader>

        <div className="flex-1 space-y-2 overflow-y-auto px-6 py-4">
          {ALARM_DEFS.map((d) => {
            const cfg = user.alarmSettings[d.type]
            return (
              <div key={d.type} className="rounded-lg border border-border p-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="w-36 text-sm font-medium">{d.label}</span>
                  <label className="flex items-center gap-1.5 text-sm">
                    <Switch checked={cfg.enabled} onCheckedChange={(v) => updateUserAlarm(user.id, d.type, { enabled: v })} />
                    {cfg.enabled ? "On" : "Off"}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <Label className="text-xs">Time</Label>
                    <Input
                      type="time"
                      value={cfg.time}
                      disabled={!cfg.enabled}
                      onChange={(e) => updateUserAlarm(user.id, d.type, { time: e.target.value })}
                      className="w-32"
                    />
                  </div>
                  {d.salah && (
                    <label className="flex items-center gap-1.5 text-sm">
                      <Switch checked={cfg.preAlert30} disabled={!cfg.enabled} onCheckedChange={(v) => updateUserAlarm(user.id, d.type, { preAlert30: v })} />
                      30-min pre-alert
                    </label>
                  )}
                  <div className="ml-auto flex items-center gap-1.5">
                    <Label className="text-xs">Audio</Label>
                    <Select
                      value={cfg.audioId ?? defaultAudioId ?? ""}
                      onValueChange={(v) => updateUserAlarm(user.id, d.type, { audioId: v })}
                    >
                      <SelectTrigger className="w-44"><SelectValue placeholder="No audio" /></SelectTrigger>
                      <SelectContent>
                        {data.audio.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.name}
                            {a.isDefault ? " (Default)" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">{d.note}</span>
                  <Button size="sm" variant="ghost" className="text-xs" onClick={() => resetUserAlarm(user.id, d.type)}>
                    Reset to default
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex shrink-0 items-center justify-between border-t border-border px-6 py-4">
          <Button variant="outline" onClick={() => resetUserAlarms(user.id)}>
            Reset all to defaults
          </Button>
          <Button onClick={onClose}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function UserTable({ users }: { users: DoxologyUser[] }) {
  const { data } = useDoxology()
  const [editingId, setEditingId] = useState<string | null>(null)
  const editing = users.find((u) => u.id === editingId) ?? data.users.find((u) => u.id === editingId) ?? null

  return (
    <div>
      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Enrolled</TableHead>
              <TableHead>Compulsory Today</TableHead>
              <TableHead>Alarms</TableHead>
              <TableHead className="w-16 text-right">Manage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => {
              const enabledCount = (Object.values(u.alarmSettings) as { enabled: boolean }[]).filter((a) => a.enabled).length
              return (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {u.initials}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{u.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {u.enrolled ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">Enrolled</span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-zinc-500/15 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-300">Not enrolled</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {COMPULSORY.map((c) => (
                        <span key={c.key} title={c.label} className="inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[11px]">
                          {SHORT[c.key]}
                          <CompletionChip done={u.completionToday[c.key]} />
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">{enabledCount}/9 on</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <Button size="sm" variant="outline" onClick={() => setEditingId(u.id)}>
                        <Bell className="mr-1.5 h-3.5 w-3.5" /> Alarms
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {editing && <UserAlarmDialog user={editing} onClose={() => setEditingId(null)} />}
    </div>
  )
}
