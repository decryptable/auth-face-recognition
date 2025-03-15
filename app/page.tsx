import ThemeToggle from "@/components/theme-toggle"
import Link from "next/link"
import CameraDebug from "@/components/camera-debug"
import SimpleFaceAuth from "@/components/simple-face-auth"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Autentikasi Wajah</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Selamat Datang</h2>
            <p className="mt-2 text-muted-foreground">Gunakan wajah Anda untuk login atau mendaftar</p>
          </div>

          {/* Gunakan SimpleFaceAuth sebagai alternatif */}
          <SimpleFaceAuth />

          {/* Komponen asli FaceAuth (dikomentari untuk sementara) */}
          {/* <FaceAuth /> */}

          {/* Komponen debug kamera */}
          <CameraDebug />

          <div className="text-center text-sm text-muted-foreground">
            <p>
              Dengan menggunakan layanan ini, Anda menyetujui{" "}
              <Link href="/terms" className="underline underline-offset-2 hover:text-primary">
                Syarat & Ketentuan
              </Link>{" "}
              dan{" "}
              <Link href="/privacy" className="underline underline-offset-2 hover:text-primary">
                Kebijakan Privasi
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

