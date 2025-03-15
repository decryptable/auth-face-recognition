"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ThemeToggle from "@/components/theme-toggle"
import UpdateProfile from "@/components/update-profile"
import { useSupabase } from "@/lib/supabase-provider"
import { Loader2, LogOut } from "lucide-react"

export default function Dashboard() {
  const { supabase } = useSupabase()
  const router = useRouter()

  const [userId, setUserId] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId")

    if (!storedUserId) {
      router.push("/")
      return
    }

    setUserId(storedUserId)

    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.from("users").select("*").eq("id", storedUserId).single()

        if (error) throw error

        setUser(data)
      } catch (error) {
        console.error("Error fetching user:", error)
        localStorage.removeItem("userId")
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [router, supabase])

  const handleLogout = () => {
    localStorage.removeItem("userId")
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Autentikasi Wajah Berhasil</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Selamat! Anda telah berhasil masuk menggunakan autentikasi wajah.</p>
            </CardContent>
          </Card>

          {userId && user && <UpdateProfile userId={userId} initialName={user.name} isNewUser={user.is_new_user} />}
        </div>
      </div>
    </main>
  )
}

