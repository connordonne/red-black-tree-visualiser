// src/core/RedBlackTree.ts

export const Color = {
    RED: 0,
    BLACK: 1
} as const;

export class TreeNode {
    key: number;
    color: typeof Color[keyof typeof Color];
    parent: TreeNode | null;
    left: TreeNode | null;
    right: TreeNode | null;
    address: number;

    constructor(key: number) {
        this.key = key;
        this.color = Color.RED;
        this.parent = null;
        this.left = null;
        this.right = null;
        this.address = Math.floor(Math.random() * 254) + 1;
    }
}

export type HealthStatus = 'healthy' | 'warning' | 'critical';

export interface TreeHealth {
    status: HealthStatus;
    score: number;
    message: string;
    violations: number[];
}

function calculateBlackHeightStats(node: TreeNode | null): { min: number, max: number, valid: boolean } {
    let min = Infinity;
    let max = -Infinity;

    const traverse = (n: TreeNode | null, currentBh: number) => {
        if (!n) {
            const leafBh = currentBh + 1;
            min = Math.min(min, leafBh);
            max = Math.max(max, leafBh);
            return;
        }

        const nextBh = currentBh + (n.color === Color.BLACK ? 1 : 0);
        traverse(n.left, nextBh);
        traverse(n.right, nextBh);
    }

    traverse(node, 0);

    if (min === Infinity) return { min: 1, max: 1, valid: true };
    return { min, max, valid: min === max };
}

function hasRedRedConflict(node: TreeNode | null): boolean {
    if (!node) return false;
    if (node.color === Color.RED) {
        if (node.left?.color === Color.RED) return true;
        if (node.right?.color === Color.RED) return true;
    }
    return hasRedRedConflict(node.left) || hasRedRedConflict(node.right);
}

export const analyzeTreeHealth = (root: TreeNode | null): TreeHealth => {
    const violations: number[] = [];

    if (root && root.color === Color.RED) violations.push(2);
    if (hasRedRedConflict(root)) violations.push(4);

    const bh = calculateBlackHeightStats(root);
    if (!bh.valid) violations.push(5);

    let status: HealthStatus = 'healthy';
    let score = 100;
    let message = "System Stable";

    if (violations.length > 0) {
        score = Math.max(0, 100 - (violations.length * 25));

        if (violations.includes(5)) {
            status = 'critical';
            message = "Critical: Black-Height Violation";
        } else if (violations.includes(4)) {
            status = 'warning';
            message = "Warning: Red-Red Conflict";
        } else if (violations.includes(2)) {
            status = 'warning';
            message = "Warning: Root is Red";
        }
    }

    return { status, score, message, violations };
};

// --- Visual Canvas Label Interface ---
export interface CanvasLabel {
    text: string;
    targetNodeKey: number;
    type?: 'info' | 'warning' | 'success' | 'rotation';
}

// --- Search Focus Interface ---
export interface SearchFocus {
    key: number;
    targetNodeKey: number | null;
}

// --- Recolor Interaction Interface ---
export interface RecolorData {
    prompt: string;
    expected: Record<number, number>;
    hint?: string;
}

// --- NEW: Drag Puzzle Interface ---
export interface DragPuzzleData {
    targetTree: TreeNode;
    nodesToMove: number[];
}

export interface Step {
    treeState: TreeNode | null;
    description: string;
    highlightedNodeKeys: number[];
    pseudocodeLines: number[];
    operationType?: 'insert' | 'delete' | 'find';
    requiresInteraction?: boolean;
    dragPuzzleData?: DragPuzzleData;
    canvasLabel?: CanvasLabel;
    searchFocus?: SearchFocus;
    recolorData?: RecolorData;
    nodeRoles?: Record<number, string>;
}

export class RedBlackTree {
    root: TreeNode | null;

    constructor() {
        this.root = null;
    }

    private cloneNode(node: TreeNode | null, parent: TreeNode | null): TreeNode | null {
        if (node === null) return null;
        const newNode = new TreeNode(node.key);
        newNode.color = node.color;
        newNode.address = node.address;
        newNode.parent = parent;
        newNode.left = this.cloneNode(node.left, newNode);
        newNode.right = this.cloneNode(node.right, newNode);
        return newNode;
    }

