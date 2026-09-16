import { useEffect } from "react"
import { CrudTable } from "@/components/gate/crud-table"
import { StatusBadge } from "@/components/gate/ui"
import { useGate } from "@/lib/gate/store"
import { PLATFORMS, PLATFORM_MAP } from "@/lib/gate/platforms"
import type { ServiceRecord } from "@/lib/gate/types"

const platformOpts = PLATFORMS.map((p) => ({ value: p.id, label: p.name }))

export default function ServicesPage() {
  const { data, addService, updateService, removeService, ensureServicesLoaded, loadMore, hasMore, isResourceLoading } = useGate()

  useEffect(() => {
    ensureServicesLoaded()
  }, [ensureServicesLoaded])

  return (
    <CrudTable
      onLoadMore={() => loadMore("services")}
      hasMore={hasMore("services")}
      loadingMore={isResourceLoading("services")}
      title="Services"
      description="Platform-specific service pages with their own landing content, enquiry CTAs and WhatsApp contact."
      rows={data.services}
      searchKeys={["title", "category", "slug"]}
      newRecord={(): ServiceRecord => ({
        id: `svc_${Date.now().toString(36)}`,
        platform: "IPN",
        category: "",
        title: "",
        slug: "",
        shortDescription: "",
        fullDescription: "",
        benefits: [],
        pricingMode: "contact",
        pricingText: "",
        whatsappUrl: "wa.link/f44l0k",
        externalUrl: "",
        seoTitle: "",
        status: "draft",
        displayOrder: data.services.length + 1,
        featured: false,
        updatedAt: new Date().toISOString(),
      })}
      onSave={(item) => (data.services.find((s) => s.id === item.id) ? updateService(item.id, item) : addService(item))}
      onDelete={removeService}
      addLabel="New Service"
      dialogTitle="Service"
      fields={[
        { name: "title", label: "Service Title", type: "text" },
        { name: "platform", label: "Platform", type: "select", options: platformOpts },
        { name: "category", label: "Category", type: "text" },
        { name: "slug", label: "Slug", type: "text" },
        { name: "shortDescription", label: "Short Description", type: "textarea" },
        { name: "fullDescription", label: "Full Description", type: "textarea" },
        { name: "pricingMode", label: "Pricing Mode", type: "select", options: [{ value: "contact", label: "Contact for Pricing" }, { value: "paid", label: "Paid" }, { value: "free", label: "Free" }] },
        { name: "pricingText", label: "Pricing Text", type: "text" },
        { name: "whatsappUrl", label: "WhatsApp URL", type: "text" },
        { name: "externalUrl", label: "External URL", type: "text" },
        { name: "seoTitle", label: "SEO Title", type: "text" },
        { name: "status", label: "Status", type: "select", options: [{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }, { value: "archived", label: "Archived" }] },
        { name: "featured", label: "Featured", type: "switch" },
      ]}
      columns={[
        { header: "Title", cell: (r) => <span className="font-medium">{r.title}</span> },
        { header: "Platform", cell: (r) => <span style={{ color: PLATFORM_MAP[r.platform].color }}>{r.platform}</span> },
        { header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
        { header: "Featured", cell: (r) => (r.featured ? "★" : "—") },
      ]}
    />
  )
}
