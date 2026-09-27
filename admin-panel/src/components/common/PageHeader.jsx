import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import { useDocumentTitle } from '@/hooks/useUtils'

/**
 * Top of every page.
 * <PageHeader title="Users" description="…" actions={…} back={{ to: '/admin/users', label: 'Users' }} meta={<StatusBadge/>} leading={<Avatar/>} />
 */
export function PageHeader({ title, description, actions, back, meta, leading, className, documentTitle }) {
  useDocumentTitle(documentTitle ?? (typeof title === 'string' ? title : undefined))
  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className={cn('mb-6', className)}>
      {back && (
        <Link to={back.to} className="mb-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-3 transition-colors hover:text-ink">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          {back.label}
        </Link>
      )}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          {leading}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <h1 className="truncate text-[22px] leading-8 font-semibold tracking-[-0.02em] text-ink sm:text-2xl">{title}</h1>
              {meta}
            </div>
            {description && <p className="mt-1 text-sm text-ink-3">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </motion.div>
  )
}
