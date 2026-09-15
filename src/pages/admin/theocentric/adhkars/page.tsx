import { SpiritualContentPage } from "@/components/gate/theocentric/spiritual-content-page"

export default function AdhkarsPage() {
  return (
    <SpiritualContentPage
      title="Adhkars"
      description="Remembrances and dhikr. Assign to routines (morning, evening, after salah, before sleep)."
      kinds={["adkar"]}
    />
  )
}
