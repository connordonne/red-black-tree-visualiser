import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrainCircuit, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuizData, QuizOption } from "@/core/RedBlackTree";

interface QuizOverlayProps {
    data: QuizData;
    onComplete: () => void;
}

export function QuizOverlay({ data, onComplete }: QuizOverlayProps) {
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);

    const handleOptionSelect = (option: QuizOption) => {
        if (isCorrect) return; 
        setSelectedOptionId(option.id);
        
        if (option.isCorrect) {
            setIsCorrect(true);
            setFeedback(option.feedback);
        } else {
            setIsCorrect(false);
            setFeedback(option.feedback);
        }
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <Card className="w-full max-w-md border-2 border-primary/20 shadow-2xl">
                <CardHeader className="bg-muted/30 pb-4">
                    <div className="flex items-center gap-2 text-primary mb-1">
                        <BrainCircuit className="size-5" />
                        <span className="text-xs font-bold uppercase tracking-wider">Predict the Step</span>
                    </div>
                    <CardTitle className="text-lg leading-tight">{data.question}</CardTitle>
                </CardHeader>
                
                <CardContent className="pt-6 space-y-3">
                    {data.options.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => handleOptionSelect(option)}
                            disabled={isCorrect === true}
                            className={cn(
                                "w-full text-left p-3 rounded-lg border text-sm font-medium transition-all relative overflow-hidden",
                                selectedOptionId === option.id
                                    ? option.isCorrect
                                        ? "bg-green-500/10 border-green-500 text-green-700 dark:text-green-300 ring-1 ring-green-500"
                                        : "bg-destructive/10 border-destructive text-destructive ring-1 ring-destructive"
                                    : "bg-card hover:bg-accent hover:border-primary/50",
                                isCorrect === true && !option.isCorrect && selectedOptionId !== option.id && "opacity-50"
                            )}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <span>{option.text}</span>
                                {selectedOptionId === option.id && (
                                    option.isCorrect 
                                        ? <CheckCircle2 className="size-5 text-green-500 shrink-0" />
                                        : <XCircle className="size-5 text-destructive shrink-0" />
                                )}
                            </div>
                        </button>
                    ))}

                    {feedback && (
                        <div className={cn(
                            "mt-4 p-3 rounded-md text-sm flex items-start gap-2 animate-in slide-in-from-top-2",
                            isCorrect ? "bg-green-500/10 text-green-800 dark:text-green-300" : "bg-destructive/10 text-destructive"
                        )}>
                            <div className="shrink-0 mt-0.5">
                                {isCorrect ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
                            </div>
                            <p>{feedback}</p>
                        </div>
                    )}
                </CardContent>

                <CardFooter className={cn(
                    "bg-muted/30 flex justify-end transition-all duration-300",
                    isCorrect ? "h-auto opacity-100 py-4" : "h-0 opacity-0 py-0 overflow-hidden"
                )}>
                    <Button onClick={onComplete} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                        Continue Execution
                        <ArrowRight className="size-4" />
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}