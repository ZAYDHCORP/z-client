import { PageHeader } from "@/components/gate/ui"
import { ContentTable } from "@/components/gate/content-table"

export default function ResearchPage() {
  return (
    <div>
      <PageHeader
        title="Research Reports"
        description="Publish research reports with 16:25 covers, PDF, metadata and Google Play Books links."
      />
      <ContentTable type="research" />
    </div>
  )
}
