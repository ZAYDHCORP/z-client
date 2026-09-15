import { CrudTable } from "@/components/gate/crud-table"
import { StatusBadge } from "@/components/gate/ui"
import { useTheo } from "@/lib/gate/theocentric/store"
import type { PublicationStatus, TheoCategory } from "@/lib/gate/theocentric/types"

const statusOpts: { value: PublicationStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "unpublished", label: "Unpublished" },
  { value: "archived", label: "Archived" },
]

export default function TheoCategoriesPage() {
  const { data, addCategory, updateCategory, removeCategory } = useTheo()
  return (
    <CrudTable
      title="Categories"
      description="Top-level spiritual categories. Add new ones anytime — the CMS is dynamic."
      rows={data.categories}
      columns={[
        {
          header: "Name",
          cell: (c) => (
            <div className="flex items-center gap-2">
              {c.icon ? (
                c.icon.startsWith("data:") || c.icon.startsWith("http") ? (
                  <img src={c.icon} alt="" className="h-7 w-7 rounded-md object-contain" />
                ) : (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-primary/10 text-sm leading-none">
                    {c.icon}
                  </span>
                )
              ) : null}
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.slug}</p>
              </div>
            </div>
          ),
        },
        { header: "Description", cell: (c) => <span className="text-sm text-muted-foreground">{c.description || "—"}</span> },
        { header: "Order", cell: (c) => c.displayOrder },
        { header: "Visible", cell: (c) => (c.visibility ? "Yes" : "No") },
        { header: "Status", cell: (c) => <StatusBadge status={c.status} /> },
      ]}
      fields={[
        { name: "name", label: "Name", type: "text" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "icon", label: "Icon", type: "icon" },
        { name: "slug", label: "Slug", type: "text" },
        { name: "displayOrder", label: "Display Order", type: "number" },
        { name: "visibility", label: "Visible", type: "switch" },
        { name: "status", label: "Status", type: "select", options: statusOpts },
      ]}
      searchKeys={["name", "description", "slug"]}
      newRecord={(): TheoCategory => ({
        id: `cat_${Date.now().toString(36)}`,
        name: "",
        description: "",
        icon: "",
        slug: "",
        parent: null,
        displayOrder: data.categories.length + 1,
        visibility: true,
        status: "published",
      })}
      onSave={(c) => {
        if (data.categories.some((x) => x.id === c.id)) updateCategory(c.id, c)
        else addCategory(c)
      }}
      onDelete={(id) => removeCategory(id)}
    />
  )
}
