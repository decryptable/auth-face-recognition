import * as faceapi from "face-api.js"
import type { Database } from "./database.types"
import type { SupabaseClient } from "@supabase/supabase-js"

// URL model dari CDN
const MODEL_URL = "https://justadudewhohacks.github.io/face-api.js/models"

// Fungsi untuk memuat model face-api.js
export const loadFaceApiModels = async () => {
  try {
    // Muat model secara berurutan
    await faceapi.nets.ssdMobilenetv1.load(MODEL_URL)
    console.log("SSD MobileNet model loaded")

    await faceapi.nets.faceLandmark68Net.load(MODEL_URL)
    console.log("Face Landmark model loaded")

    await faceapi.nets.faceRecognitionNet.load(MODEL_URL)
    console.log("Face Recognition model loaded")

    // Verifikasi model benar-benar dimuat
    const isSsdLoaded = faceapi.nets.ssdMobilenetv1.isLoaded
    const isLandmarkLoaded = faceapi.nets.faceLandmark68Net.isLoaded
    const isRecognitionLoaded = faceapi.nets.faceRecognitionNet.isLoaded

    if (!isSsdLoaded || !isLandmarkLoaded || !isRecognitionLoaded) {
      throw new Error("Models did not load properly")
    }

    return true
  } catch (error) {
    console.error("Error loading face-api models:", error)
    return false
  }
}

// Fungsi untuk mendapatkan deskriptor wajah dari gambar
export const getFaceDescriptor = async (imageElement: HTMLImageElement | HTMLVideoElement) => {
  try {
    // Verifikasi model dimuat sebelum deteksi
    if (
      !faceapi.nets.ssdMobilenetv1.isLoaded ||
      !faceapi.nets.faceLandmark68Net.isLoaded ||
      !faceapi.nets.faceRecognitionNet.isLoaded
    ) {
      throw new Error("Model pengenalan wajah belum dimuat sepenuhnya")
    }

    const detections = await faceapi.detectSingleFace(imageElement).withFaceLandmarks().withFaceDescriptor()

    if (!detections) {
      throw new Error("Tidak ada wajah yang terdeteksi")
    }

    return detections.descriptor
  } catch (error) {
    console.error("Error getting face descriptor:", error)
    throw error
  }
}

// Fungsi untuk membandingkan deskriptor wajah
export const compareFaceDescriptors = (
  descriptor1: Float32Array,
  descriptor2: Float32Array | number[],
  threshold = 0.6,
) => {
  // Konversi descriptor2 ke Float32Array jika itu adalah array biasa
  const desc2 = Array.isArray(descriptor2) ? new Float32Array(descriptor2) : descriptor2

  const distance = faceapi.euclideanDistance(descriptor1, desc2)
  return {
    distance,
    match: distance < threshold,
  }
}

// Fungsi untuk mencari pengguna berdasarkan deskriptor wajah
export const findUserByFaceDescriptor = async (
  supabase: SupabaseClient<Database>,
  faceDescriptor: Float32Array,
  threshold = 0.6,
) => {
  try {
    // Ambil semua data wajah dari database
    // Perbaikan: Gunakan join yang benar untuk menghubungkan face_data dengan users
    const { data: faceData, error } = await supabase.from("face_data").select(`
      id,
      user_id,
      face_descriptor,
      users:user_id (
        id,
        name,
        is_new_user
      )
    `)

    if (error) throw error
    if (!faceData || faceData.length === 0) return null

    // Bandingkan deskriptor wajah dengan semua data di database
    let bestMatch = null
    let lowestDistance = Number.POSITIVE_INFINITY

    for (const face of faceData) {
      const storedDescriptor = face.face_descriptor as number[]
      const { distance, match } = compareFaceDescriptors(faceDescriptor, storedDescriptor, threshold)

      if (match && distance < lowestDistance) {
        lowestDistance = distance
        bestMatch = {
          user: face.users,
          distance,
          faceId: face.id,
        }
      }
    }

    return bestMatch
  } catch (error) {
    console.error("Error finding user by face descriptor:", error)
    throw error
  }
}

// Fungsi untuk mendaftarkan pengguna baru dengan deskriptor wajah
export const registerUserWithFace = async (supabase: SupabaseClient<Database>, faceDescriptor: Float32Array) => {
  try {
    // Buat pengguna baru
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert({ name: "Pengguna Baru" })
      .select()
      .single()

    if (userError) throw userError

    // Simpan deskriptor wajah
    const { data: faceData, error: faceError } = await supabase
      .from("face_data")
      .insert({
        user_id: userData.id,
        face_descriptor: Array.from(faceDescriptor),
      })
      .select()
      .single()

    if (faceError) throw faceError

    return {
      user: userData,
      faceData,
    }
  } catch (error) {
    console.error("Error registering user with face:", error)
    throw error
  }
}

// Fungsi untuk memperbarui nama pengguna
export const updateUserName = async (supabase: SupabaseClient<Database>, userId: string, name: string) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .update({ name, is_new_user: false })
      .eq("id", userId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error updating user name:", error)
    throw error
  }
}

