// src/components/HealthBar.tsx

import { cn } from "@/lib/utils";
import { Activity, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import type { TreeHealth } from "@/core/RedBlackTree";

interface HealthBarProps {
    health: TreeHealth;
    className?: string;
}

export function HealthBar({ health, className }: HealthBarProps) {
    const { status, score, message } = health;

    const getStatusColor = () => {
        switch (status) {
            case 'healthy': return "text-green-600 dark:text-green-400";
            case 'warning': return "text-yellow-600 dark:text-yellow-400";
            case 'critical': return "text-red-600 dark:text-red-400";
            default: return "bg-slate-500 text-slate-600";
        }
    };

    const getBarColor = () => {
        switch (status) {
            case 'healthy': return "bg-green-500";
            case 'warning': return "bg-yellow-500";
            case 'critical': return "bg-red-500";
            default: return "bg-slate-500";
        }
    };

    const getIcon = () => {
        switch (status) {
            case 'healthy': return <CheckCircle className="size-4" />;
            case 'warning': return <AlertTriangle className="size-4" />;
            case 'critical': return <XCircle className="size-4" />;
            default: return <Activity className="size-4" />;
        }
    };

    return (
        <div className={cn("w-full flex flex-col gap-1.5 p-2 rounded-lg bg-muted/40 border transition-colors duration-500", 
            status === 'critical' ? "border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/10" :
            status === 'warning' ? "border-yellow-200 dark:border-yellow-900/50 bg-yellow-50/50 dark:bg-yellow-950/10" :
            "border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-950/10",
            className
        )}>
            <div className="flex items-center justify-between text-xs font-semibold">
                <div className={cn("flex items-center gap-1.5 transition-colors duration-300", getStatusColor())}>
                    {getIcon()}
                    <span className="uppercase tracking-wide">Tree Health: {score}%</span>
                </div>
                <span className={cn("text-[10px] font-medium transition-opacity duration-300", 
                    status === 'healthy' ? "text-muted-foreground" : "text-foreground font-bold"
                )}>
                    {message}
                </span>
            </div>
            
            <div className="h-1.5 w-full bg-background/50 rounded-full overflow-hidden shadow-inner border border-black/5 dark:border-white/5">
                <div 
                    className={cn("h-full transition-all duration-700 ease-out rounded-full shadow-sm", getBarColor())}
                    style={{ width: `${score}%` }}
                />
            </div>
        </div>
    );
}