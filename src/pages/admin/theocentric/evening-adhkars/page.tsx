import { SpiritualContentPage } from "@/components/gate/theocentric/spiritual-content-page"

export default function EveningAdhkarPage() {
  return (
    <SpiritualContentPage
      title="Evening Adhkars"
      description="Adhkars for the evening."
      kinds={["adkar"]}
      filters={{ routine: "evening" }}
      predicate={(c) => c.routines.includes("evening")}
      hideAdd
    />
  )
}
