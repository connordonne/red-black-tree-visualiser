// src/components/TreeCanvas.tsx
import React, { useRef, useState, useLayoutEffect, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3'; 
import { TreeNode, Color } from '@/core/RedBlackTree';
import { useTreeLayout, type RBTHierarchyPointNode, type RBTHierarchyPointLink } from '@/hooks/useTreeLayout';
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";

interface TreeCanvasProps {
    root: TreeNode | null;
    highlightedKeys?: number[];
    colorBlindMode?: boolean;
    showAddresses?: boolean;
    hoveredAddress?: number | null;
    onHoverAddress?: (addr: number | null) => void;
}

const NODE_RADIUS = 22;

const TreeCanvas: React.FC<TreeCanvasProps> = ({
                                                   root,
                                                   highlightedKeys = [],
                                                   colorBlindMode = false,
                                                   showAddresses = false,
                                                   hoveredAddress = null,
                                                   onHoverAddress
                                               }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const gRef = useRef<SVGGElement>(null);
    
    // Track if we have performed the initial centering for this tree instance
    const isViewCentered = useRef(false); 

    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const zoomBehavior = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

    // 1. Handle Resize Observer
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

    const { nodes, links } = useTreeLayout(root);

    // 2. Helper to calculate the bounding box of the tree
    const getTreeBounds = useCallback((nodes: RBTHierarchyPointNode[], padding = 40) => {
        if (nodes.length === 0) return null;
        
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        
        nodes.forEach(d => {
            if (d.x < minX) minX = d.x;
            if (d.x > maxX) maxX = d.x;
            if (d.y < minY) minY = d.y;
            if (d.y > maxY) maxY = d.y;
        });
        
        return {
            x: minX - NODE_RADIUS - padding,
            y: minY - NODE_RADIUS - padding,
            width: (maxX - minX) + (NODE_RADIUS * 2) + (padding * 2),
            height: (maxY - minY) + (NODE_RADIUS * 2) + (padding * 2),
            centerX: (minX + maxX) / 2,
            centerY: (minY + maxY) / 2
        };
    }, []);

    // 3. Smart Zoom-to-Fit Logic
    const zoomToFit = useCallback(() => {
        if (!containerRef.current || !svgRef.current || !zoomBehavior.current || nodes.length === 0) return;
        
        const bounds = getTreeBounds(nodes);
        if (!bounds) return;

        const { width, height } = containerRef.current.getBoundingClientRect();
        if (width === 0 || height === 0) return;
        
        const scaleX = width / bounds.width;
        const scaleY = height / bounds.height;
        let targetScale = Math.min(scaleX, scaleY);
        
        // Limit zoom out/in
        targetScale = Math.min(targetScale, 1.2); 

        const targetX = (width / 2) - (bounds.centerX * targetScale);
        const targetY = (height / 2) - (bounds.centerY * targetScale); 

        const newTransform = d3.zoomIdentity
            .translate(targetX, targetY)
            .scale(targetScale);

        d3.select(svgRef.current)
            .transition()
            .duration(750)
            .call(zoomBehavior.current.transform, newTransform);

        isViewCentered.current = true;
    }, [nodes, getTreeBounds]);

    // 4. Auto-Fit Effect: Runs whenever tree shape or window size changes
    useEffect(() => {
        if (!root || !svgRef.current || nodes.length === 0 || dimensions.width === 0) return;

        // If zoom hasn't been initialized yet, skip
        if (!zoomBehavior.current) return;

        const bounds = getTreeBounds(nodes);
        if (!bounds) return;

        const svg = d3.select(svgRef.current);
        // Safety check if D3 selection is valid
        if (svg.empty()) return;

        const currentTransform = d3.zoomTransform(svg.node()!);

        const screenLeft = currentTransform.applyX(bounds.x);
        const screenRight = currentTransform.applyX(bounds.x + bounds.width);
        const screenTop = currentTransform.applyY(bounds.y);
        const screenBottom = currentTransform.applyY(bounds.y + bounds.height);

        const isOutOfBounds = 
            screenLeft < 0 || 
            screenRight > dimensions.width || 
            screenTop < 0 || 
            screenBottom > dimensions.height;

        if (!isViewCentered.current || isOutOfBounds) {
             zoomToFit();
        }

    }, [nodes, dimensions, root, getTreeBounds, zoomToFit]);

    // 5. Initialize Zoom - FIX: Added [root] dependency
    useEffect(() => {
        if (!root || !svgRef.current || !gRef.current) return;

        const svg = d3.select(svgRef.current);
        const g = d3.select(gRef.current);

        zoomBehavior.current = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .on("zoom", (event) => {
                if (gRef.current) {
                    d3.select(gRef.current).attr("transform", event.transform);
                }
            });

        svg.call(zoomBehavior.current);

        // If this is the first render of the SVG (root became non-null), fit view immediately
        if (!isViewCentered.current) {
            // We need a slight delay to ensure layout is calculated
            setTimeout(() => zoomToFit(), 0);
        }

    }, [root, zoomToFit]); 

    // Reset centered flag when clearing tree
    useEffect(() => {
        if (!root) {
            isViewCentered.current = false;
        }
    }, [root]);

    const handleZoomIn = () => {
        if (!svgRef.current || !zoomBehavior.current) return;
        d3.select(svgRef.current).transition().call(zoomBehavior.current.scaleBy, 1.2);
    };

    const handleZoomOut = () => {
        if (!svgRef.current || !zoomBehavior.current) return;
        d3.select(svgRef.current).transition().call(zoomBehavior.current.scaleBy, 0.8);
    };

    const nodeKey = (d: RBTHierarchyPointNode) => `node-${d.data.key}-${d.data.address}`;
    const linkKey = (d: RBTHierarchyPointLink) => `link-${d.source.data.key}-${d.target.data.key}`;

    const transition = { type: 'spring', stiffness: 300, damping: 30 };
    const toHex = (n: number) => `0x${n.toString(16).toUpperCase().padStart(2, '0')}`;

    return (
        <div ref={containerRef} className="h-full w-full relative overflow-hidden bg-dot-pattern group">
            {/* Floating Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                 <Button variant="secondary" size="icon" className="h-8 w-8 shadow-sm bg-background/80 backdrop-blur" onClick={handleZoomIn} title="Zoom In">
                    <ZoomIn className="size-4" />
                </Button>
                <Button variant="secondary" size="icon" className="h-8 w-8 shadow-sm bg-background/80 backdrop-blur" onClick={handleZoomOut} title="Zoom Out">
                    <ZoomOut className="size-4" />
                </Button>
                <Button variant="secondary" size="icon" className="h-8 w-8 shadow-sm bg-background/80 backdrop-blur" onClick={zoomToFit} title="Fit to View">
                    <Maximize className="size-4" />
                </Button>
            </div>

            {root ? (
                <svg 
                    ref={svgRef} 
                    className="w-full h-full cursor-grab active:cursor-grabbing block touch-none"
                    onClick={(e) => e.stopPropagation()}
                >
                    <rect width="100%" height="100%" fill="transparent" />
                    
                    <g ref={gRef}>
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
                                    strokeOpacity={0.4}
                                    fill="none"
                                />
                            ))}
                        </AnimatePresence>

                        <AnimatePresence>
                            {nodes.map((node) => {
                                const isHighlighted = highlightedKeys.includes(node.data.key);
                                const isHovered = hoveredAddress === node.data.address;
                                const isRed = node.data.color === Color.RED;

                                return (
                                    <motion.g
                                        key={nodeKey(node)}
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1, x: node.x, y: node.y }}
                                        exit={{ opacity: 0, scale: 0.5 }}
                                        transition={transition}
                                        onMouseEnter={() => onHoverAddress?.(node.data.address)}
                                        onMouseLeave={() => onHoverAddress?.(null)}
                                        className="cursor-pointer"
                                    >
                                        {isHighlighted && (
                                            <motion.circle
                                                r={NODE_RADIUS + 6}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1, opacity: [0.5, 1, 0.5] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                                fill="none"
                                                stroke="var(--chart-4)"
                                                strokeWidth={3}
                                            />
                                        )}
                                        {isHovered && (
                                            <motion.circle
                                                r={NODE_RADIUS + 4}
                                                fill="none"
                                                stroke="var(--primary)"
                                                strokeWidth={2}
                                                strokeDasharray="4 4"
                                            />
                                        )}
                                        <circle
                                            r={NODE_RADIUS}
                                            fill={isRed ? 'var(--destructive)' : 'var(--foreground)'}
                                            stroke="var(--background)"
                                            strokeWidth={colorBlindMode ? 3 : 2}
                                            strokeDasharray={colorBlindMode && isRed ? "4 3" : "none"}
                                            className="drop-shadow-sm"
                                        />
                                        <text
                                            textAnchor="middle"
                                            dy=".3em"
                                            fill={isRed ? 'var(--destructive-foreground)' : 'var(--background)'}
                                            className="font-bold text-sm pointer-events-none font-mono"
                                            style={{ fontSize: showAddresses ? '10px' : '12px' }}
                                        >
                                            {showAddresses ? toHex(node.data.address) : node.data.key}
                                        </text>
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