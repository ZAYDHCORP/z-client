import { useEffect } from "react"
import { CrudTable } from "@/components/gate/crud-table"
import { useGate } from "@/lib/gate/store"
import { PLATFORMS } from "@/lib/gate/platforms"
import type { Tag, Region, Topic } from "@/lib/gate/types"

const platformOpts = [
  { value: "ALL", label: "All Platforms" },
  ...PLATFORMS.map((p) => ({ value: p.id, label: p.name })),
]

export default function TagsPage() {
  const { data, addTag, updateTag, removeTag, ensureTagsLoaded, loadMore, hasMore, isResourceLoading } = useGate()

  useEffect(() => {
    ensureTagsLoaded()
  }, [ensureTagsLoaded])

  return (
    <CrudTable
      onLoadMore={() => loadMore("tags")}
      hasMore={hasMore("tags")}
      loadingMore={isResourceLoading("tags")}
      title="Tags"
      description="Reusable tags attached to content across platforms."
      rows={data.tags}
      searchKeys={["name", "slug"]}
      newRecord={(): Tag => ({ id: `tag_${Date.now().toString(36)}`, name: "", slug: "", usage: 0, platform: "ALL" })}
      onSave={(item) => (data.tags.find((t) => t.id === item.id) ? updateTag(item.id, item) : addTag(item))}
      onDelete={removeTag}
      addLabel="New Tag"
      dialogTitle="Tag"
      fields={[
        { name: "name", label: "Tag", type: "text" },
        { name: "slug", label: "Slug", type: "text" },
        { name: "platform", label: "Platform", type: "select", options: platformOpts },
        { name: "usage", label: "Usage", type: "number", disabled: true },
      ]}
      columns={[
        { header: "Tag", cell: (r) => <span className="font-medium">#{r.name}</span> },
        { header: "Slug", cell: (r) => r.slug },
        { header: "Platform", cell: (r) => r.platform },
        { header: "Usage", cell: (r) => <span className="text-muted-foreground">{r.usage}</span> },
      ]}
    />
  )
}
