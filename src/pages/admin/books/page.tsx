import { PageHeader } from "@/components/gate/ui"
import { ContentTable } from "@/components/gate/content-table"

export default function BooksPage() {
  return (
    <div>
      <PageHeader
        title="Books"
        description="Publish books with 16:25 covers, PDF, metadata, purchase & affiliate links and Free Sample reader."
      />
      <ContentTable type="book" />
    </div>
  )
}