    clone(): RedBlackTree {
        const newTree = new RedBlackTree();
        newTree.root = this.cloneNode(this.root, null);
        return newTree;
    }

    getBlackHeightStats(): { min: number, max: number, valid: boolean } {
        return calculateBlackHeightStats(this.root);
    }

    private getSubtreeKeys(node: TreeNode | null): number[] {
        if (!node) return [];
        const keys: number[] = [];
        const stack = [node];
        while (stack.length > 0) {
            const curr = stack.pop()!;
            keys.push(curr.key);
            if (curr.right) stack.push(curr.right);
            if (curr.left) stack.push(curr.left);
        }
        return keys;
    }

    private addStep(
        steps: Step[],
        description: string,
        highlightedNodeKeys: number[],
        pseudocodeLines: number[] = [],
        operationType?: 'insert' | 'delete' | 'find',
        requiresInteraction: boolean = false,
        dragPuzzleData?: DragPuzzleData,
        canvasLabel?: CanvasLabel,
        searchFocus?: SearchFocus,
        recolorData?: RecolorData,
        nodeRoles?: Record<number, string>
    ) {
        steps.push({
            treeState: this.cloneNode(this.root, null),
            description,
            highlightedNodeKeys,
            pseudocodeLines,
            operationType,
            requiresInteraction,
            dragPuzzleData,
            canvasLabel,
            searchFocus,
            recolorData,
            nodeRoles
        });
    }

    private leftRotate(x: TreeNode, steps: Step[], lines: number[] = []): void {
        const y = x.right;
        if (!y) return;

        const simulatedTree = this.clone();
        const simX = simulatedTree.find(x.key)!;
        const simY = simX.right!;

        simX.right = simY.left;
        if (simY.left !== null) simY.left.parent = simX;
        simY.parent = simX.parent;
        if (simX.parent === null) simulatedTree.root = simY;
        else if (simX === simX.parent.left) simX.parent.left = simY;
        else simX.parent.right = simY;
        simY.left = simX;
        simX.parent = simY;

        const nodesToMove = this.getSubtreeKeys(x);
        this.addStep(
            steps,
            `Preparing Left Rotation around ${x.key}.`,
            nodesToMove,
            lines,
            undefined,
            true,
            { targetTree: simulatedTree.root!, nodesToMove },
            { text: "Rotate Left ↺", targetNodeKey: x.key, type: 'rotation' }
        );

        x.right = y.left;
        if (y.left !== null) y.left.parent = x;
        y.parent = x.parent;
        if (x.parent === null) this.root = y;
        else if (x === x.parent.left) x.parent.left = y;
        else x.parent.right = y;
        y.left = x;
        x.parent = y;

        this.addStep(steps, `Left rotate around ${x.key} complete.`, nodesToMove, lines);
    }

    private rightRotate(y: TreeNode, steps: Step[], lines: number[] = []): void {
        const x = y.left;
        if (!x) return;

        const simulatedTree = this.clone();
        const simY = simulatedTree.find(y.key)!;
        const simX = simY.left!;

        simY.left = simX.right;
        if (simX.right !== null) simX.right.parent = simY;
        simX.parent = simY.parent;
        if (simY.parent === null) simulatedTree.root = simX;
        else if (simY === simY.parent.right) simY.parent.right = simX;
        else simY.parent.left = simX;
        simX.right = simY;
        simY.parent = simX;

        const nodesToMove = this.getSubtreeKeys(y);
        this.addStep(
            steps,
            `Preparing Right Rotation around ${y.key}. Drag the highlighted nodes into their new logical positions.`,
            nodesToMove,
            lines,
            undefined,
            true,
            { targetTree: simulatedTree.root!, nodesToMove },
            { text: "Rotate Right ↻", targetNodeKey: y.key, type: 'rotation' }
        );

        y.left = x.right;
        if (x.right !== null) x.right.parent = y;
        x.parent = y.parent;
        if (y.parent === null) this.root = x;
        else if (y === y.parent.right) y.parent.right = x;
        else y.parent.left = x;
        x.right = y;
        y.parent = x;

        this.addStep(steps, `Right rotate around ${y.key} complete.`, nodesToMove, lines);
    }

