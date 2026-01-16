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
    totalSteps: number;
    speed: number;
    setSpeed: (speed: number) => void;
    description: string;
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
                                   totalSteps,
                                   speed,
                                   setSpeed,
                                   description
                               }: PlayerControlsProps) {
    return (
        <Card>
            <CardContent className="p-4 flex flex-col gap-4">
                {/* Status Bar */}
                <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                    <span className="font-medium text-foreground">
                        Step {currentStep + 1} / {totalSteps}
                    </span>
                    <span className="truncate ml-4 flex-1 text-right" title={description}>
                        {description || "Ready"}
                    </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
                    {/* Playback Controls */}
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={onStart} disabled={currentStep === 0} title="First Step">
                            <SkipBack className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onPrev} disabled={currentStep === 0} title="Previous Step">
                            <ChevronLeft className="size-4" />
                        </Button>
                        <Button
                            variant={isPlaying ? "secondary" : "default"}
                            size="icon"
                            onClick={onPlayPause}
                            className="mx-1"
                            title={isPlaying ? "Pause" : "Play"}
                        >
                            {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onNext} disabled={currentStep >= totalSteps - 1} title="Next Step">
                            <ChevronRight className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onEnd} disabled={currentStep >= totalSteps - 1} title="Last Step">
                            <SkipForward className="size-4" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto flex-1 sm:flex-none">
                        {/* Reset Button */}
                        <Button variant="outline" size="sm" onClick={onReset} className="h-8 gap-1.5 ml-auto sm:ml-0">
                            <RotateCcw className="size-3.5" />
                            <span className="sr-only sm:not-sr-only">Restart</span>
                        </Button>

                        {/* Speed Slider */}
                        <div className="flex items-center gap-2 flex-1 min-w-[120px]">
                            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Speed</span>
                            <Slider
                                min={100}
                                max={2000}
                                step={100}
                                // Invert value for slider (left = slow/high ms, right = fast/low ms)
                                value={2100 - speed}
                                onChange={(e) => setSpeed(2100 - parseInt(e.target.value))}
                                className="flex-1"
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}