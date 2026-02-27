// src/components/ExplanationBox.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, ShieldCheck, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TreeHealth } from "@/core/RedBlackTree";

interface ExplanationBoxProps {
    health?: TreeHealth;
    className?: string;
    // Props below are kept optional for compatibility but are no longer rendered
    description?: string; 
    currentStep?: number;
    totalSteps?: number;
    recolorData?: { prompt: string; expected: Record<number, number> };
    onRecolorSubmit?: () => void;
    recolorError?: string | null;
}

const RBT_RULES = [
    {
        id: 1,
        short: "Colour",
        desc: "Every node is either red or black.",
    },
    {
        id: 2,
        short: "Root",
        desc: "The root is black.",
    },
    {
        id: 3,
        short: "Leaves",
        desc: "Every leaf (NIL) is black.",
    },
    {
        id: 4,
        short: "Red",
        desc: "If a node is red, then both its children are black.",
    },
    {
        id: 5,
        short: "Black-Height",
        desc: "All simple paths from a node to descendant leaves contain the same number of black nodes.",
    }
];

export function ExplanationBox({ health, className, recolorData, onRecolorSubmit, recolorError }: ExplanationBoxProps) {
    // Default to healthy if no data
    const currentViolations = health?.violations || [];
    const isHealthy = currentViolations.length === 0;
    
    return (
        <Card className={cn(
            "flex flex-col h-full overflow-hidden shadow-sm border transition-colors duration-300",
            // Optional: Add a subtle border color change based on health
            isHealthy ? "border-border" : "border-amber-200 dark:border-amber-900/50",
            className
        )}>
            {/* NEW: Dynamic Contextual Recolor Prompt */}
            {recolorData && (
                <div className="p-4 border-b bg-amber-50 dark:bg-amber-950/20">
                    <div className="flex items-start gap-3">
                        <ShieldAlert className="size-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-amber-900 dark:text-amber-200">{recolorData.prompt}</p>
                            {recolorError && (
                                <p className="text-xs font-semibold text-red-600 dark:text-red-400 mt-2">{recolorError}</p>
                            )}
                            <Button 
                                size="sm" 
                                className="mt-3 w-full bg-amber-600 hover:bg-amber-700 text-white" 
                                onClick={onRecolorSubmit}
                            >
                                Verify Colors
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header Section */}
            <div className="flex items-center gap-2.5 p-4 border-b bg-card/50">
                {isHealthy ? (
                    <ShieldCheck className="size-5 text-green-600 dark:text-green-500" />
                ) : (
                    <ShieldAlert className="size-5 text-amber-500 dark:text-amber-400" />
                )}
                <h3 className="font-semibold text-sm text-foreground tracking-tight">
                    RBT Properties
                </h3>
            </div>

            {/* Rules List Section */}
            <CardContent className="p-0 flex-1 overflow-y-auto bg-background relative scrollbar-thin">
                <div className="divide-y divide-border/40">
                    {RBT_RULES.map((rule) => {
                        const isViolated = currentViolations.includes(rule.id);
                        
                        return (
                            <div 
                                key={rule.id} 
                                className={cn(
                                    "px-4 py-3 flex items-start gap-3 text-xs transition-colors duration-300", 
                                    isViolated 
                                        ? "bg-red-50 dark:bg-red-950/20" 
                                        : "hover:bg-muted/5"
                                )}
                            >
                                <div className={cn(
                                    "mt-0.5 shrink-0 rounded-full p-0.5 border",
                                    isViolated 
                                        ? "bg-red-100 border-red-200 text-red-600 dark:bg-red-900/50 dark:border-red-800 dark:text-red-200" 
                                        : "bg-green-100 border-green-200 text-green-600 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400"
                                )}>
                                    {isViolated ? <X className="size-2.5" /> : <Check className="size-2.5" />}
                                </div>
                                
                                <div className="flex-1 space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "font-bold text-[10px] uppercase tracking-wide",
                                            isViolated ? "text-red-700 dark:text-red-300" : "text-muted-foreground"
                                        )}>
                                            {rule.id}. {rule.short}
                                        </span>
                                    </div>
                                    <p className={cn(
                                        "leading-relaxed",
                                        isViolated ? "text-red-900 dark:text-red-100 font-medium" : "text-foreground/70"
                                    )}>
                                        {rule.desc}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}