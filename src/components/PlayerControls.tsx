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
                               }: PlayerControlsProps) {
    return (
        <Card className="border-t-4 border-t-primary/20">
            <CardContent className="p-4 space-y-4">
                {/* Timeline Scrubber */}
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                        <span>Start</span>
                        <span>Timeline ({currentStep} / {Math.max(0, totalSteps - 1)})</span>
                        <span>End</span>
                    </div>
                    <Slider
                        min={0}
                        max={Math.max(0, totalSteps - 1)}
                        step={1}
                        // FIX: Pass a single number, not an array
                        value={currentStep} 
                        // FIX: Use standard onChange event and parse the string value to int
                        onChange={(e) => setCurrentStep(parseInt(e.target.value))} 
                        className="cursor-pointer"
                    />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
                    {/* Playback Controls */}
                    <div className="flex items-center gap-1 order-2 sm:order-1">
                        <Button variant="ghost" size="icon" onClick={onStart} disabled={currentStep === 0} title="First Step (Home)">
                            <SkipBack className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onPrev} disabled={currentStep === 0} title="Previous Step (Left Arrow)">
                            <ChevronLeft className="size-4" />
                        </Button>
                        <Button
                            variant={isPlaying ? "secondary" : "default"}
                            size="icon"
                            onClick={onPlayPause}
                            className="mx-1 shadow-md hover:scale-105 transition-transform"
                            title={isPlaying ? "Pause (Space)" : "Play (Space)"}
                        >
                            {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 fill-current" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onNext} disabled={currentStep >= totalSteps - 1} title="Next Step (Right Arrow)">
                            <ChevronRight className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onEnd} disabled={currentStep >= totalSteps - 1} title="Last Step (End)">
                            <SkipForward className="size-4" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto flex-1 sm:flex-none order-1 sm:order-2">
                        {/* Speed Slider */}
                        <div className="flex items-center gap-2 flex-1 min-w-[120px] bg-muted/30 p-1.5 rounded-lg border border-border/50">
                            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap px-1">Speed</span>
                            <Slider
                                min={100}
                                max={2000}
                                step={100}
                                // FIX: Pass single number
                                value={2100 - speed} 
                                // FIX: Parse event value
                                onChange={(e) => setSpeed(2100 - parseInt(e.target.value))}
                                className="flex-1"
                            />
                        </div>

                        {/* Reset Button */}
                        <Button variant="outline" size="sm" onClick={onReset} className="h-9 gap-1.5 ml-auto sm:ml-0 text-muted-foreground hover:text-foreground">
                            <RotateCcw className="size-3.5" />
                            <span className="sr-only sm:not-sr-only">Reset</span>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}