import { useEffect } from "react"
import { CrudTable } from "@/components/gate/crud-table"
import { useGate } from "@/lib/gate/store"
import type { Topic } from "@/lib/gate/types"

export default function TopicsPage() {
  const { data, addTopic, updateTopic, removeTopic, ensureTopicsLoaded, loadMore, hasMore, isResourceLoading } = useGate()

  useEffect(() => {
    ensureTopicsLoaded()
  }, [ensureTopicsLoaded])

  return (
    <CrudTable
      onLoadMore={() => loadMore("topics")}
      hasMore={hasMore("topics")}
      loadingMore={isResourceLoading("topics")}
      title="Topics"
      description="Topical metadata used for discovery and recommendations."
      rows={data.topics}
      searchKeys={["name", "slug"]}
      newRecord={() => ({ id: `topic_${Date.now().toString(36)}`, name: "", slug: "", usage: 0 })}
      onSave={(item) => (data.topics.find((t) => t.id === item.id) ? updateTopic(item.id, item) : addTopic(item))}
      onDelete={removeTopic}
      addLabel="New Topic"
      dialogTitle="Topic"
      fields={[
        { name: "name", label: "Topic", type: "text" },
        { name: "slug", label: "Slug", type: "text" },
        { name: "usage", label: "Usage", type: "number", disabled: true },
      ]}
      columns={[
        { header: "Topic", cell: (r) => <span className="font-medium">{r.name}</span> },
        { header: "Slug", cell: (r) => r.slug },
        { header: "Usage", cell: (r) => <span className="text-muted-foreground">{r.usage}</span> },
      ]}
    />
  )
}
