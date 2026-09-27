import { Compass } from 'lucide-react'
import { EmptyState } from '@/components/common/States'
import { Button } from '@/components/common/Button'
import { useDocumentTitle } from '@/hooks/useUtils'

export default function NotFoundPage() {
  useDocumentTitle('Page not found')
  return (
    <div className="card">
      <EmptyState
        icon={Compass}
        title="Page not found"
        description="The page you’re looking for doesn’t exist or may have moved."
        action={<Button variant="primary" to="/admin/dashboard">Return to dashboard</Button>}
      />
    </div>
  )
}
