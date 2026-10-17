import Button from "./Button";

export default function Pagination({ currentPage, totalItems, itemsPerPage = 10, itemLabel = "itens", onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="pagination">
      <p>
        Exibindo {startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalItems)} de {totalItems} {itemLabel}
      </p>
      <div className="pagination-actions">
        <Button className="btn--small" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
          Anterior
        </Button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
          <Button
            className={page === currentPage ? "btn--small btn--primary" : "btn--small"}
            key={page}
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ))}
        <Button
          className="btn--small"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}
