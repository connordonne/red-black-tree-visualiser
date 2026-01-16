// src/components/ViewOptions.tsx

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import { LayoutTemplate, ChevronDown } from "lucide-react"

interface ViewOptionsProps {
    showTree: boolean
    setShowTree: (val: boolean) => void
    showExplanation: boolean
    setShowExplanation: (val: boolean) => void
    showPseudocode: boolean
    setShowPseudocode: (val: boolean) => void
    showControls: boolean
    setShowControls: (val: boolean) => void
}

export function ViewOptions({
                                showTree,
                                setShowTree,
                                showExplanation,
                                setShowExplanation,
                                showPseudocode,
                                setShowPseudocode,
                                showControls,
                                setShowControls,
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
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setIsOpen(!isOpen)}
                title="View Options"
            >
                <LayoutTemplate className="size-4" />
                <span className="hidden sm:inline">View</span>
                <ChevronDown className="size-3 opacity-50" />
            </Button>
            {isOpen && (
                <Card className="absolute right-0 top-full mt-2 w-64 p-4 z-50 flex flex-col gap-4 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                    <div className="space-y-4">
                        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Visibility</h4>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="view-tree" className="cursor-pointer">Tree Canvas</Label>
                            <Switch id="view-tree" checked={showTree} onCheckedChange={setShowTree} />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="view-expl" className="cursor-pointer">Explanation</Label>
                            <Switch id="view-expl" checked={showExplanation} onCheckedChange={setShowExplanation} />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="view-ctrl" className="cursor-pointer">Controls</Label>
                            <Switch id="view-ctrl" checked={showControls} onCheckedChange={setShowControls} />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="view-pseudo" className="cursor-pointer">Pseudocode</Label>
                            <Switch id="view-pseudo" checked={showPseudocode} onCheckedChange={setShowPseudocode} />
                        </div>
                    </div>
                </Card>
            )}
        </div>
    )
}