// src/lib/pseudocode/find.ts

export const FIND_CODE = `x = T.root
while x ≠ T.nil and k ≠ x.key
    if k < x.key
        x = x.left
    else x = x.right
return x`;

export const FIND_ANNOTATIONS: Record<number, string> = {
    1: "Start search at the root.",
    2: "Loop: Continue until x is NIL or we find the key.",
    3: "Compare search key k with current node x.",
    4: "If k is smaller, move to the left child.",
    5: "If k is larger, move to the right child.",
    6: "Return the node (found) or NIL (not found)."
};