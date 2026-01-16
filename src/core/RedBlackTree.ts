// src/core/RedBlackTree.ts

export enum Color { RED, BLACK }

export class TreeNode {
    key: number;
    color: Color;
    parent: TreeNode | null;
    left: TreeNode | null;
    right: TreeNode | null;
    address: number; // Simulated memory address (0-255)

    constructor(key: number) {
        this.key = key;
        this.color = Color.RED;
        this.parent = null;
        this.left = null;
        this.right = null;
        // Assign a random address between 1 and 255 (0 is reserved for null/nil)
        this.address = Math.floor(Math.random() * 254) + 1;
    }
}

export interface Step {
    treeState: TreeNode | null;
    description: string;
    highlightedNodeKeys: number[];
    pseudocodeLines: number[];
    operationType?: 'insert' | 'delete';
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
        newNode.address = node.address; // Persist address across clones
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

    private addStep(steps: Step[], description: string, highlightedNodeKeys: number[], pseudocodeLines: number[] = []) {
        steps.push({
            treeState: this.cloneNode(this.root, null),
            description,
            highlightedNodeKeys,
            pseudocodeLines
        });
    }

    private getColorName(color: Color): string {
        return color === Color.RED ? "RED" : "BLACK";
    }

    private leftRotate(x: TreeNode, steps: Step[], lines: number[] = []): void {
        const y = x.right;
        if (!y) return;

        x.right = y.left;
        if (y.left !== null) {
            y.left.parent = x;
        }

        y.parent = x.parent;
        if (x.parent === null) {
            this.root = y;
        } else if (x === x.parent.left) {
            x.parent.left = y;
        } else {
            x.parent.right = y;
        }

        y.left = x;
        x.parent = y;

        this.addStep(steps, `Left rotate around ${x.key}`, [x.key, y.key], lines);
    }

    private rightRotate(y: TreeNode, steps: Step[], lines: number[] = []): void {
        const x = y.left;
        if (!x) return;

        y.left = x.right;
        if (x.right !== null) {
            x.right.parent = y;
        }

        x.parent = y.parent;
        if (y.parent === null) {
            this.root = x;
        } else if (y === y.parent.right) {
            y.parent.right = x;
        } else {
            y.parent.left = x;
        }

        x.right = y;
        y.parent = x;

        this.addStep(steps, `Right rotate around ${y.key}`, [y.key, x.key], lines);
    }

