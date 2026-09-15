import { SpiritualContentPage } from "@/components/gate/theocentric/spiritual-content-page"

export default function PublishedPage() {
  return (
    <SpiritualContentPage
      title="Published"
      description="Live content visible to users across every kind."
      kinds={["dua", "adkar", "quranic", "rabbana", "ruqiyah"]}
      predicate={(c) => c.status === "published"}
      showKind
      hideAdd
    />
  )
}
