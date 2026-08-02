import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { functionalStorageAllowed } from "@/lib/privacy-preferences"

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
    if (!functionalStorageAllowed()) window.localStorage.removeItem("theme")
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
    >
      {resolvedTheme === "dark" ? <Sun /> : <Moon />}
    </Button>
  )
}

export { ThemeToggle }