    insert(key: number): Step[] {
        const steps: Step[] = [];
        this.addStep(steps, `Starting insert of ${key}`, [], [1, 2]);

        const z = new TreeNode(key);
        let y: TreeNode | null = null;
        let x: TreeNode | null = this.root;

        while (x !== null) {
            y = x;
            this.addStep(steps, `Comparing ${key} with ${x.key}`, [x.key], [3, 4, 5]);

            if (z.key < x.key) {
                x = x.left;
                this.addStep(steps, `${key} < ${y.key}, go Left`, [y.key], [6]);
            } else if (z.key > x.key) {
                x = x.right;
                this.addStep(steps, `${key} > ${y.key}, go Right`, [y.key], [7]);
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
        this.addStep(steps, "Checking for violations...", [z.key], [17, 18]);

        while (z.parent?.color === Color.RED) {
            const grandparent = z.parent.parent;
            if (!grandparent) break;

            const highlightKeys = [z.key, z.parent.key, grandparent.key];

            if (z.parent === grandparent.left) {
                const uncle = grandparent.right;
                if (uncle?.color === Color.RED) {
                    // Case 1
                    this.addStep(steps, "Parent and Uncle are RED (Case 1). Recolor.", [...highlightKeys, uncle.key], [21, 22, 23, 24]);
                    z.parent.color = Color.BLACK;
                    uncle.color = Color.BLACK;
                    grandparent.color = Color.RED;
                    z = grandparent;
                    this.addStep(steps, "Move z to grandparent.", [z.key], [25]);
                } else {
                    // Case 2
                    if (z === z.parent.right) {
                        this.addStep(steps, "Uncle is BLACK, Triangle shape (Case 2). Rotate Left.", highlightKeys, [26, 27, 28]);
                        z = z.parent;
                        this.leftRotate(z, steps, [28]);
                    }
                    // Case 3
                    this.addStep(steps, "Uncle is BLACK, Line shape (Case 3). Recolor Parent BLACK, Grandparent RED.", [z.key, z.parent!.key, grandparent.key], [29, 30]);
                    z.parent!.color = Color.BLACK;
                    grandparent.color = Color.RED;
                    this.addStep(steps, "Rotate Right on Grandparent (Case 3).", [grandparent.key], [31]);
                    this.rightRotate(grandparent, steps, [31]);
                }
            } else { // Symmetric Case
                const uncle = grandparent.left;
                if (uncle?.color === Color.RED) {
                    // Case 1 (Sym)
                    this.addStep(steps, "Parent and Uncle are RED (Case 1). Recolor.", [...highlightKeys, uncle.key], [34, 35, 36, 37]);
                    z.parent.color = Color.BLACK;
                    uncle.color = Color.BLACK;
                    grandparent.color = Color.RED;
                    z = grandparent;
                    this.addStep(steps, "Move z to grandparent.", [z.key], [38]);
                } else {
                    // Case 2 (Sym)
                    if (z === z.parent.left) {
                        this.addStep(steps, "Uncle is BLACK, Triangle shape (Case 2). Rotate Right.", highlightKeys, [39, 40, 41]);
                        z = z.parent;
                        this.rightRotate(z, steps, [41]);
                    }
                    // Case 3 (Sym)
                    this.addStep(steps, "Uncle is BLACK, Line shape (Case 3). Recolor Parent BLACK, Grandparent RED.", [z.key, z.parent!.key, grandparent.key], [42, 43]);
                    z.parent!.color = Color.BLACK;
                    grandparent.color = Color.RED;
                    this.addStep(steps, "Rotate Left on Grandparent (Case 3).", [grandparent.key], [44]);
                    this.leftRotate(grandparent, steps, [44]);
                }
            }
            this.addStep(steps, "Checking loop condition...", [z.key], [18]);
        }

        if (this.root && this.root.color !== Color.BLACK) {
            this.root.color = Color.BLACK;
            this.addStep(steps, "Ensure Root is BLACK.", [this.root.key], [45]);
        }
    }

    private transplant(u: TreeNode, v: TreeNode | null): void {
        if (u.parent === null) {
            this.root = v;
        } else if (u === u.parent.left) {
            u.parent.left = v;
        } else {
            u.parent.right = v;
        }
        if (v !== null) {
            v.parent = u.parent;
        }
    }

    private minimum(node: TreeNode): TreeNode {
        while (node.left !== null) {
            node = node.left;
        }
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
        let yOriginalColor: Color = y.color;
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

            this.addStep(steps, "Checking fixup loop...", parentOfCurrent ? [parentOfCurrent.key] : [], [21]);

            const highlightBase = parentOfCurrent ? [parentOfCurrent.key] : [];
            if (current) highlightBase.push(current.key);

            if (current === parentOfCurrent.left) {
                let sibling = parentOfCurrent.right;
                if (sibling === null) break;

                // Case 1
                if (sibling.color === Color.RED) {
                    this.addStep(steps, "Sibling is RED (Case 1). Recolor and Rotate Left.", [...highlightBase, sibling.key], [24, 25, 26, 27]);
                    sibling.color = Color.BLACK;
                    parentOfCurrent.color = Color.RED;
                    this.leftRotate(parentOfCurrent, steps, [27]);
                    sibling = parentOfCurrent.right;
                    if (sibling === null) break;
                    this.addStep(steps, "Case 1 complete. New sibling found.", [], [28]);
                }

                const isLeftChildBlack = sibling.left === null || sibling.left.color === Color.BLACK;
                const isRightChildBlack = sibling.right === null || sibling.right.color === Color.BLACK;

                // Case 2
                if (isLeftChildBlack && isRightChildBlack) {
                    this.addStep(steps, "Sibling's children are BLACK (Case 2). Recolor Sibling RED.", [...highlightBase, sibling.key], [29, 30]);
                    sibling.color = Color.RED;
                    current = parentOfCurrent;
                    parentOfCurrent = current.parent;
                    this.addStep(steps, "Case 2 complete. Move x up.", current ? [current.key] : [], [31]);
                } else {
                    // Case 3
                    if (isRightChildBlack) {
                        this.addStep(steps, "Sibling Right Child is BLACK (Case 3). Recolor and Rotate Right.", [...highlightBase, sibling.key], [32, 33, 34, 35]);
                        if (sibling.left) sibling.left.color = Color.BLACK;
                        sibling.color = Color.RED;
                        this.rightRotate(sibling, steps, [35]);
                        sibling = parentOfCurrent.right;
                        if (sibling === null) break;
                        this.addStep(steps, "Case 3 complete. New sibling found.", [], [36]);
                    }

                    // Case 4
                    this.addStep(steps, "Sibling Right Child is RED (Case 4). Recolor and Rotate Left.", [...highlightBase, sibling.key], [37, 38, 39, 40]);
                    sibling.color = parentOfCurrent.color;
                    parentOfCurrent.color = Color.BLACK;
                    if (sibling.right) sibling.right.color = Color.BLACK;
                    this.leftRotate(parentOfCurrent, steps, [40]);
                    current = this.root;
                    this.addStep(steps, "Case 4 complete. Terminate loop.", [], [41]);
                }
            } else { // Symmetric cases
                let sibling = parentOfCurrent.left;
                if (sibling === null) break;

                if (sibling.color === Color.RED) {
                    this.addStep(steps, "Sibling is RED (Case 1 Sym). Recolor and Rotate Right.", [...highlightBase, sibling.key], [44, 45, 46, 47]);
                    sibling.color = Color.BLACK;
                    parentOfCurrent.color = Color.RED;
                    this.rightRotate(parentOfCurrent, steps, [47]);
                    sibling = parentOfCurrent.left;
                    if (sibling === null) break;
                }

                const isLeftChildBlack = sibling.left === null || sibling.left.color === Color.BLACK;
                const isRightChildBlack = sibling.right === null || sibling.right.color === Color.BLACK;

                if (isLeftChildBlack && isRightChildBlack) {
                    this.addStep(steps, "Sibling's children are BLACK (Case 2 Sym). Recolor Sibling RED.", [...highlightBase, sibling.key], [49, 50]);
                    sibling.color = Color.RED;
                    current = parentOfCurrent;
                    parentOfCurrent = current.parent;
                } else {
                    if (isLeftChildBlack) {
                        this.addStep(steps, "Sibling Left Child is BLACK (Case 3 Sym). Recolor and Rotate Left.", [...highlightBase, sibling.key], [52, 53, 54, 55]);
                        if (sibling.right) sibling.right.color = Color.BLACK;
                        sibling.color = Color.RED;
                        this.leftRotate(sibling, steps, [55]);
                        sibling = parentOfCurrent.left;
                        if (sibling === null) break;
                    }

                    this.addStep(steps, "Sibling Left Child is RED (Case 4 Sym). Recolor and Rotate Right.", [...highlightBase, sibling.key], [57, 58, 59, 60]);
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
            this.addStep(steps, "Set x to BLACK.", [current.key], [62]);
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

    clear() {
        this.root = null;
    }
}