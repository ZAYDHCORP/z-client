import { PageHeader } from "@/components/gate/ui"
import { ContentTable } from "@/components/gate/content-table"

export default function InfographicsPage() {
  return (
    <div>
      <PageHeader
        title="Infographics"
        description="Instagram / Pinterest style publishing with fixed 4:5 uploads, captions, categories and feed placement."
      />
      <ContentTable type="infographic" />
    </div>
  )
}
