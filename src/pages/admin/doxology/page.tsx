import { Users, Bell, CheckCircle2, Clock } from "lucide-react"
import { PageHeader, StatCard, SectionTitle } from "@/components/gate/ui"
import { UserTable } from "@/components/gate/doxology/user-table"
import { COMPULSORY } from "@/lib/gate/doxology/types"
import { useDoxology } from "@/lib/gate/doxology/store"

export default function DoxologyDashboard() {
  const { data } = useDoxology()
  const total = data.users.length
  const enrolled = data.users.filter((u) => u.enrolled).length
  const alarmsOn = data.users.reduce(
    (n, u) => n + (Object.values(u.alarmSettings) as { enabled: boolean }[]).filter((a) => a.enabled).length,
    0,
  )
  const allDone = data.users.filter((u) => u.enrolled && COMPULSORY.every((c) => u.completionToday[c.key])).length
  const missed = data.users.filter((u) => u.enrolled && COMPULSORY.some((c) => !u.completionToday[c.key])).length
  const compulsoryCount = COMPULSORY.length

  return (
    <div>
      <PageHeader
        title="Doxology Alarms & User Controls"
        description="Manage user alarm settings and compulsory spiritual routines. Completion is auto-recorded from daily activity."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Users" value={total} icon={<Users className="h-4 w-4" />} accent="#7c3aed" />
        <StatCard label="Enrolled" value={enrolled} icon={<CheckCircle2 className="h-4 w-4" />} accent="#059669" />
        <StatCard label="Alarms Enabled" value={alarmsOn} icon={<Bell className="h-4 w-4" />} accent="#2563eb" />
        <StatCard label={`Completed All ${compulsoryCount}`} value={allDone} icon={<Clock className="h-4 w-4" />} accent="#d97706" />
      </div>

      <div className="mt-4 rounded-lg border border-border bg-accent/40 px-4 py-3 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{missed}</span> enrolled users have missed at least one compulsory category today.
        Completion records are <span className="font-medium text-foreground">read-only</span> — admins cannot backfill or modify past/future records.
      </div>

      <div className="mt-6">
        <SectionTitle>Users & Doxology Status</SectionTitle>
        <UserTable users={data.users} />
      </div>
    </div>
  )
}
