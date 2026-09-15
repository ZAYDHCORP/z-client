import { SpiritualContentPage } from "@/components/gate/theocentric/spiritual-content-page"

export default function MorningAdhkarPage() {
  return (
    <SpiritualContentPage
      title="Morning Adhkars"
      description="Adhkars assigned to the Morning routine."
      kinds={["adkar"]}
      predicate={(c) => c.routines.includes("morning")}
      hideAdd
    />
  )
}
