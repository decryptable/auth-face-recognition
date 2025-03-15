import Link from "next/link"
import { Button } from "@/components/ui/button"
import ThemeToggle from "@/components/theme-toggle"

export default function PrivacyPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Kebijakan Privasi</h1>
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
          <h2>Kebijakan Privasi</h2>

          <p>
            Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi
            Anda saat Anda menggunakan Aplikasi Autentikasi Wajah kami.
          </p>

          <h3>1. Informasi yang Kami Kumpulkan</h3>
          <p>Kami mengumpulkan informasi berikut:</p>
          <ul>
            <li>Data biometrik wajah untuk tujuan autentikasi</li>
            <li>Nama yang Anda berikan</li>
            <li>Informasi penggunaan aplikasi</li>
          </ul>

          <h3>2. Bagaimana Kami Menggunakan Informasi Anda</h3>
          <p>Kami menggunakan informasi yang dikumpulkan untuk:</p>
          <ul>
            <li>Menyediakan layanan autentikasi wajah</li>
            <li>Meningkatkan dan mengembangkan aplikasi</li>
            <li>Memastikan keamanan aplikasi</li>
          </ul>

          <h3>3. Penyimpanan dan Keamanan Data</h3>
          <p>
            Data biometrik wajah Anda disimpan dalam format terenkripsi di server kami. Kami menerapkan langkah-langkah
            keamanan yang ketat untuk melindungi data Anda dari akses yang tidak sah.
          </p>

          <h3>4. Berbagi Data</h3>
          <p>
            Kami tidak menjual, memperdagangkan, atau mentransfer informasi pribadi Anda kepada pihak ketiga tanpa
            persetujuan Anda, kecuali jika diwajibkan oleh hukum.
          </p>

          <h3>5. Hak Anda</h3>
          <p>Anda memiliki hak untuk:</p>
          <ul>
            <li>Mengakses data pribadi Anda yang kami simpan</li>
            <li>Meminta koreksi data yang tidak akurat</li>
            <li>Meminta penghapusan data Anda</li>
            <li>Menarik persetujuan Anda kapan saja</li>
          </ul>

          <h3>6. Perubahan pada Kebijakan Privasi</h3>
          <p>
            Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Kami akan memberi tahu Anda tentang
            perubahan dengan memposting kebijakan baru di aplikasi.
          </p>

          <h3>7. Kontak</h3>
          <p>Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami.</p>

          <p>Terakhir diperbarui: 15 Maret 2025</p>
        </div>
      </div>
    </main>
  )
}

