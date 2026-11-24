/** Keep navigation bounded even when a result has thousands of pages. */
export function paginationPages(currentPage: number, totalPages: number) {
  const pages = new Set([1, totalPages])
  for (let page = currentPage - 1; page <= currentPage + 1; page++) {
    if (page >= 1 && page <= totalPages) pages.add(page)
  }
  return [...pages].filter((page) => page > 0).sort((a, b) => a - b)
}
