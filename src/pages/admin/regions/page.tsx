import { CrudTable } from "@/components/gate/crud-table"
import { useGate } from "@/lib/gate/store"
import type { Region } from "@/lib/gate/types"

export default function RegionsPage() {
  const { data, addRegion, updateRegion, removeRegion } = useGate()
  return (
    <CrudTable
      title="Regions"
      description="Regional and international tags for geographic discovery."
      rows={data.regions}
      searchKeys={["name", "slug"]}
      newRecord={(): Region => ({ id: `reg_${Date.now().toString(36)}`, name: "", slug: "", type: "regional", usage: 0 })}
      onSave={(item) => (data.regions.find((r) => r.id === item.id) ? updateRegion(item.id, item) : addRegion(item))}
      onDelete={removeRegion}
      addLabel="New Region"
      dialogTitle="Region"
      fields={[
        { name: "name", label: "Region", type: "text" },
        { name: "slug", label: "Slug", type: "text" },
        { name: "type", label: "Type", type: "select", options: [{ value: "regional", label: "Regional" }, { value: "international", label: "International" }] },
        { name: "usage", label: "Usage", type: "number", disabled: true },
      ]}
      columns={[
        { header: "Region", cell: (r) => <span className="font-medium">{r.name}</span> },
        { header: "Type", cell: (r) => r.type },
        { header: "Usage", cell: (r) => <span className="text-muted-foreground">{r.usage}</span> },
      ]}
    />
  )
}
