import { useState, useEffect, useCallback, useRef } from 'react';
import { RedBlackTree, type Step } from "@/core/RedBlackTree";

const INITIAL_STEP: Step = {
    treeState: null,
    description: "Initial State",
    highlightedNodeKeys: [],
    pseudocodeLines: [],
    operationType: undefined
};

export function useAlgorithmPlayer(tutorialMode: boolean = true) {
    const [steps, setSteps] = useState<Step[]>([INITIAL_STEP]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1000);
    const lastStoppedIndex = useRef<number>(-1);

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

    useEffect(() => {
        let timer: number;
        const shouldPauseForInteraction = 
            tutorialMode && 
            steps[currentStepIndex]?.requiresInteraction && 
            lastStoppedIndex.current !== currentStepIndex;

        if (isPlaying && shouldPauseForInteraction) {
            setIsPlaying(false);
            lastStoppedIndex.current = currentStepIndex; 
            return;
        }

        if (isPlaying && currentStepIndex < steps.length - 1) {
            timer = window.setTimeout(() => setCurrentStepIndex(p => p + 1), playbackSpeed);
        } else if (isPlaying && currentStepIndex >= steps.length - 1) {
            setIsPlaying(false);
        }
        return () => clearTimeout(timer);
    }, [isPlaying, currentStepIndex, steps, playbackSpeed, tutorialMode]);

    useEffect(() => {
        lastStoppedIndex.current = -1;
    }, [steps]);

    const runOperation = useCallback((
        operationFn: (tree: RedBlackTree) => Step[], 
        opType?: 'insert' | 'delete' | 'find'
    ) => {
        const lastStep = steps[steps.length - 1];
        
        const reconstruction = new RedBlackTree();
        reconstruction.root = lastStep.treeState;
        
        const workingTree = reconstruction.clone();
        
        const newSteps = operationFn(workingTree);
        if (newSteps.length === 0) return;

        const stepsWithMeta = newSteps.map(s => ({ ...s, operationType: opType }));
        setSteps(prev => [...prev, ...stepsWithMeta]);
        setCurrentStepIndex(steps.length); 
        setIsPlaying(true);
        lastStoppedIndex.current = -1; 
    }, [steps]);

    const reset = useCallback(() => {
        setSteps([INITIAL_STEP]);
        setCurrentStepIndex(0);
        setIsPlaying(false);
        lastStoppedIndex.current = -1;
    }, []);

    const resetAnimation = useCallback(() => {
        setCurrentStepIndex(0);
        setIsPlaying(false);
        lastStoppedIndex.current = -1;
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