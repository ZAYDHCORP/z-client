import { useEffect, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { Copy, Eye, Star, Trash2, Archive, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGate } from "@/lib/gate/store";
import { PLATFORMS } from "@/lib/gate/platforms";
import type {
  AnyContent,
  BookContent,
  ContentType,
  InfographicContent,
  PlatformId,
  PodcastEpisode,
  ResearchContent,
  SeoAeo,
} from "@/lib/gate/types";
import { StatusBadge } from "./ui";
import { uploadFile } from "@/lib/gate/upload";
import { FilePreviewDialog } from "./file-preview";
import { sentenceCase } from "@/lib/text";

/** Picks an image and uploads it; the parent receives only the short public URL. */
function ImageUploadButton({ onUploaded }: { onUploaded: (publicUrl: string) => void }) {
  const [busy, setBusy] = useState(false);
  async function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const { publicUrl } = await uploadFile(file);
      onUploaded(publicUrl);
    } catch (err) {
      toast.error((err as Error).message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <label
      className={`mt-2 flex items-center justify-center gap-1.5 rounded-md border border-border bg-background px-2 py-1.5 text-xs ${
        busy ? "cursor-wait opacity-60" : "cursor-pointer hover:bg-accent/40"
      }`}
    >
      <Upload className="h-3.5 w-3.5" /> {busy ? "Uploading…" : "Upload image"}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        disabled={busy}
        onChange={handleChange}
      />
    </label>
  );
}

/**
 * A PDF field: paste a link or upload a file. The upload goes straight to storage
 * (signed upload) and only the short public link is kept on the book.
 */
function PdfUploadField({
  label,
  hint,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
  placeholder: string;
}) {
  const [busy, setBusy] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  async function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Please choose a PDF file.");
      return;
    }
    setBusy(true);
    try {
      const { publicUrl } = await uploadFile(file);
      onChange(publicUrl);
      toast.success(`${file.name} uploaded`);
    } catch (err) {
      toast.error((err as Error).message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <label
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-sm ${
            busy ? "cursor-wait opacity-60" : "cursor-pointer hover:bg-accent/40"
          }`}
        >
          <Upload className="h-4 w-4" /> {busy ? "Uploading…" : "Upload PDF"}
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            disabled={busy}
            onChange={handleChange}
          />
        </label>
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {value && (
        <p className="flex items-center gap-3 text-xs">
          <button
            type="button"
            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            onClick={() => setPreviewOpen(true)}
          >
            <Eye className="h-3.5 w-3.5" /> Preview
          </button>
          <a href={value} target="_blank" rel="noreferrer" className="font-medium text-primary underline">
            Open in new tab
          </a>
          <button
            type="button"
            className="text-muted-foreground hover:text-rose-600"
            onClick={() => onChange("")}
          >
            Remove
          </button>
        </p>
      )}
      <FilePreviewDialog
        file={previewOpen ? { url: value, name: label, mime: "application/pdf" } : null}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  );
}

function emptySeo(title: string, slug: string): SeoAeo {
  return {
    seoTitle: title,
    metaDescription: "",
    focusKeyword: "",
    slug,
    canonicalUrl: "",
    ogTitle: title,
    ogDescription: "",
    ogImage: "",
    twitterCard: "summary_large_image",
    schemaType: "Article",
    robots: "index,follow",
    aeoSummary: "",
    faq: [],
  };
}

function makeEmpty(type: ContentType): AnyContent {
  const base = {
    id: `${type}_${Date.now().toString(36)}`,
    type,
    platform: "IPN" as PlatformId,
    title: "",
    slug: "",
    status: "draft" as const,
    category: "",
    tags: [] as string[],
    regions: ["Global"],
    topics: [] as string[],
    featured: false,
    pinned: false,
    displayOrder: 1,
    views: 0,
    shares: 0,
    bookmarks: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    description: "",
    seo: emptySeo("", ""),
    feedPlacement: "default" as const,
  };
  if (type === "book" || type === "research") {
    return {
      ...base,
      cover: "",
      subtitle: "",
      pdfUrl: "",
      publicationInfo: "",
      purchaseLinks: {
        paperback: { enabled: false, url: "" },
        ebook: { enabled: false, url: "" },
        amazon: { enabled: false, url: "" },
        notionPress: { enabled: false, url: "" },
        googlePlayBooks: { enabled: false, url: "" },
        other: { enabled: false, url: "" },
      },
      freeSampleEnabled: false,
      freeSamplePdf: "",
    } as BookContent | ResearchContent;
  }
  if (type === "infographic") {
    return { ...base, image: "", caption: "" } as InfographicContent;
  }
  return {
    ...base,
    artwork: "",
    audioUrl: "",
    duration: "00:00",
    episodeNumber: 1,
    season: 1,
    rssGuid: `${type}-${Date.now()}`,
    originalTitle: "",
    originalDescription: "",
    feedId: "",
    explicit: false,
  } as PodcastEpisode;
}

export function ContentEditor({
  type,
  item,
  open,
  onOpenChange,
}: {
  type: ContentType;
  item: AnyContent | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { data, addContent, updateContent } = useGate();
  const [form, setForm] = useState<AnyContent>(() =>
    item ? structuredClone(item) : makeEmpty(type),
  );
  const [seoOpen, setSeoOpen] = useState(false);

  useEffect(() => {
    if (open) setForm(item ? structuredClone(item) : makeEmpty(type));
  }, [open, item, type]);

  const set = (patch: any) => setForm((f) => ({ ...f, ...patch }));
  const setSeo = (patch: any) =>
    setForm((f) => ({ ...f, seo: { ...f.seo, ...patch } }));

  const labels: Record<ContentType, string> = {
    book: "Book",
    infographic: "Infographic",
    podcast: "Podcast Episode",
    research: "Research Report",
  };

  function save() {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    const slug =
      form.slug.trim() ||
      form.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    const finalForm = { ...form, slug, seo: { ...form.seo, slug } };
    if (item) {
      updateContent(item.id, finalForm);
      toast.success(`${labels[type]} updated`);
    } else {
      addContent(finalForm);
      toast.success(`${labels[type]} created as ${finalForm.status}`);
    }
    onOpenChange(false);
  }

  const catOptions = data.categories.filter(
    (c) => c.platform === form.platform || c.platform === "ALL",
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="shrink-0 space-y-1 border-b border-border px-6 py-4 text-left">
          <DialogTitle>
            {item ? `Edit ${labels[type]}` : `New ${labels[type]}`}
          </DialogTitle>
          <DialogDescription>
            Complete the fields below. Save as draft, then publish when ready.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
          {/* Media + preview */}
          {(type === "book" || type === "research") && (
            <div className="flex gap-4">
              <div className="w-36 shrink-0">
                <Label className="mb-1.5 block text-xs">Cover (16:25)</Label>
                <div className="aspect-[16/25] overflow-hidden rounded-lg border border-border bg-muted">
                  {(form as BookContent).cover ? (
                    <img
                      src={(form as BookContent).cover}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
                      16:25
                    </div>
                  )}
                </div>
                <Input
                  className="mt-2 text-xs"
                  placeholder="Cover URL"
                  value={(form as BookContent).cover}
                  onChange={(e) =>
                    set({ cover: e.target.value } as Partial<AnyContent>)
                  }
                />
                <ImageUploadButton
                  onUploaded={(url) => set({ cover: url } as Partial<AnyContent>)}
                />
              </div>
              <div className="flex-1 space-y-3">
                <Field label="Title">
                  <Input
                    value={form.title}
                    onChange={(e) => set({ title: e.target.value })}
                    maxLength={200}
                  />
                </Field>
                <Field label="Subtitle">
                  <Input
                    value={(form as BookContent).subtitle ?? ""}
                    onChange={(e) =>
                      set({ subtitle: e.target.value } as Partial<AnyContent>)
                    }
                  />
                </Field>
                <Field label="Author">
                  <Input
                    value={form.author ?? ""}
                    onChange={(e) => set({ author: e.target.value })}
                  />
                </Field>
              </div>
            </div>
          )}

          {type === "infographic" && (
            <div className="flex gap-4">
              <div className="w-36 shrink-0">
                <Label className="mb-1.5 block text-xs">Image (4:5)</Label>
                <div className="aspect-[4/5] overflow-hidden rounded-lg border border-border bg-muted">
                  {(form as InfographicContent).image ? (
                    <img
                      src={(form as InfographicContent).image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
                      4:5
                    </div>
                  )}
                </div>
                <Input
                  className="mt-2 text-xs"
                  placeholder="Image URL"
                  value={(form as InfographicContent).image}
                  onChange={(e) =>
                    set({ image: e.target.value } as Partial<AnyContent>)
                  }
                />
                <ImageUploadButton
                  onUploaded={(url) => set({ image: url } as Partial<AnyContent>)}
                />
              </div>
              <div className="flex-1 space-y-3">
                <Field label="Title">
                  <Input
                    value={form.title}
                    onChange={(e) => set({ title: e.target.value })}
                    maxLength={200}
                  />
                </Field>
                <Field label="Caption">
                  <Textarea
                    value={(form as InfographicContent).caption}
                    onChange={(e) =>
                      set({ caption: e.target.value } as Partial<AnyContent>)
                    }
                    rows={3}
                  />
                </Field>
              </div>
            </div>
          )}

          {type === "podcast" && (
            <div className="space-y-3">
              <Field label="Episode Title">
                <Input
                  value={form.title}
                  onChange={(e) => set({ title: e.target.value })}
                  maxLength={200}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Field label="Duration">
                  <Input
                    value={(form as PodcastEpisode).duration}
                    onChange={(e) =>
                      set({ duration: e.target.value } as Partial<AnyContent>)
                    }
                    placeholder="38:24"
                  />
                </Field>
                <Field label="Episode #">
                  <Input
                    type="number"
                    value={(form as PodcastEpisode).episodeNumber}
                    onChange={(e) =>
                      set({
                        episodeNumber: Number(e.target.value),
                      } as Partial<AnyContent>)
                    }
                  />
                </Field>
                <Field label="Season">
                  <Input
                    type="number"
                    value={(form as PodcastEpisode).season ?? 1}
                    onChange={(e) =>
                      set({
                        season: Number(e.target.value),
                      } as Partial<AnyContent>)
                    }
                  />
                </Field>
                <Field label="Artwork URL">
                  <Input
                    value={(form as PodcastEpisode).artwork}
                    onChange={(e) =>
                      set({ artwork: e.target.value } as Partial<AnyContent>)
                    }
                  />
                </Field>
              </div>
              <Field label="Audio URL (actual RSS enclosure)">
                <Input
                  value={(form as PodcastEpisode).audioUrl}
                  onChange={(e) =>
                    set({ audioUrl: e.target.value } as Partial<AnyContent>)
                  }
                  placeholder="https://…/episode.mp3"
                />
                {(form as PodcastEpisode).audioUrl && (
                  <audio
                    controls
                    src={(form as PodcastEpisode).audioUrl}
                    className="mt-2 w-full"
                  />
                )}
              </Field>
            </div>
          )}

          {/* Common taxonomy */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Platform">
              <Select
                value={form.platform}
                onValueChange={(v) => set({ platform: v as PlatformId })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} — {p.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Category">
              <Select
                value={form.category}
                onValueChange={(v) => set({ category: v })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {catOptions.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Status">
              <Select
                value={form.status}
                onValueChange={(v) =>
                  set({ status: v as AnyContent["status"] })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "draft",
                    "scheduled",
                    "published",
                    "unpublished",
                    "archived",
                  ].map((s) => (
                    <SelectItem key={s} value={s}>
                      {sentenceCase(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Description (up to 10,000 chars)">
            <Textarea
              value={form.description}
              onChange={(e) => set({ description: e.target.value })}
              rows={4}
              maxLength={10000}
            />
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Tags (comma separated)">
              <Input
                value={form.tags.join(", ")}
                onChange={(e) =>
                  set({
                    tags: e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  })
                }
              />
            </Field>
            <Field label="Regions (comma separated)">
              <Input
                value={form.regions.join(", ")}
                onChange={(e) =>
                  set({
                    regions: e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  })
                }
              />
            </Field>
          </div>

          {/* Full book / report PDF */}
          {(type === "book" || type === "research") && (
            <div className="rounded-lg border border-border p-3">
              <PdfUploadField
                label={type === "book" ? "Book PDF" : "Report PDF"}
                hint="The full file — upload it here or paste a link."
                placeholder="https://…/book.pdf"
                value={(form as BookContent).pdfUrl ?? ""}
                onChange={(url) => set({ pdfUrl: url } as Partial<AnyContent>)}
              />
            </div>
          )}

          {/* Purchase links for books/research */}
          {(type === "book" || type === "research") && (
            <PurchaseLinksEditor
              value={(form as BookContent).purchaseLinks}
              onChange={(pl) =>
                set({ purchaseLinks: pl } as Partial<AnyContent>)
              }
              researchOnly={type === "research"}
            />
          )}

          {/* Free sample */}
          {(type === "book" || type === "research") && (
            <div className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Enable Free Sample</p>
                  <p className="text-xs text-muted-foreground">
                    Upload a short sample PDF that visitors can read before buying.
                  </p>
                </div>
                <Switch
                  checked={(form as BookContent).freeSampleEnabled}
                  onCheckedChange={(v) =>
                    set({ freeSampleEnabled: v } as Partial<AnyContent>)
                  }
                />
              </div>
              {(form as BookContent).freeSampleEnabled && (
                <div className="mt-3">
                  <PdfUploadField
                    label="Free sample PDF"
                    hint='Readers see this when they press "Read Free Sample" on the home page.'
                    placeholder="https://…/sample.pdf"
                    value={(form as BookContent).freeSamplePdf ?? ""}
                    onChange={(url) =>
                      set({ freeSamplePdf: url } as Partial<AnyContent>)
                    }
                  />
                </div>
              )}
            </div>
          )}

          {/* Featured / pin / feed */}
          <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border p-3">
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={form.featured}
                onCheckedChange={(v) => set({ featured: v })}
              />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={form.pinned}
                onCheckedChange={(v) => set({ pinned: v })}
              />
              Pinned
            </label>
            <Field label="Feed placement" inline>
              <Select
                value={form.feedPlacement}
                onValueChange={(v) =>
                  set({
                    feedPlacement: v as AnyContent["feedPlacement"],
                  })
                }
              >
                <SelectTrigger className="h-8 w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="hidden">Hidden</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          {/* SEO/AEO */}
          <div className="rounded-lg border border-border">
            <button
              type="button"
              className="flex w-full items-center justify-between px-3 py-2.5 text-sm font-medium"
              onClick={() => setSeoOpen((v) => !v)}
            >
              SEO / AEO Metadata
              <span className="text-muted-foreground">
                {seoOpen ? "Hide" : "Show"}
              </span>
            </button>
            {seoOpen && (
              <div className="space-y-3 border-t border-border p-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="SEO Title">
                    <Input
                      value={form.seo.seoTitle}
                      onChange={(e) => setSeo({ seoTitle: e.target.value })}
                    />
                  </Field>
                  <Field label="Focus Keyword">
                    <Input
                      value={form.seo.focusKeyword}
                      onChange={(e) => setSeo({ focusKeyword: e.target.value })}
                    />
                  </Field>
                  <Field label="URL Slug">
                    <Input
                      value={form.seo.slug}
                      onChange={(e) => setSeo({ slug: e.target.value })}
                    />
                  </Field>
                  <Field label="Canonical URL">
                    <Input
                      value={form.seo.canonicalUrl}
                      onChange={(e) => setSeo({ canonicalUrl: e.target.value })}
                    />
                  </Field>
                  <Field label="OG Title">
                    <Input
                      value={form.seo.ogTitle}
                      onChange={(e) => setSeo({ ogTitle: e.target.value })}
                    />
                  </Field>
                  <Field label="OG Image">
                    <Input
                      value={form.seo.ogImage}
                      onChange={(e) => setSeo({ ogImage: e.target.value })}
                    />
                  </Field>
                </div>
                <Field label="Meta Description">
                  <Textarea
                    value={form.seo.metaDescription}
                    onChange={(e) =>
                      setSeo({ metaDescription: e.target.value })
                    }
                    rows={2}
                  />
                </Field>
                <Field label="AEO Summary (AI search)">
                  <Textarea
                    value={form.seo.aeoSummary}
                    onChange={(e) => setSeo({ aeoSummary: e.target.value })}
                    rows={2}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <Field label="Twitter Card">
                    <Select
                      value={form.seo.twitterCard}
                      onValueChange={(v) =>
                        setSeo({ twitterCard: v as SeoAeo["twitterCard"] })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="summary">Summary</SelectItem>
                        <SelectItem value="summary_large_image">
                          Summary large image
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Schema Type">
                    <Input
                      value={form.seo.schemaType}
                      onChange={(e) => setSeo({ schemaType: e.target.value })}
                    />
                  </Field>
                  <Field label="Robots">
                    <Input
                      value={form.seo.robots}
                      onChange={(e) => setSeo({ robots: e.target.value })}
                    />
                  </Field>
                </div>
                <Field label="FAQ (one per line: Question? | Answer)">
                  <Textarea
                    value={form.seo.faq
                      .map((f) => `${f.question} | ${f.answer}`)
                      .join("\n")}
                    onChange={(e) =>
                      setSeo({
                        faq: e.target.value
                          .split("\n")
                          .map((l) => l.split("|"))
                          .filter((p) => p.length >= 2)
                          .map(([q, a]) => ({
                            question: q.trim(),
                            answer: a.trim(),
                          })),
                      })
                    }
                    rows={3}
                  />
                </Field>
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 flex items-center justify-between gap-3 border-t border-border px-6 py-4">
          <StatusBadge status={form.status} />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={save}>
              {item ? "Save Changes" : "Create Draft"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
  inline,
}: {
  label: string;
  children: React.ReactNode;
  inline?: boolean;
}) {
  return (
    <div className={inline ? "flex items-center gap-2" : "space-y-1.5"}>
      <Label className={inline ? "whitespace-nowrap text-xs" : "text-xs"}>
        {label}
      </Label>
      {children}
    </div>
  );
}

function PurchaseLinksEditor({
  value,
  onChange,
  researchOnly,
}: {
  value: BookContent["purchaseLinks"];
  onChange: (v: BookContent["purchaseLinks"]) => void;
  researchOnly?: boolean;
}) {
  const keys: { key: keyof BookContent["purchaseLinks"]; label: string }[] =
    researchOnly
      ? [
          { key: "googlePlayBooks", label: "Google Play Books" },
          { key: "other", label: "Other Purchase Link" },
        ]
      : [
          { key: "paperback", label: "Paperback" },
          { key: "ebook", label: "eBook" },
          { key: "amazon", label: "Amazon" },
          { key: "notionPress", label: "Notion Press" },
          { key: "googlePlayBooks", label: "Google Play Books" },
          { key: "other", label: "Other Purchase Link" },
        ];
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="mb-2 text-sm font-medium">Purchase & Affiliate Links</p>
      <div className="space-y-2">
        {keys.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-2">
            <Switch
              checked={value[key].enabled}
              onCheckedChange={(v) =>
                onChange({ ...value, [key]: { ...value[key], enabled: v } })
              }
            />
            <span className="w-36 shrink-0 text-sm">{label}</span>
            <Input
              disabled={!value[key].enabled}
              placeholder="https://…"
              value={value[key].url}
              onChange={(e) =>
                onChange({
                  ...value,
                  [key]: { ...value[key], url: e.target.value },
                })
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
