import { SpiritualContentPage } from "@/components/gate/theocentric/spiritual-content-page"

export default function BeforeSleepPage() {
  return (
    <SpiritualContentPage
      title="Before Sleep"
      description="Adhkars for before sleep."
      kinds={["adkar"]}
      filters={{ routine: "before_sleep" }}
      predicate={(c) => c.routines.includes("before_sleep")}
      hideAdd
    />
  )
}
