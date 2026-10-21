import { api } from "@/lib/axios"
import { API } from "@/lib/constants"

export interface UploadedFile {
  /** Short public link to the stored file — this is what gets saved on records. */
  publicUrl: string
  /** File category decided by the server (e.g. image / pdf / audio). */
  kind: string
}

/**
 * Uploads a file the way the backend expects:
 *  1. ask the API for a signed upload (`/admin/uploads/presign`),
 *  2. send the file straight to storage with the returned fields (file MUST be last),
 *  3. hand back the short `publicUrl` to store on the record.
 * The browser never turns the file into a giant base64 string any more.
 */
export async function uploadFile(file: File): Promise<UploadedFile> {
  if (!file.type) throw new Error("Could not detect the file type.")

  let presign: { uploadUrl: string; fields?: Record<string, string>; publicUrl: string; kind: string }
  try {
    const res = await api.post(API.ADMIN.UPLOADS_PRESIGN, {
      fileName: file.name,
      contentType: file.type,
      size: file.size,
    })
    presign = (res.data?.data ?? res.data) as typeof presign
  } catch (err) {
    throw new Error((err as { message?: string })?.message || "Could not start the upload.")
  }
  if (!presign?.uploadUrl || !presign.publicUrl) throw new Error("The server did not return an upload link.")

  const form = new FormData()
  Object.entries(presign.fields ?? {}).forEach(([k, v]) => form.append(k, String(v)))
  form.append("file", file) // MUST be the last field
  // Plain fetch on purpose: the storage host is not our API, so no cookies or API headers.
  const stored = await fetch(presign.uploadUrl, { method: "POST", body: form })
  if (!stored.ok) throw new Error(`Upload failed (${stored.status})`)

  return { publicUrl: presign.publicUrl, kind: presign.kind }
}
