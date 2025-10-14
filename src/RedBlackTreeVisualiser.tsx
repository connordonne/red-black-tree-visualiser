// src/RedBlackTreeVisualiser.tsx

import React, { useState } from "react";
import { Controls } from "@/components/Controls";
import { RedBlackTree } from "@/core/RedBlackTree";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import TreeCanvas from "@/components/TreeCanvas";

export default function RedBlackTreeVisualiser() {
    const [tree, setTree] = useState(() => new RedBlackTree());
    const [keyToInsert, setKeyToInsert] = useState("");
    const [keyToDelete, setKeyToDelete] = useState("");
    const [keyToFind, setKeyToFind] = useState("");

    // This helper function ensures React detects a state change by creating a new object reference.
    const updateTreeAndRerender = (mutatingFunction: (tree: RedBlackTree) => void) => {
        const newTree = tree.clone();
        mutatingFunction(newTree);
        setTree(newTree);
    };

    function submitInsert() {
        if (keyToInsert === "") return;
        updateTreeAndRerender(currentTree => {
            currentTree.insert(parseInt(keyToInsert, 10));
        });
        setKeyToInsert("");
    }

    function submitDelete() {
        if (keyToDelete === "") return;
        updateTreeAndRerender(currentTree => {
            currentTree.delete(parseInt(keyToDelete, 10));
        });
        setKeyToDelete("");
    }

    function submitFind() {
        if (keyToFind === "") return;
        // Find is a read-only operation, so no state update is needed unless you want to highlight the found node.
        const foundNode = tree.find(parseInt(keyToFind, 10));
        console.log(foundNode ? `Node ${keyToFind} found.` : `Node ${keyToFind} not in tree.`);
        // You could add state here to manage a "found node" highlight
        setKeyToFind("");
    }

    function onBulkRandom() {
        updateTreeAndRerender(currentTree => {
            for (let i = 0; i < 10; i++) {
                const randomKey = Math.floor(Math.random() * 100);
                currentTree.insert(randomKey);
            }
        });
    }

    function onClear() {
        // Create a completely new tree instance
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