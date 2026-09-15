import { PageHeader } from "@/components/gate/ui"
import { ContentTable } from "@/components/gate/content-table"

export default function PodcastsPage() {
  return (
    <div>
      <PageHeader
        title="Podcasts"
        description="RSS-synced episodes with actual audio URLs, artwork, metadata and publishing controls."
      />
      <ContentTable type="podcast" />
    </div>
  )
}
