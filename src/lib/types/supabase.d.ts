export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type RentType = "월세" | "전세" | "사글세";

export interface Database {
  public: {
    Tables: {
      eula_agreements: {
        Row: {
          id: number;
          created_at: string;
          terms_agreed: boolean;
          privacy_agreed: boolean | null;
          user_id: string;
        };
        Insert: {
          id?: number;
          created_at?: string;
          terms_agreed?: boolean;
          privacy_agreed?: boolean | null;
          user_id: string;
        };
        Update: {
          id?: number;
          created_at?: string;
          terms_agreed?: boolean;
          privacy_agreed?: boolean | null;
          user_id?: string;
        };
        Relationships: never[];
      };
      reports: {
        Row: {
          id: number;
          created_at: string;
          review_id: number;
          reason: string;
          reporter: string;
        };
        Insert: {
          id?: number;
          created_at?: string;
          review_id: number;
          reason: string;
          reporter: string;
        };
        Update: {
          id?: number;
          created_at?: string;
          review_id?: number;
          reason?: string;
          reporter?: string;
        };
        Relationships: never[];
      };
      reviews: {
        Row: {
          id: number;
          created_at: string;
          room_id: number;
          context: string | null;
          rent_type: RentType;
          deposit: number | null;
          rent: number | null;
          move_at: string;
          floor: string | null;
          score: number;
          author: string;
          edited_at: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: number;
          created_at?: string;
          room_id: number;
          context?: string | null;
          rent_type: RentType;
          deposit?: number | null;
          rent?: number | null;
          move_at: string;
          floor?: string | null;
          score: number;
          author: string;
          edited_at?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          room_id?: number;
          context?: string | null;
          rent_type?: RentType;
          deposit?: number | null;
          rent?: number | null;
          move_at?: string;
          floor?: string | null;
          score?: number;
          author?: string;
          edited_at?: string | null;
          deleted_at?: string | null;
        };
        Relationships: never[];
      };
      rooms: {
        Row: {
          id: number;
          created_at: string;
          name: string;
          address: string;
          author: string;
          updated_at: string | null;
          postcode: string | null;
        };
        Insert: {
          id?: number;
          created_at?: string;
          name: string;
          address: string;
          author: string;
          updated_at?: string | null;
          postcode?: string | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          name?: string;
          address?: string;
          author?: string;
          updated_at?: string | null;
          postcode?: string | null;
        };
        Relationships: never[];
      };
      users: {
        Row: {
          id: string;
          created_at: string;
          social_login: string | null;
          black_reviews: Json[] | null;
          black_users: Json[] | null;
        };
        Insert: {
          id: string;
          created_at?: string;
          social_login?: string | null;
          black_reviews?: Json[] | null;
          black_users?: Json[] | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          social_login?: string | null;
          black_reviews?: Json[] | null;
          black_users?: Json[] | null;
        };
        Relationships: never[];
      };
    };
    Views: {
      reviews_with_room_summary: {
        Row: {
          id: number;
          created_at: string;
          room_id: number;
          room_name: string;
          room_address: string;
          room_postcode: string | null;
          score: number;
          rent_type: RentType;
          annual_rent: number | null;
          deposit: number | null;
          rent: number | null;
          move_at: string;
          floor: string | null;
          context: string | null;
        };
        Relationships: never[];
      };
      room_review_stats: {
        Row: {
          room_id: number;
          room_name: string;
          room_address: string;
          room_postcode: string | null;
          average_score: number | null;
          review_count: number;
          average_annual_rent: number | null;
        };
        Relationships: never[];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type ReviewSummary =
  Database["public"]["Views"]["reviews_with_room_summary"]["Row"];

export type BuildingSummary =
  Database["public"]["Views"]["room_review_stats"]["Row"];
