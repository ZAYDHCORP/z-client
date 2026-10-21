import { lazy, Suspense, useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type PreviewKind = "image" | "pdf" | "audio" | "video" | "other";

/** Works out what a file is from its MIME type, or from the link's extension. */
export function previewKind(url: string, mime?: string): PreviewKind {
  const m = (mime ?? "").toLowerCase();
  if (m.startsWith("image/")) return "image";
  if (m === "application/pdf") return "pdf";
  if (m.startsWith("audio/")) return "audio";
  if (m.startsWith("video/")) return "video";
  const path = url.split("?")[0].split("#")[0].toLowerCase();
  if (/\.(png|jpe?g|gif|webp|svg|avif)$/.test(path)) return "image";
  if (path.endsWith(".pdf")) return "pdf";
  if (/\.(mp3|m4a|wav|ogg|aac|flac)$/.test(path)) return "audio";
  if (/\.(mp4|webm|mov)$/.test(path)) return "video";
  return "other";
}

/** Shows an uploaded file the way it will be read: image, PDF page viewer or audio player. */
export function FilePreview({
  url,
  mime,
  name,
}: {
  url: string;
  mime?: string;
  name?: string;
}) {
  const kind = previewKind(url, mime);
  return (
    <div className="space-y-3">
      {kind === "image" && (
        <div className="flex max-h-[70vh] justify-center overflow-auto rounded-lg border border-border bg-muted/40 p-3">
          <img
            src={url}
            alt={name ?? ""}
            className="max-h-[66vh] object-contain"
          />
        </div>
      )}
      {kind === "pdf" && (
        <iframe
          src={url}
          title={name ?? "PDF preview"}
          className="h-[70vh] w-full rounded-lg border border-border bg-muted/40"
        />
      )}
      {kind === "audio" && (
        <div className="rounded-lg border border-border bg-muted/40 p-6">
          <audio controls src={url} className="w-full" />
        </div>
      )}
      {kind === "video" && (
        <video
          controls
          src={url}
          className="max-h-[70vh] w-full rounded-lg border border-border"
        />
      )}
      {kind === "other" && (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          This file type can't be previewed here.
        </p>
      )}
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-primary underline"
      >
        <ExternalLink className="h-3.5 w-3.5" /> Open in a new tab
      </a>
    </div>
  );
}

// Loaded on demand so the PDF engine only downloads when someone opens a PDF.
const GateReader = lazy(() => import("@/components/GateReader"));

/**
 * Opens an uploaded file. PDFs open in the same book-style reader used on the
 * home page; if the reader can't load the file (for example storage blocks
 * cross-site reads) it falls back to the browser's own PDF viewer.
 */
export function FilePreviewDialog({
  file,
  onClose,
}: {
  file: { url: string; name?: string; mime?: string } | null;
  onClose: () => void;
}) {
  const [fallback, setFallback] = useState(false);
  const [reason, setReason] = useState("");
  useEffect(() => {
    setFallback(false);
    setReason("");
  }, [file?.url]);

  const asReader =
    !!file && previewKind(file.url, file.mime) === "pdf" && !fallback;

  if (asReader && file) {
    return (
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          showCloseButton={false}
          className="top-0 left-0 h-screen max-h-none w-screen max-w-none translate-x-0 translate-y-0 gap-0 overflow-hidden rounded-none border-0 !bg-transparent p-0 shadow-none sm:max-w-none"
        >
          <DialogTitle className="sr-only">{file.name || "PDF"}</DialogTitle>
          <Suspense fallback={null}>
            <GateReader
              pdfUrl={file.url}
              book={{
                id: "pdf-preview",
                title: file.name || "PDF",
                author: "",
                chapters: [],
              }}
              onClose={onClose}
              onPdfUnavailable={(why) => {
                setReason(why);
                setFallback(true);
              }}
            />
          </Suspense>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={!!file} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="truncate">
            {file?.name || "Preview"}
          </DialogTitle>
        </DialogHeader>

        {file && (
          <FilePreview url={file.url} mime={file.mime} name={file.name} />
        )}
      </DialogContent>
    </Dialog>
  );
}