    insert(key: number): Step[] {
        const steps: Step[] = [];
        this.addStep(steps, `Starting insert of ${key}`, [], [1, 2], 'insert', false, undefined, undefined, { key, targetNodeKey: this.root ? this.root.key : null });

        const z = new TreeNode(key);
        let y: TreeNode | null = null;
        let x: TreeNode | null = this.root;
        while (x !== null) {
            y = x;
            this.addStep(steps, `Comparing ${key} with ${x.key}`, [x.key], [3, 4, 5], 'insert', false, undefined, undefined, { key, targetNodeKey: x.key });

            if (z.key < x.key) {
                x = x.left;
                this.addStep(steps, `${key} < ${y.key}, go Left`, [y.key], [6], 'insert', false, undefined, undefined, { key, targetNodeKey: y.key });
            } else if (z.key > x.key) {
                x = x.right;
                this.addStep(steps, `${key} > ${y.key}, go Right`, [y.key], [7], 'insert', false, undefined, undefined, { key, targetNodeKey: y.key });
            } else {
                this.addStep(steps, `Key ${key} already exists.`, [x.key], []);
                return steps;
            }
        }
        z.parent = y;
        if (y === null) {
            this.root = z;
            this.addStep(steps, `Tree empty. Inserted ${key} as root (BLACK).`, [z.key], [9, 10]);
        } else if (z.key < y.key) {
            y.left = z;
            this.addStep(steps, `${key} < ${y.key}. Inserted ${key} as left child of ${y.key}.`, [z.key, y.key], [11, 12]);
        } else {
            y.right = z;
            this.addStep(steps, `${key} > ${y.key}. Inserted ${key} as right child of ${y.key}.`, [z.key, y.key], [13]);
        }
        z.left = null;
        z.right = null;
        z.color = Color.RED;
        this.addStep(steps, "New node is RED.", [z.key], [14, 15, 16]);
        this.fixupInsert(z, steps);
        return steps;
    }

