// src/components/Controls.tsx

//import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedTabs, AnimatedTabsContent, AnimatedTabsList, AnimatedTabsTrigger } from "@/components/ui/animated-tabs";
import { Trash2, Plus, Shuffle, Loader2, Search } from "lucide-react";
import { OperationForm } from './OperationForm';
import { cn } from "@/lib/utils"; 

interface ControlsProps {
    keyToInsert: string;
    setKeyToInsert: (val: string) => void;
    submitInsert: () => void;
    keyToDelete: string;
    setKeyToDelete: (val: string) => void;
    submitDelete: () => void;
    keyToFind: string;
    setKeyToFind: (val: string) => void;
    submitFind: () => void;
    onBulkRandom: () => void;
    onClear: () => void;
    activeTab: string;
    onTabChange: (val: string) => void;
    className?: string; 
}

export function Controls({
                             keyToInsert, setKeyToInsert, submitInsert,
                             keyToDelete, setKeyToDelete, submitDelete,
                             keyToFind, setKeyToFind, submitFind,
                             onBulkRandom, onClear,
                             activeTab, onTabChange,
                             className 
                          }: ControlsProps) {

    return (
        <Card className={cn("flex flex-col h-full", className)}>
            <CardHeader className="px-6 pt-4 pb-2 shrink-0"> 
                <CardTitle className="text-base">Controls</CardTitle>
            </CardHeader>
            
            <CardContent className="px-6 pt-0 pb-4 flex-1 overflow-hidden"> 
                <AnimatedTabs value={activeTab} onValueChange={onTabChange} className="h-full flex flex-col">
                    <AnimatedTabsList className="h-8 w-full shrink-0">
                        <AnimatedTabsTrigger value="insert" className="text-xs h-6">Insert</AnimatedTabsTrigger>
                        <AnimatedTabsTrigger value="delete" className="text-xs h-6">Delete</AnimatedTabsTrigger>
                        <AnimatedTabsTrigger value="find" className="text-xs h-6">Find</AnimatedTabsTrigger>
                        <AnimatedTabsTrigger value="more" className="text-xs h-6">More</AnimatedTabsTrigger>
                    </AnimatedTabsList>

                    <div className="mt-3 flex-1">
                        <AnimatedTabsContent value="insert" className="mt-0">
                            <OperationForm
                                value={keyToInsert}
                                setValue={setKeyToInsert}
                                onSubmit={submitInsert}
                                buttonText="Insert"
                                buttonVariant="default" // CHANGED: Make this Primary (Blue)
                                buttonIcon={<Plus />}
                                isActive={activeTab === 'insert'}
                            />
                        </AnimatedTabsContent>

                        <AnimatedTabsContent value="delete" className="mt-0">
                            <OperationForm
                                value={keyToDelete}
                                setValue={setKeyToDelete}
                                onSubmit={submitDelete}
                                buttonText="Delete"
                                buttonVariant="destructive"
                                buttonIcon={<Trash2 />}
                                isActive={activeTab === 'delete'}
                            />
                        </AnimatedTabsContent>

                        <AnimatedTabsContent value="find" className="mt-0">
                            <OperationForm
                                value={keyToFind}
                                setValue={setKeyToFind}
                                onSubmit={submitFind}
                                buttonText="Find"
                                buttonVariant="outline"
                                buttonIcon={<Search />}
                                isActive={activeTab === 'find'}
                            />
                        </AnimatedTabsContent>

                        <AnimatedTabsContent value="more" className="mt-0">
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={onBulkRandom} className="h-9 text-xs">
                                    <Shuffle className="mr-1.5 h-3.5 w-3.5" />Random 10
                                </Button>
                                <Button variant="secondary" size="sm" onClick={onClear} className="h-9 text-xs">
                                    <Loader2 className="mr-1.5 h-3.5 w-3.5" />Reset Tree
                                </Button>
                            </div>
                        </AnimatedTabsContent>
                    </div>
                </AnimatedTabs>
            </CardContent>
        </Card>
    );
}