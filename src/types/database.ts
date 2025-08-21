export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      wine_entries: {
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
          price_paid: number | null
          where_purchased: string | null
          appearance_intensity: 'pale' | 'medium-' | 'medium' | 'medium+' | 'deep' | null
          appearance_color: string | null
          appearance_clarity: 'clear' | 'hazy' | null
          appearance_other_observations: string | null
          nose_condition: 'clean' | 'unclean' | null
          nose_intensity: 'light' | 'medium-' | 'medium' | 'medium+' | 'pronounced' | null
          nose_aroma_characteristics: string[] | null
          nose_development: 'youthful' | 'developing' | 'fully developed' | 'tired' | null
          palate_sweetness: 'dry' | 'off-dry' | 'medium-dry' | 'medium-sweet' | 'sweet' | 'luscious' | null
          palate_acidity: 'low' | 'medium-' | 'medium' | 'medium+' | 'high' | null
          palate_tannin: 'low' | 'medium-' | 'medium' | 'medium+' | 'high' | null
          palate_alcohol: 'low' | 'medium-' | 'medium' | 'medium+' | 'high' | null
          palate_body: 'light' | 'medium-' | 'medium' | 'medium+' | 'full' | null
          palate_flavor_intensity: 'light' | 'medium-' | 'medium' | 'medium+' | 'pronounced' | null
          palate_flavor_characteristics: string[] | null
          palate_finish: 'short' | 'medium-' | 'medium' | 'medium+' | 'long' | null
          quality_assessment: 'faulty' | 'poor' | 'acceptable' | 'good' | 'very good' | 'outstanding'
          readiness_for_drinking: 'too young' | 'ready but will improve' | 'ready and at peak' | 'ready but past peak' | 'too old' | null
          aging_potential: string | null
          photo_url: string | null
          audio_url: string | null
          voice_transcript: string | null
          processing_confidence: number | null
          is_public: boolean
          rating: number | null
          notes: string | null
          tasting_date: string | null
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
          price_paid?: number | null
          where_purchased?: string | null
          appearance_intensity?: 'pale' | 'medium-' | 'medium' | 'medium+' | 'deep' | null
          appearance_color?: string | null
          appearance_clarity?: 'clear' | 'hazy' | null
          appearance_other_observations?: string | null
          nose_condition?: 'clean' | 'unclean' | null
          nose_intensity?: 'light' | 'medium-' | 'medium' | 'medium+' | 'pronounced' | null
          nose_aroma_characteristics?: string[] | null
          nose_development?: 'youthful' | 'developing' | 'fully developed' | 'tired' | null
          palate_sweetness?: 'dry' | 'off-dry' | 'medium-dry' | 'medium-sweet' | 'sweet' | 'luscious' | null
          palate_acidity?: 'low' | 'medium-' | 'medium' | 'medium+' | 'high' | null
          palate_tannin?: 'low' | 'medium-' | 'medium' | 'medium+' | 'high' | null
          palate_alcohol?: 'low' | 'medium-' | 'medium' | 'medium+' | 'high' | null
          palate_body?: 'light' | 'medium-' | 'medium' | 'medium+' | 'full' | null
          palate_flavor_intensity?: 'light' | 'medium-' | 'medium' | 'medium+' | 'pronounced' | null
          palate_flavor_characteristics?: string[] | null
          palate_finish?: 'short' | 'medium-' | 'medium' | 'medium+' | 'long' | null
          quality_assessment: 'faulty' | 'poor' | 'acceptable' | 'good' | 'very good' | 'outstanding'
          readiness_for_drinking?: 'too young' | 'ready but will improve' | 'ready and at peak' | 'ready but past peak' | 'too old' | null
          aging_potential?: string | null
          photo_url?: string | null
          audio_url?: string | null
          voice_transcript?: string | null
          processing_confidence?: number | null
          is_public?: boolean
          rating?: number | null
          notes?: string | null
          tasting_date?: string | null
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
          price_paid?: number | null
          where_purchased?: string | null
          appearance_intensity?: 'pale' | 'medium-' | 'medium' | 'medium+' | 'deep' | null
          appearance_color?: string | null
          appearance_clarity?: 'clear' | 'hazy' | null
          appearance_other_observations?: string | null
          nose_condition?: 'clean' | 'unclean' | null
          nose_intensity?: 'light' | 'medium-' | 'medium' | 'medium+' | 'pronounced' | null
          nose_aroma_characteristics?: string[] | null
          nose_development?: 'youthful' | 'developing' | 'fully developed' | 'tired' | null
          palate_sweetness?: 'dry' | 'off-dry' | 'medium-dry' | 'medium-sweet' | 'sweet' | 'luscious' | null
          palate_acidity?: 'low' | 'medium-' | 'medium' | 'medium+' | 'high' | null
          palate_tannin?: 'low' | 'medium-' | 'medium' | 'medium+' | 'high' | null
          palate_alcohol?: 'low' | 'medium-' | 'medium' | 'medium+' | 'high' | null
          palate_body?: 'light' | 'medium-' | 'medium' | 'medium+' | 'full' | null
          palate_flavor_intensity?: 'light' | 'medium-' | 'medium' | 'medium+' | 'pronounced' | null
          palate_flavor_characteristics?: string[] | null
          palate_finish?: 'short' | 'medium-' | 'medium' | 'medium+' | 'long' | null
          quality_assessment?: 'faulty' | 'poor' | 'acceptable' | 'good' | 'very good' | 'outstanding'
          readiness_for_drinking?: 'too young' | 'ready but will improve' | 'ready and at peak' | 'ready but past peak' | 'too old' | null
          aging_potential?: string | null
          photo_url?: string | null
          audio_url?: string | null
          voice_transcript?: string | null
          processing_confidence?: number | null
          is_public?: boolean
          rating?: number | null
          notes?: string | null
          tasting_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wine_entries_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      wine_collections: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wine_collections_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      collection_wines: {
        Row: {
          id: string
          collection_id: string
          wine_entry_id: string
          added_at: string
        }
        Insert: {
          id?: string
          collection_id: string
          wine_entry_id: string
          added_at?: string
        }
        Update: {
          id?: string
          collection_id?: string
          wine_entry_id?: string
          added_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_wines_collection_id_fkey"
            columns: ["collection_id"]
            referencedRelation: "wine_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_wines_wine_entry_id_fkey"
            columns: ["wine_entry_id"]
            referencedRelation: "wine_entries"
            referencedColumns: ["id"]
          }
        ]
      }
      user_follows: {
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
        Relationships: [
          {
            foreignKeyName: "user_follows_follower_id_fkey"
            columns: ["follower_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_follows_following_id_fkey"
            columns: ["following_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      wine_entry_likes: {
        Row: {
          id: string
          user_id: string
          wine_entry_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          wine_entry_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          wine_entry_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wine_entry_likes_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wine_entry_likes_wine_entry_id_fkey"
            columns: ["wine_entry_id"]
            referencedRelation: "wine_entries"
            referencedColumns: ["id"]
          }
        ]
      }
      wine_entry_comments: {
        Row: {
          id: string
          user_id: string
          wine_entry_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          wine_entry_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          wine_entry_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wine_entry_comments_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wine_entry_comments_wine_entry_id_fkey"
            columns: ["wine_entry_id"]
            referencedRelation: "wine_entries"
            referencedColumns: ["id"]
          }
        ]
      }
      activity_feed: {
        Row: {
          id: string
          user_id: string
          activity_type: 'wine_entry' | 'collection_created' | 'follow' | 'like' | 'comment'
          target_id: string | null
          target_user_id: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_type: 'wine_entry' | 'collection_created' | 'follow' | 'like' | 'comment'
          target_id?: string | null
          target_user_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_type?: 'wine_entry' | 'collection_created' | 'follow' | 'like' | 'comment'
          target_id?: string | null
          target_user_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_feed_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_feed_target_user_id_fkey"
            columns: ["target_user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      voice_processing_cache: {
        Row: {
          id: string
          audio_hash: string
          transcript: string
          wset_mapping: Json
          processing_confidence: number
          created_at: string
        }
        Insert: {
          id?: string
          audio_hash: string
          transcript: string
          wset_mapping: Json
          processing_confidence: number
          created_at?: string
        }
        Update: {
          id?: string
          audio_hash?: string
          transcript?: string
          wset_mapping?: Json
          processing_confidence?: number
          created_at?: string
        }
        Relationships: []
      }
      wine_terminology: {
        Row: {
          id: string
          term: string
          category: string
          wset_field: string
          synonyms: string[] | null
          confidence_weight: number
          created_at: string
        }
        Insert: {
          id?: string
          term: string
          category: string
          wset_field: string
          synonyms?: string[] | null
          confidence_weight?: number
          created_at?: string
        }
        Update: {
          id?: string
          term?: string
          category?: string
          wset_field?: string
          synonyms?: string[] | null
          confidence_weight?: number
          created_at?: string
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}