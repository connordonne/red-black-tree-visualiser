// src/core/RedBlackTree.ts

export enum Color { RED, BLACK }

// Using 'TreeNode' to avoid conflicts with the DOM 'Node' type.
export class TreeNode {
    key: number;
    color: Color;
    parent: TreeNode | null;
    left: TreeNode | null;
    right: TreeNode | null;

    constructor(key: number) {
        this.key = key;
        this.color = Color.RED; // New nodes are always red initially
        this.parent = null;
        this.left = null;
        this.right = null;
    }
}

// Step interface for animation
export interface Step {
    treeState: TreeNode | null; // Snapshot of the tree root
    description: string;
    highlightedNodeKeys: number[];
}

export class RedBlackTree {
    root: TreeNode | null;

    constructor() {
        this.root = null;
    }

    // A helper for deep cloning nodes
    private cloneNode(node: TreeNode | null, parent: TreeNode | null): TreeNode | null {
        if (node === null) {
            return null;
        }

        const newNode = new TreeNode(node.key);
        newNode.color = node.color;
        newNode.parent = parent;
        newNode.left = this.cloneNode(node.left, newNode);
        newNode.right = this.cloneNode(node.right, newNode);

        return newNode;
    }

    // A proper deep clone method for immutability with React state
    clone(): RedBlackTree {
        const newTree = new RedBlackTree();
        newTree.root = this.cloneNode(this.root, null);
        return newTree;
    }

    // Helper to capture a snapshot step
    private addStep(steps: Step[], description: string, highlightedNodeKeys: number[]) {
        steps.push({
            treeState: this.cloneNode(this.root, null),
            description,
            highlightedNodeKeys
        });
    }

    private getColorName(color: Color): string {
        return color === Color.RED ? "RED" : "BLACK";
    }

    private leftRotate(x: TreeNode, steps: Step[]): void {
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

        this.addStep(steps, `Left rotate around ${x.key}`, [x.key, y.key]);
    }

    private rightRotate(y: TreeNode, steps: Step[]): void {
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

        this.addStep(steps, `Right rotate around ${y.key}`, [y.key, x.key]);
    }

    insert(key: number): Step[] {
        const steps: Step[] = [];
        // Initial snapshot
        // this.addStep(steps, `Starting insert of ${key}`, []);

        const z = new TreeNode(key);
        let y: TreeNode | null = null;
        let x: TreeNode | null = this.root;

        // Standard BST insert
        while (x !== null) {
            y = x;
            this.addStep(steps, `Comparing ${key} with ${x.key}`, [x.key]);

            if (z.key < x.key) {
                x = x.left;
            } else if (z.key > x.key) {
                x = x.right;
            } else {
                this.addStep(steps, `Key ${key} already exists.`, [x.key]);
                return steps;
            }
        }

        z.parent = y;
        if (y === null) {
            this.root = z; // Tree was empty
            this.addStep(steps, `Tree empty. Inserted ${key} as root (BLACK).`, [z.key]);
        } else if (z.key < y.key) {
            y.left = z;
            this.addStep(steps, `${key} < ${y.key}. Inserted ${key} as left child of ${y.key}.`, [z.key, y.key]);
        } else {
            y.right = z;
            this.addStep(steps, `${key} > ${y.key}. Inserted ${key} as right child of ${y.key}.`, [z.key, y.key]);
        }

        // New node is red, fix any violations
        this.fixupInsert(z, steps);

        return steps;
    }

