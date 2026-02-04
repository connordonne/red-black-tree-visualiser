// src/components/ui/animated-tabs.tsx

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

const TabsContext = React.createContext<{
    setIndicatorStyle: (style: { left: number; width: number }) => void;
    listRef: React.RefObject<HTMLDivElement | null>;
}>({
    setIndicatorStyle: () => {},
    listRef: { current: null },
});

const AnimatedTabs = TabsPrimitive.Root

const AnimatedTabsList = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, children, ...props }, ref) => {
    const [indicatorStyle, setIndicatorStyle] = React.useState({ left: 0, width: 0 });
    const listRef = React.useRef<HTMLDivElement>(null);

    React.useLayoutEffect(() => {
        const listElement = listRef.current;
        const activeTab = listElement?.querySelector<HTMLButtonElement>('[data-state="active"]');

        if (listElement && activeTab) {
            const listRect = listElement.getBoundingClientRect();
            const tabRect = activeTab.getBoundingClientRect();

            setIndicatorStyle({
                left: tabRect.left - listRect.left,
                width: tabRect.width,
            });
        }
    }, []);

    const childCount = React.Children.count(children);

    return (
        <TabsContext.Provider value={{ setIndicatorStyle, listRef }}>
            <TabsPrimitive.List
                ref={listRef}
                className={cn(
                    // Base Layout
                    "relative flex h-9 items-center justify-center rounded-lg p-1 text-muted-foreground w-full",
                    
                    // --- UPDATED CONTAINER STYLES ---
                    // Background: Solid distinct grey/black
                    "bg-slate-100 dark:bg-slate-950",
                    
                    // Depth: Inner shadow makes it look like a "slot"
                    "shadow-inner",
                    
                    // The Pop: A distinct ring around the outside of the container
                    "ring-1 ring-slate-300/50 dark:ring-slate-700",
                    
                    className
                )}
                {...props}
            >
                {/* The sliding indicator (Kept the style you liked) */}
                <motion.div
                    layout
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className={cn(
                        "absolute left-0 top-1 bottom-1 rounded-md z-0",
                        "bg-white dark:bg-slate-800",
                        "shadow-[0_2px_10px_rgba(0,0,0,0.1)]",
                        "ring-1 ring-primary/30 dark:ring-primary/50",
                        "border border-slate-200 dark:border-slate-700"
                    )}
                    style={{ 
                        left: indicatorStyle.left, 
                        width: indicatorStyle.width,
                        height: 'calc(100% - 8px)',
                        top: '4px'
                    }}
                />
                
                <div
                    className="relative z-10 grid w-full items-center justify-items-center"
                    style={{ gridTemplateColumns: `repeat(${childCount}, minmax(0, 1fr))` }}
                >
                    {children}
                </div>
            </TabsPrimitive.List>
        </TabsContext.Provider>
    );
});
AnimatedTabsList.displayName = TabsPrimitive.List.displayName

const AnimatedTabsTrigger = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, onClick, ...props }, ref) => {
    const { setIndicatorStyle, listRef } = React.useContext(TabsContext);

    return (
        <TabsPrimitive.Trigger
            ref={ref}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                "text-slate-500 dark:text-slate-400",
                // Kept the text pop you liked
                "data-[state=active]:text-primary dark:data-[state=active]:text-white data-[state=active]:font-bold",
                className
            )}
            onClick={(e) => {
                onClick?.(e);
                const listElement = listRef.current;
                if (listElement) {
                    const listRect = listElement.getBoundingClientRect();
                    const tabRect = e.currentTarget.getBoundingClientRect();

                    setIndicatorStyle({
                        left: tabRect.left - listRect.left,
                        width: tabRect.width,
                    });
                }
            }}
            {...props}
        />
    );
});
AnimatedTabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const AnimatedTabsContent = TabsPrimitive.Content;
AnimatedTabsContent.displayName = TabsPrimitive.Content.displayName;

export { AnimatedTabs, AnimatedTabsList, AnimatedTabsTrigger, AnimatedTabsContent }