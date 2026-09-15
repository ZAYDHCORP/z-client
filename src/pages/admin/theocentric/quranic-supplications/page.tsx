import { SpiritualContentPage } from "@/components/gate/theocentric/spiritual-content-page"

export default function QuranicSupplicationsPage() {
  return (
    <SpiritualContentPage
      title="Quranic Reminders"
      description="Verses and supplications sourced directly from the Qur'an with surah and ayah references."
      kinds={["quranic"]}
    />
  )
}