    private fixupInsert(z: TreeNode, steps: Step[]): void {
        while (z.parent?.color === Color.RED) {
            const grandparent = z.parent.parent;
            if (!grandparent) break;

            const highlightKeys = [z.key, z.parent.key, grandparent.key];

            if (z.parent === grandparent.left) {
                const uncle = grandparent.right;
                if (uncle?.color === Color.RED) {
                    // Case 1
                    this.addStep(steps, "Parent and Uncle are RED. Recolor Parent/Uncle to BLACK, Grandparent to RED.", [...highlightKeys, uncle.key]);
                    z.parent.color = Color.BLACK;
                    uncle.color = Color.BLACK;
                    grandparent.color = Color.RED;
                    z = grandparent;
                } else {
                    // Case 2
                    if (z === z.parent.right) {
                        this.addStep(steps, "Uncle is BLACK. Triangle shape (Left-Right). Rotate Left on Parent.", highlightKeys);
                        z = z.parent;
                        this.leftRotate(z, steps);
                    }
                    // Case 3
                    this.addStep(steps, "Uncle is BLACK. Line shape (Left-Left). Recolor Parent BLACK, Grandparent RED. Rotate Right on Grandparent.", [z.key, z.parent!.key, grandparent.key]);
                    z.parent!.color = Color.BLACK;
                    grandparent.color = Color.RED;
                    this.rightRotate(grandparent, steps);
                }
            } else { // Symmetric Case B
                const uncle = grandparent.left;
                if (uncle?.color === Color.RED) {
                    // Case 4
                    this.addStep(steps, "Parent and Uncle are RED. Recolor Parent/Uncle to BLACK, Grandparent to RED.", [...highlightKeys, uncle.key]);
                    z.parent.color = Color.BLACK;
                    uncle.color = Color.BLACK;
                    grandparent.color = Color.RED;
                    z = grandparent;
                } else {
                    // Case 5
                    if (z === z.parent.left) {
                        this.addStep(steps, "Uncle is BLACK. Triangle shape (Right-Left). Rotate Right on Parent.", highlightKeys);
                        z = z.parent;
                        this.rightRotate(z, steps);
                    }
                    // Case 6
                    this.addStep(steps, "Uncle is BLACK. Line shape (Right-Right). Recolor Parent BLACK, Grandparent RED. Rotate Left on Grandparent.", [z.key, z.parent!.key, grandparent.key]);
                    z.parent!.color = Color.BLACK;
                    grandparent.color = Color.RED;
                    this.leftRotate(grandparent, steps);
                }
            }
        }

        if (this.root && this.root.color !== Color.BLACK) {
            this.root.color = Color.BLACK;
            this.addStep(steps, "Ensure Root is BLACK.", [this.root.key]);
        }
    }

    // Replaces one subtree as a child of its parent with another subtree
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

    // Finds the node with the minimum key in a subtree
    private minimum(node: TreeNode): TreeNode {
        while (node.left !== null) {
            node = node.left;
        }
        return node;
    }

    delete(key: number): Step[] {
        const steps: Step[] = [];
        this.addStep(steps, `Searching for node ${key} to delete.`, []);

        const z = this.find(key);
        if (z === null) {
            this.addStep(steps, `Node ${key} not found.`, []);
            return steps;
        }

        this.addStep(steps, `Found node ${key}.`, [z.key]);

        let y: TreeNode = z;
        let yOriginalColor: Color = y.color;
        let x: TreeNode | null;
        let xParent: TreeNode | null;

        if (z.left === null) {
            x = z.right;
            xParent = z.parent;
            this.addStep(steps, `Node ${z.key} has no left child. Replacing with right child.`, [z.key]);
            this.transplant(z, z.right);
        } else if (z.right === null) {
            x = z.left;
            xParent = z.parent;
            this.addStep(steps, `Node ${z.key} has no right child. Replacing with left child.`, [z.key]);
            this.transplant(z, z.left);
        } else {
            y = this.minimum(z.right);
            yOriginalColor = y.color;
            x = y.right;

            this.addStep(steps, `Node ${z.key} has two children. Successor is ${y.key}.`, [z.key, y.key]);

            if (y.parent === z) {
                xParent = y;
                if (x) x.parent = y;
            } else {
                xParent = y.parent;
                this.transplant(y, y.right);
                y.right = z.right;
                y.right.parent = y;
            }

            this.transplant(z, y);
            y.left = z.left;
            y.left.parent = y;
            y.color = z.color;

            this.addStep(steps, `Replaced ${z.key} with successor ${y.key}. Copied color ${this.getColorName(z.color)}.`, [y.key]);
        }

        if (yOriginalColor === Color.BLACK) {
            this.addStep(steps, "Original color was BLACK. Fixing up violations...", []);
            this.fixupDelete(x, xParent, steps);
        } else {
            this.addStep(steps, "Original color was RED. No fixup needed.", []);
        }

        return steps;
    }

