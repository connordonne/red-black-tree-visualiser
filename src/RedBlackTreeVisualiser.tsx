import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { DndContext, DragOverlay, defaultDropAnimationSideEffects } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { animate } from "framer-motion";
import { MessageSquare } from "lucide-react";

// Components
import { Button } from "@/components/ui/button";
import { Controls } from "@/components/Controls";
import { PlayerControls } from "@/components/PlayerControls";
import { ExplanationBox } from "@/components/ExplanationBox";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import TreeCanvas from "@/components/TreeCanvas";
import { PseudocodePanel } from "@/components/PseudocodePanel";
import { ParsonsPanel } from "@/components/ParsonsPanel";
import { MemoryGrid } from "@/components/MemoryGrid";
import { NodeInspector } from "@/components/NodeInspector";
import { ViewOptions } from "@/components/ViewOptions";
import { SortableItem } from "@/components/SortableItem";
import { QuizOverlay } from "@/components/QuizOverlay";

// Hooks & Types
import { useAlgorithmPlayer } from "@/hooks/useAlgorithmPlayer";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import { analyzeTreeHealth } from "@/core/RedBlackTree";
import type { WidgetId, ViewState, VisualSettings } from "@/types/visualiser";
import { cn } from "@/lib/utils";
import { ANNOTATIONS } from "@/lib/pseudocode";

// Configuration
const FEEDBACK_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdIkCdd6WXNjq6hFFK8U1Gc6wWRps3Z7NsZ2Qy4yHjZUAaKtg/viewform?usp=publish-editor"; 

