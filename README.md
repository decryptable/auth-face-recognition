# **Auth Face Recognition - Next.js & Supabase**  

Proyek ini adalah implementasi sistem autentikasi berbasis **Face Recognition** menggunakan **Next.js, TypeScript, TailwindCSS**, dan **Supabase** sebagai database.  
Pengguna dapat **mendaftarkan wajah** mereka untuk login tanpa perlu menggunakan email atau password.  

> [!WARNING]
> Proyek ini dibuat untuk **tujuan pembelajaran** dan **bukan untuk produksi**. Jangan gunakan dalam aplikasi yang menangani data sensitif tanpa tambahan keamanan yang memadai.  

---

## **Fitur**  
✅ Autentikasi menggunakan Face Recognition  
✅ Penyimpanan data wajah di Supabase  
✅ Login tanpa password  
✅ Alternatif login dengan email (opsional)  

---

## **Persyaratan**  
Sebelum menjalankan proyek ini, pastikan Anda memiliki:  
- **Node.js** (disarankan versi 18 atau lebih baru)  
- **Akun Supabase** ([daftar di sini](https://supabase.com/))  
- **API Key dan Database dari Supabase**  

---

## **Instalasi**  

### **1. Clone Repository**  
```bash
git clone https://github.com/decryptable/auth-face-recognition.git
cd auth-face-recognition
```

### **2. Install Dependencies**  
```bash
npm install
```

### **3. Konfigurasi Environment Variables**  
Buat file **`.env.local`** berdasarkan **`.env.example`**, lalu isi dengan kredensial dari Supabase.  

```bash
cp .env.example .env.local
```

Edit `.env.local` dengan kredensial yang benar.

### **4. Menjalankan Proyek**  
Jalankan proyek di mode development:  
```bash
npm run dev
```
Aplikasi akan berjalan di **http://localhost:3000**.  

---

## **Setup Supabase**  

### **1. Buat Project di Supabase**  
1. **Daftar/Login** ke [Supabase](https://supabase.com/)  
2. **Buat proyek baru**  
3. **Salin API URL dan Anon Key** dari **Project Settings → API**  

### **2. Buat Database & Tabel Users**  
Buka **SQL Editor** di Supabase, lalu jalankan skrip berikut untuk membuat tabel `users`:  

```sql
-- Aktifkan ekstensi UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Buat tabel users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_new_user BOOLEAN DEFAULT TRUE
);

-- Buat tabel face_data untuk menyimpan data wajah
CREATE TABLE IF NOT EXISTS face_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  face_descriptor JSONB NOT NULL, -- Menyimpan deskriptor wajah sebagai JSON
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buat fungsi untuk memperbarui updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Buat trigger untuk tabel users
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Buat trigger untuk tabel face_data
CREATE TRIGGER update_face_data_updated_at
BEFORE UPDATE ON face_data
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Aktifkan Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE face_data ENABLE ROW LEVEL SECURITY;

-- Kebijakan untuk tabel users (semua pengguna dapat melihat semua data)
CREATE POLICY "Users are viewable by everyone" ON users
  FOR SELECT USING (true);

-- Kebijakan untuk tabel face_data (semua pengguna dapat melihat semua data)
CREATE POLICY "Face data is viewable by everyone" ON face_data
  FOR SELECT USING (true);

-- Kebijakan untuk tabel users (hanya service role yang dapat memodifikasi data)
CREATE POLICY "Users can be modified by service role" ON users
  FOR ALL USING (auth.role() = 'service_role');

-- Kebijakan untuk tabel face_data (hanya service role yang dapat memodifikasi data)
CREATE POLICY "Face data can be modified by service role" ON face_data
  FOR ALL USING (auth.role() = 'service_role');
```

### **3. Konfigurasi Environment**  

```shell
# Database PostgreSQL (Jangan gunakan di produksi)
POSTGRES_URL="postgres://<USERNAME>:<PASSWORD>@<HOST>:<PORT>/postgres?sslmode=require"
POSTGRES_PRISMA_URL="postgres://<USERNAME>:<PASSWORD>@<HOST>:<PORT>/postgres?sslmode=require"
POSTGRES_URL_NON_POOLING="postgres://<USERNAME>:<PASSWORD>@<HOST>:<PORT>/postgres?sslmode=require"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="<PASSWORD>"
POSTGRES_DATABASE="postgres"
POSTGRES_HOST="<HOST>"

# Supabase Configuration
SUPABASE_URL="https://<YOUR_SUPABASE_ID>.supabase.co"
NEXT_PUBLIC_SUPABASE_URL="https://<YOUR_SUPABASE_ID>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<YOUR_ANON_KEY>"
SUPABASE_SERVICE_ROLE_KEY="<YOUR_SERVICE_ROLE_KEY>"
SUPABASE_JWT_SECRET="<YOUR_JWT_SECRET>"
```

---

## **Deployment ke Vercel**  
Proyek ini dapat langsung di-deploy ke **Vercel**.  

1. **Login ke Vercel**  
```bash
npx vercel login
```
2. **Deploy**  
```bash
npx vercel
```
3. **Tambahkan Environment Variables di Vercel**  
Buka **Vercel Dashboard**, pilih proyek ini, lalu tambahkan environment variables sesuai dengan **`.env.local`**.  

---

## **Lisensi**  
Proyek ini menggunakan lisensi **MIT** dan hanya untuk tujuan pembelajaran.  