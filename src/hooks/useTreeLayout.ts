// src/hooks/useTreeLayout.ts

import { useMemo } from 'react';
import * as d3 from 'd3';
import { TreeNode } from '@/core/RedBlackTree';

// Re-export TreeNode for convenience in other components
export type { TreeNode };

// Augment the D3 HierarchyPointNode to include our TreeNode data
export interface RBTHierarchyPointNode extends d3.HierarchyPointNode<TreeNode> {
    data: TreeNode;
}

export interface RBTHierarchyPointLink extends d3.HierarchyPointLink<TreeNode> {
    source: RBTHierarchyPointNode;
    target: RBTHierarchyPointNode;
}


export const useTreeLayout = (rootNode: TreeNode | null, width: number, height: number) => {
    const treeLayout = useMemo(() => {
        if (!rootNode || width === 0 || height === 0) {
            return { nodes: [], links: [] };
        }

        // 1. Create a hierarchy
        const hierarchy = d3.hierarchy(rootNode, d => {
            const children: TreeNode[] = [];
            if (d.left) children.push(d.left);
            if (d.right) children.push(d.right);
            return children.length > 0 ? children : undefined;
        });

        // 2. Create a tree layout generator
        const treeGenerator = d3.tree<TreeNode>().size([width, height]);

        // 3. Apply the layout to the hierarchy
        const treeData = treeGenerator(hierarchy);

        const nodes = treeData.descendants() as RBTHierarchyPointNode[];
        const links = treeData.links() as RBTHierarchyPointLink[];

        // D3's tree layout might place the root node somewhere other than the center top.
        // We'll adjust all nodes to center the root horizontally.
        const rootInLayout = nodes.find(n => n.data === rootNode);
        if (rootInLayout) {
            const xOffset = (width / 2) - rootInLayout.x;
            nodes.forEach(node => {
                node.x += xOffset;
            });
        }

        return { nodes, links };
    }, [rootNode, width, height]);

    return treeLayout;
};