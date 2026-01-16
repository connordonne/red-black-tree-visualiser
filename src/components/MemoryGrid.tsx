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
}

// 16x16 grid = 256 slots
const GRID_SIZE = 256;

export function MemoryGrid({ root, highlightedKeys, selectedAddress, onSelectAddress }: MemoryGridProps) {
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
            <CardHeader className="py-3 px-4 border-b">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span>Heap Memory Map</span>
                    <span className="text-xs text-muted-foreground font-normal">256 Bytes (16x16)</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-auto bg-muted/10">
                <div className="grid grid-cols-16 w-fit mx-auto border-l border-t border-border/50">
                    {slots.map((addr) => {
                        const node = memoryMap.get(addr);
                        const isOccupied = !!node;
                        const isHighlighted = node && highlightedKeys.includes(node.key);
                        const isSelected = selectedAddress === addr;

                        return (
                            <button
                                key={addr}
                                onClick={() => onSelectAddress(addr)}
                                className={cn(
                                    "w-5 h-5 md:w-6 md:h-6 text-[8px] md:text-[10px] flex items-center justify-center border-r border-b border-border/50 relative group select-none transition-colors",
                                    "hover:bg-primary/20 focus:outline-none focus:bg-primary/20",
                                    isOccupied
                                        ? "bg-background font-bold cursor-pointer"
                                        : "bg-transparent text-muted-foreground/20 cursor-pointer",
                                    isHighlighted && !isSelected && "ring-2 ring-primary/50 z-10",
                                    isSelected && "ring-2 ring-blue-500 z-20 bg-blue-500/10"
                                )}
                                title={isOccupied
                                    ? `Addr: 0x${toHex(addr)} | Key: ${node.key} | ${node.color === Color.RED ? "RED" : "BLACK"}`
                                    : `Addr: 0x${toHex(addr)} (Free)`
                                }
                            >
                                {toHex(addr)}

                                {isOccupied && (
                                    <div className={cn(
                                        "absolute inset-0 opacity-20 pointer-events-none",
                                        node.color === Color.RED ? "bg-red-500" : "bg-black dark:bg-slate-400"
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