// src/lib/pseudocode/insert.ts

export const INSERT_CODE = `y = T.nil
x = T.root
while x ≠ T.nil
    y = x
    if z.key < x.key
        x = x.left
    else x = x.right
z.p = y
if y == T.nil
    T.root = z
else if z.key < y.key
    y.left = z
else y.right = z
z.left = T.nil
z.right = T.nil
z.color = RED
RB-INSERT-FIXUP(T, z)
while z.p.color == RED
    if z.p == z.p.p.left
        y = z.p.p.right
        if y.color == RED
            z.p.color = BLACK           
            y.color = BLACK            
            z.p.p.color = RED           
            z = z.p.p                 
        else if z == z.p.right
                z = z.p                 
                LEFT-ROTATE(T, z)     
            z.p.color = BLACK          
            z.p.p.color = RED          
            RIGHT-ROTATE(T, z.p.p)      
    else 
        y = z.p.p.left
        if y.color == RED
            z.p.color = BLACK           
            y.color = BLACK            
            z.p.p.color = RED           
            z = z.p.p                  
        else if z == z.p.left
                z = z.p                 
                RIGHT-ROTATE(T, z)      
            z.p.color = BLACK           
            z.p.p.color = RED          
            LEFT-ROTATE(T, z.p.p)        
T.root.color = BLACK`;

export const INSERT_ANNOTATIONS: Record<number, string> = {
    16: "New nodes are always inserted as RED to maintain Black-Height.",
    18: "Loop while the 'Red Child, Red Parent' violation exists.",
    22: "Case 1: Uncle is RED. Push Blackness down from Grandparent.",
    25: "Case 1: Violation moves up to Grandparent (z).",
    27: "Case 2: Uncle is BLACK. Triangle shape (Left-Right).",
    28: "Case 2: Rotate to convert Triangle into Line (Case 3).",
    29: "Case 3: Uncle is BLACK. Line shape (Left-Left).",
    31: "Case 3: Rotate Grandparent to fix violation.",
    45: "Property 2: Root must always be BLACK."
};