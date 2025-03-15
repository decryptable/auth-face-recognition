export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string | null
          created_at: string
          updated_at: string
          is_new_user: boolean
        }
        Insert: {
          id?: string
          name?: string | null
          created_at?: string
          updated_at?: string
          is_new_user?: boolean
        }
        Update: {
          id?: string
          name?: string | null
          created_at?: string
          updated_at?: string
          is_new_user?: boolean
        }
      }
      face_data: {
        Row: {
          id: string
          user_id: string
          face_descriptor: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          face_descriptor: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          face_descriptor?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

