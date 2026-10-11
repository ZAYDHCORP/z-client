import { toast } from "sonner"
import { CrudTable } from "@/components/gate/crud-table"
import { useTheo, useTheoLoad } from "@/lib/gate/theocentric/store"
import type { Milestone } from "@/lib/gate/theocentric/types"

export default function TheoMilestonesPage() {
  const { data, addMilestone, updateMilestone, removeMilestone, loadMore, hasMore, isLoading } = useTheo()
  useTheoLoad("milestones")

  return (
    <CrudTable
      onLoadMore={() => loadMore("milestones")}
      hasMore={hasMore("milestones")}
      loadingMore={isLoading("milestones")}
      title="Milestones"
      description="Achievements unlocked at a set threshold."
      rows={data.milestones}
      columns={[
        {
          header: "Name",
          cell: (m) => (
            <div>
              <p className="font-medium">{m.name}</p>
              {m.description && <p className="text-xs text-muted-foreground">{m.description}</p>}
            </div>
          ),
        },
        { header: "Threshold", cell: (m) => <span className="tabular-nums">{m.threshold}</span> },
        { header: "Active", cell: (m) => (m.active ? "Yes" : "No") },
      ]}
      fields={[
        { name: "name", label: "Name", type: "text" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "threshold", label: "Threshold (whole number)", type: "number" },
        { name: "active", label: "Active", type: "switch" },
      ]}
      searchKeys={["name", "description"]}
      newRecord={(): Milestone => ({
        id: `ms_${Date.now().toString(36)}`,
        name: "",
        description: "",
        threshold: 10,
        active: true,
      })}
      onSave={(m) => {
        // Server rule: threshold must be a positive whole number.
        if (!m.name.trim() || !Number.isInteger(Number(m.threshold)) || Number(m.threshold) < 1) {
          toast.error("Enter a name and a positive whole-number threshold.")
          return false
        }
        const item = { ...m, threshold: Number(m.threshold) }
        if (data.milestones.some((x) => x.id === item.id)) updateMilestone(item.id, item)
        else addMilestone(item)
      }}
      onDelete={(id) => removeMilestone(id)}
    />
  )
}
