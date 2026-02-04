import { RedBlackTree, TreeNode, Color } from './RedBlackTree';

// Helper to validate RBT properties
function validateTree(tree: RedBlackTree) {
  if (!tree.root) return;

  // 1. Root must be black
  expect(tree.root.color).toBe(Color.BLACK);

  // 2. No red node has a red child
  validateRedProperty(tree.root);

  // 3. Black height must be consistent
  const bh = validateBlackHeight(tree.root);
  expect(bh).toBeGreaterThan(0);
}

function validateRedProperty(node: TreeNode | null) {
  if (!node) return;
  if (node.color === Color.RED) {
    if (node.left) expect(node.left.color).toBe(Color.BLACK);
    if (node.right) expect(node.right.color).toBe(Color.BLACK);
  }
  validateRedProperty(node.left);
  validateRedProperty(node.right);
}

function validateBlackHeight(node: TreeNode | null): number {
  if (!node) return 1; // Null counts as black height 1

  const leftHeight = validateBlackHeight(node.left);
  const rightHeight = validateBlackHeight(node.right);

  // All paths must have same black height
  expect(leftHeight).toBe(rightHeight);

  return leftHeight + (node.color === Color.BLACK ? 1 : 0);
}

// Helper to manually construct trees for specific cases
function createNode(key: number, color: Color, parent: TreeNode | null = null): TreeNode {
  const node = new TreeNode(key);
  node.color = color;
  node.parent = parent;
  return node;
}

