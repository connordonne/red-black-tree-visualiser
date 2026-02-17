// src/components/ViewOptions.tsx

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import { LayoutTemplate, ChevronDown, Eye, Accessibility, GraduationCap } from "lucide-react"
import { useState, useRef, useEffect } from "react"

interface ViewOptionsProps {
    showTree: boolean
    setShowTree: (val: boolean) => void
    showExplanation: boolean
    setShowExplanation: (val: boolean) => void
    showPseudocode: boolean
    setShowPseudocode: (val: boolean) => void
    showControls: boolean
    setShowControls: (val: boolean) => void
    showMemory: boolean
    setShowMemory: (val: boolean) => void
    colorBlindMode: boolean
    setColorBlindMode: (val: boolean) => void
    showAddresses: boolean
    setShowAddresses: (val: boolean) => void
    showIsomorphic: boolean
    setShowIsomorphic: (val: boolean) => void
    tutorialMode: boolean
    setTutorialMode: (val: boolean) => void
}

export function ViewOptions({
                                showTree, setShowTree,
                                showExplanation, setShowExplanation,
                                showPseudocode, setShowPseudocode,
                                showControls, setShowControls,
                                showMemory, setShowMemory,
                                colorBlindMode, setColorBlindMode,
                                showAddresses, setShowAddresses,
                                showIsomorphic, setShowIsomorphic,
                                tutorialMode, setTutorialMode
                            }: ViewOptionsProps) {
    const [isOpen, setIsOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [ref])

    return (
        <div className="relative" ref={ref}>
            <Button
                variant="ghost"
                size="sm"
                className="gap-2 h-8"
                onClick={() => setIsOpen(!isOpen)}
                title="View Options"
            >
                <LayoutTemplate className="size-4" />
                <span className="hidden sm:inline font-normal">View</span>
                <ChevronDown className="size-3 opacity-50" />
            </Button>
            {isOpen && (
                <Card className="absolute right-0 top-full mt-2 w-72 p-4 z-50 flex flex-col gap-4 shadow-xl animate-in fade-in zoom-in-95 duration-200 border-border/50">
                    <div className="space-y-4">
                        
                        <div>
                            <div className="flex items-center gap-2 mb-3 text-primary">
                                <GraduationCap className="size-4" />
                                <h4 className="font-medium text-sm">Learning Mode</h4>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <Label htmlFor="tut-mode" className="cursor-pointer font-normal">Interactive Quizzes</Label>
                                    <span className="text-[10px] text-muted-foreground">Pause for Quizzes & Parsons</span>
                                </div>
                                <Switch id="tut-mode" checked={tutorialMode} onCheckedChange={setTutorialMode} />
                            </div>
                        </div>

                        <div className="h-px bg-border" />

                        <div>
                            <div className="flex items-center gap-2 mb-3 text-primary">
                                <Accessibility className="size-4" />
                                <h4 className="font-medium text-sm">Accessibility & Display</h4>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <Label htmlFor="cb-mode" className="cursor-pointer font-normal">Color-Blind Mode</Label>
                                        <span className="text-[10px] text-muted-foreground">Patterns for colors</span>
                                    </div>
                                    <Switch id="cb-mode" checked={colorBlindMode} onCheckedChange={setColorBlindMode} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <Label htmlFor="addr-mode" className="cursor-pointer font-normal">Show Addresses</Label>
                                        <span className="text-[10px] text-muted-foreground">Hex instead of Keys</span>
                                    </div>
                                    <Switch id="addr-mode" checked={showAddresses} onCheckedChange={setShowAddresses} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <Label htmlFor="iso-mode" className="cursor-pointer font-normal">Show 2-3-4 Structure</Label>
                                        <span className="text-[10px] text-muted-foreground">Group nodes visually</span>
                                    </div>
                                    <Switch id="iso-mode" checked={showIsomorphic} onCheckedChange={setShowIsomorphic} />
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-border" />

                        <div>
                            <div className="flex items-center gap-2 mb-3 text-primary">
                                <Eye className="size-4" />
                                <h4 className="font-medium text-sm">Widget Visibility</h4>
                            </div>
                            <div className="grid gap-3">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="view-tree" className="cursor-pointer font-normal">Tree Canvas</Label>
                                    <Switch id="view-tree" checked={showTree} onCheckedChange={setShowTree} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="view-mem" className="cursor-pointer font-normal">Memory View</Label>
                                    <Switch id="view-mem" checked={showMemory} onCheckedChange={setShowMemory} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="view-expl" className="cursor-pointer font-normal">Explanation</Label>
                                    <Switch id="view-expl" checked={showExplanation} onCheckedChange={setShowExplanation} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="view-ctrl" className="cursor-pointer font-normal">Controls</Label>
                                    <Switch id="view-ctrl" checked={showControls} onCheckedChange={setShowControls} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="view-pseudo" className="cursor-pointer font-normal">Pseudocode</Label>
                                    <Switch id="view-pseudo" checked={showPseudocode} onCheckedChange={setShowPseudocode} />
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    )
}