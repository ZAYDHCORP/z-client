import { useState } from "react"
import { Search } from "lucide-react"
import { PageHeader } from "@/components/gate/ui"
import { Input } from "@/components/ui/input"
import { UserTable } from "@/components/gate/doxology/user-table"
import { useDoxology } from "@/lib/gate/doxology/store"

export default function DoxologyUsersPage() {
  const { data } = useDoxology()
  const [q, setQ] = useState("")
  const filtered = q.trim()
    ? data.users.filter(
        (u) =>
          u.name.toLowerCase().includes(q.toLowerCase()) ||
          u.email.toLowerCase().includes(q.toLowerCase()),
      )
    : data.users

  return (
    <div>
      <PageHeader
        title="Users"
        description="View each user's Doxology status, 4 compulsory categories, and manage their alarms."
      />
      <div className="relative mb-4 max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search users…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
      </div>
      <UserTable users={filtered} />
    </div>
  )
}
