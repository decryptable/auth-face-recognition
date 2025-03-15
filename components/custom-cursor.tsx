"use client"

import { useEffect, useState } from "react"
import { useMobile } from "@/hooks/use-mobile"

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [hidden, setHidden] = useState(true)
  const [clicked, setClicked] = useState(false)
  const isMobile = useMobile()

  useEffect(() => {
    if (isMobile) return

    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
      setHidden(false)
    }

    const handleMouseDown = () => setClicked(true)
    const handleMouseUp = () => setClicked(false)
    const handleMouseLeave = () => setHidden(true)
    const handleMouseEnter = () => setHidden(false)

    document.addEventListener("mousemove", updatePosition)
    document.addEventListener("mousedown", handleMouseDown)
    document.addEventListener("mouseup", handleMouseUp)
    document.addEventListener("mouseleave", handleMouseLeave)
    document.addEventListener("mouseenter", handleMouseEnter)

    // Tambahkan variabel CSS untuk warna primer
    const root = document.documentElement
    const primaryColor = getComputedStyle(root).getPropertyValue("--primary").trim()
    const primaryRgb = hexToRgb(hslToHex(primaryColor))
    if (primaryRgb) {
      root.style.setProperty("--primary-rgb", `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`)
    }

    return () => {
      document.removeEventListener("mousemove", updatePosition)
      document.removeEventListener("mousedown", handleMouseDown)
      document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("mouseleave", handleMouseLeave)
      document.removeEventListener("mouseenter", handleMouseEnter)
    }
  }, [isMobile])

  if (isMobile) return null

  return (
    <>
      <div
        className="cursor-dot"
        style={{
          opacity: hidden ? 0 : 1,
          transform: `translate(${position.x}px, ${position.y}px) scale(${clicked ? 1.5 : 1})`,
          transition: "transform 0.1s ease-out, opacity 0.2s ease-out",
        }}
      />
      <div
        className="cursor-outline"
        style={{
          opacity: hidden ? 0 : 0.5,
          transform: `translate(${position.x}px, ${position.y}px) scale(${clicked ? 0.8 : 1})`,
          transition: "transform 0.3s ease-out, opacity 0.2s ease-out",
        }}
      />
    </>
  )
}

// Fungsi untuk mengkonversi HSL ke HEX
function hslToHex(hsl: string) {
  // Ekstrak nilai HSL
  const match = hsl.match(/(\d+\.?\d*)/g)
  if (!match || match.length < 3) return "#3b82f6" // Default blue jika format tidak valid

  const h = Number.parseFloat(match[0])
  const s = Number.parseFloat(match[1]) / 100
  const l = Number.parseFloat(match[2]) / 100

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2

  let r, g, b

  if (h >= 0 && h < 60) {
    ;[r, g, b] = [c, x, 0]
  } else if (h >= 60 && h < 120) {
    ;[r, g, b] = [x, c, 0]
  } else if (h >= 120 && h < 180) {
    ;[r, g, b] = [0, c, x]
  } else if (h >= 180 && h < 240) {
    ;[r, g, b] = [0, x, c]
  } else if (h >= 240 && h < 300) {
    ;[r, g, b] = [x, 0, c]
  } else {
    ;[r, g, b] = [c, 0, x]
  }

  const toHex = (value: number) => {
    const hex = Math.round((value + m) * 255).toString(16)
    return hex.length === 1 ? "0" + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

// Fungsi untuk mengkonversi HEX ke RGB
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : null
}

