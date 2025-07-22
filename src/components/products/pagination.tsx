"use client";

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface PaginationComponentProps {
    totalPages: number;
}

export function PaginationComponent({ totalPages }: PaginationComponentProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentPage = Number(searchParams.get('page')) || 1;
    const { replace } = useRouter();

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    const renderPaginationItems = () => {
        const items = [];
        // Always show first page
        items.push(
            <PaginationItem key={1}>
                <PaginationLink href={createPageURL(1)} isActive={currentPage === 1}>1</PaginationLink>
            </PaginationItem>
        );

        if (currentPage > 3) {
            items.push(<PaginationEllipsis key="start-ellipsis" />);
        }

        const startPage = Math.max(2, currentPage - 1);
        const endPage = Math.min(totalPages - 1, currentPage + 1);

        for (let i = startPage; i <= endPage; i++) {
            items.push(
                <PaginationItem key={i}>
                    <PaginationLink href={createPageURL(i)} isActive={currentPage === i}>{i}</PaginationLink>
                </PaginationItem>
            );
        }

        if (currentPage < totalPages - 2) {
            items.push(<PaginationEllipsis key="end-ellipsis" />);
        }
        
        // Always show last page if more than 1 page
        if (totalPages > 1) {
            items.push(
                <PaginationItem key={totalPages}>
                    <PaginationLink href={createPageURL(totalPages)} isActive={currentPage === totalPages}>{totalPages}</PaginationLink>
                </PaginationItem>
            );
        }

        return items;
    };

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious href={createPageURL(currentPage - 1)} className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}/>
                </PaginationItem>
                {renderPaginationItems()}
                <PaginationItem>
                    <PaginationNext href={createPageURL(currentPage + 1)} className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}/>
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}
