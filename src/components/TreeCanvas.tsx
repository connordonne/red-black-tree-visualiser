// src/components/TreeCanvas.tsx
import React, { useRef, useState, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TreeNode, Color } from '@/core/RedBlackTree';
import { useTreeLayout, type RBTHierarchyPointNode, type RBTHierarchyPointLink } from '@/hooks/useTreeLayout';

interface TreeCanvasProps {
    root: TreeNode | null;
    highlightedKeys?: number[];
}

const NODE_RADIUS = 20;
const VERTICAL_MARGIN = 50;

const TreeCanvas: React.FC<TreeCanvasProps> = ({ root, highlightedKeys = [] }) => {
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
        updateSize();

        return () => resizeObserver.disconnect();
    }, []);

    const { nodes, links } = useTreeLayout(
        root,
        dimensions.width,
        dimensions.height - (VERTICAL_MARGIN * 2)
    );

    const nodeKey = (d: RBTHierarchyPointNode) => `node-${d.data.key}`;
    const linkKey = (d: RBTHierarchyPointLink) => `link-${d.source.data.key}-${d.target.data.key}`;

    const transition = { type: 'spring', stiffness: 300, damping: 30 };

    return (
        <div ref={containerRef} className="h-full w-full relative overflow-hidden">
            {root ? (
                <svg width={dimensions.width} height={dimensions.height} className="overflow-visible block">
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
                                    strokeOpacity={0.5}
                                    fill="none"
                                />
                            ))}
                        </AnimatePresence>

                        {/* Nodes Layer */}
                        <AnimatePresence>
                            {nodes.map((node) => {
                                const isHighlighted = highlightedKeys.includes(node.data.key);
                                return (
                                    <motion.g
                                        key={nodeKey(node)}
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.5 }}
                                        transition={transition}
                                    >
                                        {/* Highlight Ring */}
                                        {isHighlighted && (
                                            <motion.circle
                                                cx={node.x}
                                                cy={node.y}
                                                r={NODE_RADIUS + 6}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1, opacity: [0.5, 1, 0.5] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                                fill="none"
                                                stroke="var(--chart-4)" // Yellow/Gold
                                                strokeWidth={3}
                                            />
                                        )}

                                        <motion.circle
                                            r={NODE_RADIUS}
                                            animate={{ cx: node.x, cy: node.y }}
                                            transition={transition}
                                            fill={node.data.color === Color.RED ? 'var(--destructive)' : 'var(--foreground)'}
                                            stroke="var(--primary)"
                                            strokeWidth={2}
                                            className="drop-shadow-sm"
                                        />
                                        <motion.text
                                            textAnchor="middle"
                                            dy=".3em"
                                            animate={{ x: node.x, y: node.y }}
                                            transition={transition}
                                            fill={node.data.color === Color.RED ? 'var(--destructive-foreground)' : 'var(--background)'}
                                            className="font-bold text-sm select-none pointer-events-none"
                                            style={{ fontSize: '12px' }}
                                        >
                                            {node.data.key}
                                        </motion.text>
                                    </motion.g>
                                );
                            })}
                        </AnimatePresence>
                    </g>
                </svg>
            ) : (
                <div className="flex h-full w-full items-center justify-center">
                    <p className="text-muted-foreground animate-pulse">Tree is empty. Insert a node to begin.</p>
                </div>
            )}
        </div>
    );
};

export default TreeCanvas;