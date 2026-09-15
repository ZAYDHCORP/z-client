import { CrudTable } from "@/components/gate/crud-table"
import { StatusBadge } from "@/components/gate/ui"
import { useGate } from "@/lib/gate/store"
import { PLATFORMS } from "@/lib/gate/platforms"
import type { Category } from "@/lib/gate/types"

const platformOpts = [
  { value: "ALL", label: "All Platforms" },
  ...PLATFORMS.map((p) => ({ value: p.id, label: p.name })),
]

export default function CategoriesPage() {
  const { data, addCategory, updateCategory, removeCategory } = useGate()
  return (
    <CrudTable
      title="Categories"
      description="Dynamic taxonomy. Create unlimited categories per platform with ordering and status."
      rows={data.categories}
      searchKeys={["name", "slug"]}
      newRecord={(): Category => ({
        id: `cat_${Date.now().toString(36)}`,
        platform: "IPN",
        name: "",
        slug: "",
        description: "",
        displayOrder: data.categories.length + 1,
        status: "active",
        icon: "folder",
        contentCount: 0,
      })}
      onSave={(item) => {
        const exists = data.categories.find((c) => c.id === item.id)
        if (exists) updateCategory(item.id, item)
        else addCategory(item)
      }}
      onDelete={removeCategory}
      addLabel="New Category"
      dialogTitle="Category"
      fields={[
        { name: "name", label: "Category Name", type: "text", placeholder: "e.g. Climate Policy" },
        { name: "slug", label: "Slug", type: "text" },
        { name: "platform", label: "Platform", type: "select", options: platformOpts },
        { name: "description", label: "Description", type: "textarea" },
        { name: "displayOrder", label: "Display Order", type: "number" },
        { name: "status", label: "Status", type: "select", options: [{ value: "active", label: "Active" }, { value: "archived", label: "Archived" }] },
      ]}
      columns={[
        { header: "Name", cell: (r) => <span className="font-medium">{r.name}</span> },
        { header: "Platform", cell: (r) => r.platform },
        { header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
        { header: "Order", cell: (r) => <span className="tabular-nums">{r.displayOrder}</span> },
        { header: "Content", cell: (r) => <span className="text-muted-foreground">{r.contentCount}</span> },
      ]}
    />
  )
}