    private fixupInsert(z: TreeNode, steps: Step[]): void {
        this.addStep(steps, "Checking for violations...", [z.key], [17, 18], undefined, false, undefined, undefined, undefined, undefined, { [z.key]: 'z' });
        while (z.parent?.color === Color.RED) {
            const grandparent = z.parent.parent;
            if (!grandparent) break;
            const highlightKeys = [z.key, z.parent.key, grandparent.key];

            if (z.parent === grandparent.left) {
                const uncle = grandparent.right;
                const baseRoles: Record<number, string> = { [z.key]: 'z', [z.parent.key]: 'P', [grandparent.key]: 'G' };
                if (uncle) baseRoles[uncle.key] = 'U';

                if (uncle?.color === Color.RED) {
                    this.addStep(
                        steps,
                        "Case 1: Red Parent, Red Uncle.",
                        [...highlightKeys, uncle.key],
                        [21, 22, 23, 24],
                        undefined,
                        true,
                        undefined,
                        { text: "Uncle is RED", targetNodeKey: uncle.key, type: 'warning' },
                        undefined,
                        {
                            prompt: "Rule 4 Violated (Red-Red). Click the nodes to correct their colors.",
                            expected: { [z.parent.key]: Color.BLACK, [uncle.key]: Color.BLACK, [grandparent.key]: Color.RED },
                            hint: "Hint: Red Parent + Red Uncle means you must push Black down from the Grandparent."
                        },
                        baseRoles
                    );

                    z.parent.color = Color.BLACK;
                    uncle.color = Color.BLACK;
                    grandparent.color = Color.RED;
                    z = grandparent;
                    this.addStep(steps, "Recolored Parent/Uncle BLACK, Grandparent RED. Move z up.", [z.key], [25], undefined, false, undefined, undefined, undefined, undefined, { [z.key]: 'z' });
                } else {
                    if (z === z.parent.right) {
                        this.addStep(steps, "Case 2: Triangle Shape (Left-Right).", highlightKeys, [26, 27, 28], undefined, false, undefined, { text: "Triangle Shape", targetNodeKey: z.parent.key, type: 'info' }, undefined, undefined, baseRoles);
                        z = z.parent;
                        this.leftRotate(z, steps, [28]);
                    }

                    const newBaseRoles: Record<number, string> = { [z.key]: 'z', [z.parent!.key]: 'P', [grandparent.key]: 'G' };
                    if (uncle) newBaseRoles[uncle.key] = 'U';

                    this.addStep(
                        steps,
                        "Case 3: Line Shape (Left-Left).",
                        [z.key, z.parent!.key, grandparent.key],
                        [29, 30],
                        undefined,
                        true,
                        undefined,
                        { text: "Line Shape", targetNodeKey: grandparent.key, type: 'info' },
                        undefined,
                        {
                            prompt: "Rule 4 Violated (Red-Red). Click the nodes to correct their colors before rotating.",
                            expected: { [z.parent!.key]: Color.BLACK, [grandparent.key]: Color.RED },
                            hint: "Hint: For a Line shape, swap the colors of the Parent and Grandparent to restore Black-Height after rotation."
                        },
                        newBaseRoles
                    );

                    z.parent!.color = Color.BLACK;
                    grandparent.color = Color.RED;
                    this.addStep(steps, "Recolored Parent BLACK, Grandparent RED.", [z.parent!.key, grandparent.key], [30], undefined, false, undefined, undefined, undefined, undefined, newBaseRoles);
                    this.rightRotate(grandparent, steps, [31]);
                }
            } else {
                const uncle = grandparent.left;
                const baseRoles: Record<number, string> = { [z.key]: 'z', [z.parent.key]: 'P', [grandparent.key]: 'G' };
                if (uncle) baseRoles[uncle.key] = 'U';

                if (uncle?.color === Color.RED) {
                    this.addStep(
                        steps,
                        "Case 1: Red Parent, Red Uncle.",
                        [...highlightKeys, uncle.key],
                        [34, 35, 36, 37],
                        undefined,
                        true,
                        undefined,
                        { text: "Uncle is RED", targetNodeKey: uncle.key, type: 'warning' },
                        undefined,
                        {
                            prompt: "Rule 4 Violated (Red-Red). Click the nodes to correct their colors.",
                            expected: { [z.parent.key]: Color.BLACK, [uncle.key]: Color.BLACK, [grandparent.key]: Color.RED },
                            hint: "Hint: Red Parent + Red Uncle means you must push Black down from the Grandparent."
                        },
                        baseRoles
                    );

                    z.parent.color = Color.BLACK;
                    uncle.color = Color.BLACK;
                    grandparent.color = Color.RED;
                    z = grandparent;
                    this.addStep(steps, "Recolored Parent/Uncle BLACK, Grandparent RED. Move z up.", [z.key], [38], undefined, false, undefined, undefined, undefined, undefined, { [z.key]: 'z' });
                } else {
                    if (z === z.parent.left) {
                        this.addStep(steps, "Case 2: Triangle Shape (Right-Left).", highlightKeys, [39, 40, 41], undefined, false, undefined, { text: "Triangle Shape", targetNodeKey: z.parent.key, type: 'info' }, undefined, undefined, baseRoles);
                        z = z.parent;
                        this.rightRotate(z, steps, [41]);
                    }

                    const newBaseRoles: Record<number, string> = { [z.key]: 'z', [z.parent!.key]: 'P', [grandparent.key]: 'G' };
                    if (uncle) newBaseRoles[uncle.key] = 'U';

                    this.addStep(
                        steps,
                        "Case 3: Line Shape (Right-Right).",
                        [z.key, z.parent!.key, grandparent.key],
                        [42, 43],
                        undefined,
                        true,
                        undefined,
                        { text: "Line Shape", targetNodeKey: grandparent.key, type: 'info' },
                        undefined,
                        {
                            prompt: "Rule 4 Violated (Red-Red). Click the nodes to correct their colors before rotating.",
                            expected: { [z.parent!.key]: Color.BLACK, [grandparent.key]: Color.RED },
                            hint: "Hint: For a Line shape, swap the colors of the Parent and Grandparent to restore Black-Height after rotation."
                        },
                        newBaseRoles
                    );

                    z.parent!.color = Color.BLACK;
                    grandparent.color = Color.RED;
                    this.addStep(steps, "Recolored Parent BLACK, Grandparent RED.", [z.parent!.key, grandparent.key], [43], undefined, false, undefined, undefined, undefined, undefined, newBaseRoles);
                    this.leftRotate(grandparent, steps, [44]);
                }
            }
            this.addStep(steps, "Checking loop condition...", [z.key], [18], undefined, false, undefined, undefined, undefined, undefined, { [z.key]: 'z' });
        }
        if (this.root && this.root.color !== Color.BLACK) {
            this.root.color = Color.BLACK;
            this.addStep(steps, "Ensure Root is BLACK.", [this.root.key], [45]);
        }
    }

