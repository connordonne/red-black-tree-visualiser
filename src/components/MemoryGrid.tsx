// src/components/MemoryGrid.tsx

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TreeNode, Color } from "@/core/RedBlackTree";
import { cn } from "@/lib/utils";

interface MemoryGridProps {
    root: TreeNode | null;
    highlightedKeys: number[];
    selectedAddress: number | null;
    onSelectAddress: (addr: number) => void;
    hoveredAddress?: number | null;
    onHoverAddress?: (addr: number | null) => void;
}

// 16x16 grid = 256 slots
const GRID_SIZE = 256;

export function MemoryGrid({
                               root,
                               highlightedKeys,
                               selectedAddress,
                               onSelectAddress,
                               hoveredAddress,
                               onHoverAddress
                           }: MemoryGridProps) {
    const memoryMap = useMemo(() => {
        const map = new Map<number, TreeNode>();
        if (!root) return map;

        const stack = [root];
        while (stack.length > 0) {
            const node = stack.pop()!;
            map.set(node.address, node);
            if (node.right) stack.push(node.right);
            if (node.left) stack.push(node.left);
        }
        return map;
    }, [root]);

    const slots = Array.from({ length: GRID_SIZE }, (_, i) => i);

    const toHex = (n: number) => n.toString(16).toUpperCase().padStart(2, '0');

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="py-3 px-4 border-b bg-muted/20">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span>Heap Memory Map</span>
                    <span className="text-xs text-muted-foreground font-normal font-mono">256 Bytes (0x00-0xFF)</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-auto bg-muted/40 relative">
                <div className="grid grid-cols-16 w-fit mx-auto border-l border-t border-border/60 shadow-inner bg-background/50">
                    {slots.map((addr) => {
                        const node = memoryMap.get(addr);
                        const isOccupied = !!node;
                        const isHighlighted = node && highlightedKeys.includes(node.key);
                        const isSelected = selectedAddress === addr;
                        const isHovered = hoveredAddress === addr;

                        return (
                            <button
                                key={addr}
                                onClick={() => onSelectAddress(addr)}
                                onMouseEnter={() => onHoverAddress?.(addr)}
                                onMouseLeave={() => onHoverAddress?.(null)}
                                className={cn(
                                    "w-5 h-5 md:w-6 md:h-6 text-[8px] md:text-[9px] flex items-center justify-center border-r border-b border-border/60 relative group select-none transition-all duration-75",
                                    "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary",
                                    isOccupied
                                        ? "bg-background font-bold cursor-pointer text-foreground"
                                        : "bg-transparent text-muted-foreground/30 cursor-default",
                                    isHighlighted && !isSelected && "ring-2 ring-inset ring-chart-4 z-10 bg-chart-4/10",
                                    isSelected && "ring-2 ring-inset ring-blue-500 z-20 bg-blue-500/20",
                                    isHovered && !isSelected && "bg-primary/20 z-10"
                                )}
                                title={isOccupied
                                    ? `Addr: 0x${toHex(addr)} | Key: ${node.key} | ${node.color === Color.RED ? "RED" : "BLACK"}`
                                    : `Addr: 0x${toHex(addr)} (Free)`
                                }
                            >
                                <span className="font-mono scale-90 group-hover:scale-100 transition-transform">
                                    {toHex(addr)}
                                </span>

                                {isOccupied && (
                                    <div className={cn(
                                        "absolute inset-0 opacity-15 pointer-events-none mix-blend-multiply dark:mix-blend-screen",
                                        node.color === Color.RED ? "bg-red-500" : "bg-slate-900 dark:bg-slate-100"
                                    )} />
                                )}
                            </button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}