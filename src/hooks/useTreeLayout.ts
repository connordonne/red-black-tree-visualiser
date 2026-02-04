// src/hooks/useTreeLayout.ts

import { useMemo } from 'react';
import * as d3 from 'd3';
import { TreeNode } from '@/core/RedBlackTree';

export type { TreeNode };

// Internal interface to track dummy nodes
interface VisualTreeNode extends TreeNode {
    isDummy?: boolean;
}

export interface RBTHierarchyPointNode extends d3.HierarchyPointNode<TreeNode> {
    data: TreeNode;
}

export interface RBTHierarchyPointLink extends d3.HierarchyPointLink<TreeNode> {
    source: RBTHierarchyPointNode;
    target: RBTHierarchyPointNode;
}

const NODE_SIZE: [number, number] = [60, 80];

export const useTreeLayout = (rootNode: TreeNode | null) => {
    const treeLayout = useMemo(() => {
        if (!rootNode) {
            return { nodes: [], links: [] };
        }

        // 1. Create Hierarchy with Dummy Nodes
        const hierarchy = d3.hierarchy<VisualTreeNode>(rootNode, d => {
            if (d.isDummy) return undefined;

            const left = d.left;
            const right = d.right;

            // If it's a leaf, no children
            if (!left && !right) return undefined;

            const children: VisualTreeNode[] = [];

            // Handle Left Child
            if (left) {
                children.push(left);
            } else {
                const dummy = new TreeNode(0) as VisualTreeNode;
                dummy.isDummy = true;
                children.push(dummy);
            }

            // Handle Right Child
            if (right) {
                children.push(right);
            } else {
                const dummy = new TreeNode(0) as VisualTreeNode;
                dummy.isDummy = true;
                children.push(dummy);
            }

            return children;
        });

        // 2. Generate Layout
        const treeGenerator = d3.tree<VisualTreeNode>()
            .nodeSize(NODE_SIZE)
            .separation((a, b) => {
                return a.parent === b.parent ? 1.2 : 1.5;
            });

        const treeData = treeGenerator(hierarchy);

        // 3. Filter out Dummies
        const allNodes = treeData.descendants();
        const allLinks = treeData.links();

        // Ensure we explicitly declare 'nodes' here
        const nodes = allNodes.filter(d => !d.data.isDummy) as RBTHierarchyPointNode[];
        
        const links = allLinks.filter(link => 
            !link.source.data.isDummy && !link.target.data.isDummy
        ) as RBTHierarchyPointLink[];

        return { nodes, links };
    }, [rootNode]);

    return treeLayout;
};