// src/components/ExplanationBox.tsx

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";

interface ExplanationBoxProps {
    description: string;
    currentStep: number;
    totalSteps: number;
}

export function ExplanationBox({ description, currentStep, totalSteps }: ExplanationBoxProps) {
    return (
        <Card className="border-l-4 border-l-primary shadow-sm bg-muted/20">
            <CardContent className="p-4 md:p-6">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-primary font-semibold">
                            <Info className="size-4" />
                            <span>Operation Details</span>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Step {currentStep} of {totalSteps}
                        </span>
                    </div>

                    <p className="text-lg text-foreground/90 font-medium leading-relaxed mt-1">
                        {description || "Ready to start operations. Insert or delete a node to begin."}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}