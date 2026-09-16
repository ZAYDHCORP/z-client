import { toast } from "sonner"
import { HardDrive, Plus, RotateCcw, CheckCircle2, ShieldCheck } from "lucide-react"
import { PageHeader, StatusBadge } from "@/components/gate/ui"
import { useGate } from "@/lib/gate/store"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"

export default function BackupsPage() {
  const { data, createBackup, restoreBackup } = useGate()

  return (
    <div>
      <PageHeader
        title="Backups"
        description="Automated and on-demand snapshots of the • Gate database, media and configuration. Restore to any verified point."
        actions={
          <Button onClick={() => { createBackup(); toast.success("Backup created") }}>
            <Plus className="mr-1.5 h-4 w-4" /> Create Backup
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><CardContent className="space-y-1 p-4">
          <p className="text-2xl font-semibold">{data.backups.length}</p>
          <p className="text-xs text-muted-foreground">Total snapshots</p>
        </CardContent></Card>
        <Card><CardContent className="space-y-1 p-4">
          <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">{data.backups.filter((b) => b.verified).length}</p>
          <p className="text-xs text-muted-foreground">Verified</p>
        </CardContent></Card>
        <Card><CardContent className="space-y-1 p-4">
          <p className="text-2xl font-semibold">{data.backups.filter((b) => b.status === "completed").length}</p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </CardContent></Card>
        <Card><CardContent className="space-y-1 p-4">
          <p className="text-2xl font-semibold">{Math.round(data.backups.reduce((s, b) => s + b.sizeMB, 0) / 1024)} GB</p>
          <p className="text-xs text-muted-foreground">Stored</p>
        </CardContent></Card>
      </div>

      <Card className="mt-4">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Created</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.backups.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="flex items-center gap-2 font-medium"><HardDrive className="h-4 w-4 text-muted-foreground" /> {b.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{b.type}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{b.sizeMB} MB</TableCell>
                  <TableCell><StatusBadge status={b.status} /></TableCell>
                  <TableCell>
                    {b.verified ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="h-3.5 w-3.5" /> Verified</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{new Date(b.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <Button size="sm" variant="outline" onClick={() => { restoreBackup(b.id); toast.success("Restore initiated") }}>
                        <RotateCcw className="mr-1 h-3.5 w-3.5" /> Restore
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5" /> Backups are encrypted at rest and retained for 35 days with daily verification.
      </p>
    </div>
  )
}
