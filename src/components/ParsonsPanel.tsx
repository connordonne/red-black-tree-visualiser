// src/components/ParsonsPanel.tsx

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code2, ArrowRight, GripVertical, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ParsonsData } from '@/core/RedBlackTree';

interface ParsonsPanelProps {
    data: ParsonsData;
    onComplete: () => void;
    className?: string;
}

// Internal Item Component
function SortableLine({ id, text, isCorrect, isError }: { id: string, text: string, isCorrect: boolean | null, isError: boolean }) {
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
    };

    return (
        <div ref={setNodeRef} style={style} className={cn("relative mb-2", isDragging && "z-50")}>
             <div className={cn(
                "flex items-center gap-3 p-2.5 rounded-md border text-sm font-mono shadow-sm bg-card transition-colors select-none",
                isDragging ? "ring-2 ring-primary opacity-50" : "hover:border-primary/50",
                isCorrect === true ? "border-green-500 bg-green-500/10 text-green-700 dark:text-green-300" : "",
                isError ? "border-red-300 bg-red-50/50 dark:border-red-800 dark:bg-red-900/10" : ""
            )}>
                <button 
                    {...attributes} 
                    {...listeners} 
                    className="p-1 rounded cursor-grab active:cursor-grabbing text-muted-foreground hover:bg-muted"
                >
                    <GripVertical className="size-4" />
                </button>
                <span className="flex-1">{text}</span>
            </div>
        </div>
    );
}

export function ParsonsPanel({ data, onComplete, className }: ParsonsPanelProps) {
    // Initial shuffle
    const [items, setItems] = useState(() => {
        const shuffled = [...data.lines].sort(() => Math.random() - 0.5);
        // Ensure not accidentally sorted initially
        const isAlreadySorted = JSON.stringify(shuffled.map(i => i.id)) === JSON.stringify(data.solutionIds);
        if (isAlreadySorted && shuffled.length > 1) {
            [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
        }
        return shuffled;
    });

    const [isSuccess, setIsSuccess] = useState(false);
    const [isError, setIsError] = useState(false); // State for error feedback
    const [attempts, setAttempts] = useState(0);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragStart = (event: DragStartEvent) => {
        // Clear error state as soon as user starts trying to fix it
        if (isError) setIsError(false);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        
        if (over && active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
            setIsSuccess(false); 
        }
    };

    const checkOrder = () => {
        const currentOrder = items.map(i => i.id);
        const isCorrect = JSON.stringify(currentOrder) === JSON.stringify(data.solutionIds);
        
        if (isCorrect) {
            setIsSuccess(true);
            setIsError(false);
        } else {
            setAttempts(p => p + 1);
            setIsError(true);
            
            // Auto-hide error visual on items after 2 seconds, but keep message until interaction
            setTimeout(() => setIsError(false), 2000);
        }
    };

    useEffect(() => {
        // Reset when data changes
        const shuffled = [...data.lines].sort(() => Math.random() - 0.5);
        setItems(shuffled);
        setIsSuccess(false);
        setIsError(false);
        setAttempts(0);
    }, [data]);

    return (
        <Card className={cn("flex flex-col h-full overflow-hidden border-2 transition-colors duration-300", 
            isSuccess ? "border-green-500/30" : isError ? "border-red-400/50" : "border-dashed", 
            className
        )}>
            <CardHeader className="p-3 bg-muted/20 border-b flex flex-row items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <Code2 className="size-4 text-purple-600" />
                    <CardTitle className="text-sm font-bold text-purple-700 dark:text-purple-400">
                        {data.title}
                    </CardTitle>
                </div>
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">
                    Arrange the lines
                </div>
            </CardHeader>
            
            <CardContent className="p-4 flex-1 overflow-y-auto bg-muted/5 relative">
                <div className="max-w-md mx-auto h-full flex flex-col justify-center">
                    <DndContext 
                        sensors={sensors} 
                        collisionDetection={closestCenter} 
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext 
                            items={items.map(i => i.id)} 
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-1">
                                {items.map((item) => (
                                    <SortableLine 
                                        key={item.id} 
                                        id={item.id} 
                                        text={item.text} 
                                        isCorrect={isSuccess}
                                        isError={isError}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>

                {isSuccess && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px] animate-in fade-in z-10">
                        <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-6 py-4 rounded-xl shadow-lg border border-green-200 dark:border-green-800 flex flex-col items-center gap-2">
                            <CheckCircle2 className="size-8" />
                            <span className="font-bold">Logic Correct!</span>
                        </div>
                    </div>
                )}
            </CardContent>

            <CardFooter className="p-3 bg-muted/20 border-t shrink-0 flex justify-between items-center">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                        setItems([...data.lines].sort(() => Math.random() - 0.5));
                        setIsError(false);
                    }}
                    disabled={isSuccess}
                    className="text-muted-foreground"
                >
                    <RotateCcw className="size-3.5 mr-1" />
                    Reset
                </Button>

                <div className="flex items-center gap-3">
                    <AnimatePresence>
                        {isError && (
                            <motion.div 
                                initial={{ opacity: 0, x: 10 }} 
                                animate={{ opacity: 1, x: 0 }} 
                                exit={{ opacity: 0, x: 10 }}
                                className="flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400"
                            >
                                <XCircle className="size-3.5" />
                                <span>Incorrect order</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!isSuccess ? (
                        <motion.div
                            animate={isError ? { x: [-5, 5, -5, 5, 0] } : {}}
                            transition={{ duration: 0.4 }}
                        >
                            <Button 
                                size="sm" 
                                onClick={checkOrder}
                                className={cn(
                                    "transition-colors",
                                    isError 
                                        ? "bg-red-600 hover:bg-red-700 text-white" 
                                        : "bg-purple-600 hover:bg-purple-700 text-white"
                                )}
                            >
                                Verify Order
                            </Button>
                        </motion.div>
                    ) : (
                        <Button size="sm" onClick={onComplete} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                            Continue
                            <ArrowRight className="size-4" />
                        </Button>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
}