// src/components/DarkModeToggle.tsx

import * as React from "react"
import { Moon, Sun } from "lucide-react"

import { useTheme } from "@/components/ThemeProvider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function DarkModeToggle() {
    const { theme, setTheme } = useTheme()

    // We need to manage a local state for the switch's visual state that resolves "system"
    const [isDarkMode, setIsDarkMode] = React.useState(() => {
        if (theme !== "system") {
            return theme === "dark"
        }
        return window.matchMedia("(prefers-color-scheme: dark)").matches
    })

    // Update the local state if the theme prop changes from outside,
    // or when the system preference changes.
    React.useEffect(() => {
        const isCurrentlyDark = theme === "dark" ||
            (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
        setIsDarkMode(isCurrentlyDark);

        if (theme === "system") {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
            mediaQuery.addEventListener("change", handleChange);
            return () => mediaQuery.removeEventListener("change", handleChange);
        }
    }, [theme])


    const handleCheckedChange = (checked: boolean) => {
        setTheme(checked ? "dark" : "light")
    }

    return (
        <div className="flex items-center gap-2">
            <Sun className="size-5 text-muted-foreground" />
            <Label htmlFor="dark-mode-toggle" className="sr-only">
                Toggle dark mode
            </Label>
            <Switch
                id="dark-mode-toggle"
                checked={isDarkMode}
                onCheckedChange={handleCheckedChange}
                aria-label="Toggle dark mode"
            />
            <Moon className="size-5 text-muted-foreground" />
        </div>
    )
}