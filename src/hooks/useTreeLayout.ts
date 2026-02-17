// src/hooks/useTreeLayout.ts

import { useMemo } from 'react';
import * as d3 from 'd3';
import { TreeNode, Color } from '@/core/RedBlackTree';

export type { TreeNode };

interface VisualTreeNode extends TreeNode {
    isDummy?: boolean;
    isSpacer?: boolean;
}

export interface RBTHierarchyPointNode extends d3.HierarchyPointNode<VisualTreeNode> {
    data: VisualTreeNode;
    blackDepth: number; 
    isInvalidBlackHeight?: boolean;
}

export interface RBTHierarchyPointLink extends d3.HierarchyPointLink<VisualTreeNode> {
    source: RBTHierarchyPointNode;
    target: RBTHierarchyPointNode;
}

const NODE_SIZE: [number, number] = [60, 80];

export const useTreeLayout = (rootNode: TreeNode | null, showNils: boolean = false) => {
    const treeLayout = useMemo(() => {
        if (!rootNode) {
            return { nodes: [], links: [] };
        }

        const hierarchy = d3.hierarchy<VisualTreeNode>(rootNode, d => {
            if (d.isDummy || d.isSpacer) return undefined;

            const left = d.left;
            const right = d.right;

            if (!showNils && !left && !right) return undefined;

            const children: VisualTreeNode[] = [];

            if (left) {
                children.push(left);
            } else {
                if (showNils) {
                    const dummy = new TreeNode(0) as VisualTreeNode;
                    dummy.isDummy = true;
                    dummy.color = Color.BLACK;
                    dummy.address = (d.address * 1000) + 1; 
                    children.push(dummy);
                } else if (right) {
                    const spacer = new TreeNode(0) as VisualTreeNode;
                    spacer.isSpacer = true;
                    spacer.address = (d.address * 10000) + 1; 
                    children.push(spacer);
                }
            }
            if (right) {
                children.push(right);
            } else {
                if (showNils) {
                    const dummy = new TreeNode(0) as VisualTreeNode;
                    dummy.isDummy = true;
                    dummy.color = Color.BLACK;
                    dummy.address = (d.address * 1000) + 2;
                    children.push(dummy);
                } else if (left) {
                    const spacer = new TreeNode(0) as VisualTreeNode;
                    spacer.isSpacer = true;
                    spacer.address = (d.address * 10000) + 2;
                    children.push(spacer);
                }
            }

            return children.length > 0 ? children : undefined;
        });

        const treeGenerator = d3.tree<VisualTreeNode>()
            .nodeSize(NODE_SIZE)
            .separation((a, b) => {
                const isSpecialNode = a.data.isDummy || b.data.isDummy || a.data.isSpacer || b.data.isSpacer;
                if (isSpecialNode) return 1.25;
                return a.parent === b.parent ? 2.0 : 3.0;
            });

        const treeData = treeGenerator(hierarchy) as RBTHierarchyPointNode;

        treeData.eachBefore((node) => {
            const isNodeBlack = node.data.color === Color.BLACK;
            const parentBlackDepth = node.parent ? (node.parent as RBTHierarchyPointNode).blackDepth : 0;
            node.blackDepth = parentBlackDepth + (isNodeBlack ? 1 : 0);
        });

        if (showNils) {
            const leaves = treeData.leaves() as RBTHierarchyPointNode[];
            const dummyLeaves = leaves.filter(l => l.data.isDummy);
            
            if (dummyLeaves.length > 0) {
                const firstDepth = dummyLeaves[0].blackDepth;
                const isConsistent = dummyLeaves.every(l => l.blackDepth === firstDepth);
                
                if (!isConsistent) {
                    dummyLeaves.forEach(l => l.isInvalidBlackHeight = true);
                }
            }
        }

        const allNodes = treeData.descendants() as RBTHierarchyPointNode[];
        const allLinks = treeData.links() as RBTHierarchyPointLink[];

        const nodes = allNodes.filter(d => {
            if (d.data.isSpacer) return false;
            return showNils || !d.data.isDummy;
        });

        const links = allLinks.filter(link => {
            if (link.target.data.isSpacer) return false;
            return showNils || (!link.source.data.isDummy && !link.target.data.isDummy);
        });

        return { nodes, links };
    }, [rootNode, showNils]);

    return treeLayout;
};