import { PageHeader } from "@/components/gate/ui"
import { AccountContent } from "@/components/AccountContent"

export default function AdminProfilePage() {
  return (
    <div>
      <PageHeader title="Profile" description="Your account details, security and membership." />
      <div className="max-w-4xl">
        <AccountContent wide />
      </div>
    </div>
  )
}
