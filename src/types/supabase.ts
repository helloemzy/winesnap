export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          location: string | null
          website_url: string | null
          wset_level: number | null
          certifications: string[] | null
          is_public: boolean
          preferences: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          website_url?: string | null
          wset_level?: number | null
          certifications?: string[] | null
          is_public?: boolean
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          website_url?: string | null
          wset_level?: number | null
          certifications?: string[] | null
          is_public?: boolean
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      wine_tastings: {
        Row: {
          id: string
          user_id: string
          wine_name: string
          producer: string | null
          vintage: number | null
          region: string | null
          country: string | null
          grape_varieties: string[] | null
          alcohol_content: number | null
          closure_type: string | null
          wine_style: string | null
          appearance_intensity: number | null
          appearance_color: string | null
          appearance_other: string | null
          aroma_intensity: number | null
          aroma_characteristics: string[] | null
          aroma_development: string | null
          palate_sweetness: number | null
          palate_acidity: number | null
          palate_tannin: number | null
          palate_alcohol: number | null
          palate_body: number | null
          palate_intensity: number | null
          palate_finish: number | null
          flavor_characteristics: string[] | null
          quality_level: number | null
          readiness: string | null
          aging_potential: number | null
          overall_score: number | null
          price_point: string | null
          value_assessment: number | null
          occasion: string | null
          food_pairing_notes: string | null
          personal_notes: string | null
          voice_memo_url: string | null
          photos: string[] | null
          tasting_date: string
          location: string | null
          temperature: number | null
          decanted: boolean
          decant_time: number | null
          glassware: string | null
          is_public: boolean
          is_favorite: boolean
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          wine_name: string
          producer?: string | null
          vintage?: number | null
          region?: string | null
          country?: string | null
          grape_varieties?: string[] | null
          alcohol_content?: number | null
          closure_type?: string | null
          wine_style?: string | null
          appearance_intensity?: number | null
          appearance_color?: string | null
          appearance_other?: string | null
          aroma_intensity?: number | null
          aroma_characteristics?: string[] | null
          aroma_development?: string | null
          palate_sweetness?: number | null
          palate_acidity?: number | null
          palate_tannin?: number | null
          palate_alcohol?: number | null
          palate_body?: number | null
          palate_intensity?: number | null
          palate_finish?: number | null
          flavor_characteristics?: string[] | null
          quality_level?: number | null
          readiness?: string | null
          aging_potential?: number | null
          overall_score?: number | null
          price_point?: string | null
          value_assessment?: number | null
          occasion?: string | null
          food_pairing_notes?: string | null
          personal_notes?: string | null
          voice_memo_url?: string | null
          photos?: string[] | null
          tasting_date: string
          location?: string | null
          temperature?: number | null
          decanted?: boolean
          decant_time?: number | null
          glassware?: string | null
          is_public?: boolean
          is_favorite?: boolean
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          wine_name?: string
          producer?: string | null
          vintage?: number | null
          region?: string | null
          country?: string | null
          grape_varieties?: string[] | null
          alcohol_content?: number | null
          closure_type?: string | null
          wine_style?: string | null
          appearance_intensity?: number | null
          appearance_color?: string | null
          appearance_other?: string | null
          aroma_intensity?: number | null
          aroma_characteristics?: string[] | null
          aroma_development?: string | null
          palate_sweetness?: number | null
          palate_acidity?: number | null
          palate_tannin?: number | null
          palate_alcohol?: number | null
          palate_body?: number | null
          palate_intensity?: number | null
          palate_finish?: number | null
          flavor_characteristics?: string[] | null
          quality_level?: number | null
          readiness?: string | null
          aging_potential?: number | null
          overall_score?: number | null
          price_point?: string | null
          value_assessment?: number | null
          occasion?: string | null
          food_pairing_notes?: string | null
          personal_notes?: string | null
          voice_memo_url?: string | null
          photos?: string[] | null
          tasting_date?: string
          location?: string | null
          temperature?: number | null
          decanted?: boolean
          decant_time?: number | null
          glassware?: string | null
          is_public?: boolean
          is_favorite?: boolean
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      tasting_likes: {
        Row: {
          id: string
          user_id: string
          tasting_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tasting_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tasting_id?: string
          created_at?: string
        }
      }
      tasting_comments: {
        Row: {
          id: string
          user_id: string
          tasting_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tasting_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tasting_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      collections: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          is_public: boolean
          cover_image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          is_public?: boolean
          cover_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          is_public?: boolean
          cover_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      collection_tastings: {
        Row: {
          id: string
          collection_id: string
          tasting_id: string
          added_at: string
        }
        Insert: {
          id?: string
          collection_id: string
          tasting_id: string
          added_at?: string
        }
        Update: {
          id?: string
          collection_id?: string
          tasting_id?: string
          added_at?: string
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

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never