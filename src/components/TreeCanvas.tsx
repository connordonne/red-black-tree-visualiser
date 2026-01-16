// src/components/TreeCanvas.tsx
import React, { useRef, useState, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RedBlackTree, Color } from '@/core/RedBlackTree';
import { useTreeLayout, type RBTHierarchyPointNode, type RBTHierarchyPointLink } from '@/hooks/useTreeLayout';

interface TreeCanvasProps {
    tree: RedBlackTree;
}

const NODE_RADIUS = 20;
const VERTICAL_MARGIN = 50;

const TreeCanvas: React.FC<TreeCanvasProps> = ({ tree }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useLayoutEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight,
                });
            }
        };

        const resizeObserver = new ResizeObserver(updateSize);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }
        updateSize(); // Initial size

        return () => resizeObserver.disconnect();
    }, []);

    const { nodes, links } = useTreeLayout(
        tree.root,
        dimensions.width,
        dimensions.height - (VERTICAL_MARGIN * 2)
    );

    const nodeKey = (d: RBTHierarchyPointNode) => `node-${d.data.key}`;
    const linkKey = (d: RBTHierarchyPointLink) => `link-${d.source.data.key}-${d.target.data.key}`;

    const transition = { type: 'spring', stiffness: 300, damping: 30 };

    return (
        <div ref={containerRef} className="h-full w-full">
            {tree.root ? (
                <svg width={dimensions.width} height={dimensions.height} className="overflow-visible">
                    <g transform={`translate(0, ${VERTICAL_MARGIN})`}>
                        {/* Links Layer */}
                        <AnimatePresence>
                            {links.map((link) => (
                                <motion.path
                                    key={linkKey(link)}
                                    initial={{ opacity: 0, pathLength: 0 }}
                                    animate={{
                                        opacity: 1,
                                        pathLength: 1,
                                        d: `M${link.source.x},${link.source.y} L${link.target.x},${link.target.y}`
                                    }}
                                    exit={{ opacity: 0 }}
                                    transition={transition}
                                    stroke="var(--muted-foreground)"
                                    strokeWidth={2}
                                    fill="none"
                                />
                            ))}
                        </AnimatePresence>

                        {/* Nodes Layer */}
                        <AnimatePresence>
                            {nodes.map((node) => (
                                <motion.g
                                    key={nodeKey(node)}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <motion.circle
                                        r={NODE_RADIUS}
                                        initial={{ cx: node.x, cy: node.y, scale: 0 }}
                                        animate={{ cx: node.x, cy: node.y, scale: 1 }}
                                        transition={transition}
                                        fill={node.data.color === Color.RED ? 'var(--destructive)' : 'var(--foreground)'}
                                        stroke="var(--primary)"
                                        strokeWidth={2}
                                    />
                                    <motion.text
                                        textAnchor="middle"
                                        dy=".3em"
                                        initial={{ x: node.x, y: node.y, opacity: 0 }}
                                        animate={{ x: node.x, y: node.y, opacity: 1 }}
                                        transition={transition}
                                        fill={node.data.color === Color.RED ? 'var(--destructive-foreground)' : 'var(--background)'}
                                        className="font-semibold select-none pointer-events-none"
                                    >
                                        {node.data.key}
                                    </motion.text>
                                </motion.g>
                            ))}
                        </AnimatePresence>
                    </g>
                </svg>
            ) : (
                <div className="flex h-full w-full items-center justify-center">
                    <p className="text-muted-foreground">Tree is empty. Insert a node to begin.</p>
                </div>
            )}
        </div>
    );
};

export default TreeCanvas;