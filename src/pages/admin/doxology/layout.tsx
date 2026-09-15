import { DoxologyProvider } from "@/lib/gate/doxology/store"

export default function DoxologyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DoxologyProvider>{children}</DoxologyProvider>
}
