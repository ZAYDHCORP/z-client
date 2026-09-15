import { SpiritualContentPage } from "@/components/gate/theocentric/spiritual-content-page"

export default function ArchivedPage() {
  return (
    <SpiritualContentPage
      title="Archived"
      description="Archived content retained for records but hidden from users."
      kinds={["dua", "adkar", "quranic", "rabbana", "ruqiyah"]}
      predicate={(c) => c.status === "archived"}
      showKind
      hideAdd
    />
  )
}
