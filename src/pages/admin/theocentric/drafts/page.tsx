import { SpiritualContentPage } from "@/components/gate/theocentric/spiritual-content-page"

export default function DraftsPage() {
  return (
    <SpiritualContentPage
      title="Drafts"
      description="Content that isn't published yet."
      kinds={["dua", "adkar", "quranic", "rabbana", "ruqiyah"]}
      filters={{ status: "draft" }}
      predicate={(c) => c.status === "draft"}
      showKind
      hideAdd
    />
  )
}
