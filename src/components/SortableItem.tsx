// src/components/SortableItem.tsx

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SortableItemProps {
    id: string;
    children: React.ReactNode;
    className?: string;
}

export function SortableItem({ id, children, className }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        position: 'relative' as const,
        touchAction: 'none', // Prevents scrolling while dragging on touch devices
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn("group relative transition-opacity", isDragging && "opacity-50", className)}
        >
            {/* Drag Handle - Only visible on hover */}
            <div
                {...attributes}
                {...listeners}
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full cursor-grab active:cursor-grabbing bg-background border shadow-sm text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all duration-200"
                title="Drag to move"
            >
                <GripHorizontal className="size-4" />
            </div>
            {children}
        </div>
    );
}