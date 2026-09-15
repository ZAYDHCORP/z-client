import { SpiritualContentPage } from "@/components/gate/theocentric/spiritual-content-page"

export default function VerificationPage() {
  return (
    <SpiritualContentPage
      title="Verification"
      description="Review pipeline: unverified → under review → verified → requires correction. Filter by status above."
      kinds={["dua", "adkar", "quranic", "rabbana", "ruqiyah"]}
      showKind
      hideAdd
    />
  )
}
