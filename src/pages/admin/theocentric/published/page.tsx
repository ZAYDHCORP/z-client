import { SpiritualContentPage } from "@/components/gate/theocentric/spiritual-content-page"

export default function PublishedPage() {
  return (
    <SpiritualContentPage
      title="Published"
      description="Content that is live for users."
      kinds={["dua", "adkar", "quranic", "rabbana", "ruqiyah"]}
      filters={{ status: "published" }}
      predicate={(c) => c.status === "published"}
      showKind
      hideAdd
    />
  )
}
