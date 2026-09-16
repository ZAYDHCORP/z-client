import { useEffect } from "react"
import { CrudTable } from "@/components/gate/crud-table"
import { useGate } from "@/lib/gate/store"
import { PLATFORMS } from "@/lib/gate/platforms"
import type { SocialLink } from "@/lib/gate/types"

const platformOpts = [
  { value: "ALL", label: "All / Global" },
  ...PLATFORMS.map((p) => ({ value: p.id, label: p.name })),
]
const typeOpts = [
  "website", "youtube", "spotify", "apple", "instagram", "facebook",
  "linkedin", "x", "whatsapp_community", "whatsapp_channel", "whatsapp_contact", "service_enquiry",
].map((t) => ({ value: t, label: t.replace(/_/g, " ") }))

export default function SocialLinksPage() {
  const { data, addSocialLink, updateSocialLink, removeSocialLink, ensureSocialLinksLoaded, loadMore, hasMore, isResourceLoading } = useGate()

  useEffect(() => {
    ensureSocialLinksLoaded()
  }, [ensureSocialLinksLoaded])

  return (
    <CrudTable
      onLoadMore={() => loadMore("socialLinks")}
      hasMore={hasMore("socialLinks")}
      loadingMore={isResourceLoading("socialLinks")}
      title="Social & External Links"
      description="Manage website, YouTube, Spotify, podcasts, social and WhatsApp links per platform without code changes."
      rows={data.socialLinks}
      searchKeys={["label", "url", "type"]}
      newRecord={(): SocialLink => ({
        id: `sl_${Date.now().toString(36)}`,
        platform: "ALL",
        type: "website",
        label: "",
        url: "",
        displayOrder: data.socialLinks.length + 1,
        active: true,
      })}
      onSave={(item) => (data.socialLinks.find((s) => s.id === item.id) ? updateSocialLink(item.id, item) : addSocialLink(item))}
      onDelete={removeSocialLink}
      addLabel="New Link"
      dialogTitle="Link"
      fields={[
        { name: "label", label: "Label", type: "text" },
        { name: "type", label: "Type", type: "select", options: typeOpts },
        { name: "platform", label: "Platform", type: "select", options: platformOpts },
        { name: "url", label: "URL", type: "text", placeholder: "https://" },
        { name: "displayOrder", label: "Display Order", type: "number" },
        { name: "active", label: "Active", type: "switch" },
      ]}
      columns={[
        { header: "Label", cell: (r) => <span className="font-medium">{r.label}</span> },
        { header: "Type", cell: (r) => r.type.replace(/_/g, " ") },
        { header: "Platform", cell: (r) => r.platform },
        { header: "Active", cell: (r) => (r.active ? "✓" : "✕") },
      ]}
    />
  )
}
