// src/lib/pseudocode/delete.ts

export const DELETE_CODE = `if z.left == T.nil
    x = z.right
    RB-TRANSPLANT(T, z, z.right)
else if z.right == T.nil
    x = z.left
    RB-TRANSPLANT(T, z, z.left)
else y = TREE-MINIMUM(z.right)
    y-original-color = y.color
    x = y.right
    if y.p == z
        x.p = y
    else RB-TRANSPLANT(T, y, y.right)
        y.right = z.right
        y.right.p = y
    RB-TRANSPLANT(T, z, y)
    y.left = z.left
    y.left.p = y
    y.color = z.color
if y-original-color == BLACK
    RB-DELETE-FIXUP(T, x)
while x ≠ T.root and x.color == BLACK
    if x == x.p.left
        w = x.p.right
        if w.color == RED
            w.color = BLACK              // Case 1
            x.p.color = RED              // Case 1
            LEFT-ROTATE(T, x.p)          // Case 1
            w = x.p.right                // Case 1
        if w.left.color == BLACK and w.right.color == BLACK
            w.color = RED                // Case 2
            x = x.p                      // Case 2
        else if w.right.color == BLACK
                w.left.color = BLACK     // Case 3
                w.color = RED            // Case 3
                RIGHT-ROTATE(T, w)       // Case 3
                w = x.p.right            // Case 3
            w.color = x.p.color          // Case 4
            x.p.color = BLACK            // Case 4
            w.right.color = BLACK        // Case 4
            LEFT-ROTATE(T, x.p)          // Case 4
            x = T.root                   // Case 4
    else (same as then clause with "right" and "left" exchanged)
        w = x.p.left
        if w.color == RED
            w.color = BLACK              // Case 1 (Sym)
            x.p.color = RED              // Case 1 (Sym)
            RIGHT-ROTATE(T, x.p)         // Case 1 (Sym)
            w = x.p.left                 // Case 1 (Sym)
        if w.right.color == BLACK and w.left.color == BLACK
            w.color = RED                // Case 2 (Sym)
            x = x.p                      // Case 2 (Sym)
        else if w.left.color == BLACK
                w.right.color = BLACK    // Case 3 (Sym)
                w.color = RED            // Case 3 (Sym)
                LEFT-ROTATE(T, w)        // Case 3 (Sym)
                w = x.p.left             // Case 3 (Sym)
            w.color = x.p.color          // Case 4 (Sym)
            x.p.color = BLACK            // Case 4 (Sym)
            w.left.color = BLACK         // Case 4 (Sym)
            RIGHT-ROTATE(T, x.p)         // Case 4 (Sym)
            x = T.root                   // Case 4 (Sym)
x.color = BLACK`;

export const DELETE_ANNOTATIONS: Record<number, string> = {
    20: "If deleted node (or successor) was BLACK, we lost a Black unit.",
    21: "Loop to fix 'Double Black' node x.",
    24: "Case 1: Sibling w is RED. Convert to Case 2, 3, or 4.",
    27: "Case 1: Rotate to make sibling BLACK.",
    29: "Case 2: Sibling and both nephews are BLACK.",
    30: "Case 2: Take Black from Sibling (make Red), move Double Black up to parent.",
    33: "Case 3: Sibling is BLACK, close nephew RED, far nephew BLACK.",
    35: "Case 3: Rotate w to push Red to the far nephew (Case 4).",
    37: "Case 4: Sibling is BLACK, far nephew is RED.",
    40: "Case 4: Rotate x.p to add Black to x's path. Solved.",
    62: "Ensure the node x (or root) ends up BLACK."
};