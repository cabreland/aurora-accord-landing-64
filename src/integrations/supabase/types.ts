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
      companies: {
        Row: {
          asking_price: string | null
          created_at: string
          ebitda: string | null
          fit_score: number | null
          highlights: Json | null
          id: string
          industry: string | null
          is_draft: boolean
          is_published: boolean
          location: string | null
          name: string
          owner_id: string | null
          passcode: string | null
          priority: Database["public"]["Enums"]["priority_level"] | null
          publish_at: string | null
          revenue: string | null
          risks: Json | null
          stage: Database["public"]["Enums"]["company_stage"] | null
          summary: string | null
          teaser_payload: Json | null
          updated_at: string
        }
        Insert: {
          asking_price?: string | null
          created_at?: string
          ebitda?: string | null
          fit_score?: number | null
          highlights?: Json | null
          id?: string
          industry?: string | null
          is_draft?: boolean
          is_published?: boolean
          location?: string | null
          name: string
          owner_id?: string | null
          passcode?: string | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          publish_at?: string | null
          revenue?: string | null
          risks?: Json | null
          stage?: Database["public"]["Enums"]["company_stage"] | null
          summary?: string | null
          teaser_payload?: Json | null
          updated_at?: string
        }
        Update: {
          asking_price?: string | null
          created_at?: string
          ebitda?: string | null
          fit_score?: number | null
          highlights?: Json | null
          id?: string
          industry?: string | null
          is_draft?: boolean
          is_published?: boolean
          location?: string | null
          name?: string
          owner_id?: string | null
          passcode?: string | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          publish_at?: string | null
          revenue?: string | null
          risks?: Json | null
          stage?: Database["public"]["Enums"]["company_stage"] | null
          summary?: string | null
          teaser_payload?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      company_custom_fields: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          is_required: boolean | null
          key: string
          label: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          key: string
          label: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          key?: string
          label?: string
          type?: string
        }
        Relationships: []
      }
      company_custom_values: {
        Row: {
          company_id: string
          field_id: string
          value: Json | null
        }
        Insert: {
          company_id: string
          field_id: string
          value?: Json | null
        }
        Update: {
          company_id?: string
          field_id?: string
          value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "company_custom_values_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_custom_values_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "public_company_teasers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_custom_values_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "company_custom_fields"
            referencedColumns: ["id"]
          },
        ]
      }
      company_growth_opps: {
        Row: {
          company_id: string
          growth_id: string
          note: string | null
        }
        Insert: {
          company_id: string
          growth_id: string
          note?: string | null
        }
        Update: {
          company_id?: string
          growth_id?: string
          note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_growth_opps_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_growth_opps_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "public_company_teasers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_growth_opps_growth_id_fkey"
            columns: ["growth_id"]
            isOneToOne: false
            referencedRelation: "growth_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      company_nda_acceptances: {
        Row: {
          accepted_at: string
          company_id: string
          id: string
          ip_address: unknown | null
          nda_version: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string
          company_id: string
          id?: string
          ip_address?: unknown | null
          nda_version?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string
          company_id?: string
          id?: string
          ip_address?: unknown | null
          nda_version?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_nda_acceptances_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_nda_acceptances_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "public_company_teasers"
            referencedColumns: ["id"]
          },
        ]
      }
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
          company_id: string | null
          company_name: string
          created_at: string
          created_by: string
          description: string | null
          ebitda: string | null
          id: string
          industry: string | null
          location: string | null
          priority: string
          revenue: string | null
          status: Database["public"]["Enums"]["deal_status"]
          title: string
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          company_name: string
          created_at?: string
          created_by: string
          description?: string | null
          ebitda?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          priority?: string
          revenue?: string | null
          status?: Database["public"]["Enums"]["deal_status"]
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          company_name?: string
          created_at?: string
          created_by?: string
          description?: string | null
          ebitda?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          priority?: string
          revenue?: string | null
          status?: Database["public"]["Enums"]["deal_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "public_company_teasers"
            referencedColumns: ["id"]
          },
        ]
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
      growth_opportunities: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          tags: string[] | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          tags?: string[] | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      investor_invitations: {
        Row: {
          accepted_at: string | null
          access_type: Database["public"]["Enums"]["access_type"]
          company_name: string | null
          created_at: string
          deal_id: string | null
          deal_ids: Json | null
          email: string
          expires_at: string
          id: string
          investor_name: string | null
          invitation_code: string
          invited_at: string
          invited_by: string
          master_nda_signed: boolean
          notes: string | null
          portfolio_access: boolean
          status: Database["public"]["Enums"]["invitation_status"]
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          access_type?: Database["public"]["Enums"]["access_type"]
          company_name?: string | null
          created_at?: string
          deal_id?: string | null
          deal_ids?: Json | null
          email: string
          expires_at: string
          id?: string
          investor_name?: string | null
          invitation_code: string
          invited_at?: string
          invited_by: string
          master_nda_signed?: boolean
          notes?: string | null
          portfolio_access?: boolean
          status?: Database["public"]["Enums"]["invitation_status"]
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          access_type?: Database["public"]["Enums"]["access_type"]
          company_name?: string | null
          created_at?: string
          deal_id?: string | null
          deal_ids?: Json | null
          email?: string
          expires_at?: string
          id?: string
          investor_name?: string | null
          invitation_code?: string
          invited_at?: string
          invited_by?: string
          master_nda_signed?: boolean
          notes?: string | null
          portfolio_access?: boolean
          status?: Database["public"]["Enums"]["invitation_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_investor_invitations_deal"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_investor_invitations_invited_by"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      nda_signatures: {
        Row: {
          company_id: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          invitation_id: string | null
          ip_address: unknown | null
          signature_data: Json
          signed_at: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          invitation_id?: string | null
          ip_address?: unknown | null
          signature_data: Json
          signed_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          invitation_id?: string | null
          ip_address?: unknown | null
          signature_data?: Json
          signed_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      registration_settings: {
        Row: {
          category: string
          created_at: string
          description: string | null
          display_name: string
          id: string
          setting_key: string
          setting_type: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          setting_key: string
          setting_type?: string
          setting_value: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          setting_key?: string
          setting_type?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
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
      security_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          severity: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          category: string | null
          description: string | null
          is_sensitive: boolean | null
          key: string
          setting_type: string | null
          updated_at: string | null
          value: Json | null
        }
        Insert: {
          category?: string | null
          description?: string | null
          is_sensitive?: boolean | null
          key: string
          setting_type?: string | null
          updated_at?: string | null
          value?: Json | null
        }
        Update: {
          category?: string | null
          description?: string | null
          is_sensitive?: boolean | null
          key?: string
          setting_type?: string | null
          updated_at?: string | null
          value?: Json | null
        }
        Relationships: []
      }
      settings_history: {
        Row: {
          change_reason: string | null
          changed_at: string
          changed_by: string | null
          id: string
          new_value: Json | null
          old_value: Json | null
          setting_key: string
        }
        Insert: {
          change_reason?: string | null
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          setting_key: string
        }
        Update: {
          change_reason?: string | null
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          setting_key?: string
        }
        Relationships: []
      }
      user_activity_log: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          ip_address: unknown | null
          is_active: boolean
          last_activity: string
          location_data: Json | null
          session_token: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean
          last_activity?: string
          location_data?: Json | null
          session_token: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean
          last_activity?: string
          location_data?: Json | null
          session_token?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      public_company_teasers: {
        Row: {
          asking_price: string | null
          created_at: string | null
          ebitda: string | null
          fit_score: number | null
          id: string | null
          industry: string | null
          is_published: boolean | null
          location: string | null
          name: string | null
          priority: Database["public"]["Enums"]["priority_level"] | null
          publish_at: string | null
          revenue: string | null
          stage: Database["public"]["Enums"]["company_stage"] | null
          summary: string | null
          teaser_payload: Json | null
          updated_at: string | null
        }
        Insert: {
          asking_price?: string | null
          created_at?: string | null
          ebitda?: string | null
          fit_score?: number | null
          id?: string | null
          industry?: string | null
          is_published?: boolean | null
          location?: string | null
          name?: string | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          publish_at?: string | null
          revenue?: string | null
          stage?: Database["public"]["Enums"]["company_stage"] | null
          summary?: string | null
          teaser_payload?: Json | null
          updated_at?: string | null
        }
        Update: {
          asking_price?: string | null
          created_at?: string | null
          ebitda?: string | null
          fit_score?: number | null
          id?: string | null
          industry?: string | null
          is_published?: boolean | null
          location?: string | null
          name?: string | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          publish_at?: string | null
          revenue?: string | null
          stage?: Database["public"]["Enums"]["company_stage"] | null
          summary?: string | null
          teaser_payload?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_company_nda: {
        Args: { p_company_id: string }
        Returns: Json
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      investor_has_deal_access: {
        Args: { p_deal_id: string; p_investor_email: string }
        Returns: boolean
      }
      log_security_event: {
        Args: { p_event_data?: Json; p_event_type: string; p_user_id?: string }
        Returns: string
      }
      log_user_activity: {
        Args: {
          p_action: string
          p_metadata?: Json
          p_resource_id?: string
          p_resource_type?: string
        }
        Returns: string
      }
      record_security_event: {
        Args: { p_event_data?: Json; p_event_type: string; p_severity?: string }
        Returns: string
      }
      user_has_accepted_nda: {
        Args: { p_company_id: string; p_user_id: string }
        Returns: boolean
      }
      user_has_deal_access: {
        Args: { deal_uuid: string; user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      access_type: "single" | "multiple" | "portfolio" | "custom"
      acquisition_goal:
        | "buy_businesses"
        | "minority_partner"
        | "explore_options"
      business_type: "saas" | "ecom" | "agency" | "other"
      company_stage: "teaser" | "discovery" | "dd" | "closing"
      deal_status: "active" | "archived" | "draft"
      document_tag:
        | "cim"
        | "nda"
        | "financials"
        | "buyer_notes"
        | "legal"
        | "due_diligence"
        | "other"
      invitation_status: "pending" | "accepted" | "expired" | "revoked"
      priority_level: "low" | "medium" | "high"
      referral_source: "referral" | "social_media" | "search" | "other"
      user_role: "admin" | "editor" | "viewer" | "super_admin"
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
      access_type: ["single", "multiple", "portfolio", "custom"],
      acquisition_goal: [
        "buy_businesses",
        "minority_partner",
        "explore_options",
      ],
      business_type: ["saas", "ecom", "agency", "other"],
      company_stage: ["teaser", "discovery", "dd", "closing"],
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
      invitation_status: ["pending", "accepted", "expired", "revoked"],
      priority_level: ["low", "medium", "high"],
      referral_source: ["referral", "social_media", "search", "other"],
      user_role: ["admin", "editor", "viewer", "super_admin"],
    },
  },
} as const
