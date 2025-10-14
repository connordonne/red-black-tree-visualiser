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

    private leftRotate(x: TreeNode): void {
        const y = x.right;
        // This check should not be strictly necessary if the tree logic is correct,
        // but it prevents runtime errors.
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
    }

    private rightRotate(y: TreeNode): void {
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
    }

    insert(key: number): void {
        const z = new TreeNode(key);

        let y: TreeNode | null = null;
        let x: TreeNode | null = this.root;

        // Standard BST insert
        while (x !== null) {
            y = x;
            if (z.key < x.key) {
                x = x.left;
            } else if (z.key > x.key) {
                x = x.right;
            } else {
                // Key already exists, do nothing.
                return;
            }
        }

        z.parent = y;
        if (y === null) {
            this.root = z; // Tree was empty
        } else if (z.key < y.key) {
            y.left = z;
        } else {
            y.right = z;
        }

        // New node is red, fix any violations
        this.fixupInsert(z);
    }

    private fixupInsert(z: TreeNode): void {
        // Loop as long as the parent of the current node 'z' is RED.
        // This indicates a "red-red" violation.
        while (z.parent?.color === Color.RED) {
            // The grandparent must exist because the parent is RED, and the root must be BLACK.
            const grandparent = z.parent.parent;
            if (!grandparent) {
                // This case is a safeguard; it implies the parent is the root, which should be black.
                // The loop should terminate, and the final step will fix the root's color.
                break;
            }

            // Case A: The parent is a LEFT child
            if (z.parent === grandparent.left) {
                const uncle = grandparent.right;
                // Case 1: The uncle is RED.
                // Action: Recolor parent, uncle, and grandparent. Move 'z' up to the grandparent.
                if (uncle?.color === Color.RED) {
                    z.parent.color = Color.BLACK;
                    uncle.color = Color.BLACK;
                    grandparent.color = Color.RED;
                    z = grandparent;
                } else {
                    // Case 2: The uncle is BLACK, and 'z' is a RIGHT child (triangle shape).
                    // Action: Left rotate on the parent to transform into Case 3.
                    if (z === z.parent.right) {
                        z = z.parent;
                        this.leftRotate(z);
                    }
                    // Case 3: The uncle is BLACK, and 'z' is a LEFT child (line shape).
                    // Action: Recolor parent and grandparent, then right rotate on the grandparent.
                    z.parent!.color = Color.BLACK; // z.parent is guaranteed to exist here
                    grandparent.color = Color.RED;
                    this.rightRotate(grandparent);
                }
            } else { // Case B: The parent is a RIGHT child (symmetric to Case A)
                const uncle = grandparent.left;
                // Case 4: The uncle is RED.
                if (uncle?.color === Color.RED) {
                    z.parent.color = Color.BLACK;
                    uncle.color = Color.BLACK;
                    grandparent.color = Color.RED;
                    z = grandparent;
                } else {
                    // Case 5: The uncle is BLACK, and 'z' is a LEFT child (triangle).
                    if (z === z.parent.left) {
                        z = z.parent;
                        this.rightRotate(z);
                    }
                    // Case 6: The uncle is BLACK, and 'z' is a RIGHT child (line).
                    z.parent!.color = Color.BLACK;
                    grandparent.color = Color.RED;
                    this.leftRotate(grandparent);
                }
            }
        }

        // Property 2: The root of the tree is always black.
        if (this.root !== null) {
            this.root.color = Color.BLACK;
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

    delete(key: number): void {
        const z = this.find(key);
        if (z === null) {
            // Node not in the tree, nothing to do
            return;
        }

        let y: TreeNode = z;
        let yOriginalColor: Color = y.color;
        let x: TreeNode | null;
        let xParent: TreeNode | null;

        if (z.left === null) {
            x = z.right;
            xParent = z.parent;
            this.transplant(z, z.right);
        } else if (z.right === null) {
            x = z.left;
            xParent = z.parent;
            this.transplant(z, z.left);
        } else {
            y = this.minimum(z.right);
            yOriginalColor = y.color;
            x = y.right;

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
        }

        if (yOriginalColor === Color.BLACK) {
            this.fixupDelete(x, xParent);
        }
    }

    private fixupDelete(x: TreeNode | null, xParent: TreeNode | null): void {
        let current = x;
        let parentOfCurrent = xParent;

        while (current !== this.root && (current === null || current.color === Color.BLACK)) {
            if (parentOfCurrent === null) {
                break;
            }

            if (current === parentOfCurrent.left) {
                let sibling = parentOfCurrent.right;
                if (sibling === null) break;

                // Case 1: Sibling is red
                if (sibling.color === Color.RED) {
                    sibling.color = Color.BLACK;
                    parentOfCurrent.color = Color.RED;
                    this.leftRotate(parentOfCurrent);
                    sibling = parentOfCurrent.right;
                    if (sibling === null) break;
                }

                const isLeftChildBlack = sibling.left === null || sibling.left.color === Color.BLACK;
                const isRightChildBlack = sibling.right === null || sibling.right.color === Color.BLACK;

                // Case 2: Sibling's children are both black
                if (isLeftChildBlack && isRightChildBlack) {
                    sibling.color = Color.RED;
                    current = parentOfCurrent;
                    parentOfCurrent = current.parent;
                } else {
                    // Case 3: Sibling's left child is red, right is black
                    if (isRightChildBlack) {
                        if (sibling.left) sibling.left.color = Color.BLACK;
                        sibling.color = Color.RED;
                        this.rightRotate(sibling);
                        sibling = parentOfCurrent.right;
                        if (sibling === null) break;
                    }

                    // Case 4: Sibling's right child is red
                    sibling.color = parentOfCurrent.color;
                    parentOfCurrent.color = Color.BLACK;
                    if (sibling.right) sibling.right.color = Color.BLACK;
                    this.leftRotate(parentOfCurrent);
                    current = this.root; // End loop
                }
            } else { // Symmetric cases: current is a right child
                let sibling = parentOfCurrent.left;
                if (sibling === null) break;

                // Case 1 (symmetric): Sibling is red
                if (sibling.color === Color.RED) {
                    sibling.color = Color.BLACK;
                    parentOfCurrent.color = Color.RED;
                    this.rightRotate(parentOfCurrent);
                    sibling = parentOfCurrent.left;
                    if (sibling === null) break;
                }

                const isLeftChildBlack = sibling.left === null || sibling.left.color === Color.BLACK;
                const isRightChildBlack = sibling.right === null || sibling.right.color === Color.BLACK;

                // Case 2 (symmetric): Sibling's children are both black
                if (isLeftChildBlack && isRightChildBlack) {
                    sibling.color = Color.RED;
                    current = parentOfCurrent;
                    parentOfCurrent = current.parent;
                } else {
                    // Case 3 (symmetric): Sibling's right child is red, left is black
                    if (isLeftChildBlack) {
                        if (sibling.right) sibling.right.color = Color.BLACK;
                        sibling.color = Color.RED;
                        this.leftRotate(sibling);
                        sibling = parentOfCurrent.left;
                        if (sibling === null) break;
                    }

                    // Case 4 (symmetric): Sibling's left child is red
                    sibling.color = parentOfCurrent.color;
                    parentOfCurrent.color = Color.BLACK;
                    if (sibling.left) sibling.left.color = Color.BLACK;
                    this.rightRotate(parentOfCurrent);
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