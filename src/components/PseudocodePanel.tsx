// src/components/PseudocodePanel.tsx

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ALGORITHMS } from '@/lib/pseudocode';

export interface PseudocodePanelProps {
    mode: 'insert' | 'delete';
    activeLineNumbers: number[]; // 1-based line numbers
    annotations?: Record<number, string>; // Tooltips for specific lines
    onCopy?: () => void;
    className?: string;
}

export function PseudocodePanel({
                                    mode,
                                    activeLineNumbers,
                                    annotations = {},
                                    onCopy,
                                    className
                                }: PseudocodePanelProps) {
    const [copied, setCopied] = useState(false);

    // Internal state for debugging/keyboard navigation
    const [debugLine, setDebugLine] = useState<number | null>(null);

    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const lineRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

    const codeString = ALGORITHMS[mode] || "Algorithm not found.";
    const lines = useMemo(() => codeString.split('\n'), [codeString]);

    const currentHighlights = activeLineNumbers.length > 0 ? activeLineNumbers : (debugLine ? [debugLine] : []);

    // --- Auto-scroll Logic ---
    useEffect(() => {
        if (currentHighlights.length > 0) {
            const firstActive = currentHighlights[0];
            const element = lineRefs.current[firstActive];

            if (element && scrollAreaRef.current) {
                element.scrollIntoView({
                    block: 'center',
                    behavior: 'smooth'
                });
            }
        }
    }, [currentHighlights, mode]);

    useEffect(() => {
        setDebugLine(null);
    }, [mode]);

    // --- Copy Logic ---
    const handleCopy = () => {
        navigator.clipboard.writeText(codeString);
        setCopied(true);
        onCopy?.();
        setTimeout(() => setCopied(false), 2000);
    };

    // --- Keyboard Navigation ---
    const handleKeyDown = (e: React.KeyboardEvent) => {
        let nextLine = debugLine || activeLineNumbers[0] || 1;

        if (e.key === 'ArrowDown' || e.key === 'j') {
            e.preventDefault();
            nextLine = Math.min(lines.length, nextLine + 1);
            setDebugLine(nextLine);
        } else if (e.key === 'ArrowUp' || e.key === 'k') {
            e.preventDefault();
            nextLine = Math.max(1, nextLine - 1);
            setDebugLine(nextLine);
        }
    };

    return (
        <Card
            className={cn("flex flex-col h-full overflow-hidden outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring", className)}
            tabIndex={0}
            onKeyDown={handleKeyDown}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 bg-muted/30 border-b">
                <div className="flex items-center gap-2">
                    <Terminal className="size-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-medium uppercase tracking-wider">
                        {mode} Algorithm
                    </CardTitle>
                    {activeLineNumbers.length > 0 && (
                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                            Line {activeLineNumbers.join(', ')}
                        </Badge>
                    )}
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleCopy}
                    title="Copy code"
                >
                    {copied ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
                    <span className="sr-only">Copy</span>
                </Button>
            </CardHeader>

            <CardContent className="p-0 flex-1 overflow-hidden relative bg-card">
                <div
                    ref={scrollAreaRef}
                    className="h-full overflow-y-auto py-2 font-mono text-xs md:text-sm leading-6"
                >
                    {lines.map((lineContent, index) => {
                        const lineNumber = index + 1;
                        const isActive = currentHighlights.includes(lineNumber);
                        const annotation = annotations[lineNumber];

                        return (
                            <div
                                key={lineNumber}
                                ref={(el) => (lineRefs.current[lineNumber] = el)}
                                className={cn(
                                    "group flex w-full px-4 transition-colors duration-150",
                                    isActive
                                        ? "bg-primary/10 text-primary-foreground dark:text-primary"
                                        : "hover:bg-muted/50 text-muted-foreground"
                                )}
                                title={annotation || undefined} // Tooltip remains here
                            >
                                {/* Line Number */}
                                <span className={cn(
                                    "inline-block w-8 mr-4 text-right select-none opacity-50 shrink-0",
                                    isActive ? "text-primary font-bold opacity-100" : ""
                                )}>
                                    {lineNumber}
                                </span>

                                {/* Code Content */}
                                <span className={cn(
                                    "whitespace-pre flex-1",
                                    isActive ? "font-medium text-foreground" : ""
                                )}>
                                    {lineContent}
                                </span>

                                {/* REMOVED: The span that was rendering the annotation text explicitly */}
                            </div>
                        );
                    })}

                    <div className="h-4" /> {/* Bottom spacer */}
                </div>
            </CardContent>
        </Card>
    );
}