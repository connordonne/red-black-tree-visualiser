// src/components/ui/animated-tabs.tsx

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

// Create a context to share the animation trigger function and the list ref
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

    // This effect runs once on mount to set the initial indicator position accurately.
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
    }, []); // Empty dependency array ensures this runs only once on mount

    const childCount = React.Children.count(children);

    return (
        <TabsContext.Provider value={{ setIndicatorStyle, listRef }}>
            <TabsPrimitive.List
                ref={listRef} // Attach ref here for measurements
                className={cn(
                    "relative flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground w-full",
                    className
                )}
                {...props}
            >
                {/* The sliding indicator */}
                <motion.div
                    layout
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    className="absolute left-0 h-[calc(100%-0.5rem)] rounded-md bg-background shadow"
                    style={indicatorStyle}
                />
                {/* The container for the tabs now handles the grid layout */}
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
                "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground",
                className
            )}
            onClick={(e) => {
                // Trigger the original onClick if it exists from the parent component
                onClick?.(e);

                // Instantly and accurately update the indicator style on click
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