"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"

export default function ParticlesBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const particleCount = 30
    const particles: HTMLDivElement[] = []

    // Bersihkan partikel yang ada
    container.innerHTML = ""

    // Buat partikel baru
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div")
      particle.className = "particle"

      // Ukuran acak
      const size = Math.random() * 100 + 50
      particle.style.width = `${size}px`
      particle.style.height = `${size}px`

      // Posisi acak
      const x = Math.random() * 100
      const y = Math.random() * 100
      particle.style.left = `${x}%`
      particle.style.top = `${y}%`

      // Animasi
      particle.style.animation = `
        moveX ${Math.random() * 100 + 50}s linear infinite alternate,
        moveY ${Math.random() * 100 + 50}s linear infinite alternate,
        pulse ${Math.random() * 10 + 5}s ease-in-out infinite alternate
      `

      container.appendChild(particle)
      particles.push(particle)
    }

    // Tambahkan keyframes untuk animasi
    const style = document.createElement("style")
    style.innerHTML = `
      @keyframes moveX {
        0% { transform: translateX(-50px); }
        100% { transform: translateX(50px); }
      }
      
      @keyframes moveY {
        0% { transform: translateY(-50px); }
        100% { transform: translateY(50px); }
      }
      
      @keyframes pulse {
        0% { opacity: 0.2; }
        100% { opacity: 0.8; }
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [theme])

  return <div ref={containerRef} className="particles-container" />
}

