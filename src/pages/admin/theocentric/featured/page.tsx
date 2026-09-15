import { SpiritualContentPage } from "@/components/gate/theocentric/spiritual-content-page"

export default function FeaturedPage() {
  return (
    <SpiritualContentPage
      title="Featured Content"
      description="Content promoted in featured slots across the user experience. Toggle the star on any item to feature or unfeature."
      kinds={["dua", "adkar", "quranic", "rabbana", "ruqiyah"]}
      predicate={(c) => c.featured}
      showKind
      hideAdd
    />
  )
}
