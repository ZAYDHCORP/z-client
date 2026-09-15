import { SpiritualContentPage } from "@/components/gate/theocentric/spiritual-content-page"

export default function BeforeSleepPage() {
  return (
    <SpiritualContentPage
      title="Before Sleep"
      description="Adhkars and supplications assigned to the Before Sleep routine."
      kinds={["adkar"]}
      predicate={(c) => c.routines.includes("before_sleep")}
      hideAdd
    />
  )
}
