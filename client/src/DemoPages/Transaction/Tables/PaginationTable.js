import { Pagination, PaginationItem, PaginationLink } from "reactstrap";

const TransactionsPagination = ({ totalPages, currentPage, hasPrevPage, hasNextPage, onPageChange }) => {
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    return (
        <Pagination aria-label="Page navigation">
            {/* Nút về trang đầu */}
            <PaginationItem disabled={currentPage === 1}>
                <PaginationLink first onClick={() => onPageChange(1)} />
            </PaginationItem>

            {/* Nút Previous */}
            <PaginationItem disabled={!hasPrevPage}>
                <PaginationLink previous onClick={() => onPageChange(currentPage - 1)} />
            </PaginationItem>

            {/* Hiển thị các trang */}
            {pageNumbers.map((pageNumber) => (
                <PaginationItem key={pageNumber} active={pageNumber === currentPage}>
                    <PaginationLink onClick={() => onPageChange(pageNumber)}>
                        {pageNumber}
                    </PaginationLink>
                </PaginationItem>
            ))}

            {/* Nút Next */}
            <PaginationItem disabled={!hasNextPage}>
                <PaginationLink next onClick={() => onPageChange(currentPage + 1)} />
            </PaginationItem>

            {/* Nút đến trang cuối */}
            <PaginationItem disabled={currentPage === totalPages}>
                <PaginationLink last onClick={() => onPageChange(totalPages)} />
            </PaginationItem>
        </Pagination>
    );
};

export default TransactionsPagination;
