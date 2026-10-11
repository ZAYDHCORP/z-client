import { PageHeader } from "@/components/gate/ui"
import { ContentTable } from "@/components/gate/content-table"

export default function BooksPage() {
  return (
    <div>
      <PageHeader
        title="Books"
        description="Publish books with covers, files and links."
      />
      <ContentTable type="book" />
    </div>
  )
}