    private fixupDelete(x: TreeNode | null, xParent: TreeNode | null, steps: Step[]): void {
        let current = x;
        let parentOfCurrent = xParent;

        while (current !== this.root && (current === null || current.color === Color.BLACK)) {
            if (parentOfCurrent === null) {
                break;
            }

            const highlightBase = parentOfCurrent ? [parentOfCurrent.key] : [];
            if (current) highlightBase.push(current.key);

            if (current === parentOfCurrent.left) {
                let sibling = parentOfCurrent.right;
                if (sibling === null) break;

                // Case 1: Sibling is red
                if (sibling.color === Color.RED) {
                    this.addStep(steps, "Sibling is RED. Recolor Sibling BLACK, Parent RED. Rotate Left.", [...highlightBase, sibling.key]);
                    sibling.color = Color.BLACK;
                    parentOfCurrent.color = Color.RED;
                    this.leftRotate(parentOfCurrent, steps);
                    sibling = parentOfCurrent.right;
                    if (sibling === null) break;
                }

                const isLeftChildBlack = sibling.left === null || sibling.left.color === Color.BLACK;
                const isRightChildBlack = sibling.right === null || sibling.right.color === Color.BLACK;

                // Case 2: Sibling's children are both black
                if (isLeftChildBlack && isRightChildBlack) {
                    this.addStep(steps, "Sibling's children are BLACK. Recolor Sibling to RED.", [...highlightBase, sibling.key]);
                    sibling.color = Color.RED;
                    current = parentOfCurrent;
                    parentOfCurrent = current.parent;
                } else {
                    // Case 3: Sibling's left child is red, right is black
                    if (isRightChildBlack) {
                        this.addStep(steps, "Sibling's Right Child is BLACK (Left Red). Recolor Sibling Left Child BLACK, Sibling RED. Rotate Right on Sibling.", [...highlightBase, sibling.key]);
                        if (sibling.left) sibling.left.color = Color.BLACK;
                        sibling.color = Color.RED;
                        this.rightRotate(sibling, steps);
                        sibling = parentOfCurrent.right;
                        if (sibling === null) break;
                    }

                    // Case 4: Sibling's right child is red
                    this.addStep(steps, "Sibling's Right Child is RED. Recolor Sibling to Parent Color, Parent BLACK, Sibling Right Child BLACK. Rotate Left.", [...highlightBase, sibling.key]);
                    sibling.color = parentOfCurrent.color;
                    parentOfCurrent.color = Color.BLACK;
                    if (sibling.right) sibling.right.color = Color.BLACK;
                    this.leftRotate(parentOfCurrent, steps);
                    current = this.root; // End loop
                }
            } else { // Symmetric cases
                let sibling = parentOfCurrent.left;
                if (sibling === null) break;

                // Case 1 (symmetric)
                if (sibling.color === Color.RED) {
                    this.addStep(steps, "Sibling is RED. Recolor Sibling BLACK, Parent RED. Rotate Right.", [...highlightBase, sibling.key]);
                    sibling.color = Color.BLACK;
                    parentOfCurrent.color = Color.RED;
                    this.rightRotate(parentOfCurrent, steps);
                    sibling = parentOfCurrent.left;
                    if (sibling === null) break;
                }

                const isLeftChildBlack = sibling.left === null || sibling.left.color === Color.BLACK;
                const isRightChildBlack = sibling.right === null || sibling.right.color === Color.BLACK;

                // Case 2 (symmetric)
                if (isLeftChildBlack && isRightChildBlack) {
                    this.addStep(steps, "Sibling's children are BLACK. Recolor Sibling to RED.", [...highlightBase, sibling.key]);
                    sibling.color = Color.RED;
                    current = parentOfCurrent;
                    parentOfCurrent = current.parent;
                } else {
                    // Case 3 (symmetric)
                    if (isLeftChildBlack) {
                        this.addStep(steps, "Sibling's Left Child is BLACK (Right Red). Recolor Sibling Right Child BLACK, Sibling RED. Rotate Left on Sibling.", [...highlightBase, sibling.key]);
                        if (sibling.right) sibling.right.color = Color.BLACK;
                        sibling.color = Color.RED;
                        this.leftRotate(sibling, steps);
                        sibling = parentOfCurrent.left;
                        if (sibling === null) break;
                    }

                    // Case 4 (symmetric)
                    this.addStep(steps, "Sibling's Left Child is RED. Recolor Sibling to Parent Color, Parent BLACK, Sibling Left Child BLACK. Rotate Right.", [...highlightBase, sibling.key]);
                    sibling.color = parentOfCurrent.color;
                    parentOfCurrent.color = Color.BLACK;
                    if (sibling.left) sibling.left.color = Color.BLACK;
                    this.rightRotate(parentOfCurrent, steps);
                    current = this.root; // End loop
                }
            }
        }
        if (current !== null) {
            current.color = Color.BLACK;
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