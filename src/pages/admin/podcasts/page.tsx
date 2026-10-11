import { PageHeader } from "@/components/gate/ui"
import { ContentTable } from "@/components/gate/content-table"

export default function PodcastsPage() {
  return (
    <div>
      <PageHeader
        title="Podcasts"
        description="Podcast episodes imported from RSS."
      />
      <ContentTable type="podcast" />
    </div>
  )
}
