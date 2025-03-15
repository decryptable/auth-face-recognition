"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Pastikan komponen sudah di-mount sebelum mengakses tema
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fungsi untuk toggle tema
  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light")
      // Pastikan class 'dark' dihapus dari <html>
      document.documentElement.classList.remove("dark")
    } else {
      setTheme("dark")
      // Pastikan class 'dark' ditambahkan ke <html>
      document.documentElement.classList.add("dark")
    }
  }

  // Jika komponen belum di-mount, tampilkan placeholder
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Sun className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
}

