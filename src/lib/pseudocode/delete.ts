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
            w.color = BLACK             
            x.p.color = RED             
            LEFT-ROTATE(T, x.p)        
            w = x.p.right                
        if w.left.color == BLACK and w.right.color == BLACK
            w.color = RED                
            x = x.p                    
        else if w.right.color == BLACK
                w.left.color = BLACK     
                w.color = RED           
                RIGHT-ROTATE(T, w)    
                w = x.p.right        
            w.color = x.p.color          
            x.p.color = BLACK           
            w.right.color = BLACK        
            LEFT-ROTATE(T, x.p)         
            x = T.root                 
    else 
        w = x.p.left
        if w.color == RED
            w.color = BLACK              
            x.p.color = RED             
            RIGHT-ROTATE(T, x.p)        
            w = x.p.left               
        if w.right.color == BLACK and w.left.color == BLACK
            w.color = RED             
            x = x.p                    
        else if w.left.color == BLACK
                w.right.color = BLACK   
                w.color = RED        
                LEFT-ROTATE(T, w)       
                w = x.p.left           
            w.color = x.p.color          
            x.p.color = BLACK            
            w.left.color = BLACK        
            RIGHT-ROTATE(T, x.p)         
            x = T.root                   
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