// src/components/Controls.tsx

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedTabs, AnimatedTabsContent, AnimatedTabsList, AnimatedTabsTrigger } from "@/components/ui/animated-tabs";
import { Trash2, Plus, Shuffle, Loader2, Search } from "lucide-react";
import { OperationForm } from './OperationForm';

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
}

export function Controls({
                             keyToInsert, setKeyToInsert, submitInsert,
                             keyToDelete, setKeyToDelete, submitDelete,
                             keyToFind, setKeyToFind, submitFind,
                             onBulkRandom, onClear
                         }: ControlsProps) {
    const [activeTab, setActiveTab] = useState("insert");

    return (
        <Card>
            <CardHeader><CardTitle>Controls</CardTitle></CardHeader>
            <CardContent>
                <AnimatedTabs defaultValue="insert" onValueChange={setActiveTab}>
                    <AnimatedTabsList>
                        <AnimatedTabsTrigger value="insert">Insert</AnimatedTabsTrigger>
                        <AnimatedTabsTrigger value="delete">Delete</AnimatedTabsTrigger>
                        <AnimatedTabsTrigger value="find">Find</AnimatedTabsTrigger>
                        <AnimatedTabsTrigger value="more">More</AnimatedTabsTrigger>
                    </AnimatedTabsList>

                    <AnimatedTabsContent value="insert" className="space-y-3 pt-4">
                        <OperationForm
                            value={keyToInsert}
                            setValue={setKeyToInsert}
                            onSubmit={submitInsert}
                            buttonText="Insert"
                            buttonVariant="outline"
                            buttonIcon={<Plus />}
                            isActive={activeTab === 'insert'}
                        />
                    </AnimatedTabsContent>

                    <AnimatedTabsContent value="delete" className="space-y-3 pt-4">
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

                    <AnimatedTabsContent value="find" className="space-y-3 pt-4">
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

                    <AnimatedTabsContent value="more" className="space-y-3 pt-4">
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={onBulkRandom}><Shuffle />Random 10</Button>
                            <Button variant="secondary" onClick={onClear}><Loader2 />Reset Tree</Button>
                        </div>
                    </AnimatedTabsContent>
                </AnimatedTabs>
            </CardContent>
        </Card>
    );
}