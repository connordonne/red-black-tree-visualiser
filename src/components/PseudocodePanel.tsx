// src/components/PseudocodePanel.tsx

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Terminal, Info, ArrowDownCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ALGORITHMS } from '@/lib/pseudocode';

export interface PseudocodePanelProps {
    mode: 'insert' | 'delete' | 'find'; 
    activeLineNumbers: number[]; 
    annotations?: Record<number, string>;
    onCopy?: () => void;
    className?: string;
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
                                    annotations = {},
                                    onCopy,
                                    className
                                }: PseudocodePanelProps) {
    const [copied, setCopied] = useState(false);
    const [debugLine, setDebugLine] = useState<number | null>(null);
    const [autoScroll, setAutoScroll] = useState(true);

    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const lineRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

    const codeString = ALGORITHMS[mode] || "// Algorithm code not found.";
    const lines = useMemo(() => codeString.split('\n'), [codeString]);

    const currentHighlights = useMemo(() => {
        return activeLineNumbers.length > 0 ? activeLineNumbers : (debugLine ? [debugLine] : []);
    }, [activeLineNumbers, debugLine]);

    useEffect(() => {
        if (autoScroll && currentHighlights.length > 0 && scrollAreaRef.current) {
            const firstActive = currentHighlights[0];
            const element = lineRefs.current[firstActive];

            if (element) {
                const container = scrollAreaRef.current;
                const elementTop = element.offsetTop;
                const elementHeight = element.offsetHeight;
                const containerHeight = container.clientHeight;
                const scrollTop = container.scrollTop;

                const isVisible = (
                    elementTop >= scrollTop + 20 &&
                    (elementTop + elementHeight) <= (scrollTop + containerHeight - 20)
                );

                if (!isVisible) {
                    container.scrollTo({
                        top: elementTop - (containerHeight / 2) + (elementHeight / 2),
                        behavior: 'smooth'
                    });
                }
            }
        }
    }, [currentHighlights, mode, autoScroll]);

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
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 bg-muted/50 border-b">
                <div className="flex items-center gap-2">
                    <Terminal className="size-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-medium uppercase tracking-wider">
                        {mode} Algorithm
                    </CardTitle>
                    {activeLineNumbers.length > 0 && (
                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 animate-pulse">
                            Exec: Line {activeLineNumbers.join(', ')}
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <Button 
                        variant={autoScroll ? "secondary" : "ghost"} 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => setAutoScroll(!autoScroll)}
                        title={autoScroll ? "Auto-scroll ON (Click to disable)" : "Auto-scroll OFF (Click to enable)"}
                    >
                        <ArrowDownCircle className={cn("size-3.5 transition-all", autoScroll ? "text-primary" : "text-muted-foreground opacity-50")} />
                        <span className="sr-only">Toggle Auto-scroll</span>
                    </Button>

                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy} title="Copy code">
                        {copied ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
                        <span className="sr-only">Copy</span>
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="p-0 flex-1 overflow-hidden relative bg-card font-mono text-xs md:text-sm">
                <div
                    ref={scrollAreaRef}
                    className="h-full overflow-y-auto py-2 leading-6"
                >
                    {lines.map((lineContent, index) => {
                        const lineNumber = index + 1;
                        const isActive = currentHighlights.includes(lineNumber);
                        const annotation = annotations[lineNumber];

                        return (
                            <div key={lineNumber} className="flex flex-col">
                                <div
                                    ref={(el: HTMLDivElement | null) => { lineRefs.current[lineNumber] = el; }}
                                    className={cn(
                                        "group flex w-full px-4 border-l-4 transition-colors duration-150",
                                        isActive
                                            ? "bg-primary/10 border-l-primary text-foreground"
                                            : "border-l-transparent text-muted-foreground hover:bg-muted/30"
                                    )}
                                    title={isActive ? undefined : (annotation || undefined)}
                                >
                                    <span className={cn(
                                        "inline-block w-8 mr-4 text-right select-none opacity-40 shrink-0",
                                        isActive ? "text-primary font-bold opacity-100" : ""
                                    )}>
                                        {lineNumber}
                                    </span>

                                    <span className={cn(
                                        "whitespace-pre flex-1",
                                        isActive ? "font-medium" : ""
                                    )}>
                                        {highlightSyntax(lineContent)}
                                    </span>
                                </div>

                                {isActive && annotation && (
                                    <div className="pl-16 pr-4 py-2 bg-primary/5 border-l-4 border-l-primary/50 animate-in slide-in-from-top-1 duration-200">
                                        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-background/50 p-2 rounded border shadow-sm">
                                            <Info className="size-3.5 mt-0.5 text-primary shrink-0" />
                                            <span className="leading-snug">
                                                <span className="font-semibold text-primary/80 mr-1">Why:</span>
                                                {annotation}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    <div className="h-8" />
                </div>
            </CardContent>
        </Card>
    );
}