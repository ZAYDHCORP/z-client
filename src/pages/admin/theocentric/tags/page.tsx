import { CrudTable } from "@/components/gate/crud-table"
import { useTheo } from "@/lib/gate/theocentric/store"
import type { TheoTag } from "@/lib/gate/theocentric/types"

export default function TheoTagsPage() {
  const { data, addTag, updateTag, removeTag } = useTheo()
  return (
    <CrudTable
      title="Tags"
      description="Thematic tags applied across content for discovery."
      rows={data.tags}
      columns={[
        { header: "Name", cell: (t) => <span className="font-medium">{t.name}</span> },
        { header: "Slug", cell: (t) => <span className="text-muted-foreground">{t.slug}</span> },
      ]}
      fields={[
        { name: "name", label: "Name", type: "text" },
        { name: "slug", label: "Slug", type: "text" },
      ]}
      searchKeys={["name", "slug"]}
      newRecord={(): TheoTag => ({ id: `tag_${Date.now().toString(36)}`, name: "", slug: "" })}
      onSave={(t) => {
        if (data.tags.some((x) => x.id === t.id)) updateTag(t.id, t)
        else addTag(t)
      }}
      onDelete={(id) => removeTag(id)}
    />
  )
}
