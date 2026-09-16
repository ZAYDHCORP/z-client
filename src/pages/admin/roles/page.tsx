import { useEffect, useMemo } from "react"
import { Shield, Check, Minus } from "lucide-react"
import { PageHeader, StatusBadge } from "@/components/gate/ui"
import { useGate } from "@/lib/gate/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const ROLES = ["Super Admin", "Admin", "Editor", "Content Manager", "Analyst"] as const

const CAPABILITIES: { label: string; access: Record<(typeof ROLES)[number], boolean> }[] = [
  { label: "View dashboard", access: { "Super Admin": true, Admin: true, Editor: true, "Content Manager": true, Analyst: true } },
  { label: "Create / edit content", access: { "Super Admin": true, Admin: true, Editor: true, "Content Manager": true, Analyst: false } },
  { label: "Publish / unpublish", access: { "Super Admin": true, Admin: true, Editor: true, "Content Manager": false, Analyst: false } },
  { label: "Manage users & memberships", access: { "Super Admin": true, Admin: true, Editor: false, "Content Manager": false, Analyst: false } },
  { label: "Manage payments", access: { "Super Admin": true, Admin: true, Editor: false, "Content Manager": false, Analyst: false } },
  { label: "Manage services & links", access: { "Super Admin": true, Admin: true, Editor: true, "Content Manager": true, Analyst: false } },
  { label: "Manage taxonomy", access: { "Super Admin": true, Admin: true, Editor: true, "Content Manager": true, Analyst: false } },
  { label: "Manage RSS & media", access: { "Super Admin": true, Admin: true, Editor: true, "Content Manager": true, Analyst: false } },
  { label: "View analytics", access: { "Super Admin": true, Admin: true, Editor: true, "Content Manager": true, Analyst: true } },
  { label: "Manage API keys & backups", access: { "Super Admin": true, Admin: true, Editor: false, "Content Manager": false, Analyst: false } },
  { label: "Manage settings & security", access: { "Super Admin": true, Admin: false, Editor: false, "Content Manager": false, Analyst: false } },
  { label: "View audit logs", access: { "Super Admin": true, Admin: true, Editor: false, "Content Manager": false, Analyst: true } },
]

export default function RolesPage() {
  const { data, ensureUsersLoaded } = useGate()

  useEffect(() => {
    ensureUsersLoaded()
  }, [ensureUsersLoaded])

  const counts = useMemo(() => {
    const map: Record<string, number> = {}
    for (const u of data.users) map[u.role] = (map[u.role] ?? 0) + 1
    return map
  }, [data.users])

  return (
    <div>
      <PageHeader
        title="Roles & Permissions"
        description="Role-based access control across the • Gate admin. Assign roles from the Users page; capabilities are enforced here."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {ROLES.map((r) => (
          <Card key={r}>
            <CardContent className="space-y-1 p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">{r}</p>
              </div>
              <p className="text-2xl font-semibold">{counts[r.toLowerCase()] ?? 0}</p>
              <p className="text-xs text-muted-foreground">users</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-4">
        <CardHeader><CardTitle className="text-base">Capability Matrix</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Capability</TableHead>
                {ROLES.map((r) => <TableHead key={r} className="text-center">{r}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {CAPABILITIES.map((cap) => (
                <TableRow key={cap.label}>
                  <TableCell className="font-medium">{cap.label}</TableCell>
                  {ROLES.map((r) => (
                    <TableCell key={r} className="text-center">
                      {cap.access[r] ? (
                        <Check className="mx-auto h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Minus className="mx-auto h-4 w-4 text-muted-foreground/50" />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader><CardTitle className="text-base">Active Admins</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {data.users
            .filter((u) => u.role !== "user")
            .map((u) => (
              <div key={u.id} className="flex items-center justify-between rounded-lg border border-border p-2.5">
                <span className="text-sm font-medium">{u.name}</span>
                <span className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground capitalize">{u.role}</span>
                  <StatusBadge status={u.accountStatus} />
                </span>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  )
}
