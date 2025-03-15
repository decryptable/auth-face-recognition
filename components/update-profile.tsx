"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useSupabase } from "@/lib/supabase-provider"
import { updateUserName } from "@/lib/face-auth"
import { Loader2 } from "lucide-react"

interface UpdateProfileProps {
  userId: string
  initialName: string
  isNewUser: boolean
}

export default function UpdateProfile({ userId, initialName, isNewUser }: UpdateProfileProps) {
  const { supabase } = useSupabase()
  const { toast } = useToast()

  const [name, setName] = useState(initialName || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Nama tidak boleh kosong",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      await updateUserName(supabase, userId, name)

      toast({
        title: "Berhasil",
        description: "Profil Anda telah diperbarui",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Gagal memperbarui profil. Silakan coba lagi.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isNewUser ? "Selamat Datang!" : "Perbarui Profil"}</CardTitle>
      </CardHeader>
      <CardContent>
        {isNewUser && (
          <div className="mb-4 p-3 bg-primary/10 rounded-md text-sm">
            Hai! Anda berhasil mendaftar. Silakan ubah profil Anda.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Nama
            </label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Masukkan nama Anda" />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

