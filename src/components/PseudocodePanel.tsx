// src/components/PseudocodePanel.tsx

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Terminal, ArrowDownCircle, Maximize2, Minimize2, GripHorizontal, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ALGORITHMS } from '@/lib/pseudocode';
import type { DragControls } from 'framer-motion';

export interface PseudocodePanelProps {
    mode: 'insert' | 'delete' | 'find';
    activeLineNumbers: number[];
    annotations?: Record<number, string>;
    onCopy?: () => void;
    className?: string;
    dragControls?: DragControls;
    hoveredLine?: number | null;
    onHoverLine?: (line: number | null) => void;
    glowingLines?: number[];
}

const highlightSyntax = (line: string) => {
    if (!line) return null;
    const commentIndex = line.indexOf('//');
    let code = line;
    let comment = '';
    if (commentIndex !== -1) {
        code = line.substring(0, commentIndex);
        comment = line.substring(commentIndex);
    }
    const tokens = code.split(/(\s+|[().,])/);
    const renderedTokens = tokens.map((token, i) => {
        if (['if', 'else', 'while', 'return', 'elseif'].includes(token.trim())) {
            return <span key={i} className="text-purple-600 dark:text-purple-400 font-bold">{token}</span>;
        }
        if (['T.nil', 'T.root', 'true', 'false', 'null'].includes(token.trim())) {
            return <span key={i} className="text-blue-600 dark:text-blue-400">{token}</span>;
        }
        if (token.trim() === 'RED') {
            return <span key={i} className="text-red-600 font-bold">{token}</span>;
        }
        if (token.trim() === 'BLACK') {
            return <span key={i} className="text-slate-800 dark:text-slate-200 font-bold">{token}</span>;
        }
        return token;
    });
    return (
        <>
            {renderedTokens}
            {comment && <span className="text-green-600 dark:text-green-500 italic opacity-80">{comment}</span>}
        </>
    );
};

