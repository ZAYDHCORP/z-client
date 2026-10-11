import { CrudTable } from "@/components/gate/crud-table"
import { useTheo, useTheoLoad } from "@/lib/gate/theocentric/store"
import type { TheoTag } from "@/lib/gate/theocentric/types"

export default function TheoTagsPage() {
  const { data, addTag, updateTag, removeTag, loadMore, hasMore, isLoading } = useTheo()
  useTheoLoad("tags")
  return (
    <CrudTable
      onLoadMore={() => loadMore("tags")}
      hasMore={hasMore("tags")}
      loadingMore={isLoading("tags")}
      title="Tags"
      description="Tags used to group content."
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
