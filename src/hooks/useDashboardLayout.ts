import { useState } from 'react';
import {
    useSensor,
    useSensors,
    PointerSensor,
    KeyboardSensor,
    pointerWithin,
} from '@dnd-kit/core';
import type {
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { WidgetId } from '@/types/visualiser';

interface LayoutState {
    main: WidgetId[];
    sidebar: WidgetId[];
}

const DEFAULT_LAYOUT: LayoutState = {
    main: ['tree', 'memory', 'player'],
    sidebar: ['controls', 'explanation', 'pseudocode'],
};

export function useDashboardLayout() {
    const [columns, setColumns] = useState<LayoutState>(DEFAULT_LAYOUT);
    const [activeDragId, setActiveDragId] = useState<WidgetId | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const findContainer = (id: WidgetId | string): keyof LayoutState | null => {
        if (columns.main.includes(id as WidgetId)) return 'main';
        if (columns.sidebar.includes(id as WidgetId)) return 'sidebar';
        return null;
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveDragId(event.active.id as WidgetId);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as WidgetId;
        const overId = over.id as string;

        const activeContainer = findContainer(activeId);
        // If over a container directly (empty space), or over an item
        const overContainer = (overId === 'main' || overId === 'sidebar')
            ? overId as keyof LayoutState
            : findContainer(overId);

        if (!activeContainer || !overContainer || activeContainer === activeContainer) {
            // We usually only handle cross-container movement in DragOver
            // But strict dnd-kit implementation often handles all movement here for smoother preview
        }
        
        if (!activeContainer || !overContainer || activeContainer === overContainer) {
             return;
        }

        setColumns((prev) => {
            const activeItems = prev[activeContainer];
            const overItems = prev[overContainer];
            const activeIndex = activeItems.indexOf(activeId);
            const overIndex = (overId === 'main' || overId === 'sidebar')
                ? overItems.length + 1
                : overItems.indexOf(overId as WidgetId);

            let newIndex;
            if (overId === 'main' || overId === 'sidebar') {
                newIndex = overItems.length + 1;
            } else {
                const isBelowOverItem =
                    over &&
                    active.rect.current.translated &&
                    active.rect.current.translated.top > over.rect.top + over.rect.height;

                const modifier = isBelowOverItem ? 1 : 0;
                newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
            }

            return {
                ...prev,
                [activeContainer]: [
                    ...prev[activeContainer].filter((item) => item !== active.id),
                ],
                [overContainer]: [
                    ...prev[overContainer].slice(0, newIndex),
                    active.id,
                    ...prev[overContainer].slice(newIndex, prev[overContainer].length),
                ],
            };
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        const activeId = active.id as WidgetId;
        const overId = over?.id as string;

        const activeContainer = findContainer(activeId);
        const overContainer = (overId === 'main' || overId === 'sidebar')
            ? overId as keyof LayoutState
            : findContainer(overId);

        if (
            activeContainer &&
            overContainer &&
            activeContainer === overContainer &&
            overId !== 'main' && overId !== 'sidebar'
        ) {
            const activeIndex = columns[activeContainer].indexOf(activeId);
            const overIndex = columns[overContainer].indexOf(overId as WidgetId);

            if (activeIndex !== overIndex) {
                setColumns((prev) => ({
                    ...prev,
                    [activeContainer]: arrayMove(prev[activeContainer], activeIndex, overIndex),
                }));
            }
        }
        setActiveDragId(null);
    };

    return {
        columns,
        activeDragId,
        sensors,
        handlers: {
            onDragStart: handleDragStart,
            onDragOver: handleDragOver,
            onDragEnd: handleDragEnd,
            collisionDetection: pointerWithin
        }
    };
}