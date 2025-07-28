
"use client";

import { StorageLocation } from '@/types';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface LocationCellProps {
    locationId: string;
    data: StorageLocation | undefined;
    onClick: () => void;
}

export function LocationCell({ locationId, data, onClick }: LocationCellProps) {
    
    const getStatusColor = () => {
        if (!data || !data.status || data.status === 'empty') return 'bg-green-500/20 hover:bg-green-500/40';
        if (data.status === 'partial') return 'bg-yellow-500/20 hover:bg-yellow-500/40';
        if (data.status === 'full') return 'bg-red-500/20 hover:bg-red-500/40';
        if (data.status === 'blocked') return 'bg-gray-500 hover:bg-gray-500/80';
        return 'bg-muted hover:bg-accent'; // Default
    };

    const tooltipContent = data?.entries && data.entries.length > 0 
        ? data.entries.map(e => `${e.quantity}x ${e.productDescription} (NFD: ${e.nfd})`).join(', ')
        : "Vazio";

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div
                        onClick={onClick}
                        className={cn(
                            "flex h-20 w-full cursor-pointer items-center justify-center border-b border-r text-sm transition-colors",
                            getStatusColor()
                        )}
                    >
                        <span>{locationId}</span>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="max-w-xs">{tooltipContent}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
