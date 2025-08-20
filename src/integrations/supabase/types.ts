export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      deal_assignments: {
        Row: {
          assigned_by: string
          can_download: boolean
          can_upload: boolean
          can_view: boolean
          created_at: string
          deal_id: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          assigned_by: string
          can_download?: boolean
          can_upload?: boolean
          can_view?: boolean
          created_at?: string
          deal_id: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          assigned_by?: string
          can_download?: boolean
          can_upload?: boolean
          can_view?: boolean
          created_at?: string
          deal_id?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_assignments_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          company_name: string
          created_at: string
          created_by: string
          description: string | null
          ebitda: string | null
          id: string
          industry: string | null
          location: string | null
          revenue: string | null
          status: Database["public"]["Enums"]["deal_status"]
          title: string
          updated_at: string
        }
        Insert: {
          company_name: string
          created_at?: string
          created_by: string
          description?: string | null
          ebitda?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          revenue?: string | null
          status?: Database["public"]["Enums"]["deal_status"]
          title: string
          updated_at?: string
        }
        Update: {
          company_name?: string
          created_at?: string
          created_by?: string
          description?: string | null
          ebitda?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          revenue?: string | null
          status?: Database["public"]["Enums"]["deal_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string
          deal_id: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          name: string
          tag: Database["public"]["Enums"]["document_tag"]
          updated_at: string
          uploaded_by: string
          version: number
        }
        Insert: {
          created_at?: string
          deal_id: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          name: string
          tag?: Database["public"]["Enums"]["document_tag"]
          updated_at?: string
          uploaded_by: string
          version?: number
        }
        Update: {
          created_at?: string
          deal_id?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          name?: string
          tag?: Database["public"]["Enums"]["document_tag"]
          updated_at?: string
          uploaded_by?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "documents_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_responses: {
        Row: {
          acquisition_goal:
            | Database["public"]["Enums"]["acquisition_goal"]
            | null
          annual_profit: string | null
          annual_revenue: string | null
          asking_price_max: number | null
          asking_price_min: number | null
          business_type: Database["public"]["Enums"]["business_type"] | null
          company_name: string | null
          completed_at: string | null
          created_at: string
          full_name: string | null
          id: string
          ideal_business_types:
            | Database["public"]["Enums"]["business_type"][]
            | null
          industries_of_interest: string[] | null
          linkedin_url: string | null
          owns_business: boolean | null
          phone_number: string | null
          preferred_tech_stacks: string[] | null
          profit_multiple_max: number | null
          profit_multiple_min: number | null
          referral_other_details: string | null
          referral_source: Database["public"]["Enums"]["referral_source"] | null
          ttm_profit_max: number | null
          ttm_profit_min: number | null
          ttm_revenue_max: number | null
          ttm_revenue_min: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          acquisition_goal?:
            | Database["public"]["Enums"]["acquisition_goal"]
            | null
          annual_profit?: string | null
          annual_revenue?: string | null
          asking_price_max?: number | null
          asking_price_min?: number | null
          business_type?: Database["public"]["Enums"]["business_type"] | null
          company_name?: string | null
          completed_at?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          ideal_business_types?:
            | Database["public"]["Enums"]["business_type"][]
            | null
          industries_of_interest?: string[] | null
          linkedin_url?: string | null
          owns_business?: boolean | null
          phone_number?: string | null
          preferred_tech_stacks?: string[] | null
          profit_multiple_max?: number | null
          profit_multiple_min?: number | null
          referral_other_details?: string | null
          referral_source?:
            | Database["public"]["Enums"]["referral_source"]
            | null
          ttm_profit_max?: number | null
          ttm_profit_min?: number | null
          ttm_revenue_max?: number | null
          ttm_revenue_min?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          acquisition_goal?:
            | Database["public"]["Enums"]["acquisition_goal"]
            | null
          annual_profit?: string | null
          annual_revenue?: string | null
          asking_price_max?: number | null
          asking_price_min?: number | null
          business_type?: Database["public"]["Enums"]["business_type"] | null
          company_name?: string | null
          completed_at?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          ideal_business_types?:
            | Database["public"]["Enums"]["business_type"][]
            | null
          industries_of_interest?: string[] | null
          linkedin_url?: string | null
          owns_business?: boolean | null
          phone_number?: string | null
          preferred_tech_stacks?: string[] | null
          profit_multiple_max?: number | null
          profit_multiple_min?: number | null
          referral_other_details?: string | null
          referral_source?:
            | Database["public"]["Enums"]["referral_source"]
            | null
          ttm_profit_max?: number | null
          ttm_profit_min?: number | null
          ttm_revenue_max?: number | null
          ttm_revenue_min?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          onboarding_completed: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          onboarding_completed?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          onboarding_completed?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      log_security_event: {
        Args: { p_event_data?: Json; p_event_type: string; p_user_id?: string }
        Returns: string
      }
      user_has_deal_access: {
        Args: { deal_uuid: string; user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      acquisition_goal:
        | "buy_businesses"
        | "minority_partner"
        | "explore_options"
      business_type: "saas" | "ecom" | "agency" | "other"
      deal_status: "active" | "archived" | "draft"
      document_tag:
        | "cim"
        | "nda"
        | "financials"
        | "buyer_notes"
        | "legal"
        | "due_diligence"
        | "other"
      referral_source: "referral" | "social_media" | "search" | "other"
      user_role: "admin" | "editor" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      acquisition_goal: [
        "buy_businesses",
        "minority_partner",
        "explore_options",
      ],
      business_type: ["saas", "ecom", "agency", "other"],
      deal_status: ["active", "archived", "draft"],
      document_tag: [
        "cim",
        "nda",
        "financials",
        "buyer_notes",
        "legal",
        "due_diligence",
        "other",
      ],
      referral_source: ["referral", "social_media", "search", "other"],
      user_role: ["admin", "editor", "viewer"],
    },
  },
} as const
