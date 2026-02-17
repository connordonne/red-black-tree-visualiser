// src/components/TreeCanvas.tsx

import React, { useRef, useState, useLayoutEffect, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3'; 
import { TreeNode, Color } from '@/core/RedBlackTree';
import type { CanvasLabel, SearchFocus } from '@/core/RedBlackTree';
import { useTreeLayout, type RBTHierarchyPointNode, type RBTHierarchyPointLink } from '@/hooks/useTreeLayout';
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize, Minimize2, GitCommitHorizontal } from "lucide-react";
import { cn } from '@/lib/utils';

interface TreeCanvasProps {
    root: TreeNode | null;
    highlightedKeys?: number[];
    colorBlindMode?: boolean;
    showAddresses?: boolean;
    showNils?: boolean;
    toggleNils?: () => void;
    hoveredAddress?: number | null;
    onHoverAddress?: (addr: number | null) => void;
    onResetContainerSize?: () => void;
    showIsomorphic?: boolean;
    canvasLabel?: CanvasLabel; 
    searchFocus?: SearchFocus; 
}

const NODE_RADIUS = 22;

const TreeCanvas: React.FC<TreeCanvasProps> = ({
                                                   root,
                                                   highlightedKeys = [],
                                                   colorBlindMode = false,
                                                   showAddresses = false,
                                                   showNils = false,
                                                   toggleNils,
                                                   hoveredAddress = null,
                                                   onHoverAddress,
                                                   onResetContainerSize,
                                                   showIsomorphic = false,
                                                   canvasLabel,
                                                   searchFocus
                                               }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const gRef = useRef<SVGGElement>(null);
    
    const isViewCentered = useRef(false); 

    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const zoomBehavior = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

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

    const { nodes, links } = useTreeLayout(root, showNils);

    const searchNodePos = useMemo(() => {
        if (!searchFocus) return null;
        
        const rootNode = nodes.find(n => n.parent === null);
        const rootKey = rootNode ? rootNode.data.key : null;

        if (searchFocus.targetNodeKey !== null) {
            const target = nodes.find(n => n.data.key === searchFocus.targetNodeKey);
            if (target) {
                
                if (searchFocus.key === target.data.key) {
                    return { x: target.x, y: target.y };
                }

                let xOffset = 0;
                
                if (rootKey !== null) {
                    if (searchFocus.key < rootKey) {
                        xOffset = -65; 
                    } else {
                        xOffset = 65; 
                    }
                } else {
                    const diff = searchFocus.key - target.data.key;
                    xOffset = diff < 0 ? -65 : 65;
                }

                return { 
                    x: target.x + xOffset, 
                    y: target.y 
                };
            }
        } 
        
        if (nodes.length > 0 && nodes[0].parent === null) {
             return { x: nodes[0].x, y: nodes[0].y - 60 };
        }

        return { x: 0, y: -50 }; 
    }, [searchFocus, nodes]);

    const labelTarget = useMemo(() => {
        if (!canvasLabel) return null;
        return nodes.find(n => n.data.key === canvasLabel.targetNodeKey);
    }, [canvasLabel, nodes]);

    const isomorphicGroups = useMemo(() => {
        if (!showIsomorphic) return [];
        const groups: RBTHierarchyPointNode[][] = [];

        nodes.forEach(node => {
            if (node.data.isDummy) return;

            if (node.data.color === Color.BLACK) {
                const currentGroup = [node];
                
                if (node.children) {
                    node.children.forEach(child => {
                        const childNode = child as RBTHierarchyPointNode;
                        if (childNode.data.color === Color.RED) {
                            currentGroup.push(childNode);
                        }
                    });
                }
                groups.push(currentGroup);
            }
        });
        return groups;
    }, [nodes, showIsomorphic]);

    const getGroupRect = (group: RBTHierarchyPointNode[]) => {
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        group.forEach(n => {
            minX = Math.min(minX, n.x);
            maxX = Math.max(maxX, n.x);
            minY = Math.min(minY, n.y);
            maxY = Math.max(maxY, n.y);
        });
        const padding = 28; 
        return {
            x: minX - padding,
            y: minY - padding,
            width: (maxX - minX) + (padding * 2),
            height: (maxY - minY) + (padding * 2),
            rx: 20 
        };
    };

    const activePath = useMemo(() => {
        if (hoveredAddress === null) return new Set<number>();
        
        const pathSet = new Set<number>();
        const targetNode = nodes.find(n => n.data.address === hoveredAddress);
        
        if (targetNode) {
            let current: RBTHierarchyPointNode | null = targetNode;
            while (current) {
                pathSet.add(current.data.address);
                current = current.parent;
            }
        }
        return pathSet;
    }, [hoveredAddress, nodes]);

    const getOpacity = (nodeAddress: number) => {
        if (hoveredAddress === null) return 1;
        return activePath.has(nodeAddress) ? 1 : 0.15;
    };
    
    const getLinkOpacity = (link: RBTHierarchyPointLink) => {
        if (hoveredAddress === null) return link.target.data.isDummy ? 0.3 : 1; 
        
        const targetInPath = activePath.has(link.target.data.address);
        return targetInPath ? 1 : 0.1;
    }

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

    const zoomToFit = useCallback(() => {
        if (!containerRef.current || !svgRef.current || !zoomBehavior.current || nodes.length === 0) return;
        
        const bounds = getTreeBounds(nodes);
        if (!bounds) return;

        const { width, height } = containerRef.current.getBoundingClientRect();
        if (width === 0 || height === 0) return;
        
        const scaleX = width / bounds.width;
        const scaleY = height / bounds.height;
        let targetScale = Math.min(scaleX, scaleY);
        
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

    useEffect(() => {
        if (!root || !svgRef.current || nodes.length === 0 || dimensions.width === 0) return;

        if (!zoomBehavior.current) return;

        const bounds = getTreeBounds(nodes);
        if (!bounds) return;

        const svg = d3.select(svgRef.current);
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

    useEffect(() => {
        if (!root || !svgRef.current || !gRef.current) return;

        const svg = d3.select(svgRef.current);

        zoomBehavior.current = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .on("zoom", (event) => {
                if (gRef.current) {
                    d3.select(gRef.current).attr("transform", event.transform);
                }
            });

        svg.call(zoomBehavior.current);

        if (!isViewCentered.current) {
            setTimeout(() => zoomToFit(), 0);
        }

    }, [root, zoomToFit]); 

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

    const nodeKey = (d: RBTHierarchyPointNode) => `node-${d.data.key}-${d.data.address}-${d.data.isDummy ? 'dummy' : 'real'}`;
    const linkKey = (d: RBTHierarchyPointLink) => `link-${d.source.data.key}-${d.target.data.key}-${d.target.data.address}`;

    const transition: any = { type: 'spring', stiffness: 300, damping: 30 };
    const toHex = (n: number) => `0x${n.toString(16).toUpperCase().padStart(2, '0')}`;

    
    return (
        <div ref={containerRef} className="h-full w-full relative overflow-hidden bg-dot-pattern group">
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
                
                {toggleNils && (
                    <Button 
                        variant={showNils ? "default" : "secondary"} 
                        size="icon" 
                        className={cn("h-8 w-8 shadow-sm backdrop-blur transition-colors", !showNils && "bg-background/80")}
                        onClick={toggleNils} 
                        title={showNils ? "Hide NIL Nodes" : "Show NIL Nodes (Black Height)"}
                    >
                        <GitCommitHorizontal className="size-4" />
                    </Button>
                )}

                {onResetContainerSize && (
                    <Button variant="secondary" size="icon" className="h-8 w-8 shadow-sm bg-background/80 backdrop-blur" onClick={onResetContainerSize} title="Reset Container Size">
                        <Minimize2 className="size-4" />
                    </Button>
                )}
            </div>

            {root ? (
                <svg 
                    ref={svgRef} 
                    className="w-full h-full cursor-grab active:cursor-grabbing block touch-none"
                    onClick={(e) => e.stopPropagation()}
                >
                    <rect width="100%" height="100%" fill="transparent" />
                    
                    <g ref={gRef}>
                        {/* Isomorphic Group Backgrounds */}
                        <AnimatePresence>
                            {isomorphicGroups.map((group) => {
                                const rect = getGroupRect(group);
                                const key = `group-${group[0].data.key}-${group[0].data.address}`; 
                                return (
                                    <motion.rect
                                        key={key}
                                        initial={{ opacity: 0 }}
                                        animate={{ 
                                            opacity: 1, 
                                            x: rect.x, 
                                            y: rect.y, 
                                            width: rect.width, 
                                            height: rect.height 
                                        }}
                                        exit={{ opacity: 0 }}
                                        transition={transition}
                                        rx={rect.rx}
                                        fill="var(--chart-5)"
                                        fillOpacity={0.15}
                                        stroke="var(--chart-5)"
                                        strokeOpacity={0.4}
                                        strokeWidth={1.5}
                                        strokeDasharray="6 4"
                                        className="pointer-events-none"
                                    />
                                );
                            })}
                        </AnimatePresence>

                        {/* Node Links */}
                        <AnimatePresence>
                            {links.map((link) => (
                                <motion.path
                                    key={linkKey(link)}
                                    initial={{ opacity: 0, pathLength: 0 }}
                                    animate={{
                                        opacity: getLinkOpacity(link),
                                        pathLength: 1,
                                        d: `M${link.source.x},${link.source.y} L${link.target.x},${link.target.y}`
                                    }}
                                    exit={{ opacity: 0 }}
                                    transition={transition}
                                    stroke="var(--foreground)"
                                    strokeWidth={link.target.data.isDummy ? 1 : 2}
                                    strokeDasharray={link.target.data.isDummy ? "4 4" : "none"}
                                    fill="none"
                                />
                            ))}
                        </AnimatePresence>

                        {/* Nodes */}
                        <AnimatePresence>
                            {nodes.map((node) => {
                                const isDummy = node.data.isDummy;
                                const isHighlighted = highlightedKeys.includes(node.data.key);
                                const isHovered = hoveredAddress === node.data.address;
                                const isRed = node.data.color === Color.RED;
                                const opacity = getOpacity(node.data.address);

                                if (isDummy) {
                                    return (
                                        <motion.g
                                            key={nodeKey(node)}
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: opacity, scale: 1, x: node.x, y: node.y }}
                                            exit={{ opacity: 0, scale: 0.5 }}
                                            transition={transition}
                                            className="cursor-help"
                                            onMouseEnter={() => onHoverAddress?.(node.data.address)}
                                            onMouseLeave={() => onHoverAddress?.(null)}
                                        >
                                            <rect
                                                x={-16}
                                                y={-10}
                                                width={32}
                                                height={20}
                                                rx={4}
                                                fill={node.isInvalidBlackHeight ? "var(--destructive)" : "#1e293b"}
                                                className={cn(
                                                    "transition-colors duration-300",
                                                    node.isInvalidBlackHeight && "animate-pulse"
                                                )}
                                                stroke={node.isInvalidBlackHeight ? "var(--destructive)" : "rgba(255, 255, 255, 0.6)"}
                                                strokeWidth={2}
                                            />
                                            <text
                                                textAnchor="middle"
                                                dy=".35em"
                                                className="font-mono text-[10px] font-bold fill-white pointer-events-none"
                                            >
                                                {node.blackDepth}
                                            </text>
                                            <text
                                                textAnchor="middle"
                                                dy="2.2em"
                                                className="font-sans text-[9px] fill-muted-foreground font-medium pointer-events-none"
                                            >
                                                NIL
                                            </text>
                                        </motion.g>
                                    );
                                }

                                return (
                                    <motion.g
                                        key={nodeKey(node)}
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: opacity, scale: 1, x: node.x, y: node.y }}
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
                                            className="drop-shadow-sm transition-all duration-300"
                                            fill={isRed ? 'var(--destructive)' : '#1e293b'}
                                            stroke={isRed ? 'var(--card)' : 'rgba(255, 255, 255, 0.6)'}
                                            strokeWidth={2}
                                            strokeDasharray={colorBlindMode && isRed ? "4 3" : "none"}
                                        />
                                    
                                        <text
                                            textAnchor="middle"
                                            dy=".3em"
                                            className="font-bold text-sm pointer-events-none font-mono"
                                            style={{ fontSize: showAddresses ? '10px' : '12px' }}
                                            fill="#ffffff"
                                        >
                                            {showAddresses ? toHex(node.data.address) : node.data.key}
                                        </text>
                                    </motion.g>
                                );
                            })}
                        </AnimatePresence>

                        {/* SEARCH/INSERT COMPARISON GHOST NODE */}
                        <AnimatePresence>
                            {searchFocus && searchNodePos && (
                                <React.Fragment key="search-visuals">
                                     {/* Render line if we have a target and it's not a direct overlap */}
                                    {(() => {
                                        if (searchFocus.targetNodeKey !== null) {
                                            const target = nodes.find(n => n.data.key === searchFocus.targetNodeKey);
                                            if (target && searchFocus.key !== target.data.key) {
                                                const ghostRadius = NODE_RADIUS - 2; 
                                                const targetRadius = NODE_RADIUS; 
                                                
                                                const dx = target.x - searchNodePos.x;
                                                const dy = target.y - searchNodePos.y;
                                                const distance = Math.sqrt(dx * dx + dy * dy);
                                                
                                                let newX1 = searchNodePos.x;
                                                let newY1 = searchNodePos.y;
                                                let newX2 = target.x;
                                                let newY2 = target.y;
                                                
                                                if (distance > 0) {
                                                     newX1 += (dx / distance) * ghostRadius;
                                                     newY1 += (dy / distance) * ghostRadius;

                                                     newX2 -= (dx / distance) * targetRadius;
                                                     newY2 -= (dy / distance) * targetRadius;
                                                }

                                                return (
                                                    <motion.line
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        x1={newX1}
                                                        y1={newY1}
                                                        x2={newX2}
                                                        y2={newY2}
                                                        stroke="var(--primary)"
                                                        strokeWidth={2}
                                                        strokeDasharray="4 4"
                                                        strokeOpacity={0.5}
                                                    />
                                                );
                                            }
                                        }
                                        return null;
                                    })()}

                                    <motion.g
                                        key="search-ghost-node"
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1, x: searchNodePos.x, y: searchNodePos.y }}
                                        exit={{ opacity: 0, scale: 0 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                    >
                                        <circle 
                                            r={NODE_RADIUS - 2} 
                                            fill="var(--background)" 
                                            stroke="var(--primary)" 
                                            strokeWidth={2} 
                                            strokeDasharray="3 3"
                                        />
                                        <text 
                                            textAnchor="middle" 
                                            dy=".3em" 
                                            className="font-bold text-xs font-mono fill-foreground"
                                        >
                                            {searchFocus.key}
                                        </text>
                                        
                                        {/* Text Background Pill for readability over links */}
                                        <motion.rect
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            x={-30}
                                            y={-NODE_RADIUS - 20}
                                            width={60}
                                            height={14}
                                            rx={7}
                                            fill="var(--background)"
                                            className="stroke-none"
                                        />

                                        <motion.text 
                                            textAnchor="middle" 
                                            y={-NODE_RADIUS - 10} 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-[10px] fill-primary font-bold uppercase tracking-widest pointer-events-none"
                                        >
                                            Compare
                                        </motion.text>
                                    </motion.g>
                                </React.Fragment>
                            )}
                        </AnimatePresence>

                        {/* Floating Canvas Labels */}
                        <AnimatePresence>
                            {labelTarget && canvasLabel && (
                                <motion.g
                                    key={`label-${canvasLabel.targetNodeKey}-${canvasLabel.text}`}
                                    initial={{ opacity: 0, y: -5, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                    transform={`translate(${labelTarget.x}, ${labelTarget.y - 85})`}
                                    className="pointer-events-none"
                                >
                                    <foreignObject x="-60" y="-15" width="120" height="40" overflow="visible">
                                        <div className={cn(
                                            "flex items-center justify-center px-3 py-1.5 rounded-full shadow-lg border text-xs font-bold whitespace-nowrap w-fit mx-auto",
                                            canvasLabel.type === 'warning' ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/80 dark:text-amber-100" :
                                            canvasLabel.type === 'rotation' ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/80 dark:text-blue-100" :
                                            "bg-background text-foreground border-border"
                                        )}>
                                            {canvasLabel.text}
                                        </div>
                                    </foreignObject>
                                </motion.g>
                            )}
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