export function PseudocodePanel({
                                    mode,
                                    activeLineNumbers = [],
                                    annotations,
                                    onCopy,
                                    className,
                                    dragControls,
                                    onHoverLine,
                                    glowingLines = []
                                }: PseudocodePanelProps) {
    const [copied, setCopied] = useState(false);
    const [debugLine, setDebugLine] = useState<number | null>(null);
    const [autoScroll, setAutoScroll] = useState(true);
    const [isMinimized, setIsMinimized] = useState(false);

    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const lineRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

    const codeString = ALGORITHMS[mode] || "// Algorithm code not found.";
    // Split on newline and optionally carriage return to prevent hidden characters
    const lines = useMemo(() => codeString.split(/\r?\n/), [codeString]);

    const currentHighlights = useMemo(() => {
        return activeLineNumbers.length > 0 ? activeLineNumbers : (debugLine ? [debugLine] : []);
    }, [activeLineNumbers, debugLine]);

    // Use native scrollIntoView for reliable auto-scrolling
    useEffect(() => {
        if (autoScroll && currentHighlights.length > 0 && !isMinimized) {
            const firstActive = currentHighlights[0];
            const element = lineRefs.current[firstActive];

            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [currentHighlights, autoScroll, isMinimized]);

    useEffect(() => {
        setDebugLine(null);
    }, [mode]);

    const handleCopy = () => {
        navigator.clipboard.writeText(codeString);
        setCopied(true);
        onCopy?.();
        setTimeout(() => setCopied(false), 2000);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (isMinimized) return;
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
            className={cn(
                "flex flex-col outline-none transition-all duration-300 bg-transparent border-none shadow-none pointer-events-none w-full",
                isMinimized ? "h-auto" : "flex-1 min-h-0 overflow-hidden",
                className
            )}
            tabIndex={-1}
        >
            {/* Header / Grab Handle */}
            <div
                className={cn(
                    "pointer-events-auto inline-flex flex-row items-center justify-between p-2 transition-colors rounded-xl mb-2 w-fit min-w-[200px] gap-6 group",
                    dragControls ? "cursor-grab active:cursor-grabbing touch-none hover:bg-background/40 hover:backdrop-blur-sm" : ""
                )}
                onPointerDown={(e) => {
                    if (dragControls) dragControls.start(e);
                }}
            >
                <div className="flex items-center gap-2 pr-2">
                    {dragControls && <GripHorizontal className="size-3.5 text-muted-foreground opacity-30 group-hover:opacity-80 transition-opacity shrink-0" />}
                    <Terminal className="size-3.5 text-muted-foreground shrink-0 drop-shadow-sm" />
                    <span className="text-xs font-bold uppercase tracking-wider shrink-0 text-foreground drop-shadow-sm">
                        {mode}
                    </span>
                    {!isMinimized && activeLineNumbers.length > 0 && (
                        <Badge variant="secondary" className="text-[9px] h-4 px-1 animate-pulse shrink-0 ml-1 shadow-sm">
                            Exec: {activeLineNumbers.join(', ')}
                        </Badge>
                    )}
                </div>

                <div className="flex items-center gap-0.5 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
                    {!isMinimized && (
                        <>
                            <Button
                                variant={autoScroll ? "secondary" : "ghost"}
                                size="icon"
                                className="h-6 w-6 bg-transparent"
                                onClick={(e) => { e.stopPropagation(); setAutoScroll(!autoScroll); }}
                                title={autoScroll ? "Auto-scroll ON (Click to disable)" : "Auto-scroll OFF (Click to enable)"}
                            >
                                <ArrowDownCircle className={cn("size-3 transition-all", autoScroll ? "text-primary" : "text-muted-foreground opacity-50")} />
                                <span className="sr-only">Toggle Auto-scroll</span>
                            </Button>

                            <Button variant="ghost" size="icon" className="h-6 w-6 bg-transparent" onClick={(e) => { e.stopPropagation(); handleCopy(); }} title="Copy code">
                                {copied ? <Check className="size-3 text-green-500" /> : <Copy className="size-3 drop-shadow-sm" />}
                                <span className="sr-only">Copy</span>
                            </Button>
                        </>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 bg-transparent text-muted-foreground hover:text-foreground"
                        onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                        title={isMinimized ? "Maximize Panel" : "Minimize Panel"}
                    >
                        {isMinimized ? <Maximize2 className="size-3 drop-shadow-sm" /> : <Minimize2 className="size-3 drop-shadow-sm" />}
                        <span className="sr-only">Toggle Minimize</span>
                    </Button>
                </div>
            </div>

            {/* Code Lines Container */}
            {!isMinimized && (
                <div
                    ref={scrollAreaRef}
                    className="flex-1 overflow-y-auto relative font-mono text-[11px] md:text-xs pointer-events-auto min-h-0 w-full scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                >
                    <div className="py-1 leading-5 flex flex-col items-start w-fit pointer-events-auto pb-4 pr-4">
                        {lines.map((rawLineContent, index) => {
                            // Trim trailing whitespace to prevent highlighting invisible blocks
                            const lineContent = rawLineContent.trimEnd();
                            const lineNumber = index + 1;
                            const isActive = currentHighlights.includes(lineNumber);
                            const annotation = annotations?.[lineNumber];

                            return (
                                <div key={lineNumber} className="flex flex-col items-start max-w-full">
                                    <div
                                        ref={(el: HTMLDivElement | null) => { lineRefs.current[lineNumber] = el; }}
                                        onMouseEnter={() => onHoverLine?.(lineNumber)}
                                        onMouseLeave={() => onHoverLine?.(null)}
                                        className={cn(
                                            "group/line inline-flex items-center w-fit max-w-full px-2 md:px-3 border-l-2 transition-all duration-150 py-0.5 cursor-pointer",
                                            isActive
                                                ? "bg-primary/20 backdrop-blur-md border-l-primary text-foreground rounded-r-md shadow-sm"
                                                : "border-l-transparent text-foreground/80 hover:bg-background/50 hover:backdrop-blur-sm hover:text-foreground rounded-r-md",
                                            glowingLines.includes(lineNumber)
                                                ? "bg-chart-4/20 border-l-chart-4 font-bold text-foreground"
                                                : ""
                                        )}
                                        title={isActive ? undefined : (annotation || undefined)}
                                    >
                                        <span className={cn(
                                            "inline-block w-6 mr-2 text-right select-none opacity-40 shrink-0",
                                            isActive ? "text-primary font-bold opacity-100" : ""
                                        )}>
                                            {lineNumber}
                                        </span>

                                        <span className={cn(
                                            "whitespace-pre-wrap break-words drop-shadow-sm pr-2",
                                            isActive ? "font-bold" : "font-medium"
                                        )}>
                                            {highlightSyntax(lineContent)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Minimized Status */}
            {isMinimized && (
                <div className="pointer-events-auto p-1.5 px-3 hover:bg-background/40 hover:backdrop-blur-sm transition-all font-mono text-[11px] md:text-xs bg-background/70 backdrop-blur-md border border-border/40 shadow-sm rounded-full inline-flex items-center w-fit ml-1 mt-1 max-w-full">
                    {activeLineNumbers.length > 0 && lines[activeLineNumbers[0] - 1] ? (
                        <div className="flex items-center gap-2 truncate">
                            <span className="text-primary font-bold shrink-0 drop-shadow-sm">{activeLineNumbers[0]}</span>
                            <span className="truncate font-medium drop-shadow-sm">{highlightSyntax(lines[activeLineNumbers[0] - 1].trimEnd())}</span>
                        </div>
                    ) : (
                        <div className="text-muted-foreground italic truncate drop-shadow-sm">Waiting for operation...</div>
                    )}
                </div>
            )}
        </Card>
    );
}