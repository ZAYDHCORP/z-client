import { CrudTable } from "@/components/gate/crud-table"
import { useTheo } from "@/lib/gate/theocentric/store"
import type { TheoSubcategory } from "@/lib/gate/theocentric/types"

export default function TheoSubcategoriesPage() {
  const { data, addSubcategory, updateSubcategory, removeSubcategory } = useTheo()
  return (
    <CrudTable
      title="Subcategories"
      description="Nest finer groupings under a parent category."
      rows={data.subcategories}
      columns={[
        { header: "Name", cell: (s) => <span className="font-medium">{s.name}</span> },
        {
          header: "Parent",
          cell: (s) => data.categories.find((c) => c.id === s.parent)?.name ?? "—",
        },
        { header: "Order", cell: (s) => s.displayOrder },
        { header: "Hidden", cell: (s) => (s.hidden ? "Yes" : "No") },
        { header: "Archived", cell: (s) => (s.archived ? "Yes" : "No") },
      ]}
      fields={[
        { name: "name", label: "Name", type: "text" },
        {
          name: "parent",
          label: "Parent Category",
          type: "select",
          options: data.categories.map((c) => ({ value: c.id, label: c.name })),
        },
        { name: "slug", label: "Slug", type: "text" },
        { name: "displayOrder", label: "Display Order", type: "number" },
        { name: "hidden", label: "Hidden", type: "switch" },
        { name: "archived", label: "Archived", type: "switch" },
      ]}
      searchKeys={["name", "slug"]}
      newRecord={(): TheoSubcategory => ({
        id: `sub_${Date.now().toString(36)}`,
        name: "",
        parent: data.categories[0]?.id ?? "",
        slug: "",
        displayOrder: data.subcategories.length + 1,
        hidden: false,
        archived: false,
      })}
      onSave={(s) => {
        if (data.subcategories.some((x) => x.id === s.id)) updateSubcategory(s.id, s)
        else addSubcategory(s)
      }}
      onDelete={(id) => removeSubcategory(id)}
    />
  )
}
