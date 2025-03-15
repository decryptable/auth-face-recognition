"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false)

  // Pastikan tema hanya diterapkan setelah komponen di-mount
  // untuk menghindari perbedaan antara server dan client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Pastikan class 'dark' diterapkan jika tema adalah 'dark'
  useEffect(() => {
    if (mounted) {
      const isDark =
        localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)

      if (isDark) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }
  }, [mounted])

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

