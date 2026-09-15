import { SpiritualContentPage } from "@/components/gate/theocentric/spiritual-content-page"

export default function DraftsPage() {
  return (
    <SpiritualContentPage
      title="Drafts"
      description="All unpublished draft content across every kind."
      kinds={["dua", "adkar", "quranic", "rabbana", "ruqiyah"]}
      predicate={(c) => c.status === "draft"}
      showKind
      hideAdd
    />
  )
}
