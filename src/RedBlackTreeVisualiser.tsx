// src/RedBlackTreeVisualiser.tsx

import React, { useState, useEffect, useCallback } from "react";
import { Controls } from "@/components/Controls";
import { PlayerControls } from "@/components/PlayerControls";
import { RedBlackTree, type Step } from "@/core/RedBlackTree";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import TreeCanvas from "@/components/TreeCanvas";

const INITIAL_STEP: Step = {
    treeState: null,
    description: "Initial State",
    highlightedNodeKeys: []
};

export default function RedBlackTreeVisualiser() {
    // Animation State
    const [steps, setSteps] = useState<Step[]>([INITIAL_STEP]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1000); // ms per step

    // Form Inputs
    const [keyToInsert, setKeyToInsert] = useState("");
    const [keyToDelete, setKeyToDelete] = useState("");
    const [keyToFind, setKeyToFind] = useState("");

    // --- Animation Loop ---
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


    // --- Core Logic ---
    const runOperation = (operationFn: (tree: RedBlackTree) => Step[]) => {
        // 1. Reconstitute the tree from the *last* known state in the history.
        // This ensures operations are sequential even if the user is looking at a past step.
        const lastStep = steps[steps.length - 1];

        const reconstruction = new RedBlackTree();
        reconstruction.root = lastStep.treeState; // Point to the snapshot

        // Clone deeply so the operation doesn't mutate the historical snapshot
        const workingTree = reconstruction.clone();

        // 2. Generate new steps
        const newSteps = operationFn(workingTree);

        if (newSteps.length === 0) return;

        // 3. Append steps to history
        setSteps(prev => [...prev, ...newSteps]);

        // 4. Auto-play the new sequence
        setCurrentStepIndex(steps.length); // Jump to start of new operation
        setIsPlaying(true);
    };

    function submitInsert() {
        if (keyToInsert === "") return;
        runOperation((t) => t.insert(parseInt(keyToInsert, 10)));
        setKeyToInsert("");
    }

    function submitDelete() {
        if (keyToDelete === "") return;
        runOperation((t) => t.delete(parseInt(keyToDelete, 10)));
        setKeyToDelete("");
    }

    function submitFind() {
        if (keyToFind === "") return;
        // Find is just a traversal, but we can visualize it if we implemented it as steps.
        // The current RedBlackTree class 'find' returns a node, not steps.
        // For now, we'll just log it, but ideally we'd upgrade RBT to return steps for find.
        // Let's create a dummy step for "Found" or "Not Found" to give visual feedback.
        const val = parseInt(keyToFind, 10);
        runOperation((t) => {
            const node = t.find(val);
            return [{
                treeState: t.clone().root, // State doesn't change
                description: node ? `Node ${val} found.` : `Node ${val} not found.`,
                highlightedNodeKeys: node ? [node.key] : []
            }];
        });
        setKeyToFind("");
    }

    function onBulkRandom() {
        runOperation((t) => {
            const bulkSteps: Step[] = [];
            // We can chain inserts.
            // Note: Since insert returns steps, we'd need to aggregate them.
            // But 'runOperation' expects a single function.
            // We can simulate it by running inserts sequentially on the mutable 't'.
            for (let i = 0; i < 10; i++) {
                const randomKey = Math.floor(Math.random() * 100);
                const opSteps = t.insert(randomKey);
                bulkSteps.push(...opSteps);
            }
            return bulkSteps;
        });
    }

    function onClear() {
        setSteps([INITIAL_STEP]);
        setCurrentStepIndex(0);
        setIsPlaying(false);
    }

    // --- Handlers for Player Controls ---
    const handleResetAnimation = useCallback(() => {
        // Resets to the start of the ENTIRE history.
        setCurrentStepIndex(0);
        setIsPlaying(false);
    }, []);

    const currentStepData = steps[currentStepIndex] || INITIAL_STEP;

    return (
        <>
            <div className="min-h-screen w-full bg-gradient-to-b from-white to-slate-50 p-4 md:p-6 dark:from-background dark:to-slate-950">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Red–Black Tree Visualiser</h1>
                        <DarkModeToggle />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 flex flex-col gap-4">
                            {/* Visualization Canvas */}
                            <div className="h-[500px] w-full rounded-xl border bg-card text-card-foreground shadow overflow-hidden relative">
                                <TreeCanvas
                                    root={currentStepData.treeState}
                                    highlightedKeys={currentStepData.highlightedNodeKeys}
                                />
                            </div>

                            {/* Player Controls */}
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
                                description={currentStepData.description}
                            />
                        </div>

                        {/* Input Controls */}
                        <div className="lg:col-span-1">
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
                            />
                        </div>
                    </div>
                </div>
            </div>
            <footer className="fixed bottom-4 right-4 z-50 text-xs text-muted-foreground opacity-50 hover:opacity-100 transition-opacity">
                Connor Peter Donnelly – University of Glasgow – Level 4 Dissertation Project © 2025
            </footer>
        </>
    );
}