export default function RedBlackTreeVisualiser() {
    // --- View & Visual Options (Moved up for hook dependency) ---
    const [visualSettings, setVisualSettings] = useState<VisualSettings>({
        colorBlindMode: false,
        showAddresses: false,
        showNils: false,
        showIsomorphic: false,
        tutorialMode: true // Default enabled
    });

    // --- State Logic ---
    const algorithm = useAlgorithmPlayer(visualSettings.tutorialMode);
    const layout = useDashboardLayout();

    // --- Inputs State ---
    const [inputs, setInputs] = useState({ insert: "", delete: "", find: "" });
    const [activeTab, setActiveTab] = useState("insert");
    
    // --- Interaction State ---
    const [quizSolved, setQuizSolved] = useState(false);
    const [parsonsSolved, setParsonsSolved] = useState(false);
    
    // Reset interaction states when changing steps
    useEffect(() => {
        // When step changes, check if new step requires interaction. If not, reset solved flags.
        setQuizSolved(false);
        setParsonsSolved(false);
    }, [algorithm.currentStepIndex]);

    const [viewState, setViewState] = useState<ViewState>({
        showTree: true,
        showMemory: false,
        showExplanation: true,
        showPseudocode: true,
        showControls: true
    });

    // --- Interaction State (Visuals) ---
    const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
    const [hoveredAddress, setHoveredAddress] = useState<number | null>(null);
    
    // --- Tree Resizing Logic ---
    const treeContainerRef = useRef<HTMLDivElement>(null);
    
    const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        const startY = e.clientY;
        const startHeight = treeContainerRef.current?.offsetHeight || 554;

        const onMouseMove = (moveEvent: MouseEvent) => {
            if (treeContainerRef.current) {
                const newHeight = Math.max(300, startHeight + (moveEvent.clientY - startY));
                treeContainerRef.current.style.height = `${newHeight}px`;
            }
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.body.style.cursor = '';
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        document.body.style.cursor = 'ns-resize';
    }, []);

    const resetTreeSize = useCallback(() => {
        if (!treeContainerRef.current) return;
        const element = treeContainerRef.current;
        animate(element, { height: [element.offsetHeight, 554] }, {
            type: "spring", stiffness: 250, damping: 25,
            onComplete: () => { element.style.height = ''; element.style.width = ''; }
        });
    }, []);

    // --- Operation Handlers ---
    const handleInsert = () => {
        if (!inputs.insert) return;
        algorithm.runOperation(t => t.insert(parseInt(inputs.insert, 10)), 'insert');
        setInputs(p => ({ ...p, insert: "" }));
        setSelectedAddress(null);
    };

    const handleDelete = () => {
        if (!inputs.delete) return;
        algorithm.runOperation(t => t.delete(parseInt(inputs.delete, 10)), 'delete');
        setInputs(p => ({ ...p, delete: "" }));
        setSelectedAddress(null);
    };

    const handleFind = () => {
        if (!inputs.find) return;
        algorithm.runOperation(t => t.search(parseInt(inputs.find, 10)), 'find');
        setInputs(p => ({ ...p, find: "" }));
        setSelectedAddress(null);
    };

    const handleBulkRandom = () => {
        algorithm.runOperation(t => {
            const steps = [];
            for (let i = 0; i < 10; i++) steps.push(...t.insert(Math.floor(Math.random() * 100)));
            return steps;
        }, 'insert');
    };

    // --- Computed Data ---
    const pseudocodeMode = (activeTab === 'delete' || activeTab === 'find') ? activeTab : 'insert';     
    const activeLines = (algorithm.currentStepData.operationType === pseudocodeMode) 
        ? algorithm.currentStepData.pseudocodeLines 
        : [];

    const isSidebarVisible = layout.columns.sidebar.some(id => {
        if (id === 'player') return true; 
        const key = `show${id.charAt(0).toUpperCase() + id.slice(1)}` as keyof ViewState;
        return viewState[key];
    });

    // Quiz Check (Modified for Tutorial Mode)
    const isQuizActive = visualSettings.tutorialMode &&
                         algorithm.currentStepData.requiresInteraction && 
                         algorithm.currentStepData.questionData && 
                         !quizSolved;

    const handleQuizComplete = () => {
        setQuizSolved(true);
        algorithm.setCurrentStepIndex(algorithm.currentStepIndex + 1);
    };

    // Parsons Check (Modified for Tutorial Mode)
    const isParsonsActive = visualSettings.tutorialMode &&
                            algorithm.currentStepData.requiresInteraction && 
                            algorithm.currentStepData.parsonsData && 
                            !parsonsSolved;

    const handleParsonsComplete = () => {
        setParsonsSolved(true);
        algorithm.setCurrentStepIndex(algorithm.currentStepIndex + 1);
    };

    // --- Health Analysis ---
    const treeHealth = useMemo(() => {
        return analyzeTreeHealth(algorithm.currentStepData.treeState);
    }, [algorithm.currentStepData.treeState]);

    // --- Widget Rendering ---
    const renderWidget = (id: WidgetId) => {
        const viewKey = `show${id.charAt(0).toUpperCase() + id.slice(1)}` as keyof ViewState;
        if (id !== 'player' && !viewState[viewKey]) return null;

        let content;
        switch (id) {
            case 'tree':
                content = (
                    <div ref={treeContainerRef} className="h-[554px] w-full rounded-xl border bg-card relative min-h-[300px] group overflow-hidden transition-colors">
                        <div className={cn("absolute inset-0 z-0 transition-opacity duration-500", isParsonsActive ? "opacity-30 blur-sm scale-[0.98]" : "opacity-100")}>
                            <TreeCanvas
                                root={algorithm.currentStepData.treeState}
                                highlightedKeys={algorithm.currentStepData.highlightedNodeKeys}
                                colorBlindMode={visualSettings.colorBlindMode}
                                showAddresses={visualSettings.showAddresses}
                                showNils={visualSettings.showNils}  
                                toggleNils={() => setVisualSettings(p => ({ ...p, showNils: !p.showNils }))} 
                                hoveredAddress={hoveredAddress}
                                onHoverAddress={setHoveredAddress}
                                onResetContainerSize={resetTreeSize}
                                showIsomorphic={visualSettings.showIsomorphic} 
                                canvasLabel={algorithm.currentStepData.canvasLabel}
                                searchFocus={algorithm.currentStepData.searchFocus} // Pass the new prop
                            />
                        </div>
                        {/* Dim Overlay when Parsons is Active to focus user on Code Panel */}
                        {isParsonsActive && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/20 backdrop-blur-[2px]">
                                <div className="bg-card/90 p-4 rounded-lg shadow-lg border max-w-sm text-center">
                                    <p className="font-semibold text-muted-foreground">Construct the Rotation Logic</p>
                                    <p className="text-xs text-muted-foreground/70 mt-1">Focus on the code panel to proceed.</p>
                                </div>
                            </div>
                        )}
                        {/* Quiz Overlay Positioned Over TreeCanvas */}
                        {isQuizActive && algorithm.currentStepData.questionData && (
                            <QuizOverlay 
                                data={algorithm.currentStepData.questionData} 
                                onComplete={handleQuizComplete} 
                            />
                        )}
                        <div onMouseDown={handleResizeMouseDown} className="absolute bottom-0 right-0 p-2 cursor-ns-resize z-40 opacity-30 group-hover:opacity-100 transition-opacity">
                            <svg width="16" height="16" viewBox="0 0 12 12" fill="none" className="text-muted-foreground"><path d="M10 2L2 10M10 6L6 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        </div>
                    </div>
                );
                break;
            case 'memory':
                content = (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[350px]">
                        <div className="h-full overflow-hidden">
                            <MemoryGrid
                                root={algorithm.currentStepData.treeState}
                                highlightedKeys={algorithm.currentStepData.highlightedNodeKeys}
                                selectedAddress={selectedAddress}
                                onSelectAddress={setSelectedAddress}
                                hoveredAddress={hoveredAddress}
                                onHoverAddress={setHoveredAddress}
                            />
                        </div>
                        <div className="h-full overflow-hidden">
                            <NodeInspector
                                root={algorithm.currentStepData.treeState}
                                highlightedKeys={algorithm.currentStepData.highlightedNodeKeys}
                                selectedAddress={selectedAddress || hoveredAddress}
                                showAddresses={visualSettings.showAddresses}
                            />
                        </div>
                    </div>
                );
                break;
            case 'explanation':
                content = (
                    <div className="h-[120px] w-full">
                        <ExplanationBox
                            description={algorithm.currentStepData.description}
                            currentStep={algorithm.currentStepIndex + 1}
                            totalSteps={algorithm.steps.length}
                            health={treeHealth}
                            className="h-full"
                        />
                    </div>
                );
                break;
            case 'player':
                content = (
                    <div className="h-[85px] w-full">
                        <div className={cn("h-full relative", (isQuizActive || isParsonsActive) && "opacity-50 transition-opacity")}>
                            <PlayerControls
                                isPlaying={algorithm.isPlaying}
                                onPlayPause={() => algorithm.setIsPlaying(!algorithm.isPlaying)}
                                onNext={() => {
                                    algorithm.setIsPlaying(false);
                                    algorithm.setCurrentStepIndex(Math.min(algorithm.steps.length - 1, algorithm.currentStepIndex + 1));
                                }}
                                onPrev={() => {
                                    algorithm.setIsPlaying(false);
                                    algorithm.setCurrentStepIndex(Math.max(0, algorithm.currentStepIndex - 1));
                                }}
                                onStart={() => {
                                    algorithm.setIsPlaying(false);
                                    algorithm.setCurrentStepIndex(0);
                                }}
                                onEnd={() => {
                                    algorithm.setIsPlaying(false);
                                    algorithm.setCurrentStepIndex(algorithm.steps.length - 1);
                                }}
                                onReset={algorithm.resetAnimation}
                                currentStep={algorithm.currentStepIndex}
                                setCurrentStep={(step) => {
                                    algorithm.setIsPlaying(false);
                                    algorithm.setCurrentStepIndex(step);
                                }}
                                totalSteps={algorithm.steps.length}
                                speed={algorithm.playbackSpeed}
                                setSpeed={algorithm.setPlaybackSpeed}
                                className="h-full"
                            />
                        </div>
                    </div>
                );
                break;
            case 'controls':
                content = (
                    <div className="h-[154px] w-full">
                        <Controls
                            keyToInsert={inputs.insert} setKeyToInsert={(v) => setInputs(p => ({...p, insert: v}))} submitInsert={handleInsert}
                            keyToDelete={inputs.delete} setKeyToDelete={(v) => setInputs(p => ({...p, delete: v}))} submitDelete={handleDelete}
                            keyToFind={inputs.find} setKeyToFind={(v) => setInputs(p => ({...p, find: v}))} submitFind={handleFind}
                            onBulkRandom={handleBulkRandom}
                            onClear={() => { algorithm.reset(); setSelectedAddress(null); }}
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            className="h-full"
                        />
                    </div>
                );
                break;
            case 'pseudocode':
                if (isParsonsActive && algorithm.currentStepData.parsonsData) {
                    content = (
                        <div className="h-[384px] w-full">
                            <ParsonsPanel 
                                data={algorithm.currentStepData.parsonsData} 
                                onComplete={handleParsonsComplete} 
                                className="h-full bg-card shadow-md ring-4 ring-primary/20"
                            />
                        </div>
                    );
                } else {
                    content = (
                        <div className="h-[384px] w-full">
                            <PseudocodePanel
                                mode={pseudocodeMode}
                                activeLineNumbers={activeLines}
                                annotations={ANNOTATIONS[pseudocodeMode]}
                                className="h-full"
                            />
                        </div>
                    );
                }
                break;
        }

        return <SortableItem key={id} id={id}>{content}</SortableItem>;
    };

    return (
        <>
            <div className="min-h-screen w-full bg-background p-4 md:p-6 pb-12 relative z-10">
                <div className="mx-auto max-w-7xl">
                    {/* --- HEADER --- */}
                    <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4 relative z-50">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
                            <img src="/uofg-crest.png" alt="University of Glasgow Crest" className="h-12 w-auto md:h-14 object-contain drop-shadow-md" />
                            <div className="flex flex-col">
                                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                                    UofG Red–Black Tree Visualiser
                                </h1>
                                <span className="text-muted-foreground font-serif italic text-sm tracking-wide">Via, Veritas, Vita</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 bg-card/50 p-1.5 rounded-lg border shadow-sm backdrop-blur-sm relative z-50">
                            <Button variant="outline" size="sm" className="gap-2 h-8 border-primary/20 text-primary hover:bg-primary/5" onClick={() => window.open(FEEDBACK_URL, '_blank')}>
                                <MessageSquare className="size-4" />
                                <span className="hidden sm:inline font-medium">Feedback</span>
                            </Button>
                            <div className="h-6 w-px bg-border mx-1" />
                            <ViewOptions
                                showTree={viewState.showTree} setShowTree={(v) => setViewState(p => ({...p, showTree: v}))}
                                showMemory={viewState.showMemory} setShowMemory={(v) => setViewState(p => ({...p, showMemory: v}))}
                                showExplanation={viewState.showExplanation} setShowExplanation={(v) => setViewState(p => ({...p, showExplanation: v}))}
                                showPseudocode={viewState.showPseudocode} setShowPseudocode={(v) => setViewState(p => ({...p, showPseudocode: v}))}
                                showControls={viewState.showControls} setShowControls={(v) => setViewState(p => ({...p, showControls: v}))}
                                colorBlindMode={visualSettings.colorBlindMode} setColorBlindMode={(v) => setVisualSettings(p => ({...p, colorBlindMode: v}))}
                                showAddresses={visualSettings.showAddresses} setShowAddresses={(v) => setVisualSettings(p => ({...p, showAddresses: v}))}
                                showIsomorphic={visualSettings.showIsomorphic} setShowIsomorphic={(v) => setVisualSettings(p => ({...p, showIsomorphic: v}))}
                                tutorialMode={visualSettings.tutorialMode} setTutorialMode={(v) => setVisualSettings(p => ({...p, tutorialMode: v}))}
                            />
                            <div className="h-6 w-px bg-border mx-1" />
                            <DarkModeToggle />
                        </div>
                    </div>

                    {/* --- GRID LAYOUT --- */}
                    <DndContext sensors={layout.sensors} {...layout.handlers}>
                        <div className={cn("gap-6 transition-all duration-300 relative z-0", isSidebarVisible ? "grid grid-cols-1 lg:grid-cols-3" : "flex flex-col")}>
                            <div className={cn("flex flex-col gap-4 transition-all duration-300", isSidebarVisible ? "lg:col-span-2" : "w-full")}>
                                <SortableContext id="main" items={layout.columns.main} strategy={verticalListSortingStrategy}>
                                    {layout.columns.main.map(renderWidget)}
                                </SortableContext>
                            </div>
                            {isSidebarVisible && (
                                <div className="lg:col-span-1 flex flex-col gap-4">
                                    <SortableContext id="sidebar" items={layout.columns.sidebar} strategy={verticalListSortingStrategy}>
                                        {layout.columns.sidebar.map(renderWidget)}
                                    </SortableContext>
                                </div>
                            )}
                        </div>
                        <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }) }}>
                            {layout.activeDragId ? <div className="opacity-80 rotate-2 scale-[1.02]"></div> : null}
                        </DragOverlay>
                    </DndContext>
                </div>
            </div>

            {/* --- FOOTER --- */}
            <footer className="fixed bottom-4 right-4 z-50 text-[11px] md:text-xs text-muted-foreground opacity-60 hover:opacity-100 transition-opacity pointer-events-none">
                <span className="bg-background/80 border border-border/50 p-1.5 px-3 rounded-lg backdrop-blur shadow-sm inline-flex items-center gap-2">
                    <span className="font-semibold text-foreground">Connor Donnelly</span>
                    <span className="hidden sm:inline w-px h-3 bg-border" />
                    <span className="hidden sm:inline">University of Glasgow</span>
                </span>
            </footer>
        </>
    );
}