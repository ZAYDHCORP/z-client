import { PageHeader } from "@/components/gate/ui"
import { ContentTable } from "@/components/gate/content-table"

export default function InfographicsPage() {
  return (
    <div>
      <PageHeader
        title="Infographics"
        description="Create and publish infographics."
      />
      <ContentTable type="infographic" />
    </div>
  )
}
