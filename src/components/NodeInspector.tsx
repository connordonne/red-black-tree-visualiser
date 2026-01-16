// src/components/NodeInspector.tsx

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TreeNode, Color } from "@/core/RedBlackTree";
import { cn } from "@/lib/utils";
import { Microscope, AlertCircle } from 'lucide-react';

interface NodeInspectorProps {
    root: TreeNode | null;
    highlightedKeys: number[];
    selectedAddress: number | null;
}

export function NodeInspector({ root, highlightedKeys, selectedAddress }: NodeInspectorProps) {
    // 1. If explicit address selected, try to find that node (O(N) traversal).
    // 2. Else use highlightedKeys.
    const activeData = useMemo(() => {
        let foundNode: TreeNode | null = null;
        let isManualSelection = false;

        const stack = root ? [root] : [];

        // Helper to traverse and find
        const findByAddress = (addr: number) => {
            const s = root ? [root] : [];
            while (s.length > 0) {
                const n = s.pop()!;
                if (n.address === addr) return n;
                if (n.right) s.push(n.right);
                if (n.left) s.push(n.left);
            }
            return null;
        };

        const findByKey = (key: number) => {
            const s = root ? [root] : [];
            while (s.length > 0) {
                const n = s.pop()!;
                if (n.key === key) return n;
                if (n.right) s.push(n.right);
                if (n.left) s.push(n.left);
            }
            return null;
        };

        if (selectedAddress !== null) {
            foundNode = findByAddress(selectedAddress);
            isManualSelection = true;
        } else if (highlightedKeys.length > 0) {
            foundNode = findByKey(highlightedKeys[0]);
        }

        return { node: foundNode, isManualSelection };
    }, [root, highlightedKeys, selectedAddress]);

    const toHex = (n: number | undefined | null) =>
        (n !== undefined && n !== null) ? `0x${n.toString(16).toUpperCase().padStart(2, '0')}` : "NULL";

    const { node, isManualSelection } = activeData;

    // Case 1: Manual selection but empty slot
    if (selectedAddress !== null && !node) {
        return (
            <Card className="h-full flex flex-col">
                <CardHeader className="py-3 px-4 border-b bg-muted/30">
                    <div className="flex items-center gap-2">
                        <Microscope className="size-4" />
                        <CardTitle className="text-sm font-medium">Struct Inspector</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-6 flex flex-col items-center justify-center text-muted-foreground h-full">
                    <div className="text-center space-y-2">
                        <div className="font-mono text-xl font-bold">{toHex(selectedAddress)}</div>
                        <div className="inline-flex items-center gap-2 text-sm bg-muted px-3 py-1 rounded-full">
                            <AlertCircle className="size-3" />
                            <span>Free Memory</span>
                        </div>
                        <p className="text-xs opacity-70 max-w-[200px] mt-2">
                            This memory address is currently unallocated.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Case 2: No selection and no highlight
    if (!node) {
        return (
            <Card className="h-full flex flex-col justify-center items-center text-muted-foreground p-6">
                <Microscope className="size-8 mb-2 opacity-50" />
                <p className="text-sm text-center">Select a grid cell or run an operation to inspect.</p>
            </Card>
        );
    }

    // Case 3: Occupied node (Manual or Highlighted)
    return (
        <Card className={cn(
            "h-full flex flex-col overflow-hidden transition-colors",
            isManualSelection ? "border-blue-500/50" : ""
        )}>
            <CardHeader className={cn(
                "py-3 px-4 border-b",
                isManualSelection ? "bg-blue-500/10" : "bg-muted/30"
            )}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Microscope className="size-4" />
                        <CardTitle className="text-sm font-medium">Struct Inspector</CardTitle>
                    </div>
                    {isManualSelection && <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">Locked</span>}
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <table className="w-full text-sm">
                    <tbody>
                    <tr className="border-b">
                        <td className="py-2 px-4 text-muted-foreground font-mono">address</td>
                        <td className="py-2 px-4 font-mono font-bold text-primary">{toHex(node.address)}</td>
                    </tr>
                    <tr className="border-b bg-muted/10">
                        <td className="py-2 px-4 text-muted-foreground font-mono">key (int)</td>
                        <td className="py-2 px-4 font-mono">{node.key}</td>
                    </tr>
                    <tr className="border-b">
                        {/* Changed spelling as requested */}
                        <td className="py-2 px-4 text-muted-foreground font-mono">colour</td>
                        <td className={cn(
                            "py-2 px-4 font-bold font-mono text-[10px]",
                            node.color === Color.RED ? "text-red-500" : "text-foreground"
                        )}>
                            {node.color === Color.RED ? "RED" : "BLACK"}
                        </td>
                    </tr>
                    <tr className="border-b bg-muted/10">
                        <td className="py-2 px-4 text-muted-foreground font-mono">left_ptr</td>
                        <td className="py-2 px-4 font-mono text-blue-500">{toHex(node.left?.address)}</td>
                    </tr>
                    <tr className="border-b">
                        <td className="py-2 px-4 text-muted-foreground font-mono">right_ptr</td>
                        <td className="py-2 px-4 font-mono text-blue-500">{toHex(node.right?.address)}</td>
                    </tr>
                    <tr className="bg-muted/10">
                        <td className="py-2 px-4 text-muted-foreground font-mono">parent_ptr</td>
                        <td className="py-2 px-4 font-mono text-blue-500">{toHex(node.parent?.address)}</td>
                    </tr>
                    </tbody>
                </table>
            </CardContent>
        </Card>
    );
}