    private transplant(u: TreeNode, v: TreeNode | null): void {
        if (u.parent === null) this.root = v;
        else if (u === u.parent.left) u.parent.left = v;
        else u.parent.right = v;
        if (v !== null) v.parent = u.parent;
    }

    private minimum(node: TreeNode): TreeNode {
        while (node.left !== null) node = node.left;
        return node;
    }

    delete(key: number): Step[] {
        const steps: Step[] = [];
        this.addStep(steps, `Searching for node ${key} to delete.`, [], []);
        const z = this.find(key);
        if (z === null) {
            this.addStep(steps, `Node ${key} not found.`, [], []);
            return steps;
        }
        this.addStep(steps, `Found node ${key}.`, [z.key], []);
        let y: TreeNode = z;
        let yOriginalColor: typeof Color[keyof typeof Color] = y.color;
        let x: TreeNode | null;
        let xParent: TreeNode | null;
        if (z.left === null) {
            x = z.right;
            xParent = z.parent;
            this.addStep(steps, `Node ${z.key} has no left child. Replacing with right child.`, [z.key], [1, 2, 3]);
            this.transplant(z, z.right);
        } else if (z.right === null) {
            x = z.left;
            xParent = z.parent;
            this.addStep(steps, `Node ${z.key} has no right child. Replacing with left child.`, [z.key], [4, 5, 6]);
            this.transplant(z, z.left);
        } else {
            y = this.minimum(z.right);
            yOriginalColor = y.color;
            x = y.right;
            this.addStep(steps, `Finding successor (min of right subtree): ${y.key}`, [z.key, y.key], [7, 8]);
            if (y.parent === z) {
                xParent = y;
                if (x) x.parent = y;
                this.addStep(steps, `Successor is direct child.`, [y.key], [10, 11]);
            } else {
                xParent = y.parent;
                this.transplant(y, y.right);
                y.right = z.right;
                y.right.parent = y;
                this.addStep(steps, `Successor is not direct child. Transplanting successor.`, [y.key], [12, 13, 14]);
            }
            this.transplant(z, y);
            y.left = z.left;
            y.left.parent = y;
            y.color = z.color;
            this.addStep(steps, `Replaced ${z.key} with successor ${y.key}.`, [y.key], [15, 16, 17, 18]);
        }
        if (yOriginalColor === Color.BLACK) {
            this.addStep(steps, "Original color was BLACK. Fixing up violations...", [], [19, 20]);
            this.fixupDelete(x, xParent, steps);
        } else {
            this.addStep(steps, "Original color was RED. No fixup needed.", [], []);
        }
        return steps;
    }

