export interface PaginationProp {
  page: number;
  limit: number;
  total: number;
  onPageChange?: (page: number) => void;
}

export default function Pagination({ page, limit, total, onPageChange }: PaginationProp) {
  const totalPages = Math.ceil(total / limit);
  const currentPage = page;
  const maxVisible = 5;
  const half = Math.floor(maxVisible / 2);

  let startPage = Math.max(currentPage - half, 1);
  let endPage = startPage + maxVisible - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(endPage - maxVisible + 1, 1);
  }

  const pagesToShow: number[] = [];
  for (let i = startPage; i <= endPage; i++) {
    pagesToShow.push(i);
  }

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  const showPrev = !isFirstPage;
  const showNext = !isLastPage;
  const showFirst = startPage > 1;
  const showLast = endPage < totalPages;

  return (
    <div className="join">
      {showFirst && (
        <button className="btn btn-ghost join-item" onClick={() => onPageChange?.(1)}>
          <i className="fa-regular fa-chevrons-left"></i>
        </button>
      )}
      {showPrev && (
        <button className="btn btn-ghost join-item" onClick={() => onPageChange?.(currentPage - 1)}>
          <i className="fa-regular fa-chevron-left"></i>
        </button>
      )}

      {pagesToShow.map((p) => (
        <button
          key={p}
          className={`btn btn-ghost join-item ${p === currentPage ? 'btn-active' : ''}`}
          onClick={() => onPageChange?.(p)}
        >
          {p}
        </button>
      ))}

      {showNext && (
        <button className="btn btn-ghost join-item" onClick={() => onPageChange?.(currentPage + 1)}>
          <i className="fa-regular fa-chevron-right"></i>
        </button>
      )}
      {showLast && (
        <button className="btn btn-ghost join-item" onClick={() => onPageChange?.(totalPages)}>
          <i className="fa-regular fa-chevrons-right"></i>
        </button>
      )}
    </div>
  );
}
