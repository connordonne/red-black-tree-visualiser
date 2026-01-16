// src/RedBlackTreeVisualiser.tsx

import React, { useState, useEffect, useCallback } from "react";
import { Controls } from "@/components/Controls";
import { PlayerControls } from "@/components/PlayerControls";
import { ExplanationBox } from "@/components/ExplanationBox";
import { RedBlackTree, type Step } from "@/core/RedBlackTree";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import TreeCanvas from "@/components/TreeCanvas";
import { PseudocodePanel } from "@/components/PseudocodePanel";
import { ANNOTATIONS } from "@/lib/pseudocode";
import { ViewOptions } from "@/components/ViewOptions"; // Imported ViewOptions
import { cn } from "@/lib/utils";

const INITIAL_STEP: Step = {
    treeState: null,
    description: "Initial State",
    highlightedNodeKeys: [],
    pseudocodeLines: []
};

export default function RedBlackTreeVisualiser() {
    const [steps, setSteps] = useState<Step[]>([INITIAL_STEP]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1000);

    const [keyToInsert, setKeyToInsert] = useState("");
    const [keyToDelete, setKeyToDelete] = useState("");
    const [keyToFind, setKeyToFind] = useState("");

    const [activeTab, setActiveTab] = useState("insert");

    // --- View State ---
    const [showTree, setShowTree] = useState(true);
    const [showExplanation, setShowExplanation] = useState(true);
    const [showPseudocode, setShowPseudocode] = useState(true);
    const [showControls, setShowControls] = useState(true);

    useEffect(() => {
        let timer: number;
        if (isPlaying && currentStepIndex < steps.length - 1) {
            timer = window.setTimeout(() => {
                setCurrentStepIndex((prev) => prev + 1);
            }, playbackSpeed);
        } else if (isPlaying && currentStepIndex >= steps.length - 1) {
            setIsPlaying(false);
        }
        return () => clearTimeout(timer);
    }, [isPlaying, currentStepIndex, steps.length, playbackSpeed]);

    const runOperation = (
        operationFn: (tree: RedBlackTree) => Step[],
        opType?: 'insert' | 'delete'
    ) => {
        const lastStep = steps[steps.length - 1];
        const reconstruction = new RedBlackTree();
        reconstruction.root = lastStep.treeState;
        const workingTree = reconstruction.clone();

        const newSteps = operationFn(workingTree);
        if (newSteps.length === 0) return;

        const stepsWithMeta = newSteps.map(s => ({
            ...s,
            operationType: opType
        }));

        setSteps(prev => [...prev, ...stepsWithMeta]);
        setCurrentStepIndex(steps.length);
        setIsPlaying(true);
    };

    function submitInsert() {
        if (keyToInsert === "") return;
        runOperation((t) => t.insert(parseInt(keyToInsert, 10)), 'insert');
        setKeyToInsert("");
    }

    function submitDelete() {
        if (keyToDelete === "") return;
        runOperation((t) => t.delete(parseInt(keyToDelete, 10)), 'delete');
        setKeyToDelete("");
    }

    function submitFind() {
        if (keyToFind === "") return;
        const val = parseInt(keyToFind, 10);
        runOperation((t) => {
            const node = t.find(val);
            return [{
                treeState: t.clone().root,
                description: node ? `Node ${val} found.` : `Node ${val} not found.`,
                highlightedNodeKeys: node ? [node.key] : [],
                pseudocodeLines: []
            }];
        });
        setKeyToFind("");
    }

    function onBulkRandom() {
        setActiveTab('insert');
        runOperation((t) => {
            const bulkSteps: Step[] = [];
            for (let i = 0; i < 10; i++) {
                const randomKey = Math.floor(Math.random() * 100);
                const opSteps = t.insert(randomKey);
                bulkSteps.push(...opSteps);
            }
            return bulkSteps;
        }, 'insert');
    }

    function onClear() {
        setSteps([INITIAL_STEP]);
        setCurrentStepIndex(0);
        setIsPlaying(false);
    }

    const handleResetAnimation = useCallback(() => {
        setCurrentStepIndex(0);
        setIsPlaying(false);
    }, []);

    const currentStepData = steps[currentStepIndex] || INITIAL_STEP;
    const pseudocodeMode = activeTab === 'delete' ? 'delete' : 'insert';
    const activeLinesToRender = (currentStepData.operationType === pseudocodeMode)
        ? currentStepData.pseudocodeLines
        : [];

    // --- Layout Logic ---
    // If both right-column items are hidden, the left column takes full width.
    const isSidebarVisible = showControls || showPseudocode;

    return (
        <>
            <div className="min-h-screen w-full bg-gradient-to-b from-white to-slate-50 p-4 md:p-6 dark:from-background dark:to-slate-950">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Red–Black Tree Visualiser</h1>

                        <div className="flex items-center gap-2">
                            <ViewOptions
                                showTree={showTree}
                                setShowTree={setShowTree}
                                showExplanation={showExplanation}
                                setShowExplanation={setShowExplanation}
                                showPseudocode={showPseudocode}
                                setShowPseudocode={setShowPseudocode}
                                showControls={showControls}
                                setShowControls={setShowControls}
                            />
                            <DarkModeToggle />
                        </div>
                    </div>

                    <div className={cn(
                        "gap-6 transition-all duration-300",
                        isSidebarVisible ? "grid grid-cols-1 lg:grid-cols-3" : "flex flex-col"
                    )}>
                        <div className={cn(
                            "flex flex-col gap-4 transition-all duration-300",
                            isSidebarVisible ? "lg:col-span-2" : "w-full"
                        )}>
                            {showTree && (
                                <div className="h-[450px] w-full rounded-xl border bg-card text-card-foreground shadow overflow-hidden relative">
                                    <TreeCanvas
                                        root={currentStepData.treeState}
                                        highlightedKeys={currentStepData.highlightedNodeKeys}
                                    />
                                </div>
                            )}

                            {showExplanation && (
                                <ExplanationBox
                                    description={currentStepData.description}
                                    currentStep={currentStepIndex + 1}
                                    totalSteps={steps.length}
                                />
                            )}

                            <PlayerControls
                                isPlaying={isPlaying}
                                onPlayPause={() => setIsPlaying(!isPlaying)}
                                onNext={() => setCurrentStepIndex(i => Math.min(steps.length - 1, i + 1))}
                                onPrev={() => setCurrentStepIndex(i => Math.max(0, i - 1))}
                                onStart={() => setCurrentStepIndex(0)}
                                onEnd={() => setCurrentStepIndex(steps.length - 1)}
                                onReset={handleResetAnimation}
                                currentStep={currentStepIndex}
                                totalSteps={steps.length}
                                speed={playbackSpeed}
                                setSpeed={setPlaybackSpeed}
                            />
                        </div>

                        {isSidebarVisible && (
                            <div className="lg:col-span-1 flex flex-col gap-4">
                                {showControls && (
                                    <Controls
                                        keyToInsert={keyToInsert}
                                        setKeyToInsert={setKeyToInsert}
                                        submitInsert={submitInsert}
                                        keyToDelete={keyToDelete}
                                        setKeyToDelete={setKeyToDelete}
                                        submitDelete={submitDelete}
                                        keyToFind={keyToFind}
                                        setKeyToFind={setKeyToFind}
                                        submitFind={submitFind}
                                        onBulkRandom={onBulkRandom}
                                        onClear={onClear}
                                        activeTab={activeTab}
                                        onTabChange={setActiveTab}
                                    />
                                )}

                                {showPseudocode && (
                                    <div className="flex-1 min-h-[400px]">
                                        <PseudocodePanel
                                            mode={pseudocodeMode}
                                            activeLineNumbers={activeLinesToRender}
                                            annotations={ANNOTATIONS[pseudocodeMode]}
                                            className="h-full"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <footer className="fixed bottom-4 right-4 z-50 text-xs text-muted-foreground opacity-50 hover:opacity-100 transition-opacity">
                Connor Peter Donnelly – University of Glasgow – Level 4 Dissertation Project © 2025
            </footer>
        </>
    );
}