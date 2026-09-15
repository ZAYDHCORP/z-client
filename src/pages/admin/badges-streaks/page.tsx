import { CrudTable } from "@/components/gate/crud-table"
import { PageHeader } from "@/components/gate/ui"
import { useGate } from "@/lib/gate/store"
import type { BadgeRule } from "@/lib/gate/types"

export default function BadgesStreaksPage() {
  const { data, addBadge, updateBadge, removeBadge } = useGate()

  return (
    <CrudTable
      title="Badges & Streaks"
      description="Gamification rules that award badges and streaks for learning, reading, podcasts and category milestones."
      columns={[
        { header: "Name", cell: (r) => <span className="font-medium">{r.name}</span> },
        { header: "Type", cell: (r) => r.type.replace(/_/g, " ") },
        { header: "Threshold", cell: (r) => r.threshold },
        { header: "Active", cell: (r) => (r.active ? "Yes" : "No") },
      ]}
      fields={[
        { name: "name", label: "Name", type: "text" },
        {
          name: "type",
          label: "Type",
          type: "select",
          options: [
            { value: "daily_streak", label: "Daily Streak" },
            { value: "weekly_streak", label: "Weekly Streak" },
            { value: "monthly_streak", label: "Monthly Streak" },
            { value: "learning", label: "Learning" },
            { value: "reading", label: "Reading" },
            { value: "podcast", label: "Podcast" },
            { value: "research", label: "Research" },
            { value: "category", label: "Category" },
            { value: "anniversary", label: "Anniversary" },
          ],
        },
        { name: "description", label: "Description", type: "textarea" },
        { name: "icon", label: "Icon (lucide name)", type: "text" },
        { name: "threshold", label: "Threshold", type: "number" },
        { name: "active", label: "Active", type: "switch" },
      ]}
      rows={data.badgeRules}
      newRecord={() => ({
        id: `bg_${Date.now().toString(36)}`,
        name: "",
        type: "daily_streak",
        description: "",
        icon: "award",
        active: true,
        threshold: 1,
      } as BadgeRule)}
      onSave={(b) => {
        if (data.badgeRules.find((x) => x.id === b.id)) updateBadge(b.id, b)
        else addBadge(b)
      }}
      onDelete={removeBadge}
      searchKeys={["name", "type", "description"]}
      addLabel="Add Rule"
    />
  )
}
