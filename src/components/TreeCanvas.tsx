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

    const spring = { type: 'spring', stiffness: 300, damping: 25 };

    return (
        <div ref={containerRef} className="h-full w-full">
            {tree.root ? (
                <svg width={dimensions.width} height={dimensions.height} className="overflow-visible">
                    <g transform={`translate(0, ${VERTICAL_MARGIN})`}>
                        <AnimatePresence>
                            {links.map((link) => (
                                <motion.line
                                    key={linkKey(link)}
                                    initial={{ opacity: 0 }}
                                    animate={{
                                        opacity: 1,
                                        x1: link.source.x,
                                        y1: link.source.y,
                                        x2: link.target.x,
                                        y2: link.target.y,
                                    }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    stroke="var(--muted-foreground)" // FIXED
                                    strokeWidth={2}
                                />
                            ))}
                        </AnimatePresence>
                        <AnimatePresence>
                            {nodes.map((node) => (
                                <motion.g
                                    key={nodeKey(node)}
                                    // The group now only handles initial/exit opacity
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <motion.circle
                                        r={NODE_RADIUS}
                                        initial={{ cx: node.x, cy: node.y, scale: 0 }}
                                        animate={{ cx: node.x, cy: node.y, scale: 1 }}
                                        exit={{ scale: 0 }}
                                        transition={spring}
                                        fill={node.data.color === Color.RED ? 'var(--destructive)' : 'var(--foreground)'} // FIXED
                                        stroke="var(--primary)" // FIXED
                                        strokeWidth={2}
                                    />
                                    <motion.text
                                        textAnchor="middle"
                                        dy=".3em"
                                        initial={{ x: node.x, y: node.y, opacity: 0 }}
                                        animate={{ x: node.x, y: node.y, opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        fill={node.data.color === Color.RED ? 'var(--destructive-foreground)' : 'var(--background)'} // FIXED
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