// src/components/ExplanationBox.tsx

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExplanationBoxProps {
    description: string;
    currentStep: number;
    totalSteps: number;
    className?: string; 
}

export function ExplanationBox({ description, currentStep, totalSteps, className }: ExplanationBoxProps) {
    return (
        <Card className={cn("border-t-4 border-t-primary/20 shadow-sm flex flex-col h-full", className)}>
            <CardContent className="p-3 flex flex-col gap-1.5 h-full overflow-hidden">
                <div className="flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2 text-primary font-semibold">
                        <Info className="size-4" />
                        <span className="text-sm">Operation Details</span>
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        Step {currentStep} of {totalSteps}
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 flex flex-col justify-center">
                    <p className="text-sm text-foreground/90 font-medium leading-snug">
                        {description || "Ready to start operations. Insert or delete a node to begin."}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}