"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import * as faceapi from "face-api.js"

export default function CameraDebug() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [permissions, setPermissions] = useState<PermissionStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [modelStatus, setModelStatus] = useState({
    ssd: false,
    landmark: false,
    recognition: false,
  })

  useEffect(() => {
    // Cek perangkat kamera yang tersedia
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter((device) => device.kind === "videoinput")
        setDevices(videoDevices)
      } catch (err) {
        setError(`Error enumerating devices: ${err.message}`)
      }
    }

    // Cek izin kamera
    const checkPermissions = async () => {
      try {
        if ("permissions" in navigator) {
          const status = await navigator.permissions.query({ name: "camera" as PermissionName })
          setPermissions(status)

          status.onchange = () => {
            setPermissions({ ...status })
          }
        }
      } catch (err) {
        setError(`Error checking permissions: ${err.message}`)
      }
    }

    // Cek status model
    const checkModelStatus = () => {
      setModelStatus({
        ssd: faceapi.nets.ssdMobilenetv1.isLoaded,
        landmark: faceapi.nets.faceLandmark68Net.isLoaded,
        recognition: faceapi.nets.faceRecognitionNet.isLoaded,
      })
    }

    getDevices()
    checkPermissions()
    checkModelStatus()

    // Periksa status model setiap 2 detik
    const intervalId = setInterval(checkModelStatus, 2000)

    return () => clearInterval(intervalId)
  }, [])

  const requestCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      // Hentikan stream setelah mendapatkan akses
      stream.getTracks().forEach((track) => track.stop())

      // Perbarui daftar perangkat dan izin
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter((device) => device.kind === "videoinput")
      setDevices(videoDevices)

      if ("permissions" in navigator) {
        const status = await navigator.permissions.query({ name: "camera" as PermissionName })
        setPermissions(status)
      }

      setError(null)
    } catch (err) {
      setError(`Error requesting camera access: ${err.message}`)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-4">
      <CardHeader>
        <CardTitle>Diagnostik Kamera & Model</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Status Model:</h3>
          <div className="space-y-1">
            <div className="flex justify-between p-2 bg-muted rounded">
              <span>SSD MobileNet:</span>
              {modelStatus.ssd ? (
                <span className="text-green-600">Dimuat ✓</span>
              ) : (
                <span className="text-red-600">Belum dimuat ✗</span>
              )}
            </div>
            <div className="flex justify-between p-2 bg-muted rounded">
              <span>Face Landmark:</span>
              {modelStatus.landmark ? (
                <span className="text-green-600">Dimuat ✓</span>
              ) : (
                <span className="text-red-600">Belum dimuat ✗</span>
              )}
            </div>
            <div className="flex justify-between p-2 bg-muted rounded">
              <span>Face Recognition:</span>
              {modelStatus.recognition ? (
                <span className="text-green-600">Dimuat ✓</span>
              ) : (
                <span className="text-red-600">Belum dimuat ✗</span>
              )}
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Status Izin Kamera:</h3>
          {permissions ? (
            <div className="p-2 bg-muted rounded">
              {permissions.state === "granted" ? (
                <p className="text-green-600">Diizinkan ✓</p>
              ) : permissions.state === "denied" ? (
                <p className="text-red-600">Ditolak ✗</p>
              ) : (
                <p className="text-yellow-600">Prompt / Belum Diputuskan</p>
              )}
            </div>
          ) : (
            <p>Tidak dapat memeriksa izin</p>
          )}
        </div>

        <div>
          <h3 className="font-medium mb-2">Perangkat Kamera Tersedia:</h3>
          {devices.length > 0 ? (
            <ul className="space-y-2">
              {devices.map((device, index) => (
                <li key={device.deviceId} className="p-2 bg-muted rounded">
                  {index + 1}. {device.label || `Kamera ${index + 1}`}
                </li>
              ))}
            </ul>
          ) : (
            <p>Tidak ada perangkat kamera yang terdeteksi atau izin belum diberikan</p>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <Button onClick={requestCameraAccess} className="w-full">
          Minta Akses Kamera
        </Button>
      </CardContent>
    </Card>
  )
}

