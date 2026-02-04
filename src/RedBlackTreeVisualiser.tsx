// src/RedBlackTreeVisualiser.tsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    DndContext,
    closestCorners,
    pointerWithin,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
} from '@dnd-kit/core';

import type {
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from '@dnd-kit/core';

import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { Controls } from "@/components/Controls";
import { PlayerControls } from "@/components/PlayerControls";
import { ExplanationBox } from "@/components/ExplanationBox";
import { RedBlackTree, type Step } from "@/core/RedBlackTree";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import TreeCanvas from "@/components/TreeCanvas";
import { PseudocodePanel } from "@/components/PseudocodePanel";
import { MemoryGrid } from "@/components/MemoryGrid";
import { NodeInspector } from "@/components/NodeInspector";
import { ANNOTATIONS } from "@/lib/pseudocode";
import { ViewOptions } from "@/components/ViewOptions";
import { cn } from "@/lib/utils";
import { SortableItem } from "@/components/SortableItem";

const INITIAL_STEP: Step = {
    treeState: null,
    description: "Initial State",
    highlightedNodeKeys: [],
    pseudocodeLines: []
};

type WidgetId = 'tree' | 'memory' | 'explanation' | 'player' | 'controls' | 'pseudocode';

export default function RedBlackTreeVisualiser() {
    // --- Algorithm State ---
    const [steps, setSteps] = useState<Step[]>([INITIAL_STEP]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1000);

    const [keyToInsert, setKeyToInsert] = useState("");
    const [keyToDelete, setKeyToDelete] = useState("");
    const [keyToFind, setKeyToFind] = useState("");
    const [activeTab, setActiveTab] = useState("insert");

    // --- View Visibility State ---
    const [showTree, setShowTree] = useState(true);
    const [showMemory, setShowMemory] = useState(false);
    const [showExplanation, setShowExplanation] = useState(true);
    const [showPseudocode, setShowPseudocode] = useState(true);
    const [showControls, setShowControls] = useState(true);

    // --- Visual Options ---
    const [colorBlindMode, setColorBlindMode] = useState(false);
    const [showAddresses, setShowAddresses] = useState(false);

    // --- Interaction State ---
    const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
    const [hoveredAddress, setHoveredAddress] = useState<number | null>(null);

    // --- Drag & Drop Layout State ---
    const [columns, setColumns] = useState<{ main: WidgetId[]; sidebar: WidgetId[] }>({
        main: ['tree', 'memory', 'explanation', 'player'],
        sidebar: ['controls', 'pseudocode'],
    });
    const [activeDragId, setActiveDragId] = useState<WidgetId | null>(null);

    // --- Sensors for DnD ---
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Require 8px movement before drag starts (prevents accidental clicks)
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // --- Keyboard Shortcuts ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
            switch (e.key) {
                case 'ArrowLeft': e.preventDefault(); setIsPlaying(false); setCurrentStepIndex(i => Math.max(0, i - 1)); break;
                case 'ArrowRight': e.preventDefault(); setIsPlaying(false); setCurrentStepIndex(i => Math.min(steps.length - 1, i + 1)); break;
                case ' ': e.preventDefault(); setIsPlaying(prev => !prev); break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [steps.length]);

    // --- Animation Loop ---
    useEffect(() => {
        let timer: number;
        if (isPlaying && currentStepIndex < steps.length - 1) {
            timer = window.setTimeout(() => setCurrentStepIndex(p => p + 1), playbackSpeed);
        } else if (isPlaying && currentStepIndex >= steps.length - 1) {
            setIsPlaying(false);
        }
        return () => clearTimeout(timer);
    }, [isPlaying, currentStepIndex, steps.length, playbackSpeed]);

    // --- Operations ---
    const runOperation = (operationFn: (tree: RedBlackTree) => Step[], opType?: 'insert' | 'delete') => {
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
        setSelectedAddress(null);
    };

    function submitInsert() { if (keyToInsert) runOperation(t => t.insert(parseInt(keyToInsert, 10)), 'insert'); setKeyToInsert(""); }
    function submitDelete() { if (keyToDelete) runOperation(t => t.delete(parseInt(keyToDelete, 10)), 'delete'); setKeyToDelete(""); }
    function submitFind() {
        if (!keyToFind) return;
        const val = parseInt(keyToFind, 10);
        runOperation(t => {
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
        // REMOVED: setActiveTab('insert'); 
        // This keeps the user on the "More" tab while running the insert operations.
        runOperation(t => {
            const bulkSteps: Step[] = [];
            for (let i = 0; i < 10; i++) {
                bulkSteps.push(...t.insert(Math.floor(Math.random() * 100)));
            }
            return bulkSteps;
        }, 'insert');
    }
    
    function onClear() { setSteps([INITIAL_STEP]); setCurrentStepIndex(0); setIsPlaying(false); setSelectedAddress(null); }
    const handleResetAnimation = useCallback(() => { setCurrentStepIndex(0); setIsPlaying(false); setSelectedAddress(null); }, []);

    const currentStepData = steps[currentStepIndex] || INITIAL_STEP;
    const pseudocodeMode = activeTab === 'delete' ? 'delete' : 'insert';
    
    const activeLinesToRender = useMemo(() => {
        return (currentStepData.operationType === pseudocodeMode) ? currentStepData.pseudocodeLines : [];
    }, [currentStepData, pseudocodeMode]);

    // --- Drag & Drop Handlers ---
    const findContainer = (id: WidgetId) => {
        if (columns.main.includes(id)) return 'main';
        if (columns.sidebar.includes(id)) return 'sidebar';
        return null;
    };

    const handleDragStart = (event: DragStartEvent) => setActiveDragId(event.active.id as WidgetId);

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as WidgetId;
        const overId = over.id as string;

        const activeContainer = findContainer(activeId);
        const overContainer = (overId === 'main' || overId === 'sidebar')
            ? overId
            : findContainer(overId as WidgetId);

        if (!activeContainer || !overContainer || activeContainer === overContainer) {
            return;
        }

        setColumns((prev) => {
            const activeItems = prev[activeContainer as keyof typeof prev];
            const overItems = prev[overContainer as keyof typeof prev];
            const activeIndex = activeItems.indexOf(activeId);
            const overIndex = (overId === 'main' || overId === 'sidebar')
                ? overItems.length + 1
                : overItems.indexOf(overId as WidgetId);

            let newIndex;
            if (overId === 'main' || overId === 'sidebar') {
                newIndex = overItems.length + 1;
            } else {
                const isBelowOverItem =
                    over &&
                    active.rect.current.translated &&
                    active.rect.current.translated.top > over.rect.top + over.rect.height;

                const modifier = isBelowOverItem ? 1 : 0;
                newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
            }

            return {
                ...prev,
                [activeContainer]: [
                    ...prev[activeContainer as keyof typeof prev].filter((item) => item !== active.id),
                ],
                [overContainer]: [
                    ...prev[overContainer as keyof typeof prev].slice(0, newIndex),
                    active.id,
                    ...prev[overContainer as keyof typeof prev].slice(newIndex, prev[overContainer as keyof typeof prev].length),
                ],
            };
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        const activeId = active.id as WidgetId;
        const overId = over?.id as string;
        const activeContainer = findContainer(activeId);
        const overContainer = (overId === 'main' || overId === 'sidebar')
            ? overId
            : findContainer(overId as WidgetId);

        if (
            activeContainer &&
            overContainer &&
            activeContainer === overContainer &&
            overId !== 'main' && overId !== 'sidebar'
        ) {
            const activeIndex = columns[activeContainer as keyof typeof columns].indexOf(activeId);
            const overIndex = columns[overContainer as keyof typeof columns].indexOf(overId as WidgetId);

            if (activeIndex !== overIndex) {
                setColumns((prev) => ({
                    ...prev,
                    [activeContainer]: arrayMove(prev[activeContainer as keyof typeof prev], activeIndex, overIndex),
                }));
            }
        }
        setActiveDragId(null);
    };

    // --- Widget Rendering Helper ---
    const renderWidget = (id: WidgetId) => {
        const isVisible = {
            tree: showTree,
            memory: showMemory,
            explanation: showExplanation,
            player: true,
            controls: showControls,
            pseudocode: showPseudocode,
        }[id];

        if (!isVisible) return null;

        let content;
        switch (id) {
            case 'tree':
                content = (
                    <div className="h-[450px] w-full rounded-xl border bg-card text-card-foreground shadow overflow-hidden relative resize-y min-h-[300px]">
                        <TreeCanvas
                            root={currentStepData.treeState}
                            highlightedKeys={currentStepData.highlightedNodeKeys}
                            colorBlindMode={colorBlindMode}
                            showAddresses={showAddresses}
                            hoveredAddress={hoveredAddress}
                            onHoverAddress={setHoveredAddress}
                        />
                        <div className="absolute bottom-4 left-4 p-2 bg-background/90 backdrop-blur rounded-md border text-xs shadow-sm flex flex-col gap-1.5 pointer-events-none">
                            <div className="font-semibold text-muted-foreground mb-0.5">Legend</div>
                            <div className="flex items-center gap-2">
                                <div className={cn("w-3 h-3 rounded-full border-2 border-red-500 bg-red-500/20", colorBlindMode && "border-dashed")} />
                                <span>Red Node</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full border-2 border-foreground bg-foreground/20" />
                                <span>Black Node</span>
                            </div>
                            {showAddresses && <div className="text-[10px] text-muted-foreground mt-1">Showing Memory Addrs</div>}
                        </div>
                    </div>
                );
                break;
            case 'memory':
                content = (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[350px]">
                        <div className="h-full overflow-hidden">
                            <MemoryGrid
                                root={currentStepData.treeState}
                                highlightedKeys={currentStepData.highlightedNodeKeys}
                                selectedAddress={selectedAddress}
                                onSelectAddress={setSelectedAddress}
                                hoveredAddress={hoveredAddress}
                                onHoverAddress={setHoveredAddress}
                            />
                        </div>
                        <div className="h-full overflow-hidden">
                            <NodeInspector
                                root={currentStepData.treeState}
                                highlightedKeys={currentStepData.highlightedNodeKeys}
                                selectedAddress={selectedAddress || hoveredAddress}
                                showAddresses={showAddresses}
                            />
                        </div>
                    </div>
                );
                break;
            case 'explanation':
                content = (
                    <ExplanationBox
                        description={currentStepData.description}
                        currentStep={currentStepIndex + 1}
                        totalSteps={steps.length}
                    />
                );
                break;
            case 'player':
                content = (
                    <PlayerControls
                        isPlaying={isPlaying}
                        onPlayPause={() => setIsPlaying(!isPlaying)}
                        onNext={() => setCurrentStepIndex(i => Math.min(steps.length - 1, i + 1))}
                        onPrev={() => setCurrentStepIndex(i => Math.max(0, i - 1))}
                        onStart={() => setCurrentStepIndex(0)}
                        onEnd={() => setCurrentStepIndex(steps.length - 1)}
                        onReset={handleResetAnimation}
                        currentStep={currentStepIndex}
                        setCurrentStep={setCurrentStepIndex}
                        totalSteps={steps.length}
                        speed={playbackSpeed}
                        setSpeed={setPlaybackSpeed}
                    />
                );
                break;
            case 'controls':
                content = (
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
                );
                break;
            case 'pseudocode':
                content = (
                    <div className="h-[450px] w-full">
                        <PseudocodePanel
                            mode={pseudocodeMode}
                            activeLineNumbers={activeLinesToRender}
                            annotations={ANNOTATIONS[pseudocodeMode]}
                            className="h-full"
                        />
                    </div>
                );
                break;
        }

        return (
            <SortableItem key={id} id={id}>
                {content}
            </SortableItem>
        );
    };

    const visibleMainWidgets = columns.main.filter(id => id === 'player' || (id === 'tree' && showTree) || (id === 'memory' && showMemory) || (id === 'explanation' && showExplanation) || (id === 'controls' && showControls) || (id === 'pseudocode' && showPseudocode));
    const visibleSidebarWidgets = columns.sidebar.filter(id => id === 'player' || (id === 'tree' && showTree) || (id === 'memory' && showMemory) || (id === 'explanation' && showExplanation) || (id === 'controls' && showControls) || (id === 'pseudocode' && showPseudocode));
    const isSidebarVisible = visibleSidebarWidgets.length > 0;

    return (
        <>
            <div className="min-h-screen w-full bg-gradient-to-b from-white to-slate-50 p-4 md:p-6 dark:from-background dark:to-slate-950">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4 relative z-50">
                        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Red–Black Tree Visualiser</h1>
                        <div className="flex items-center gap-2 bg-card/50 p-1.5 rounded-lg border shadow-sm backdrop-blur-sm relative z-50">
                            <ViewOptions
                                showTree={showTree}
                                setShowTree={setShowTree}
                                showMemory={showMemory}
                                setShowMemory={setShowMemory}
                                showExplanation={showExplanation}
                                setShowExplanation={setShowExplanation}
                                showPseudocode={showPseudocode}
                                setShowPseudocode={setShowPseudocode}
                                showControls={showControls}
                                setShowControls={setShowControls}
                                colorBlindMode={colorBlindMode}
                                setColorBlindMode={setColorBlindMode}
                                showAddresses={showAddresses}
                                setShowAddresses={setShowAddresses}
                            />
                            <div className="h-6 w-px bg-border mx-1" />
                            <DarkModeToggle />
                        </div>
                    </div>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={pointerWithin}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                    >
                        <div className={cn(
                            "gap-6 transition-all duration-300 relative z-0",
                            isSidebarVisible ? "grid grid-cols-1 lg:grid-cols-3" : "flex flex-col"
                        )}>
                            {/* Main Column */}
                            <div className={cn(
                                "flex flex-col gap-4 transition-all duration-300",
                                isSidebarVisible ? "lg:col-span-2" : "w-full"
                            )}>
                                <SortableContext
                                    id="main"
                                    items={columns.main}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {columns.main.map(renderWidget)}
                                </SortableContext>
                            </div>

                            {/* Sidebar Column */}
                            {isSidebarVisible && (
                                <div className="lg:col-span-1 flex flex-col gap-4">
                                    <SortableContext
                                        id="sidebar"
                                        items={columns.sidebar}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {columns.sidebar.map(renderWidget)}
                                    </SortableContext>
                                </div>
                            )}
                        </div>

                        {/* Drag Overlay for smooth visual feedback */}
                        <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }) }}>
                            {activeDragId ? (
                                <div className="opacity-80 rotate-2 scale-[1.02]">
                                    {/* Simplified drag overlay representation */}
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </div>
            </div>
            <footer className="fixed bottom-4 right-4 z-50 text-xs text-muted-foreground opacity-50 hover:opacity-100 transition-opacity pointer-events-none">
                <span className="bg-background/80 p-1 rounded backdrop-blur">
                    Connor Peter Donnelly – University of Glasgow – Level 4 Dissertation Project © 2025
                </span>
            </footer>
        </>
    );
}