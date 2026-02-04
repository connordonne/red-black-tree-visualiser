// src/components/PlayerControls.tsx

import React from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    ChevronLeft,
    ChevronRight,
    RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayerControlsProps {
    isPlaying: boolean;
    onPlayPause: () => void;
    onNext: () => void;
    onPrev: () => void;
    onStart: () => void;
    onEnd: () => void;
    onReset: () => void;
    currentStep: number;
    setCurrentStep: (step: number) => void;
    totalSteps: number;
    speed: number;
    setSpeed: (speed: number) => void;
    className?: string; 
}

export function PlayerControls({
                                   isPlaying,
                                   onPlayPause,
                                   onNext,
                                   onPrev,
                                   onStart,
                                   onEnd,
                                   onReset,
                                   currentStep,
                                   setCurrentStep,
                                   totalSteps,
                                   speed,
                                   setSpeed,
                                   className
                               }: PlayerControlsProps) {
    return (
        <Card className={cn("border-t-4 border-t-primary/20 h-full flex flex-col justify-center", className)}>
            <CardContent className="p-3 space-y-2">
                {/* Timeline Scrubber */}
                <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
                        <span>Start</span>
                        <span>{currentStep} / {Math.max(0, totalSteps - 1)}</span>
                        <span>End</span>
                    </div>
                    <Slider
                        min={0}
                        max={Math.max(0, totalSteps - 1)}
                        step={1}
                        value={currentStep} 
                        onChange={(e) => setCurrentStep(parseInt(e.target.value))} 
                        className="cursor-pointer h-1.5"
                    />
                </div>

                <div className="flex items-center gap-2 justify-between">
                    {/* Playback Controls */}
                    <div className="flex items-center gap-0.5">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onStart} disabled={currentStep === 0}>
                            <SkipBack className="size-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onPrev} disabled={currentStep === 0}>
                            <ChevronLeft className="size-3.5" />
                        </Button>
                        <Button
                            variant={isPlaying ? "secondary" : "default"}
                            size="icon"
                            onClick={onPlayPause}
                            className="mx-1 h-7 w-7 shadow-sm"
                        >
                            {isPlaying ? <Pause className="size-3" /> : <Play className="size-3 fill-current" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onNext} disabled={currentStep >= totalSteps - 1}>
                            <ChevronRight className="size-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEnd} disabled={currentStep >= totalSteps - 1}>
                            <SkipForward className="size-3.5" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
                        {/* Speed Slider */}
                        <div className="flex items-center gap-2 w-[160px] bg-muted/30 p-1.5 rounded border border-border/50">
                            <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap px-1">Speed</span>
                            <Slider
                                min={100}
                                max={2000}
                                step={100}
                                value={2100 - speed} 
                                onChange={(e) => setSpeed(2100 - parseInt(e.target.value))}
                                className="flex-1 h-2"
                            />
                        </div>

                        {/* Reset Button */}
                        <Button variant="outline" size="sm" onClick={onReset} className="h-7 px-2 text-muted-foreground hover:text-foreground text-[10px]">
                            <RotateCcw className="size-3 mr-1" />
                            Reset
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}