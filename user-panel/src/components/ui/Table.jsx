import { cn } from '@/utils/cn';

/**
 * Semantic data table for desktop. On small screens, pages should render a
 * card list instead (see `mobile` prop) so there's never horizontal overflow.
 *
 * columns: [{ key, header, className?, render: (row) => node, align? }]
 */
export function Table({ columns, rows, rowKey = 'id', onRowClick, caption, className, mobile }) {
  return (
    <>
      {/* No overflow-hidden: row action menus must be able to escape the table. */}
      <div className={cn('hidden rounded-3xl border border-line bg-surface shadow-soft md:block', className)}>
        <table className="w-full border-collapse text-left text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="border-b border-line bg-surface-muted/60">
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={cn(
                    'px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted first:rounded-tl-3xl last:rounded-tr-3xl',
                    c.align === 'right' && 'text-right',
                    c.headerClassName,
                  )}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row[rowKey]}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn('border-b border-line last:border-0 transition-colors', onRowClick && 'cursor-pointer hover:bg-surface-muted/60')}
              >
                {columns.map((c) => (
                  <td key={c.key} className={cn('px-5 py-4 align-middle text-ink-soft', c.align === 'right' && 'text-right', c.className)}>
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {mobile && <div className="grid gap-3 md:hidden">{rows.map((row) => <div key={row[rowKey]}>{mobile(row)}</div>)}</div>}
    </>
  );
}
