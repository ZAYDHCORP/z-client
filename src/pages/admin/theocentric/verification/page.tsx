import { SpiritualContentPage } from "@/components/gate/theocentric/spiritual-content-page"

export default function VerificationPage() {
  return (
    <SpiritualContentPage
      title="Verification"
      description="Review content before it can be published."
      kinds={["dua", "adkar", "quranic", "rabbana", "ruqiyah"]}
      showKind
      hideAdd
    />
  )
}
