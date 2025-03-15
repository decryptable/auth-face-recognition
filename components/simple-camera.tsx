"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, RefreshCw } from "lucide-react"

export default function SimpleCamera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isComponentMounted, setIsComponentMounted] = useState(false)

  // Pastikan komponen sudah di-mount sebelum mengakses DOM
  useEffect(() => {
    setIsComponentMounted(true)

    return () => {
      setIsComponentMounted(false)
      // Cleanup stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  // Mulai kamera setelah komponen di-mount
  useEffect(() => {
    if (isComponentMounted) {
      // Tunggu sebentar untuk memastikan DOM sudah di-render sepenuhnya
      const timer = setTimeout(() => {
        if (isComponentMounted) {
          startCamera()
        }
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [isComponentMounted])

  const startCamera = async () => {
    try {
      setError(null)

      // Periksa apakah videoRef.current ada
      if (!videoRef.current) {
        console.error("Video element reference is null in SimpleCamera")
        setError("Elemen video tidak tersedia. Silakan muat ulang halaman.")
        return
      }

      // Stop any existing stream
      if (videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
        videoRef.current.srcObject = null
      }

      console.log("SimpleCamera: Requesting camera access...")

      // Get new stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      })

      console.log("SimpleCamera: Camera access granted")

      if (videoRef.current) {
        videoRef.current.srcObject = stream

        // Ensure video plays
        try {
          await videoRef.current.play()
          console.log("SimpleCamera: Video playback started")
          setIsStreaming(true)
        } catch (playError) {
          console.error("SimpleCamera: Error playing video:", playError)
          setError(`Error playing video: ${playError.message}`)
        }
      } else {
        console.error("SimpleCamera: Video element reference became null")
        setError("Elemen video tidak tersedia setelah mendapatkan akses kamera.")
      }
    } catch (err) {
      console.error("SimpleCamera: Error accessing camera:", err)
      setError(`Tidak dapat mengakses kamera: ${err.message}`)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-4">
      <CardHeader>
        <CardTitle>Tes Kamera Sederhana</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative bg-muted aspect-video overflow-hidden rounded-md">
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              <p className="mb-4 text-red-500">{error}</p>
              <Button onClick={startCamera}>
                <Camera className="w-4 h-4 mr-2" />
                Coba Lagi
              </Button>
            </div>
          ) : !isComponentMounted ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <p>Mempersiapkan kamera...</p>
            </div>
          ) : (
            <div className="w-full h-full">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ backgroundColor: "#000" }}
              />
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm">
            Status:{" "}
            {isStreaming ? (
              <span className="text-green-500">Aktif</span>
            ) : (
              <span className="text-red-500">Tidak Aktif</span>
            )}
          </div>
          <Button onClick={startCamera} size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Muat Ulang
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

