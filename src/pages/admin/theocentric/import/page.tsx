import { useRef, useState } from "react"
import { FileUp, Upload } from "lucide-react"
import { PageHeader } from "@/components/gate/ui"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useTheo } from "@/lib/gate/theocentric/store"
import type { TheoData } from "@/lib/gate/theocentric/types"

const SAMPLE = `{
  "content": [],
  "categories": [],
  "subcategories": [],
  "collections": [],
  "references": [],
  "tags": [],
  "journey": { "sections": [] },
  "afterSalah": [],
  "featured": [],
  "milestones": [],
  "settings": { "verificationRequired": true, "publicationRules": "", "displayRules": "", "defaultOrdering": "", "defaultCategories": [], "defaultJourney": [] }
}`

export default function ImportPage() {
  const {
    data,
    updateSettings,
    addCategory,
    updateCategory,
    removeCategory,
    addSubcategory,
    updateSubcategory,
    removeSubcategory,
    addCollection,
    updateCollection,
    removeCollection,
    addReference,
    updateReference,
    removeReference,
    addTag,
    updateTag,
    removeTag,
    addContent,
    updateContent,
    removeContent,
    addMilestone,
    updateMilestone,
    removeMilestone,
    updateJourney,
    updateAfterSalah,
  } = useTheo()
  const [text, setText] = useState("")
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    f.text().then((t) => setText(t))
  }

  function validate(parsed: any): parsed is TheoData {
    return parsed && Array.isArray(parsed.content) && Array.isArray(parsed.categories)
  }

  function upsert<T extends { id: string }>(
    incoming: T[],
    add: (x: T) => void,
    update: (x: T) => void,
    remove: (id: string) => void,
    existing: T[],
    mode: "replace" | "merge",
  ) {
    if (mode === "replace") existing.forEach((x) => remove(x.id))
    incoming.forEach((x) => {
      if (existing.some((e) => e.id === x.id) && mode === "merge") update(x)
      else add(x)
    })
  }

  function doImport(mode: "replace" | "merge") {
    setError(null)
    setMsg(null)
    let parsed: any
    try {
      parsed = JSON.parse(text)
    } catch {
      setError("Invalid JSON.")
      return
    }
    if (!validate(parsed)) {
      setError("JSON is missing required arrays (content, categories, …).")
      return
    }
    upsert(parsed.content, addContent, (x) => updateContent(x.id, x), removeContent, data.content, mode)
    upsert(parsed.categories, addCategory, (x) => updateCategory(x.id, x), removeCategory, data.categories, mode)
    upsert(parsed.subcategories, addSubcategory, (x) => updateSubcategory(x.id, x), removeSubcategory, data.subcategories, mode)
    upsert(parsed.collections, addCollection, (x) => updateCollection(x.id, x), removeCollection, data.collections, mode)
    upsert(parsed.references, addReference, (x) => updateReference(x.id, x), removeReference, data.references, mode)
    upsert(parsed.tags, addTag, (x) => updateTag(x.id, x), removeTag, data.tags, mode)
    upsert(parsed.milestones ?? [], addMilestone, (x) => updateMilestone(x.id, x), removeMilestone, data.milestones, mode)
    if (parsed.journey) updateJourney(parsed.journey)
    if (parsed.afterSalah) updateAfterSalah(parsed.afterSalah)
    if (parsed.settings) updateSettings(parsed.settings)
    setMsg(mode === "replace" ? "Replaced all data." : "Merged imported data.")
  }

  return (
    <div>
      <PageHeader
        title="Import"
        description="Import Theocentric & Doxology data as JSON. Merge updates existing records (by id) and adds new ones; Replace rebuilds each dataset."
        actions={
          <Button variant="outline" onClick={() => setText(SAMPLE)}>
            Load Template
          </Button>
        }
      />

      <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={onFile} />
      <Button variant="outline" className="mb-3" onClick={() => fileRef.current?.click()}>
        <FileUp className="mr-1.5 h-4 w-4" /> Choose JSON file
      </Button>

      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={14}
        placeholder="Paste exported JSON here…"
        className="font-mono text-xs"
      />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button onClick={() => doImport("merge")}>
          <Upload className="mr-1.5 h-4 w-4" /> Merge Import
        </Button>
        <Button variant="destructive" onClick={() => doImport("replace")}>
          Replace All
        </Button>
        {msg && <span className="text-sm text-emerald-600">{msg}</span>}
        {error && <span className="text-sm text-rose-600">{error}</span>}
      </div>
    </div>
  )
}
