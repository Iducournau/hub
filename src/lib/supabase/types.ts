export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      keywords: {
        Row: {
          id: string
          keyword: string
          priority: 'P0' | 'P1' | 'P2' | 'P3' | null
          intent: string | null
          volume: number | null
          difficulty: number | null
          assigned_page_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          keyword: string
          priority?: 'P0' | 'P1' | 'P2' | 'P3' | null
          intent?: string | null
          volume?: number | null
          difficulty?: number | null
          assigned_page_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          keyword?: string
          priority?: 'P0' | 'P1' | 'P2' | 'P3' | null
          intent?: string | null
          volume?: number | null
          difficulty?: number | null
          assigned_page_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      pages: {
        Row: {
          id: string
          url: string
          title: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          url: string
          title?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          url?: string
          title?: string | null
          status?: string
          created_at?: string
        }
      }
      positions: {
        Row: {
          id: string
          keyword_id: string
          position: number | null
          clicks: number | null
          impressions: number | null
          ctr: number | null
          date: string
          source: string
        }
        Insert: {
          id?: string
          keyword_id: string
          position?: number | null
          clicks?: number | null
          impressions?: number | null
          ctr?: number | null
          date: string
          source?: string
        }
        Update: {
          id?: string
          keyword_id?: string
          position?: number | null
          clicks?: number | null
          impressions?: number | null
          ctr?: number | null
          date?: string
          source?: string
        }
      }
      alerts: {
        Row: {
          id: string
          type: string
          severity: string
          keyword_id: string | null
          page_id: string | null
          message: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          type: string
          severity?: string
          keyword_id?: string | null
          page_id?: string | null
          message?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          type?: string
          severity?: string
          keyword_id?: string | null
          page_id?: string | null
          message?: string | null
          status?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Convenience types
export type Keyword = Tables<'keywords'>
export type Page = Tables<'pages'>
export type Position = Tables<'positions'>
export type Alert = Tables<'alerts'>
