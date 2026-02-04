// src/components/NodeInspector.tsx

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TreeNode, Color } from "@/core/RedBlackTree";
import { cn } from "@/lib/utils";
import { Microscope, AlertCircle, Lock } from 'lucide-react';

interface NodeInspectorProps {
    root: TreeNode | null;
    highlightedKeys: number[];
    selectedAddress: number | null;
    showAddresses: boolean;
}

export function NodeInspector({ root, highlightedKeys, selectedAddress, showAddresses }: NodeInspectorProps) {
    const activeData = useMemo(() => {
        let foundNode: TreeNode | null = null;
        let isManualSelection = false;

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

    // Manual selection but empty slot
    if (selectedAddress !== null && !node) {
        return (
            <Card className="h-full flex flex-col">
                <CardHeader className="py-3 px-4 border-b bg-muted/20">
                    <div className="flex items-center gap-2">
                        <Microscope className="size-4 text-muted-foreground" />
                        <CardTitle className="text-sm font-medium">Struct Inspector</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-6 flex flex-col items-center justify-center text-muted-foreground h-full">
                    <div className="text-center space-y-2 bg-muted/30 p-4 rounded-lg border border-dashed">
                        <div className="font-mono text-2xl font-bold text-primary">{toHex(selectedAddress)}</div>
                        <div className="inline-flex items-center gap-2 text-xs bg-muted px-2 py-1 rounded-full">
                            <AlertCircle className="size-3" />
                            <span>Free Memory</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!node) {
        return (
            <Card className="h-full flex flex-col justify-center items-center text-muted-foreground p-6 bg-muted/5 border-dashed">
                <Microscope className="size-8 mb-2 opacity-30" />
                <p className="text-sm text-center">Select a grid cell or run an operation to inspect.</p>
            </Card>
        );
    }

    return (
        <Card className={cn(
            "h-full flex flex-col overflow-hidden transition-all duration-300",
            isManualSelection ? "ring-2 ring-blue-500/20 border-blue-500/30" : ""
        )}>
            <CardHeader className={cn(
                "py-3 px-4 border-b flex flex-row items-center justify-between",
                isManualSelection ? "bg-blue-500/5" : "bg-muted/20"
            )}>
                <div className="flex items-center gap-2">
                    <Microscope className="size-4" />
                    <CardTitle className="text-sm font-medium">Struct Inspector</CardTitle>
                </div>
                {isManualSelection && <Lock className="size-3 text-blue-500" />}
            </CardHeader>
            <CardContent className="p-0">
                <div className="w-full text-sm font-mono">
                    <div className="grid grid-cols-2 border-b divide-x">
                        <div className="p-2 pl-4 text-muted-foreground">address</div>
                        <div className="p-2 pl-4 font-bold text-primary">{toHex(node.address)}</div>
                    </div>
                    <div className="grid grid-cols-2 border-b divide-x bg-muted/5">
                        <div className="p-2 pl-4 text-muted-foreground">key (int)</div>
                        <div className="p-2 pl-4 font-semibold text-foreground">{node.key}</div>
                    </div>
                    <div className="grid grid-cols-2 border-b divide-x">
                        <div className="p-2 pl-4 text-muted-foreground">color</div>
                        <div className={cn(
                            "p-2 pl-4 font-bold text-[10px] flex items-center gap-2",
                            node.color === Color.RED ? "text-red-600" : "text-foreground"
                        )}>
                            <div className={cn("w-2 h-2 rounded-full", node.color === Color.RED ? "bg-red-500" : "bg-foreground")} />
                            {node.color === Color.RED ? "RED" : "BLACK"}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 border-b divide-x bg-muted/5">
                        <div className="p-2 pl-4 text-muted-foreground">parent</div>
                        <div className="p-2 pl-4 text-blue-600 dark:text-blue-400">
                            {showAddresses ? toHex(node.parent?.address) : (node.parent ? `Key: ${node.parent.key}` : "NULL")}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 border-b divide-x">
                        <div className="p-2 pl-4 text-muted-foreground">left</div>
                        <div className="p-2 pl-4 text-blue-600 dark:text-blue-400">
                            {showAddresses ? toHex(node.left?.address) : (node.left ? `Key: ${node.left.key}` : "NULL")}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 divide-x bg-muted/5">
                        <div className="p-2 pl-4 text-muted-foreground">right</div>
                        <div className="p-2 pl-4 text-blue-600 dark:text-blue-400">
                            {showAddresses ? toHex(node.right?.address) : (node.right ? `Key: ${node.right.key}` : "NULL")}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}