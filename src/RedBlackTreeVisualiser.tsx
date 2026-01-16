// src/RedBlackTreeVisualiser.tsx

import React, { useState } from "react";
import { Controls } from "@/components/Controls";
import { RedBlackTree, type Step } from "@/core/RedBlackTree";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import TreeCanvas from "@/components/TreeCanvas";

export default function RedBlackTreeVisualiser() {
    const [tree, setTree] = useState(() => new RedBlackTree());
    const [keyToInsert, setKeyToInsert] = useState("");
    const [keyToDelete, setKeyToDelete] = useState("");
    const [keyToFind, setKeyToFind] = useState("");

    // Helper to log steps for verification
    const runOperation = (operationName: string, operationFn: (tree: RedBlackTree) => Step[]) => {
        const newTree = tree.clone();
        const steps = operationFn(newTree);
        console.group(`Operation: ${operationName}`);
        console.log("Generated Steps:", steps);
        steps.forEach((step, index) => {
            console.log(`Step ${index + 1}: ${step.description}`, step.highlightedNodeKeys);
        });
        console.groupEnd();

        setTree(newTree);
    };

    function submitInsert() {
        if (keyToInsert === "") return;
        runOperation(`Insert ${keyToInsert}`, (t) => t.insert(parseInt(keyToInsert, 10)));
        setKeyToInsert("");
    }

    function submitDelete() {
        if (keyToDelete === "") return;
        runOperation(`Delete ${keyToDelete}`, (t) => t.delete(parseInt(keyToDelete, 10)));
        setKeyToDelete("");
    }

    function submitFind() {
        if (keyToFind === "") return;
        const foundNode = tree.find(parseInt(keyToFind, 10));
        console.log(foundNode ? `Node ${keyToFind} found.` : `Node ${keyToFind} not in tree.`);
        setKeyToFind("");
    }

    function onBulkRandom() {
        // Bulk random doesn't return steps individually in this loop,
        // but we update the state once at the end.
        const newTree = tree.clone();
        for (let i = 0; i < 10; i++) {
            const randomKey = Math.floor(Math.random() * 100);
            newTree.insert(randomKey);
        }
        setTree(newTree);
    }

    function onClear() {
        setTree(new RedBlackTree());
    }

    return (
        <>
            <div className="min-h-screen w-full bg-gradient-to-b from-white to-slate-50 p-4 md:p-6 dark:from-background dark:to-slate-950">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Red–Black Tree Visualiser</h1>
                        <DarkModeToggle />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <div className="h-[500px] w-full rounded-xl border bg-card text-card-foreground shadow">
                                <TreeCanvas tree={tree} />
                            </div>
                        </div>

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
            <footer className="fixed bottom-4 right-4 z-50 text-xs text-muted-foreground">
                Connor Peter Donnelly – University of Glasgow – Level 4 Dissertation Project © 2025
            </footer>
        </>
    );
}