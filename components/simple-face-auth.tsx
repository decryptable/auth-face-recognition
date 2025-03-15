"use client"

import { useState, useRef, useEffect } from "react"
import * as faceapi from "face-api.js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"
import { getFaceDescriptor, findUserByFaceDescriptor, registerUserWithFace } from "@/lib/face-auth"
import { Loader2, Camera, RefreshCw } from "lucide-react"

// URL model dari CDN
const MODEL_URL = "https://justadudewhohacks.github.io/face-api.js/models"

export default function SimpleFaceAuth() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const detectionRef = useRef<number | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [detections, setDetections] = useState<faceapi.FaceDetection[]>([])
  const [loadingProgress, setLoadingProgress] = useState(0)

  // Load models
  useEffect(() => {
    const loadModels = async () => {
      try {
        setLoadingProgress(10)
        await faceapi.nets.ssdMobilenetv1.load(MODEL_URL)
        setLoadingProgress(40)
        await faceapi.nets.faceLandmark68Net.load(MODEL_URL)
        setLoadingProgress(70)
        await faceapi.nets.faceRecognitionNet.load(MODEL_URL)
        setLoadingProgress(100)

        setModelsLoaded(true)
        setIsLoading(false)
        console.log("All models loaded successfully")

        // Start camera after models are loaded
        startCamera()
      } catch (err) {
        console.error("Error loading models:", err)
        setError(`Error loading models: ${err.message}`)
        setIsLoading(false)
      }
    }

    loadModels()

    return () => {
      // Cleanup
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
      }

      // Cancel any ongoing detection
      if (detectionRef.current) {
        cancelAnimationFrame(detectionRef.current)
        detectionRef.current = null
      }
    }
  }, [])

  // Start camera
  const startCamera = async () => {
    try {
      setError(null)

      // Stop any existing stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
        videoRef.current.srcObject = null
      }

      // Cancel any ongoing detection
      if (detectionRef.current) {
        cancelAnimationFrame(detectionRef.current)
        detectionRef.current = null
      }

      // Get new stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream

        // Add loadeddata event listener to ensure video is ready
        videoRef.current.onloadeddata = () => {
          console.log("Video loaded, starting face detection")
          setIsCameraReady(true)
          startFaceDetection()
        }

        // Ensure video plays
        try {
          await videoRef.current.play()
        } catch (playError) {
          console.error("Error playing video:", playError)
          setError(`Error playing video: ${playError.message}`)
        }
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      setError(`Tidak dapat mengakses kamera: ${err.message}`)
    }
  }

  // Start face detection
  const startFaceDetection = () => {
    if (!videoRef.current || !canvasRef.current || !modelsLoaded) {
      console.log("Cannot start face detection - missing elements or models")
      return
    }

    console.log("Starting face detection")

    const video = videoRef.current
    const canvas = canvasRef.current

    const displaySize = {
      width: video.videoWidth || video.offsetWidth || 640,
      height: video.videoHeight || video.offsetHeight || 480,
    }

    canvas.width = displaySize.width
    canvas.height = displaySize.height
    faceapi.matchDimensions(canvas, displaySize)

    const detectFaces = async () => {
      if (!video || !canvas || video.paused || video.ended || !video.srcObject) {
        console.log("Video not ready for detection")
        return
      }

      try {
        const detections = await faceapi.detectAllFaces(video)
        const resizedDetections = faceapi.resizeResults(detections, displaySize)

        canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height)

        setDetections(resizedDetections)

        // Draw detection boxes
        resizedDetections.forEach((detection) => {
          const box = detection.box
          const drawBox = new faceapi.draw.DrawBox(box, {
            boxColor: "var(--primary)",
            lineWidth: 2,
          })
          drawBox.draw(canvas)
        })

        // Continue detection loop
        detectionRef.current = requestAnimationFrame(detectFaces)
      } catch (error) {
        console.error("Error detecting faces:", error)
        // Continue despite error
        detectionRef.current = requestAnimationFrame(detectFaces)
      }
    }

    // Start detection loop
    detectionRef.current = requestAnimationFrame(detectFaces)
  }

  // Authenticate face
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

      // Get face descriptor
      const faceDescriptor = await getFaceDescriptor(videoRef.current)

      // Find user by face descriptor
      const user = await findUserByFaceDescriptor(supabase, faceDescriptor)

      if (user) {
        // User found, login
        toast({
          title: "Berhasil",
          description: `Selamat datang kembali, ${user.user.name || "Pengguna"}!`,
        })

        // Save user ID in localStorage
        localStorage.setItem("userId", user.user.id)

        // Redirect to dashboard
        router.push("/dashboard")
      } else {
        // User not found, register
        const newUser = await registerUserWithFace(supabase, faceDescriptor)

        toast({
          title: "Berhasil",
          description: "Wajah Anda telah terdaftar. Anda akan diarahkan ke dashboard.",
        })

        // Save user ID in localStorage
        localStorage.setItem("userId", newUser.user.id)

        // Redirect to dashboard
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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Autentikasi Wajah</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative bg-muted aspect-video overflow-hidden rounded-md">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
              <span className="text-center">Memuat model... ({loadingProgress}%)</span>
              <div className="w-64 h-2 bg-gray-200 rounded-full mt-2">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              <p className="mb-4 text-red-500">{error}</p>
              <Button onClick={startCamera}>
                <Camera className="w-4 h-4 mr-2" />
                Coba Lagi
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

        <div className="flex justify-between items-center">
          <div className="text-sm">
            Status:{" "}
            {isCameraReady ? (
              <span className="text-green-500">Kamera Aktif</span>
            ) : (
              <span className="text-red-500">Kamera Tidak Aktif</span>
            )}
            {detections.length > 0 && (
              <span className="ml-2 text-green-500">• Wajah Terdeteksi ({detections.length})</span>
            )}
          </div>
          <Button onClick={startCamera} size="sm" disabled={isLoading || isProcessing}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Muat Ulang
          </Button>
        </div>

        <Button
          onClick={authenticateFace}
          disabled={isLoading || !isCameraReady || isProcessing || detections.length === 0}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Memproses...
            </>
          ) : (
            "Autentikasi Wajah"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

