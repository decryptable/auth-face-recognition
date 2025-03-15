import Link from "next/link"
import { Button } from "@/components/ui/button"
import ThemeToggle from "@/components/theme-toggle"

export default function TermsPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Syarat & Ketentuan</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" asChild>
              <Link href="/">Kembali</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto prose dark:prose-invert">
          <h2>Syarat & Ketentuan Penggunaan</h2>

          <p>
            Selamat datang di Aplikasi Autentikasi Wajah. Dengan menggunakan aplikasi ini, Anda menyetujui syarat dan
            ketentuan berikut:
          </p>

          <h3>1. Penggunaan Aplikasi</h3>
          <p>
            Aplikasi ini menyediakan layanan autentikasi berbasis pengenalan wajah. Anda bertanggung jawab untuk
            menggunakan aplikasi ini sesuai dengan hukum yang berlaku dan syarat ketentuan ini.
          </p>

          <h3>2. Privasi dan Data</h3>
          <p>
            Kami mengumpulkan data biometrik wajah Anda untuk tujuan autentikasi. Data ini disimpan dengan aman dan
            tidak akan dibagikan kepada pihak ketiga tanpa persetujuan Anda. Untuk informasi lebih lanjut, silakan baca
            Kebijakan Privasi kami.
          </p>

          <h3>3. Akun Pengguna</h3>
          <p>
            Anda bertanggung jawab untuk menjaga keamanan akun Anda. Jangan memberikan akses ke orang lain untuk
            menggunakan fitur autentikasi wajah Anda.
          </p>

          <h3>4. Batasan Tanggung Jawab</h3>
          <p>
            Kami berusaha menyediakan layanan yang aman dan andal, namun kami tidak menjamin bahwa aplikasi akan selalu
            berfungsi tanpa gangguan atau kesalahan. Kami tidak bertanggung jawab atas kerugian yang mungkin timbul dari
            penggunaan aplikasi ini.
          </p>

          <h3>5. Perubahan Syarat & Ketentuan</h3>
          <p>
            Kami berhak untuk mengubah syarat dan ketentuan ini kapan saja. Perubahan akan efektif setelah
            dipublikasikan di aplikasi. Penggunaan berkelanjutan dari aplikasi setelah perubahan berarti Anda menyetujui
            syarat dan ketentuan yang baru.
          </p>

          <h3>6. Hukum yang Berlaku</h3>
          <p>
            Syarat dan ketentuan ini diatur oleh hukum Indonesia dan setiap perselisihan akan diselesaikan di pengadilan
            yang berwenang di Indonesia.
          </p>

          <p>Jika Anda memiliki pertanyaan tentang syarat dan ketentuan ini, silakan hubungi kami.</p>

          <p>Terakhir diperbarui: 15 Maret 2025</p>
        </div>
      </div>
    </main>
  )
}

