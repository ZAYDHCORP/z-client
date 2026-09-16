import { useEffect, useMemo } from "react"
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { GraduationCap, BookOpen, Headphones, Flame } from "lucide-react"
import { PageHeader, StatCard, PlatformPill } from "@/components/gate/ui"
import { useGate } from "@/lib/gate/store"
import { PLATFORMS } from "@/lib/gate/platforms"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function LearningAnalyticsPage() {
  const { data, ensureUsersLoaded } = useGate()

  useEffect(() => {
    ensureUsersLoaded()
  }, [ensureUsersLoaded])

  const users = data.users

  const totals = useMemo(() => {
    const reading = users.reduce((s, u) => s + u.readingHours, 0)
    const listening = users.reduce((s, u) => s + u.listeningHours, 0)
    return { reading, listening, total: reading + listening }
  }, [users])

  const perPlatform = useMemo(
    () =>
      PLATFORMS.map((p) => {
        const u = users.filter((x) => x.followedCategories.some((c) => c.startsWith(p.id)))
        return {
          name: p.name,
          hours: u.reduce((s, x) => s + x.readingHours + x.listeningHours, 0),
          color: p.color,
        }
      }),
    [users],
  )

  const top = useMemo(
    () =>
      [...users]
        .map((u) => ({ ...u, hours: u.readingHours + u.listeningHours }))
        .sort((a, b) => b.hours - a.hours)
        .slice(0, 8),
    [users],
  )

  const avgStreak = 3.4

  return (
    <div>
      <PageHeader
        title="Learning Analytics"
        description="Reading and listening engagement, streaks and learning progress across the • Gate libraries."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Reading Hours" value={totals.reading.toFixed(0)} icon={<BookOpen className="h-4 w-4" />} accent="#10b981" />
        <StatCard label="Total Listening Hours" value={totals.listening.toFixed(0)} icon={<Headphones className="h-4 w-4" />} accent="#8b5cf6" />
        <StatCard label="Learning Hours" value={totals.total.toFixed(0)} icon={<GraduationCap className="h-4 w-4" />} accent="#0ea5e9" />
        <StatCard label="Avg Streak" value={`${avgStreak} days`} icon={<Flame className="h-4 w-4" />} accent="#f59e0b" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Learning Hours by Platform</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={perPlatform}>
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                  {perPlatform.map((p) => <Cell key={p.name} fill={p.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Reading vs Listening</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={[{ name: "Mix", reading: totals.reading, listening: totals.listening }]}>
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="reading" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="listening" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader><CardTitle className="text-base">Top Learners</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Reading (h)</TableHead>
                <TableHead>Listening (h)</TableHead>
                <TableHead>Total (h)</TableHead>
                <TableHead>Streak</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {top.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-muted-foreground">{u.plan ?? "—"}</TableCell>
                  <TableCell>{u.readingHours}</TableCell>
                  <TableCell>{u.listeningHours}</TableCell>
                  <TableCell className="font-medium">{u.hours}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400"><Flame className="h-3.5 w-3.5" /> {Math.max(1, Math.round(u.hours / 7))}d</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
