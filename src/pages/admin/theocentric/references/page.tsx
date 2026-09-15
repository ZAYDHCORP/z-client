import { CrudTable } from "@/components/gate/crud-table"
import { useTheo } from "@/lib/gate/theocentric/store"
import type { TheoReference } from "@/lib/gate/theocentric/types"

export default function TheoReferencesPage() {
  const { data, addReference, updateReference, removeReference } = useTheo()
  return (
    <CrudTable
      title="References"
      description="Authoritative Qur'an and Hadith sources used to verify content."
      rows={data.references}
      columns={[
        {
          header: "Type",
          cell: (r) => (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">{r.type}</span>
          ),
        },
        {
          header: "Reference",
          cell: (r) => (
            <div>
              <p className="font-medium">
                {r.type === "quran" ? `${r.surah} ${r.ayah}` : `${r.hadithCollection} ${r.hadithNumber}`}
              </p>
              <p className="text-xs text-muted-foreground">{r.referenceText || "—"}</p>
            </div>
          ),
        },
        { header: "Authenticity", cell: (r) => r.authenticity || "—" },
      ]}
      fields={[
        {
          name: "type",
          label: "Type",
          type: "select",
          options: [
            { value: "quran", label: "Qur'an" },
            { value: "hadith", label: "Hadith" },
          ],
        },
        { name: "surah", label: "Surah", type: "text" },
        { name: "ayah", label: "Ayah", type: "text" },
        { name: "hadithCollection", label: "Hadith Collection", type: "text" },
        { name: "hadithNumber", label: "Hadith Number", type: "text" },
        { name: "sourceBook", label: "Source Book", type: "text" },
        { name: "referenceText", label: "Reference Text", type: "textarea" },
        { name: "authenticity", label: "Authenticity", type: "text", placeholder: "Sahih / Hasan / Da'if" },
        { name: "notes", label: "Notes", type: "textarea" },
      ]}
      searchKeys={["surah", "ayah", "referenceText", "hadithCollection"]}
      newRecord={(): TheoReference => ({
        id: `ref_${Date.now().toString(36)}`,
        type: "quran",
        surah: "",
        ayah: "",
        hadithCollection: "",
        hadithNumber: "",
        sourceBook: "",
        referenceText: "",
        authenticity: "",
        notes: "",
      })}
      onSave={(r) => {
        if (data.references.some((x) => x.id === r.id)) updateReference(r.id, r)
        else addReference(r)
      }}
      onDelete={(id) => removeReference(id)}
    />
  )
}
