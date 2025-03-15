"use client"

import { useState, useRef, useEffect } from "react"
import * as faceapi from "face-api.js"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"
import { getFaceDescriptor, findUserByFaceDescriptor, registerUserWithFace } from "@/lib/face-auth"
import { Loader2, Camera, RefreshCw } from "lucide-react"

// URL model dari CDN
const MODEL_URL = "https://justadudewhohacks.github.io/face-api.js/models"

export default function FaceAuth() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [detections, setDetections] = useState<faceapi.FaceDetection[]>([])
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isComponentMounted, setIsComponentMounted] = useState(false)

  // Fungsi untuk memuat model face-api.js dengan retry
  const loadModelsWithRetry = async (retryCount = 0, maxRetries = 3) => {
    try {
      console.log(`Attempting to load models (attempt ${retryCount + 1}/${maxRetries + 1})...`)
      setLoadingProgress(10)

      // Pastikan model dimuat secara berurutan
      await faceapi.nets.ssdMobilenetv1.load(MODEL_URL)
      console.log("SSD MobileNet model loaded")
      setLoadingProgress(40)

      await faceapi.nets.faceLandmark68Net.load(MODEL_URL)
      console.log("Face Landmark model loaded")
      setLoadingProgress(70)

      await faceapi.nets.faceRecognitionNet.load(MODEL_URL)
      console.log("Face Recognition model loaded")
      setLoadingProgress(100)

      // Verifikasi model benar-benar dimuat
      const isSsdLoaded = faceapi.nets.ssdMobilenetv1.isLoaded
      const isLandmarkLoaded = faceapi.nets.faceLandmark68Net.isLoaded
      const isRecognitionLoaded = faceapi.nets.faceRecognitionNet.isLoaded

      console.log("Model load status:", {
        ssd: isSsdLoaded,
        landmark: isLandmarkLoaded,
        recognition: isRecognitionLoaded,
      })

      if (!isSsdLoaded || !isLandmarkLoaded || !isRecognitionLoaded) {
        throw new Error("Models did not load properly")
      }

      setModelsLoaded(true)
      setIsLoading(false)
      console.log("All models loaded successfully")
    } catch (error) {
      console.error("Error loading face-api models:", error)

      if (retryCount < maxRetries) {
        console.log(`Retrying model load (${retryCount + 1}/${maxRetries})...`)
        // Tunggu sebentar sebelum mencoba lagi
        await new Promise((resolve) => setTimeout(resolve, 2000))
        return loadModelsWithRetry(retryCount + 1, maxRetries)
      }

      toast({
        title: "Error",
        description: "Gagal memuat model pengenalan wajah setelah beberapa percobaan",
        variant: "destructive",
      })
      setIsLoading(false)
      setCameraError("Model pengenalan wajah gagal dimuat. Silakan muat ulang halaman.")
    }
  }

  // Pastikan komponen sudah di-mount sebelum mengakses DOM
  useEffect(() => {
    console.log("Component mounted")
    setIsComponentMounted(true)

    // Muat model
    loadModelsWithRetry()

    return () => {
      console.log("Component unmounting")
      setIsComponentMounted(false)

      // Bersihkan sumber daya saat komponen unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }

      if (detectIntervalRef.current) {
        clearInterval(detectIntervalRef.current)
      }
    }
  }, [toast])

  // Mulai kamera setelah model dimuat dan komponen di-mount
  useEffect(() => {
    if (isComponentMounted && !isLoading && modelsLoaded) {
      console.log("Models loaded and component mounted, starting camera...")
      // Tunggu sebentar untuk memastikan DOM sudah di-render sepenuhnya
      const timer = setTimeout(() => {
        if (isComponentMounted) {
          startCamera()
        }
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [isComponentMounted, isLoading, modelsLoaded])

  // Fungsi untuk memulai kamera - mengadopsi pendekatan dari SimpleCamera
  const startCamera = async () => {
    try {
      setCameraError(null)

      // Periksa apakah videoRef.current ada
      if (!videoRef.current) {
        console.error("Video element reference is null")
        setCameraError("Elemen video tidak tersedia. Silakan muat ulang halaman.")
        return
      }

      // Hentikan stream yang ada jika ada
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }

      // Hentikan interval deteksi jika ada
      if (detectIntervalRef.current) {
        clearInterval(detectIntervalRef.current)
        detectIntervalRef.current = null
      }

      // Reset video element
      if (videoRef.current.srcObject) {
        videoRef.current.srcObject = null
      }

      console.log("Requesting camera access...")

      // Gunakan constraint yang lebih sederhana seperti di SimpleCamera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      })

      console.log("Camera access granted")
      streamRef.current = stream

      // Periksa lagi apakah videoRef.current masih ada
      if (!videoRef.current) {
        console.error("Video element reference became null")
        setCameraError("Elemen video tidak tersedia setelah mendapatkan akses kamera.")
        return
      }

      // Set stream to video element
      videoRef.current.srcObject = stream

      // Ensure video plays
      try {
        await videoRef.current.play()
        console.log("Video playback started")
        setIsCameraReady(true)

        // Start face detection after camera is ready
        setTimeout(() => {
          if (isComponentMounted) {
            detectFaces()
          }
        }, 1000)
      } catch (playError) {
        console.error("Error playing video:", playError)
        setCameraError(`Error playing video: ${playError.message}`)
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      setCameraError(`Tidak dapat mengakses kamera: ${error.message}. Pastikan Anda memberikan izin kamera.`)
    }
  }

  // Fungsi untuk mendeteksi wajah
  const detectFaces = async () => {
    if (!videoRef.current || !canvasRef.current || !modelsLoaded || !isCameraReady) {
      console.log("Cannot detect faces:", {
        videoReady: !!videoRef.current,
        canvasReady: !!canvasRef.current,
        modelsLoaded,
        isCameraReady,
      })
      return
    }

    console.log("Starting face detection")

    const video = videoRef.current
    const canvas = canvasRef.current

    // Use actual video dimensions or fallback to element dimensions
    const displaySize = {
      width: video.videoWidth || video.offsetWidth || 640,
      height: video.videoHeight || video.offsetHeight || 480,
    }
    console.log("Display size:", displaySize)

    // Set canvas dimensions to match video
    canvas.width = displaySize.width
    canvas.height = displaySize.height
    faceapi.matchDimensions(canvas, displaySize)

    // Bersihkan interval yang ada
    if (detectIntervalRef.current) {
      clearInterval(detectIntervalRef.current)
    }

    // Buat interval baru
    detectIntervalRef.current = setInterval(async () => {
      if (!isComponentMounted || !videoRef.current || !canvasRef.current || !videoRef.current.srcObject) {
        console.log("Component unmounted or video not available, stopping detection")
        if (detectIntervalRef.current) {
          clearInterval(detectIntervalRef.current)
        }
        return
      }

      const video = videoRef.current
      const canvas = canvasRef.current

      if (video.paused || video.ended || !modelsLoaded) {
        console.log("Video is paused or ended, stopping detection")
        return
      }

      try {
        // Verifikasi model dimuat sebelum deteksi
        if (!faceapi.nets.ssdMobilenetv1.isLoaded) {
          console.error("SSD MobileNet model is not loaded!")
          return
        }

        // Deteksi wajah
        const detections = await faceapi.detectAllFaces(video)
        console.log("Detections:", detections.length)

        const resizedDetections = faceapi.resizeResults(detections, displaySize)

        canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height)

        setDetections(resizedDetections)

        // Gambar kotak deteksi wajah
        resizedDetections.forEach((detection) => {
          const box = detection.box
          const drawBox = new faceapi.draw.DrawBox(box, {
            boxColor: "var(--primary)",
            lineWidth: 2,
          })
          drawBox.draw(canvas)
        })
      } catch (error) {
        console.error("Error detecting faces:", error)
      }
    }, 100)
  }

  // Fungsi untuk autentikasi wajah
  const authenticateFace = async () => {
    if (!videoRef.current || !modelsLoaded) {
      toast({
        title: "Peringatan",
        description: "Model pengenalan wajah belum dimuat. Silakan tunggu atau muat ulang halaman.",
        variant: "warning",
      })
      return
    }

    if (detections.length === 0) {
      toast({
        title: "Peringatan",
        description: "Tidak ada wajah yang terdeteksi. Pastikan wajah Anda terlihat jelas.",
        variant: "warning",
      })
      return
    }

    try {
      setIsProcessing(true)

      // Verifikasi model dimuat sebelum autentikasi
      if (
        !faceapi.nets.ssdMobilenetv1.isLoaded ||
        !faceapi.nets.faceLandmark68Net.isLoaded ||
        !faceapi.nets.faceRecognitionNet.isLoaded
      ) {
        throw new Error("Model pengenalan wajah belum dimuat sepenuhnya")
      }

      // Dapatkan deskriptor wajah
      const faceDescriptor = await getFaceDescriptor(videoRef.current)

      // Cari pengguna berdasarkan deskriptor wajah
      const user = await findUserByFaceDescriptor(supabase, faceDescriptor)

      if (user) {
        // Pengguna ditemukan, lakukan login
        toast({
          title: "Berhasil",
          description: `Selamat datang kembali, ${user.user.name || "Pengguna"}!`,
        })

        // Simpan ID pengguna di localStorage
        localStorage.setItem("userId", user.user.id)

        // Redirect ke dashboard
        router.push("/dashboard")
      } else {
        // Pengguna tidak ditemukan, lakukan registrasi
        const newUser = await registerUserWithFace(supabase, faceDescriptor)

        toast({
          title: "Berhasil",
          description: "Wajah Anda telah terdaftar. Anda akan diarahkan ke dashboard.",
        })

        // Simpan ID pengguna di localStorage
        localStorage.setItem("userId", newUser.user.id)

        // Redirect ke dashboard
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error authenticating face:", error)
      toast({
        title: "Error",
        description: `Gagal melakukan autentikasi wajah: ${error.message}. Silakan coba lagi.`,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden">
      <CardContent className="p-0">
        <div className="relative bg-muted aspect-video">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
              <span className="text-center">Memuat model pengenalan wajah... ({loadingProgress}%)</span>
              <div className="w-64 h-2 bg-gray-200 rounded-full mt-2">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
            </div>
          ) : cameraError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              <p className="mb-4 text-destructive">{cameraError}</p>
              <Button onClick={() => loadModelsWithRetry()} className="mb-2">
                <RefreshCw className="w-4 h-4 mr-2" />
                Muat Ulang Model
              </Button>
              <Button onClick={startCamera}>
                <Camera className="w-4 h-4 mr-2" />
                Coba Kamera Lagi
              </Button>
            </div>
          ) : !isCameraReady ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Button onClick={startCamera}>
                <Camera className="w-4 h-4 mr-2" />
                Mulai Kamera
              </Button>
            </div>
          ) : (
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ backgroundColor: "#000" }}
              />
              <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col gap-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold">Autentikasi Wajah</h2>
            <p className="text-sm text-muted-foreground">
              Posisikan wajah Anda di tengah kamera untuk login atau registrasi
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={authenticateFace}
              disabled={isLoading || !isCameraReady || isProcessing || detections.length === 0 || !modelsLoaded}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Autentikasi"
              )}
            </Button>

            <Button variant="outline" onClick={startCamera} disabled={isLoading || isProcessing}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          {/* Status model dan kamera */}
          <div className="text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Model:</span>
              {modelsLoaded ? (
                <span className="text-green-500">Dimuat ✓</span>
              ) : (
                <span className="text-red-500">Belum dimuat ✗</span>
              )}
            </div>
            <div className="flex justify-between">
              <span>Kamera:</span>
              {isCameraReady ? (
                <span className="text-green-500">Siap ✓</span>
              ) : (
                <span className="text-red-500">Belum siap ✗</span>
              )}
            </div>
            <div className="flex justify-between">
              <span>Deteksi Wajah:</span>
              {detections.length > 0 ? (
                <span className="text-green-500">Terdeteksi ({detections.length}) ✓</span>
              ) : (
                <span className="text-yellow-500">Tidak terdeteksi ⚠</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

