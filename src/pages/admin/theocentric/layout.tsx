import { TheocentricProvider } from "@/lib/gate/theocentric/store"

export default function TheocentricLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <TheocentricProvider>{children}</TheocentricProvider>
}