    private fixupDelete(x: TreeNode | null, xParent: TreeNode | null, steps: Step[]): void {
        let current = x;
        let parentOfCurrent = xParent;
        while (current !== this.root && (current === null || current.color === Color.BLACK)) {
            if (parentOfCurrent === null) break;

            const baseRoles: Record<number, string> = {};
            if (current) baseRoles[current.key] = 'x';
            if (parentOfCurrent) baseRoles[parentOfCurrent.key] = 'P';

            this.addStep(steps, "Checking fixup loop...", parentOfCurrent ? [parentOfCurrent.key] : [], [21], undefined, false, undefined, undefined, undefined, undefined, baseRoles);

            const highlightBase = parentOfCurrent ? [parentOfCurrent.key] : [];
            if (current) highlightBase.push(current.key);

            if (current === parentOfCurrent.left) {
                let sibling = parentOfCurrent.right;
                if (sibling === null) break;

                const rolesCase1 = { ...baseRoles, [sibling.key]: 'w' };

                if (sibling.color === Color.RED) {
                    this.addStep(steps, "Sibling is RED (Case 1). Recolor and Rotate Left.", [...highlightBase, sibling.key], [24, 25, 26, 27], undefined, true, undefined, { text: "Sibling Red", targetNodeKey: sibling.key, type: 'warning'}, undefined, {
                        prompt: "Sibling is RED (Case 1). Fix the colors before rotating.",
                        expected: { [sibling.key]: Color.BLACK, [parentOfCurrent.key]: Color.RED },
                        hint: "Hint: To fix a Red sibling, swap the colors of the parent and the sibling to prepare for rotation."
                    }, rolesCase1);

                    sibling.color = Color.BLACK;
                    parentOfCurrent.color = Color.RED;
                    this.leftRotate(parentOfCurrent, steps, [27]);
                    sibling = parentOfCurrent.right;
                    if (sibling === null) break;
                    this.addStep(steps, "Case 1 complete. New sibling found.", [], [28], undefined, false, undefined, undefined, undefined, undefined, { ...baseRoles, [sibling.key]: 'w' });
                }

                const isLeftChildBlack = sibling.left === null || sibling.left.color === Color.BLACK;
                const isRightChildBlack = sibling.right === null || sibling.right.color === Color.BLACK;

                const rolesCase234 = { ...baseRoles, [sibling.key]: 'w' };
                if (sibling.left) rolesCase234[sibling.left.key] = 'L';
                if (sibling.right) rolesCase234[sibling.right.key] = 'R';

                if (isLeftChildBlack && isRightChildBlack) {
                    this.addStep(steps, "Sibling's children are BLACK (Case 2). Recolor Sibling RED.", [...highlightBase, sibling.key], [29, 30], undefined, true, undefined, undefined, undefined, {
                        prompt: "Sibling's children are BLACK (Case 2). Fix the color of the sibling.",
                        expected: { [sibling.key]: Color.RED },
                        hint: "Hint: If the sibling and both nephews are Black, push the 'extra black' up by making the sibling Red."
                    }, rolesCase234);

                    sibling.color = Color.RED;
                    current = parentOfCurrent;
                    parentOfCurrent = current.parent;

                    const updatedBaseRoles: Record<number, string> = {};
                    if (current) updatedBaseRoles[current.key] = 'x';
                    if (parentOfCurrent) updatedBaseRoles[parentOfCurrent.key] = 'P';
                    this.addStep(steps, "Case 2 complete. Move x up.", current ? [current.key] : [], [31], undefined, false, undefined, undefined, undefined, undefined, updatedBaseRoles);
                } else {
                    if (isRightChildBlack) {
                        this.addStep(steps, "Sibling Right Child is BLACK (Case 3). Recolor and Rotate Right.", [...highlightBase, sibling.key], [32, 33, 34, 35], undefined, true, undefined, { text: "Close Nephew Red", targetNodeKey: sibling.left ? sibling.left.key : sibling.key, type: 'info' }, undefined, {
                            prompt: "Close nephew is RED (Case 3). Fix colors before rotation.",
                            expected: { [sibling.key]: Color.RED, ...(sibling.left ? { [sibling.left.key]: Color.BLACK } : {}) },
                            hint: "Hint: Swap the colors of the sibling and its close Red nephew to push the Red node outward."
                        }, rolesCase234);
                        if (sibling.left) sibling.left.color = Color.BLACK;
                        sibling.color = Color.RED;
                        this.rightRotate(sibling, steps, [35]);
                        sibling = parentOfCurrent.right;
                        if (sibling === null) break;
                        this.addStep(steps, "Case 3 complete. New sibling found.", [], [36], undefined, false, undefined, undefined, undefined, undefined, { ...baseRoles, [sibling.key]: 'w' });
                    }

                    const rolesCase4 = { ...baseRoles, [sibling.key]: 'w' };
                    if (sibling.right) rolesCase4[sibling.right.key] = 'R';

                    this.addStep(steps, "Sibling Right Child is RED (Case 4). Recolor and Rotate Left.", [...highlightBase, sibling.key], [37, 38, 39, 40], undefined, true, undefined, { text: "Far Nephew Red", targetNodeKey: sibling.right ? sibling.right.key : sibling.key, type: 'info' }, undefined, {
                        prompt: "Far nephew is RED (Case 4). Fix colors to restore Black-Height before final rotation.",
                        expected: {
                            [sibling.key]: parentOfCurrent.color,
                            [parentOfCurrent.key]: Color.BLACK,
                            ...(sibling.right ? { [sibling.right.key]: Color.BLACK } : {})
                        },
                        hint: "Hint: The sibling takes the parent's color, while the parent and the far Red nephew are colored Black."
                    }, rolesCase4);

                    sibling.color = parentOfCurrent.color;
                    parentOfCurrent.color = Color.BLACK;
                    if (sibling.right) sibling.right.color = Color.BLACK;
                    this.leftRotate(parentOfCurrent, steps, [40]);
                    current = this.root;
                    this.addStep(steps, "Case 4 complete. Terminate loop.", [], [41], undefined, false, undefined, undefined, undefined, undefined, current ? { [current.key]: 'x' } : {});
                }
            } else {
                let sibling = parentOfCurrent.left;
                if (sibling === null) break;

                const rolesCase1 = { ...baseRoles, [sibling.key]: 'w' };

                if (sibling.color === Color.RED) {
                    this.addStep(steps, "Sibling is RED (Case 1 Sym). Recolor and Rotate Right.", [...highlightBase, sibling.key], [44, 45, 46, 47], undefined, true, undefined, { text: "Sibling Red", targetNodeKey: sibling.key, type: 'warning'}, undefined, {
                        prompt: "Sibling is RED (Case 1 Sym). Fix the colors before rotating.",
                        expected: { [sibling.key]: Color.BLACK, [parentOfCurrent.key]: Color.RED },
                        hint: "Hint: To fix a Red sibling, swap the colors of the parent and the sibling to prepare for rotation."
                    }, rolesCase1);

                    sibling.color = Color.BLACK;
                    parentOfCurrent.color = Color.RED;
                    this.rightRotate(parentOfCurrent, steps, [47]);
                    sibling = parentOfCurrent.left;
                    if (sibling === null) break;
                    this.addStep(steps, "Case 1 Sym complete. New sibling found.", [], [48], undefined, false, undefined, undefined, undefined, undefined, { ...baseRoles, [sibling.key]: 'w' });
                }

                const isLeftChildBlack = sibling.left === null || sibling.left.color === Color.BLACK;
                const isRightChildBlack = sibling.right === null || sibling.right.color === Color.BLACK;

                const rolesCase234 = { ...baseRoles, [sibling.key]: 'w' };
                if (sibling.left) rolesCase234[sibling.left.key] = 'L';
                if (sibling.right) rolesCase234[sibling.right.key] = 'R';

                if (isLeftChildBlack && isRightChildBlack) {
                    this.addStep(steps, "Sibling's children are BLACK (Case 2 Sym). Recolor Sibling RED.", [...highlightBase, sibling.key], [49, 50], undefined, true, undefined, undefined, undefined, {
                        prompt: "Sibling's children are BLACK (Case 2 Sym). Fix the color of the sibling.",
                        expected: { [sibling.key]: Color.RED },
                        hint: "Hint: If the sibling and both nephews are Black, push the 'extra black' up by making the sibling Red."
                    }, rolesCase234);

                    sibling.color = Color.RED;
                    current = parentOfCurrent;
                    parentOfCurrent = current.parent;

                    const updatedBaseRoles: Record<number, string> = {};
                    if (current) updatedBaseRoles[current.key] = 'x';
                    if (parentOfCurrent) updatedBaseRoles[parentOfCurrent.key] = 'P';
                    this.addStep(steps, "Case 2 Sym complete. Move x up.", current ? [current.key] : [], [51], undefined, false, undefined, undefined, undefined, undefined, updatedBaseRoles);
                } else {
                    if (isLeftChildBlack) {
                        this.addStep(steps, "Sibling Left Child is BLACK (Case 3 Sym). Recolor and Rotate Left.", [...highlightBase, sibling.key], [52, 53, 54, 55], undefined, true, undefined, { text: "Close Nephew Red", targetNodeKey: sibling.right ? sibling.right.key : sibling.key, type: 'info' }, undefined, {
                            prompt: "Close nephew is RED (Case 3 Sym). Fix colors before rotation.",
                            expected: { [sibling.key]: Color.RED, ...(sibling.right ? { [sibling.right.key]: Color.BLACK } : {}) },
                            hint: "Hint: Swap the colors of the sibling and its close Red nephew to push the Red node outward."
                        }, rolesCase234);
                        if (sibling.right) sibling.right.color = Color.BLACK;
                        sibling.color = Color.RED;
                        this.leftRotate(sibling, steps, [55]);
                        sibling = parentOfCurrent.left;
                        if (sibling === null) break;
                        this.addStep(steps, "Case 3 Sym complete. New sibling found.", [], [56], undefined, false, undefined, undefined, undefined, undefined, { ...baseRoles, [sibling.key]: 'w' });
                    }

                    const rolesCase4 = { ...baseRoles, [sibling.key]: 'w' };
                    if (sibling.left) rolesCase4[sibling.left.key] = 'L';

                    this.addStep(steps, "Sibling Left Child is RED (Case 4 Sym). Recolor and Rotate Right.", [...highlightBase, sibling.key], [57, 58, 59, 60], undefined, true, undefined, { text: "Far Nephew Red", targetNodeKey: sibling.left ? sibling.left.key : sibling.key, type: 'info' }, undefined, {
                        prompt: "Far nephew is RED (Case 4 Sym). Fix colors to restore Black-Height before final rotation.",
                        expected: {
                            [sibling.key]: parentOfCurrent.color,
                            [parentOfCurrent.key]: Color.BLACK,
                            ...(sibling.left ? { [sibling.left.key]: Color.BLACK } : {})
                        },
                        hint: "Hint: The sibling takes the parent's color, while the parent and the far Red nephew are colored Black."
                    }, rolesCase4);

                    sibling.color = parentOfCurrent.color;
                    parentOfCurrent.color = Color.BLACK;
                    if (sibling.left) sibling.left.color = Color.BLACK;
                    this.rightRotate(parentOfCurrent, steps, [60]);
                    current = this.root;
                }
            }
        }
        if (current !== null) {
            current.color = Color.BLACK;
            this.addStep(steps, "Set x to BLACK.", [current.key], [62], undefined, false, undefined, undefined, undefined, undefined, { [current.key]: 'x' });
        }
    }

