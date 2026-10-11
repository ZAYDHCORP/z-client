import { SpiritualContentPage } from "@/components/gate/theocentric/spiritual-content-page"

export default function FeaturedPage() {
  return (
    <SpiritualContentPage
      title="Featured Content"
      description="Content promoted in featured slots."
      kinds={["dua", "adkar", "quranic", "rabbana", "ruqiyah"]}
      predicate={(c) => c.featured}
      showKind
      hideAdd
    />
  )
}