describe('RedBlackTree Insertion', () => {
  let tree: RedBlackTree;

  beforeEach(() => {
    tree = new RedBlackTree();
  });

  test('Insert into empty tree', () => {
    tree.insert(10);
    expect(tree.root).not.toBeNull();
    expect(tree.root?.key).toBe(10);
    expect(tree.root?.color).toBe(Color.BLACK); // Root must always be BLACK
    validateTree(tree);
  });

  test('Insert simple cases (No rotation, just color assignment)', () => {
    // 1. Insert Root
    tree.insert(10);
    // 2. Insert Left Child (RED by default, parent is BLACK root, no violation)
    tree.insert(5);

    expect(tree.root?.key).toBe(10);
    expect(tree.root?.left?.key).toBe(5);
    expect(tree.root?.left?.color).toBe(Color.RED);
    
    // 3. Insert Right Child
    tree.insert(15);
    expect(tree.root?.right?.key).toBe(15);
    expect(tree.root?.right?.color).toBe(Color.RED);

    validateTree(tree);
  });

  test('Recoloring (Case 1: Uncle is RED)', () => {
    // Setup: 10(B) -> 5(R), 15(R)
    tree.insert(10);
    tree.insert(5);
    tree.insert(15);

    // Insert 1 (Child of 5). 
    // Parent(5) is Red, Uncle(15) is Red.
    // Should flip colors: 5->B, 15->B, 10->R->B(root fixup)
    tree.insert(1);

    expect(tree.root?.key).toBe(10);
    expect(tree.root?.color).toBe(Color.BLACK);
    expect(tree.root?.left?.key).toBe(5);
    expect(tree.root?.left?.color).toBe(Color.BLACK);
    expect(tree.root?.right?.key).toBe(15);
    expect(tree.root?.right?.color).toBe(Color.BLACK);
    
    // The new node 1 should be RED
    const n1 = tree.root?.left?.left;
    expect(n1?.key).toBe(1);
    expect(n1?.color).toBe(Color.RED);

    validateTree(tree);
  });

  test('Single Rotation (Case 3: Line case)', () => {
    // Setup: 20(B) -> 10(R)
    tree.insert(20);
    tree.insert(10);
    
    // Insert 5.
    // Structure: 20(B) -> 10(R) -> 5(R). Uncle (right of 20) is Nil (Black).
    // Left-Left case.
    // Rotate Right on 20.
    // New root: 10(B). Left: 5(R). Right: 20(R).
    tree.insert(5);

    expect(tree.root?.key).toBe(10);
    expect(tree.root?.color).toBe(Color.BLACK);
    
    expect(tree.root?.left?.key).toBe(5);
    expect(tree.root?.left?.color).toBe(Color.RED);
    
    expect(tree.root?.right?.key).toBe(20);
    expect(tree.root?.right?.color).toBe(Color.RED);

    validateTree(tree);
  });

  test('Double Rotation (Case 2: Triangle case)', () => {
    // Setup: 20(B) -> 10(R)
    tree.insert(20);
    tree.insert(10);

    // Insert 15.
    // Structure: 20(B) -> 10(R) -> right->15(R). Uncle is Nil (Black).
    // Left-Right case.
    // 1. Rotate Left on 10 (Parent). -> 20(B) -> 15(R) -> left->10(R). (Now Left-Left line relative to 20?) 
    // Actually creates 20(B) -> 15(R) -> 10(R) is not quite right description, it lifts 15.
    // Result Root: 15(B). Left: 10(R). Right: 20(R).
    tree.insert(15);

    expect(tree.root?.key).toBe(15);
    expect(tree.root?.color).toBe(Color.BLACK);

    expect(tree.root?.left?.key).toBe(10);
    expect(tree.root?.left?.color).toBe(Color.RED);

    expect(tree.root?.right?.key).toBe(20);
    expect(tree.root?.right?.color).toBe(Color.RED);

    validateTree(tree);
  });
  
  test('Symmetric Right-Right Single Rotation', () => {
      // 10 -> 20 -> 30
      tree.insert(10);
      tree.insert(20);
      tree.insert(30);
      
      // Should rotate left around 10.
      // Root 20(B), Left 10(R), Right 30(R)
      expect(tree.root?.key).toBe(20);
      expect(tree.root?.color).toBe(Color.BLACK);
      expect(tree.root?.left?.key).toBe(10);
      expect(tree.root?.left?.color).toBe(Color.RED);
      expect(tree.root?.right?.key).toBe(30);
      expect(tree.root?.right?.color).toBe(Color.RED);
      
      validateTree(tree);
  });

  test('Symmetric Right-Left Double Rotation', () => {
      // 10 -> 30 -> 20
      tree.insert(10);
      tree.insert(30);
      tree.insert(20);
      
      // Rotate Right on 30, then Left on 10.
      // Root 20(B), Left 10(R), Right 30(R)
      expect(tree.root?.key).toBe(20);
      expect(tree.root?.color).toBe(Color.BLACK);
      expect(tree.root?.left?.key).toBe(10);
      expect(tree.root?.right?.key).toBe(30);
      
      validateTree(tree);
  });

  test('Propagating Fixup (Recolor pushes Red up)', () => {
      //        10(B)
      //      /       \
      //    5(B)      15(B)
      //   /   \     /    \
      // 1(R) 7(R) 12(R) 20(R)
      
      tree.insert(10);
      tree.insert(5);
      tree.insert(15);
      tree.insert(1); // Recolor 5,15 Black
      tree.insert(7); 
      tree.insert(12);
      tree.insert(20);
      
      // Insert 25. Child of 20.
      // Parent 20(R), Uncle 12(R). Grandparent 15(B).
      // Case 1: 20->B, 12->B, 15->R.
      // Now 15 is RED. Parent 10 is BLACK. No further violation.
      tree.insert(25);
      
      const n15 = tree.root?.right;
      expect(n15?.color).toBe(Color.RED);
      expect(n15?.left?.color).toBe(Color.BLACK); // 12
      expect(n15?.right?.color).toBe(Color.BLACK); // 20
      
      validateTree(tree);
  });
});