    find(key: number): TreeNode | null {
        let current = this.root;
        while (current !== null) {
            if (key === current.key) return current;
            current = key < current.key ? current.left : current.right;
        }
        return null;
    }

    search(key: number): Step[] {
        const steps: Step[] = [];
        this.addStep(
            steps,
            `Starting search for ${key}.`,
            this.root ? [this.root.key] : [],
            [1],
            'find',
            false,
            undefined,
            undefined,
            { key, targetNodeKey: this.root ? this.root.key : null }
        );

        let x = this.root;
        while (x !== null) {
            this.addStep(
                steps,
                `Comparing ${key} with ${x.key}.`,
                [x.key],
                [2, 3],
                'find',
                false,
                undefined,
                undefined,
                { key, targetNodeKey: x.key }
            );

            if (key === x.key) {
                this.addStep(steps, `Found key ${key}!`, [x.key], [6], 'find', false, undefined, undefined, { key, targetNodeKey: x.key });
                return steps;
            }

            const parentKey = x.key;

            if (key < x.key) {
                x = x.left;
                if (x) {
                    this.addStep(steps, `${key} < ${parentKey}. Go Left.`, [x.key], [4], 'find', false, undefined, undefined, { key, targetNodeKey: x.key });
                } else {
                    this.addStep(steps, `${key} < ${parentKey}. Left child is NIL.`, [], [4], 'find', false, undefined, undefined, { key, targetNodeKey: null });
                }
            } else {
                x = x.right;
                if (x) {
                    this.addStep(steps, `${key} > ${parentKey}. Go Right.`, [x.key], [5], 'find', false, undefined, undefined, { key, targetNodeKey: x.key });
                } else {
                    this.addStep(steps, `${key} > ${parentKey}. Right child is NIL.`, [], [5], 'find', false, undefined, undefined, { key, targetNodeKey: null });
                }
            }
        }
        this.addStep(steps, `Key ${key} not found.`, [], [2, 6]);
        return steps;
    }

    clear() {
        this.root = null;
    }
}