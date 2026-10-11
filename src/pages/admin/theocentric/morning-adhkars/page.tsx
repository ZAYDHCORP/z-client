import { SpiritualContentPage } from "@/components/gate/theocentric/spiritual-content-page"

export default function MorningAdhkarPage() {
  return (
    <SpiritualContentPage
      title="Morning Adhkars"
      description="Adhkars for the morning."
      kinds={["adkar"]}
      filters={{ routine: "morning" }}
      predicate={(c) => c.routines.includes("morning")}
      hideAdd
    />
  )
}
