import { SpiritualContentPage } from "@/components/gate/theocentric/spiritual-content-page"

export default function EveningAdhkarPage() {
  return (
    <SpiritualContentPage
      title="Evening Adhkars"
      description="Adhkars assigned to the Evening routine."
      kinds={["adkar"]}
      predicate={(c) => c.routines.includes("evening")}
      hideAdd
    />
  )
}
