// src/core/RedBlackTree.ts

enum Color { RED, BLACK }

// Using 'TreeNode' to avoid conflicts with the DOM 'Node' type.
class TreeNode {
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

    // A simple clone method for immutability with React state
    clone(): RedBlackTree {
        const newTree = new RedBlackTree();
        // A deep clone of the node structure would be needed for a perfect clone.
        // For this example, we'll just copy the root reference, but a proper implementation
        // would recursively copy all nodes.
        newTree.root = this.root;
        return newTree;
    }

    // --- All your tree logic will go here ---

    insert(key: number) {
        // ... Placeholder for your full insertion logic ...
        // ... This would include finding the position and then calling a fixup method ...
        console.log(`(Logic) Inserting ${key}`);
        // For demonstration, let's just create a node.
        if (!this.root) {
            this.root = new TreeNode(key);
            this.root.color = Color.BLACK; // Root is always black
        }
    }

    delete(key: number) {
        // ... Placeholder for your full deletion logic ...
        console.log(`(Logic) Deleting ${key}`);
    }

    find(key: number): TreeNode | null {
        // ... Placeholder for your full find logic ...
        console.log(`(Logic) Finding ${key}`);
        let current = this.root;
        while (current !== null) {
            if (key === current.key) return current;
            current = key < current.key ? current.left : current.right;
        }
        return null;
    }

    clear() {
        this.root = null;
        console.log("(Logic) Tree cleared");
    }
}