describe('RedBlackTree Deletion', () => {
  let tree: RedBlackTree;

  beforeEach(() => {
    tree = new RedBlackTree();
  });

  test('Delete root (only node)', () => {
    tree.insert(10);
    tree.delete(10);
    expect(tree.root).toBeNull();
  });

  test('Delete red leaf node', () => {
    // 20(B) -> 10(R)
    tree.insert(20);
    tree.insert(10); 
    // Tree: 20(B), 10(R) left.
    expect(tree.root?.key).toBe(20);
    expect(tree.root?.left?.key).toBe(10);
    expect(tree.root?.left?.color).toBe(Color.RED);

    tree.delete(10);
    
    expect(tree.root?.key).toBe(20);
    expect(tree.root?.left).toBeNull();
    validateTree(tree);
  });

  test('Delete black leaf node (Simple Case 2)', () => {
    // Constructing specific Case 2:
    //      20(B)
    //     /     \
    //   10(B)   30(B)
    tree.root = createNode(20, Color.BLACK);
    const n10 = createNode(10, Color.BLACK, tree.root);
    const n30 = createNode(30, Color.BLACK, tree.root);
    tree.root.left = n10;
    tree.root.right = n30;

    tree.delete(10);
    validateTree(tree);
    expect(tree.find(10)).toBeNull();
  });

  test('Delete node with one child', () => {
    // 10(B) -> 20(R)
    tree.insert(10);
    tree.insert(20);
    
    tree.delete(10);
    // 20 should be root and BLACK
    expect(tree.root?.key).toBe(20);
    expect(tree.root?.color).toBe(Color.BLACK);
    validateTree(tree);
  });

  test('Delete node with two children', () => {
    tree.insert(20);
    tree.insert(10);
    tree.insert(30);
    
    tree.delete(20);
    // Should replace with successor (30) or predecessor. 
    // Implementation uses minimum(right), so 30.
    expect(tree.find(20)).toBeNull();
    expect(tree.root?.key).toBe(30);
    validateTree(tree);
  });

  // --- Fixup Cases ---

  test('Case 1: Sibling is Red', () => {
    //      20(B)
    //     /     \
    //   10(B)   30(R)
    //          /    \
    //        25(B) 35(B)
    tree.root = createNode(20, Color.BLACK);
    const n10 = createNode(10, Color.BLACK, tree.root);
    const n30 = createNode(30, Color.RED, tree.root);
    const n25 = createNode(25, Color.BLACK, n30);
    const n35 = createNode(35, Color.BLACK, n30);
    
    tree.root.left = n10;
    tree.root.right = n30;
    n30.left = n25;
    n30.right = n35;

    // Delete 10 triggers Case 1
    tree.delete(10);
    validateTree(tree);
    expect(tree.find(10)).toBeNull();
  });

  test('Case 2: Sibling is Black, both nephews Black', () => {
    //      20(B)
    //     /     \
    //   10(B)   30(B)
    // (Implicit nil children of 30 are black)
    tree.root = createNode(20, Color.BLACK);
    const n10 = createNode(10, Color.BLACK, tree.root);
    const n30 = createNode(30, Color.BLACK, tree.root);
    tree.root.left = n10;
    tree.root.right = n30;

    tree.delete(10);
    validateTree(tree);
  });

  test('Case 3: Sibling Black, Close Nephew Red, Far Nephew Black', () => {
    //      20(B)
    //     /     \
    //   10(B)   30(B)
    //          /
    //        25(R)
    tree.root = createNode(20, Color.BLACK);
    const n10 = createNode(10, Color.BLACK, tree.root);
    const n30 = createNode(30, Color.BLACK, tree.root);
    const n25 = createNode(25, Color.RED, n30);
    
    tree.root.left = n10;
    tree.root.right = n30;
    n30.left = n25;

    tree.delete(10);
    validateTree(tree);
  });

  test('Case 4: Sibling Black, Far Nephew Red', () => {
    //      20(B)
    //     /     \
    //   10(B)   30(B)
    //             \
    //             35(R)
    tree.root = createNode(20, Color.BLACK);
    const n10 = createNode(10, Color.BLACK, tree.root);
    const n30 = createNode(30, Color.BLACK, tree.root);
    const n35 = createNode(35, Color.RED, n30);
    
    tree.root.left = n10;
    tree.root.right = n30;
    n30.right = n35;

    tree.delete(10);
    validateTree(tree);
  });

  test('Complex Random Deletions', () => {
    // Use a fixed seed or predictable sequence if strict determinism is needed,
    // but random shuffle covers diverse cases well.
    const keys = Array.from({ length: 50 }, (_, i) => i);
    // Shuffle
    for (let i = keys.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [keys[i], keys[j]] = [keys[j], keys[i]];
    }

    // Insert all
    keys.forEach(k => tree.insert(k));
    validateTree(tree);

    // Delete half
    for (let i = 0; i < 25; i++) {
        tree.delete(keys[i]);
        validateTree(tree);
        expect(tree.find(keys[i])).toBeNull();
    }
  });
});