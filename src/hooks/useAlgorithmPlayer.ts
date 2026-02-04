import { useState, useEffect, useCallback } from 'react';
import { RedBlackTree, type Step } from "@/core/RedBlackTree";

const INITIAL_STEP: Step = {
    treeState: null,
    description: "Initial State",
    highlightedNodeKeys: [],
    pseudocodeLines: [],
    operationType: undefined
};

export function useAlgorithmPlayer() {
    const [steps, setSteps] = useState<Step[]>([INITIAL_STEP]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1000);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
            switch (e.key) {
                case 'ArrowLeft': 
                    e.preventDefault(); 
                    setIsPlaying(false); 
                    setCurrentStepIndex(i => Math.max(0, i - 1)); 
                    break;
                case 'ArrowRight': 
                    e.preventDefault(); 
                    setIsPlaying(false); 
                    setCurrentStepIndex(i => Math.min(steps.length - 1, i + 1)); 
                    break;
                case ' ': 
                    e.preventDefault(); 
                    setIsPlaying(prev => !prev); 
                    break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [steps.length]);

    // Auto-play timer
    useEffect(() => {
        let timer: number;
        if (isPlaying && currentStepIndex < steps.length - 1) {
            timer = window.setTimeout(() => setCurrentStepIndex(p => p + 1), playbackSpeed);
        } else if (isPlaying && currentStepIndex >= steps.length - 1) {
            setIsPlaying(false);
        }
        return () => clearTimeout(timer);
    }, [isPlaying, currentStepIndex, steps.length, playbackSpeed]);

    const runOperation = useCallback((
        operationFn: (tree: RedBlackTree) => Step[], 
        opType?: 'insert' | 'delete' | 'find'
    ) => {
        const lastStep = steps[steps.length - 1];
        
        // Reconstruct tree from last state to ensure continuity
        const reconstruction = new RedBlackTree();
        reconstruction.root = lastStep.treeState;
        
        // Clone for the operation to avoid mutating the history directly
        const workingTree = reconstruction.clone();
        
        const newSteps = operationFn(workingTree);
        if (newSteps.length === 0) return;

        const stepsWithMeta = newSteps.map(s => ({ ...s, operationType: opType }));
        setSteps(prev => [...prev, ...stepsWithMeta]);
        setCurrentStepIndex(steps.length); // Jump to start of new operation
        setIsPlaying(true);
    }, [steps]);

    const reset = useCallback(() => {
        setSteps([INITIAL_STEP]);
        setCurrentStepIndex(0);
        setIsPlaying(false);
    }, []);

    const resetAnimation = useCallback(() => {
        setCurrentStepIndex(0);
        setIsPlaying(false);
    }, []);

    return {
        steps,
        currentStepIndex,
        currentStepData: steps[currentStepIndex] || INITIAL_STEP,
        setCurrentStepIndex,
        isPlaying,
        setIsPlaying,
        playbackSpeed,
        setPlaybackSpeed,
        runOperation,
        reset,
        resetAnimation
    };
}