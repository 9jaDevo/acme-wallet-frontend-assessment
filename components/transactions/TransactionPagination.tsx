import { Icon } from '@/components/ui'
import styles from './TransactionsPage.module.css'

function pageItems(page: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1)
  const middle = [Math.max(2, page - 1), page, Math.min(totalPages - 1, page + 1)]
  const unique = [...new Set([1, ...middle, totalPages])].sort((a, b) => a - b)
  const result: (number | 'ellipsis')[] = []
  unique.forEach((value, index) => {
    if (index && value - unique[index - 1] > 1) result.push('ellipsis')
    result.push(value)
  })
  return result
}

export function TransactionPagination({
  page,
  totalPages,
  total,
  limit,
  onPage,
}: {
  page: number
  totalPages: number
  total: number
  limit: number
  onPage: (page: number) => void
}) {
  if (!total || !totalPages) return null
  const previousDisabled = page <= 1
  const nextDisabled = page >= totalPages
  return (
    <div className={styles.pagination}>
      <p className={styles.range}>
        Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
      </p>
      <div className={styles.desktopPages}>
        <button disabled={previousDisabled} onClick={() => onPage(page - 1)}>
          <Icon name="chevron-left" size={16} /> Previous
        </button>
        {pageItems(page, totalPages).map((item, index) =>
          item === 'ellipsis' ? (
            <span key={`ellipsis-${index}`}>…</span>
          ) : (
            <button
              key={item}
              className={item === page ? styles.currentPage : undefined}
              aria-current={item === page ? 'page' : undefined}
              onClick={() => onPage(item)}
            >
              {item}
            </button>
          )
        )}
        <button disabled={nextDisabled} onClick={() => onPage(page + 1)}>
          Next <Icon name="chevron-right" size={16} />
        </button>
      </div>
      <div className={styles.mobilePages}>
        <button disabled={previousDisabled} onClick={() => onPage(page - 1)}>
          <Icon name="chevron-left" size={16} /> Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button disabled={nextDisabled} onClick={() => onPage(page + 1)}>
          Next <Icon name="chevron-right" size={16} />
        </button>
      </div>
    </div>
  )
}
