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

// --- Quiz Interface ---
export interface QuizOption {
    id: string;
    text: string;
    isCorrect: boolean;
    feedback: string;
}

export interface QuizData {
    question: string;
    options: QuizOption[];
}

export interface Step {
    treeState: TreeNode | null;
    description: string;
    highlightedNodeKeys: number[];
    pseudocodeLines: number[];
    operationType?: 'insert' | 'delete' | 'find';
    requiresInteraction?: boolean;
    questionData?: QuizData;
}

// --- Predefined Quizzes ---
const QUIZZES = {
    case1: {
        question: "Violation: Red Parent and Red Uncle. How do we resolve this?",
        options: [
            { id: 'q1-opt1', text: "Rotate the Parent", isCorrect: false, feedback: "Rotations are used to fix shape/path issues (Black Uncle). Here we have a color overload." },
            { id: 'q1-opt2', text: "Push Black down (Recolor Parent & Uncle Black, GP Red)", isCorrect: true, feedback: "Correct! We push the redness up to the Grandparent." },
            { id: 'q1-opt3', text: "Recolor current node to Black", isCorrect: false, feedback: "Changing the new node to Black would violate the Black-Height property immediately." }
        ]
    } as QuizData,
    case2: {
        question: "Violation: Red Parent, Black Uncle, Triangle Shape. What is the first step?",
        options: [
            { id: 'q2-opt1', text: "Rotate Parent to form a Line", isCorrect: true, feedback: "Correct! We transform the Triangle (Case 2) into a Line (Case 3) to prepare for the final fix." },
            { id: 'q2-opt2', text: "Rotate Grandparent", isCorrect: false, feedback: "Rotating the Grandparent now would create a complex 'kink' shape and not solve the issue." },
            { id: 'q2-opt3', text: "Recolor Parent Black", isCorrect: false, feedback: "Simply recoloring here creates a Black-Height violation on this path." }
        ]
    } as QuizData,
    case3: {
        question: "Violation: Red Parent, Black Uncle, Line Shape. How do we fix it?",
        options: [
            { id: 'q3-opt1', text: "Recolor Parent Black, GP Red, then Rotate GP", isCorrect: true, feedback: "Correct! This restores Property 4 (No Red-Red) and balances the Black Height." },
            { id: 'q3-opt2', text: "Just Rotate Grandparent", isCorrect: false, feedback: "Rotation alone moves nodes but leaves the Red-Red color violation." },
            { id: 'q3-opt3', text: "Push Black Down", isCorrect: false, feedback: "The Uncle is Black (or NIL), so we cannot push Black down onto it." }
        ]
    } as QuizData
};


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
        let min = Infinity;
        let max = -Infinity;
        
        const traverse = (node: TreeNode | null, currentBh: number) => {
            if (!node) {
                const leafBh = currentBh + 1;
                min = Math.min(min, leafBh);
                max = Math.max(max, leafBh);
                return;
            }
            
            const nextBh = currentBh + (node.color === Color.BLACK ? 1 : 0);
            traverse(node.left, nextBh);
            traverse(node.right, nextBh);
        }
        
        traverse(this.root, 0);
        
        if (min === Infinity) return { min: 1, max: 1, valid: true }; 
        
        return { min, max, valid: min === max };
    }

    private addStep(
        steps: Step[], 
        description: string, 
        highlightedNodeKeys: number[], 
        pseudocodeLines: number[] = [],
        operationType?: 'insert' | 'delete' | 'find',
        requiresInteraction: boolean = false,
        questionData?: QuizData
    ) {
        steps.push({
            treeState: this.cloneNode(this.root, null),
            description,
            highlightedNodeKeys,
            pseudocodeLines,
            operationType,
            requiresInteraction,
            questionData
        });
    }

    private leftRotate(x: TreeNode, steps: Step[], lines: number[] = []): void {
        const y = x.right;
        if (!y) return;
        x.right = y.left;
        if (y.left !== null) y.left.parent = x;
        y.parent = x.parent;
        if (x.parent === null) this.root = y;
        else if (x === x.parent.left) x.parent.left = y;
        else x.parent.right = y;
        y.left = x;
        x.parent = y;
        this.addStep(steps, `Left rotate around ${x.key}`, [x.key, y.key], lines);
    }

    private rightRotate(y: TreeNode, steps: Step[], lines: number[] = []): void {
        const x = y.left;
        if (!x) return;
        y.left = x.right;
        if (x.right !== null) x.right.parent = y;
        x.parent = y.parent;
        if (y.parent === null) this.root = x;
        else if (y === y.parent.right) y.parent.right = x;
        else y.parent.left = x;
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
                    // CASE 1: Red Uncle
                    this.addStep(
                        steps, 
                        "Case 1: Red Parent, Red Uncle.", 
                        [...highlightKeys, uncle.key], 
                        [21, 22, 23, 24], 
                        undefined, 
                        true, 
                        QUIZZES.case1
                    );
                    
                    z.parent.color = Color.BLACK;
                    uncle.color = Color.BLACK;
                    grandparent.color = Color.RED;
                    z = grandparent;
                    this.addStep(steps, "Recolored Parent/Uncle BLACK, Grandparent RED. Move z up.", [z.key], [25]);
                } else {
                    // Uncle is Black
                    if (z === z.parent.right) {
                        // CASE 2: Triangle (Left-Right)
                        this.addStep(
                            steps, 
                            "Case 2: Triangle Shape (Left-Right).", 
                            highlightKeys, 
                            [26, 27, 28],
                            undefined,
                            true,
                            QUIZZES.case2
                        );
                        
                        z = z.parent;
                        this.leftRotate(z, steps, [28]);
                    }
                    
                    // CASE 3: Line (Left-Left)
                    this.addStep(
                        steps, 
                        "Case 3: Line Shape (Left-Left).", 
                        [z.key, z.parent!.key, grandparent.key], 
                        [29, 30],
                        undefined,
                        true,
                        QUIZZES.case3
                    );
                    
                    z.parent!.color = Color.BLACK;
                    grandparent.color = Color.RED;
                    this.addStep(steps, "Recolored Parent BLACK, Grandparent RED.", [z.parent!.key, grandparent.key], [30]);
                    this.rightRotate(grandparent, steps, [31]);
                }
            } else {
                // Symmetric Case
                const uncle = grandparent.left;
                if (uncle?.color === Color.RED) {
                    // CASE 1: Red Uncle
                    this.addStep(
                        steps, 
                        "Case 1: Red Parent, Red Uncle.", 
                        [...highlightKeys, uncle.key], 
                        [34, 35, 36, 37],
                        undefined,
                        true,
                        QUIZZES.case1
                    );

                    z.parent.color = Color.BLACK;
                    uncle.color = Color.BLACK;
                    grandparent.color = Color.RED;
                    z = grandparent;
                    this.addStep(steps, "Recolored Parent/Uncle BLACK, Grandparent RED. Move z up.", [z.key], [38]);
                } else {
                    if (z === z.parent.left) {
                         // CASE 2: Triangle (Right-Left)
                         this.addStep(
                            steps, 
                            "Case 2: Triangle Shape (Right-Left).", 
                            highlightKeys, 
                            [39, 40, 41],
                            undefined,
                            true,
                            QUIZZES.case2
                        );

                        z = z.parent;
                        this.rightRotate(z, steps, [41]);
                    }

                    // CASE 3: Line (Right-Right)
                    this.addStep(
                        steps, 
                        "Case 3: Line Shape (Right-Right).", 
                        [z.key, z.parent!.key, grandparent.key], 
                        [42, 43],
                        undefined,
                        true,
                        QUIZZES.case3
                    );

                    z.parent!.color = Color.BLACK;
                    grandparent.color = Color.RED;
                    this.addStep(steps, "Recolored Parent BLACK, Grandparent RED.", [z.parent!.key, grandparent.key], [43]);
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
            this.addStep(steps, "Checking fixup loop...", parentOfCurrent ? [parentOfCurrent.key] : [], [21]);
            const highlightBase = parentOfCurrent ? [parentOfCurrent.key] : [];
            if (current) highlightBase.push(current.key);
            if (current === parentOfCurrent.left) {
                let sibling = parentOfCurrent.right;
                if (sibling === null) break;
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
                if (isLeftChildBlack && isRightChildBlack) {
                    this.addStep(steps, "Sibling's children are BLACK (Case 2). Recolor Sibling RED.", [...highlightBase, sibling.key], [29, 30]);
                    sibling.color = Color.RED;
                    current = parentOfCurrent;
                    parentOfCurrent = current.parent;
                    this.addStep(steps, "Case 2 complete. Move x up.", current ? [current.key] : [], [31]);
                } else {
                    if (isRightChildBlack) {
                        this.addStep(steps, "Sibling Right Child is BLACK (Case 3). Recolor and Rotate Right.", [...highlightBase, sibling.key], [32, 33, 34, 35]);
                        if (sibling.left) sibling.left.color = Color.BLACK;
                        sibling.color = Color.RED;
                        this.rightRotate(sibling, steps, [35]);
                        sibling = parentOfCurrent.right;
                        if (sibling === null) break;
                        this.addStep(steps, "Case 3 complete. New sibling found.", [], [36]);
                    }
                    this.addStep(steps, "Sibling Right Child is RED (Case 4). Recolor and Rotate Left.", [...highlightBase, sibling.key], [37, 38, 39, 40]);
                    sibling.color = parentOfCurrent.color;
                    parentOfCurrent.color = Color.BLACK;
                    if (sibling.right) sibling.right.color = Color.BLACK;
                    this.leftRotate(parentOfCurrent, steps, [40]);
                    current = this.root;
                    this.addStep(steps, "Case 4 complete. Terminate loop.", [], [41]);
                }
            } else {
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

    search(key: number): Step[] {
        const steps: Step[] = [];
        this.addStep(steps, `Starting search for ${key}.`, this.root ? [this.root.key] : [], [1]);
        let x = this.root;
        while (x !== null) {
            this.addStep(steps, `Checking node ${x.key}.`, [x.key], [2]);
            this.addStep(steps, `Comparing ${key} with ${x.key}.`, [x.key], [3]);
            if (key === x.key) {
                this.addStep(steps, `Found key ${key}!`, [x.key], [6]);
                return steps;
            } else if (key < x.key) {
                this.addStep(steps, `${key} < ${x.key}. Go Left.`, [x.key], [4]);
                x = x.left;
            } else {
                this.addStep(steps, `${key} > ${x.key}. Go Right.`, [x.key], [5]);
                x = x.right;
            }
        }
        this.addStep(steps, `Key ${key} not found (reached NIL).`, [], [2, 6]);
        return steps;
    }

    clear() {
        this.root = null;
    }
}