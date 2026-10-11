import { Info } from "lucide-react"
import { PageHeader } from "@/components/gate/ui"

/**
 * Bulk JSON import is not offered by the backend yet — only the underlying
 * create/update primitives exist. Wiring this page to loop over them would be
 * unsafe (ids change on create, so cross-references like content → category
 * would break, and "Replace All" would delete live production data), so it is
 * intentionally disabled until a real import endpoint exists.
 */
export default function ImportPage() {
  return (
    <div>
      <PageHeader
        title="Import"
        description="Bulk JSON import of Theocentric & Doxology data."
      />
      <div className="flex max-w-2xl gap-3 rounded-xl border border-border bg-card p-4 text-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div className="space-y-2 text-muted-foreground">
          <p className="font-medium text-foreground">Bulk import isn&apos;t available yet</p>
          <p>
            The backend doesn&apos;t expose an import endpoint. Create content, categories, collections and the rest
            from their own pages — each of those is saved directly to the server.
          </p>
        </div>
      </div>
    </div>
  )
}
