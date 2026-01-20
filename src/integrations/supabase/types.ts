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
      access_requests: {
        Row: {
          company_id: string
          created_at: string
          current_level: string
          id: string
          reason: string
          requested_at: string
          requested_level: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          current_level: string
          id?: string
          reason: string
          requested_at?: string
          requested_level: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          current_level?: string
          id?: string
          reason?: string
          requested_at?: string
          requested_level?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_with_custom"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_with_growth"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "public_company_teasers"
            referencedColumns: ["id"]
          },
        ]
      }
      call_requests: {
        Row: {
          additional_message: string | null
          alternative_times: string | null
          created_at: string | null
          deal_id: string | null
          id: string
          investor_id: string | null
          preferred_date: string | null
          preferred_time: string | null
          scheduled_at: string | null
          scheduled_by: string | null
          status: string | null
        }
        Insert: {
          additional_message?: string | null
          alternative_times?: string | null
          created_at?: string | null
          deal_id?: string | null
          id?: string
          investor_id?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          scheduled_at?: string | null
          scheduled_by?: string | null
          status?: string | null
        }
        Update: {
          additional_message?: string | null
          alternative_times?: string | null
          created_at?: string | null
          deal_id?: string | null
          id?: string
          investor_id?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          scheduled_at?: string | null
          scheduled_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_requests_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
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
            referencedRelation: "company_with_custom"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_custom_values_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_with_growth"
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
            referencedRelation: "company_with_custom"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_growth_opps_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_with_growth"
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
          expires_at: string | null
          id: string
          ip_address: unknown
          nda_content: string | null
          nda_version: string | null
          signature: string | null
          signer_company: string | null
          signer_email: string | null
          signer_name: string | null
          status: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string
          company_id: string
          expires_at?: string | null
          id?: string
          ip_address?: unknown
          nda_content?: string | null
          nda_version?: string | null
          signature?: string | null
          signer_company?: string | null
          signer_email?: string | null
          signer_name?: string | null
          status?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string
          company_id?: string
          expires_at?: string | null
          id?: string
          ip_address?: unknown
          nda_content?: string | null
          nda_version?: string | null
          signature?: string | null
          signer_company?: string | null
          signer_email?: string | null
          signer_name?: string | null
          status?: string | null
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
            referencedRelation: "company_with_custom"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_nda_acceptances_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_with_growth"
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
      conversation_messages: {
        Row: {
          conversation_id: string
          created_at: string | null
          id: string
          message_text: string
          message_type: string | null
          metadata: Json | null
          read_at: string | null
          sender_id: string
          sender_type: string
        }
        Insert: {
          conversation_id: string
          created_at?: string | null
          id?: string
          message_text: string
          message_type?: string | null
          metadata?: Json | null
          read_at?: string | null
          sender_id: string
          sender_type: string
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          id?: string
          message_text?: string
          message_type?: string | null
          metadata?: Json | null
          read_at?: string | null
          sender_id?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          archived_at: string | null
          assigned_to: string | null
          channel: string | null
          created_at: string | null
          deal_id: string | null
          deal_name: string | null
          id: string
          investor_id: string
          last_message_at: string | null
          priority: string | null
          status: string | null
          subject: string
          unread_count_broker: number | null
          unread_count_investor: number | null
          updated_at: string | null
        }
        Insert: {
          archived_at?: string | null
          assigned_to?: string | null
          channel?: string | null
          created_at?: string | null
          deal_id?: string | null
          deal_name?: string | null
          id?: string
          investor_id: string
          last_message_at?: string | null
          priority?: string | null
          status?: string | null
          subject: string
          unread_count_broker?: number | null
          unread_count_investor?: number | null
          updated_at?: string | null
        }
        Update: {
          archived_at?: string | null
          assigned_to?: string | null
          channel?: string | null
          created_at?: string | null
          deal_id?: string | null
          deal_name?: string | null
          id?: string
          investor_id?: string
          last_message_at?: string | null
          priority?: string | null
          status?: string | null
          subject?: string
          unread_count_broker?: number | null
          unread_count_investor?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "company_with_custom"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "company_with_growth"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "public_company_teasers"
            referencedColumns: ["id"]
          },
        ]
      }
      data_room_activity: {
        Row: {
          action_type: string
          created_at: string | null
          deal_id: string | null
          details: Json | null
          document_id: string | null
          folder_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          deal_id?: string | null
          details?: Json | null
          document_id?: string | null
          folder_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          deal_id?: string | null
          details?: Json | null
          document_id?: string | null
          folder_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_room_activity_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_room_activity_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "data_room_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_room_activity_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "data_room_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      data_room_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          index_number: number
          is_active: boolean | null
          name: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          index_number: number
          is_active?: boolean | null
          name: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          index_number?: number
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      data_room_documents: {
        Row: {
          approved_at: string | null
          created_at: string | null
          deal_id: string | null
          download_count: number | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          file_url: string | null
          folder_id: string | null
          id: string
          index_number: string | null
          linked_request_ids: string[] | null
          metadata: Json | null
          mime_type: string | null
          rejection_reason: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
          uploaded_by: string | null
          version: number | null
          view_count: number | null
        }
        Insert: {
          approved_at?: string | null
          created_at?: string | null
          deal_id?: string | null
          download_count?: number | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          folder_id?: string | null
          id?: string
          index_number?: string | null
          linked_request_ids?: string[] | null
          metadata?: Json | null
          mime_type?: string | null
          rejection_reason?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          version?: number | null
          view_count?: number | null
        }
        Update: {
          approved_at?: string | null
          created_at?: string | null
          deal_id?: string | null
          download_count?: number | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          folder_id?: string | null
          id?: string
          index_number?: string | null
          linked_request_ids?: string[] | null
          metadata?: Json | null
          mime_type?: string | null
          rejection_reason?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          version?: number | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "data_room_documents_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_room_documents_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "data_room_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      data_room_folders: {
        Row: {
          category_id: string | null
          completion_percentage: number | null
          created_at: string | null
          deal_id: string | null
          description: string | null
          id: string
          index_number: string
          is_not_applicable: boolean | null
          is_required: boolean | null
          name: string
          parent_folder_id: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          deal_id?: string | null
          description?: string | null
          id?: string
          index_number: string
          is_not_applicable?: boolean | null
          is_required?: boolean | null
          name: string
          parent_folder_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          deal_id?: string | null
          description?: string | null
          id?: string
          index_number?: string
          is_not_applicable?: boolean | null
          is_required?: boolean | null
          name?: string
          parent_folder_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_room_folders_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "data_room_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_room_folders_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_room_folders_parent_folder_id_fkey"
            columns: ["parent_folder_id"]
            isOneToOne: false
            referencedRelation: "data_room_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      data_room_permissions: {
        Row: {
          can_approve: boolean | null
          can_delete: boolean | null
          can_download: boolean | null
          can_upload: boolean | null
          created_at: string | null
          deal_id: string | null
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          can_approve?: boolean | null
          can_delete?: boolean | null
          can_download?: boolean | null
          can_upload?: boolean | null
          created_at?: string | null
          deal_id?: string | null
          id?: string
          role: string
          user_id?: string | null
        }
        Update: {
          can_approve?: boolean | null
          can_delete?: boolean | null
          can_download?: boolean | null
          can_upload?: boolean | null
          created_at?: string | null
          deal_id?: string | null
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_room_permissions_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      data_room_templates: {
        Row: {
          created_at: string | null
          description: string | null
          folder_structure: Json
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          folder_structure: Json
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          folder_structure?: Json
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      deal_activities: {
        Row: {
          activity_type: Database["public"]["Enums"]["deal_activity_type"]
          created_at: string
          deal_id: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["deal_activity_type"]
          created_at?: string
          deal_id: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["deal_activity_type"]
          created_at?: string
          deal_id?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_activities_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
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
      deal_interests: {
        Row: {
          created_at: string | null
          deal_id: string | null
          id: string
          investor_id: string | null
          notes: string | null
        }
        Insert: {
          created_at?: string | null
          deal_id?: string | null
          id?: string
          investor_id?: string | null
          notes?: string | null
        }
        Update: {
          created_at?: string | null
          deal_id?: string | null
          id?: string
          investor_id?: string | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_interests_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_requests: {
        Row: {
          asked_by: string | null
          assigned_to: string | null
          category: string
          created_at: string
          deal_id: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          asked_by?: string | null
          assigned_to?: string | null
          category?: string
          created_at?: string
          deal_id: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          asked_by?: string | null
          assigned_to?: string | null
          category?: string
          created_at?: string
          deal_id?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_requests_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_stage_history: {
        Row: {
          created_at: string
          deal_id: string
          duration_days: number | null
          entered_at: string
          exited_at: string | null
          id: string
          stage: string
          trigger_event: string | null
          triggered_by: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          deal_id: string
          duration_days?: number | null
          entered_at?: string
          exited_at?: string | null
          id?: string
          stage: string
          trigger_event?: string | null
          triggered_by?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          deal_id?: string
          duration_days?: number | null
          entered_at?: string
          exited_at?: string | null
          id?: string
          stage?: string
          trigger_event?: string | null
          triggered_by?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_stage_history_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_team_members: {
        Row: {
          added_at: string
          added_by: string | null
          deal_id: string
          id: string
          last_active: string | null
          permissions: Json
          role: Database["public"]["Enums"]["deal_team_role"]
          user_id: string
        }
        Insert: {
          added_at?: string
          added_by?: string | null
          deal_id: string
          id?: string
          last_active?: string | null
          permissions?: Json
          role?: Database["public"]["Enums"]["deal_team_role"]
          user_id: string
        }
        Update: {
          added_at?: string
          added_by?: string | null
          deal_id?: string
          id?: string
          last_active?: string | null
          permissions?: Json
          role?: Database["public"]["Enums"]["deal_team_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_team_members_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_watchlist: {
        Row: {
          created_at: string
          deal_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deal_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deal_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_watchlist_company_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_watchlist_company_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "company_with_custom"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_watchlist_company_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "company_with_growth"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_watchlist_company_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "public_company_teasers"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          approval_notes: string | null
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          asking_price: string | null
          cac_ltv_ratio: string | null
          closed_at: string | null
          company_id: string | null
          company_name: string
          company_overview: string | null
          created_at: string
          created_by: string
          current_stage: string | null
          customer_count: string | null
          data_room_complete_at: string | null
          deal_published_at: string | null
          deal_status: string | null
          description: string | null
          ebitda: string | null
          first_nda_signed_at: string | null
          founded_year: number | null
          founder_name: string | null
          founder_title: string | null
          founders_message: string | null
          growth_opportunities: Json | null
          growth_rate: string | null
          id: string
          ideal_buyer_profile: string | null
          industry: string | null
          is_test_data: boolean | null
          listing_approved_at: string | null
          listing_received_at: string | null
          location: string | null
          loi_accepted_at: string | null
          loi_submitted_at: string | null
          market_trends_alignment: string | null
          priority: string
          profit_margin: string | null
          purchase_agreement_signed_at: string | null
          reason_for_sale: string | null
          recurring_revenue: string | null
          revenue: string | null
          revision_notes: string | null
          revision_requested_at: string | null
          rollup_potential: string | null
          stage_entered_at: string | null
          status: Database["public"]["Enums"]["deal_status"]
          submitted_for_review_at: string | null
          team_size: string | null
          title: string
          updated_at: string
          workflow_phase: Database["public"]["Enums"]["workflow_phase"] | null
        }
        Insert: {
          approval_notes?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          asking_price?: string | null
          cac_ltv_ratio?: string | null
          closed_at?: string | null
          company_id?: string | null
          company_name: string
          company_overview?: string | null
          created_at?: string
          created_by: string
          current_stage?: string | null
          customer_count?: string | null
          data_room_complete_at?: string | null
          deal_published_at?: string | null
          deal_status?: string | null
          description?: string | null
          ebitda?: string | null
          first_nda_signed_at?: string | null
          founded_year?: number | null
          founder_name?: string | null
          founder_title?: string | null
          founders_message?: string | null
          growth_opportunities?: Json | null
          growth_rate?: string | null
          id?: string
          ideal_buyer_profile?: string | null
          industry?: string | null
          is_test_data?: boolean | null
          listing_approved_at?: string | null
          listing_received_at?: string | null
          location?: string | null
          loi_accepted_at?: string | null
          loi_submitted_at?: string | null
          market_trends_alignment?: string | null
          priority?: string
          profit_margin?: string | null
          purchase_agreement_signed_at?: string | null
          reason_for_sale?: string | null
          recurring_revenue?: string | null
          revenue?: string | null
          revision_notes?: string | null
          revision_requested_at?: string | null
          rollup_potential?: string | null
          stage_entered_at?: string | null
          status?: Database["public"]["Enums"]["deal_status"]
          submitted_for_review_at?: string | null
          team_size?: string | null
          title: string
          updated_at?: string
          workflow_phase?: Database["public"]["Enums"]["workflow_phase"] | null
        }
        Update: {
          approval_notes?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          asking_price?: string | null
          cac_ltv_ratio?: string | null
          closed_at?: string | null
          company_id?: string | null
          company_name?: string
          company_overview?: string | null
          created_at?: string
          created_by?: string
          current_stage?: string | null
          customer_count?: string | null
          data_room_complete_at?: string | null
          deal_published_at?: string | null
          deal_status?: string | null
          description?: string | null
          ebitda?: string | null
          first_nda_signed_at?: string | null
          founded_year?: number | null
          founder_name?: string | null
          founder_title?: string | null
          founders_message?: string | null
          growth_opportunities?: Json | null
          growth_rate?: string | null
          id?: string
          ideal_buyer_profile?: string | null
          industry?: string | null
          is_test_data?: boolean | null
          listing_approved_at?: string | null
          listing_received_at?: string | null
          location?: string | null
          loi_accepted_at?: string | null
          loi_submitted_at?: string | null
          market_trends_alignment?: string | null
          priority?: string
          profit_margin?: string | null
          purchase_agreement_signed_at?: string | null
          reason_for_sale?: string | null
          recurring_revenue?: string | null
          revenue?: string | null
          revision_notes?: string | null
          revision_requested_at?: string | null
          rollup_potential?: string | null
          stage_entered_at?: string | null
          status?: Database["public"]["Enums"]["deal_status"]
          submitted_for_review_at?: string | null
          team_size?: string | null
          title?: string
          updated_at?: string
          workflow_phase?: Database["public"]["Enums"]["workflow_phase"] | null
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
            referencedRelation: "company_with_custom"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_with_growth"
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
      diligence_categories: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          name: string
          order_index: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          order_index?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          order_index?: number | null
        }
        Relationships: []
      }
      diligence_comments: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          comment_type: string
          content: string
          created_at: string
          id: string
          is_from_customer: boolean
          parent_comment_id: string | null
          request_id: string
          sent_to_customer: boolean
          sent_to_customer_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          comment_type?: string
          content: string
          created_at?: string
          id?: string
          is_from_customer?: boolean
          parent_comment_id?: string | null
          request_id: string
          sent_to_customer?: boolean
          sent_to_customer_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          comment_type?: string
          content?: string
          created_at?: string
          id?: string
          is_from_customer?: boolean
          parent_comment_id?: string | null
          request_id?: string
          sent_to_customer?: boolean
          sent_to_customer_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diligence_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "diligence_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diligence_comments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "diligence_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      diligence_documents: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string | null
          id: string
          request_id: string
          storage_path: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          request_id: string
          storage_path: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          request_id?: string
          storage_path?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "diligence_documents_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "diligence_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      diligence_notifications: {
        Row: {
          created_at: string | null
          deal_id: string | null
          id: string
          message: string
          read: boolean | null
          request_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deal_id?: string | null
          id?: string
          message: string
          read?: boolean | null
          request_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          deal_id?: string | null
          id?: string
          message?: string
          read?: boolean | null
          request_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diligence_notifications_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diligence_notifications_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "diligence_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      diligence_request_views: {
        Row: {
          created_at: string
          id: string
          last_viewed_at: string
          request_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_viewed_at?: string
          request_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_viewed_at?: string
          request_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diligence_request_views_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "diligence_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      diligence_requests: {
        Row: {
          assignee_id: string | null
          assignee_ids: string[] | null
          category_id: string
          completion_date: string | null
          created_at: string
          created_by: string
          deal_id: string
          description: string | null
          document_ids: string[] | null
          due_date: string | null
          id: string
          last_activity_at: string | null
          notes: string | null
          order_index: number | null
          priority: Database["public"]["Enums"]["diligence_priority"]
          reviewer_ids: string[] | null
          risk_score: number | null
          stage: string | null
          status: Database["public"]["Enums"]["diligence_status"]
          subcategory_id: string | null
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          assignee_id?: string | null
          assignee_ids?: string[] | null
          category_id: string
          completion_date?: string | null
          created_at?: string
          created_by: string
          deal_id: string
          description?: string | null
          document_ids?: string[] | null
          due_date?: string | null
          id?: string
          last_activity_at?: string | null
          notes?: string | null
          order_index?: number | null
          priority?: Database["public"]["Enums"]["diligence_priority"]
          reviewer_ids?: string[] | null
          risk_score?: number | null
          stage?: string | null
          status?: Database["public"]["Enums"]["diligence_status"]
          subcategory_id?: string | null
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          assignee_id?: string | null
          assignee_ids?: string[] | null
          category_id?: string
          completion_date?: string | null
          created_at?: string
          created_by?: string
          deal_id?: string
          description?: string | null
          document_ids?: string[] | null
          due_date?: string | null
          id?: string
          last_activity_at?: string | null
          notes?: string | null
          order_index?: number | null
          priority?: Database["public"]["Enums"]["diligence_priority"]
          reviewer_ids?: string[] | null
          risk_score?: number | null
          stage?: string | null
          status?: Database["public"]["Enums"]["diligence_status"]
          subcategory_id?: string | null
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diligence_requests_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "diligence_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diligence_requests_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diligence_requests_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "diligence_subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      diligence_subcategories: {
        Row: {
          category_id: string
          created_at: string
          id: string
          name: string
          order_index: number | null
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          name: string
          order_index?: number | null
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          name?: string
          order_index?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "diligence_subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "diligence_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      diligence_templates: {
        Row: {
          created_at: string
          created_by: string | null
          deal_type: string | null
          description: string | null
          id: string
          industry: string | null
          is_default: boolean | null
          name: string
          template_data: Json
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deal_type?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          is_default?: boolean | null
          name: string
          template_data?: Json
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deal_type?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          is_default?: boolean | null
          name?: string
          template_data?: Json
        }
        Relationships: []
      }
      document_views: {
        Row: {
          action: string
          document_id: string
          id: string
          ip_address: string | null
          session_data: Json | null
          user_agent: string | null
          user_id: string | null
          viewed_at: string
        }
        Insert: {
          action: string
          document_id: string
          id?: string
          ip_address?: string | null
          session_data?: Json | null
          user_agent?: string | null
          user_id?: string | null
          viewed_at?: string
        }
        Update: {
          action?: string
          document_id?: string
          id?: string
          ip_address?: string | null
          session_data?: Json | null
          user_agent?: string | null
          user_id?: string | null
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_views_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          confidentiality_level: string | null
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
          confidentiality_level?: string | null
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
          confidentiality_level?: string | null
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
      financing_activity: {
        Row: {
          activity_type: string
          application_id: string
          condition_id: string | null
          created_at: string | null
          description: string | null
          document_id: string | null
          id: string
          metadata: Json | null
          title: string
          user_id: string | null
        }
        Insert: {
          activity_type: string
          application_id: string
          condition_id?: string | null
          created_at?: string | null
          description?: string | null
          document_id?: string | null
          id?: string
          metadata?: Json | null
          title: string
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          application_id?: string
          condition_id?: string | null
          created_at?: string | null
          description?: string | null
          document_id?: string | null
          id?: string
          metadata?: Json | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financing_activity_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "financing_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financing_activity_condition_id_fkey"
            columns: ["condition_id"]
            isOneToOne: false
            referencedRelation: "financing_conditions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financing_activity_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "financing_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      financing_applications: {
        Row: {
          amortization_months: number | null
          application_number: string | null
          approved_at: string | null
          assigned_to: string | null
          closing_date: string | null
          created_at: string | null
          created_by: string
          days_in_stage: number | null
          deal_id: string
          decline_reason: string | null
          down_payment_percent: number | null
          financing_type: Database["public"]["Enums"]["financing_type"]
          funded_at: string | null
          health_score: number | null
          id: string
          interest_rate: number | null
          internal_notes: string | null
          is_primary: boolean | null
          lender_id: string | null
          loan_amount: number | null
          partner_id: string | null
          priority: string | null
          stage: Database["public"]["Enums"]["financing_stage"]
          stage_entered_at: string | null
          submitted_at: string | null
          term_months: number | null
          updated_at: string | null
        }
        Insert: {
          amortization_months?: number | null
          application_number?: string | null
          approved_at?: string | null
          assigned_to?: string | null
          closing_date?: string | null
          created_at?: string | null
          created_by: string
          days_in_stage?: number | null
          deal_id: string
          decline_reason?: string | null
          down_payment_percent?: number | null
          financing_type?: Database["public"]["Enums"]["financing_type"]
          funded_at?: string | null
          health_score?: number | null
          id?: string
          interest_rate?: number | null
          internal_notes?: string | null
          is_primary?: boolean | null
          lender_id?: string | null
          loan_amount?: number | null
          partner_id?: string | null
          priority?: string | null
          stage?: Database["public"]["Enums"]["financing_stage"]
          stage_entered_at?: string | null
          submitted_at?: string | null
          term_months?: number | null
          updated_at?: string | null
        }
        Update: {
          amortization_months?: number | null
          application_number?: string | null
          approved_at?: string | null
          assigned_to?: string | null
          closing_date?: string | null
          created_at?: string | null
          created_by?: string
          days_in_stage?: number | null
          deal_id?: string
          decline_reason?: string | null
          down_payment_percent?: number | null
          financing_type?: Database["public"]["Enums"]["financing_type"]
          funded_at?: string | null
          health_score?: number | null
          id?: string
          interest_rate?: number | null
          internal_notes?: string | null
          is_primary?: boolean | null
          lender_id?: string | null
          loan_amount?: number | null
          partner_id?: string | null
          priority?: string | null
          stage?: Database["public"]["Enums"]["financing_stage"]
          stage_entered_at?: string | null
          submitted_at?: string | null
          term_months?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financing_applications_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financing_applications_lender_id_fkey"
            columns: ["lender_id"]
            isOneToOne: false
            referencedRelation: "lenders"
            referencedColumns: ["id"]
          },
        ]
      }
      financing_conditions: {
        Row: {
          application_id: string
          assigned_to: string | null
          category: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          notes: string | null
          order_index: number | null
          status: Database["public"]["Enums"]["condition_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          application_id: string
          assigned_to?: string | null
          category?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          order_index?: number | null
          status?: Database["public"]["Enums"]["condition_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          application_id?: string
          assigned_to?: string | null
          category?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          order_index?: number | null
          status?: Database["public"]["Enums"]["condition_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financing_conditions_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "financing_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      financing_documents: {
        Row: {
          application_id: string
          category: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          file_name: string | null
          file_path: string | null
          file_size: number | null
          file_type: string | null
          id: string
          name: string
          notes: string | null
          received_at: string | null
          rejection_reason: string | null
          requested_at: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["financing_doc_status"] | null
          updated_at: string | null
        }
        Insert: {
          application_id: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          name: string
          notes?: string | null
          received_at?: string | null
          rejection_reason?: string | null
          requested_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["financing_doc_status"] | null
          updated_at?: string | null
        }
        Update: {
          application_id?: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          name?: string
          notes?: string | null
          received_at?: string | null
          rejection_reason?: string | null
          requested_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["financing_doc_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financing_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "financing_applications"
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
      info_requests: {
        Row: {
          additional_notes: string | null
          created_at: string | null
          deal_id: string | null
          fulfilled_at: string | null
          fulfilled_by: string | null
          id: string
          investor_id: string | null
          requested_items: string[]
          status: string | null
        }
        Insert: {
          additional_notes?: string | null
          created_at?: string | null
          deal_id?: string | null
          fulfilled_at?: string | null
          fulfilled_by?: string | null
          id?: string
          investor_id?: string | null
          requested_items: string[]
          status?: string | null
        }
        Update: {
          additional_notes?: string | null
          created_at?: string | null
          deal_id?: string | null
          fulfilled_at?: string | null
          fulfilled_by?: string | null
          id?: string
          investor_id?: string | null
          requested_items?: string[]
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "info_requests_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
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
      investor_messages: {
        Row: {
          created_at: string
          deal_id: string | null
          id: string
          message: string
          read_at: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          deal_id?: string | null
          id?: string
          message: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          deal_id?: string | null
          id?: string
          message?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investor_messages_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_profiles: {
        Row: {
          communication_preference: string
          company_name: string
          created_at: string | null
          deal_breakers: string[] | null
          ebitda_range_preference: string
          email: string
          full_name: string
          funding_type: string
          geographic_preference: string
          id: string
          linkedin_url: string | null
          max_investment: string
          min_investment: string
          must_haves: string[] | null
          onboarding_completed_at: string | null
          phone: string
          pre_qualified: string
          primary_goal: string
          referral_details: string | null
          referral_source: string | null
          revenue_range_preference: string
          target_industries: string[]
          timeline_to_close: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          communication_preference: string
          company_name: string
          created_at?: string | null
          deal_breakers?: string[] | null
          ebitda_range_preference: string
          email: string
          full_name: string
          funding_type: string
          geographic_preference: string
          id?: string
          linkedin_url?: string | null
          max_investment: string
          min_investment: string
          must_haves?: string[] | null
          onboarding_completed_at?: string | null
          phone: string
          pre_qualified: string
          primary_goal: string
          referral_details?: string | null
          referral_source?: string | null
          revenue_range_preference: string
          target_industries?: string[]
          timeline_to_close: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          communication_preference?: string
          company_name?: string
          created_at?: string | null
          deal_breakers?: string[] | null
          ebitda_range_preference?: string
          email?: string
          full_name?: string
          funding_type?: string
          geographic_preference?: string
          id?: string
          linkedin_url?: string | null
          max_investment?: string
          min_investment?: string
          must_haves?: string[] | null
          onboarding_completed_at?: string | null
          phone?: string
          pre_qualified?: string
          primary_goal?: string
          referral_details?: string | null
          referral_source?: string | null
          revenue_range_preference?: string
          target_industries?: string[]
          timeline_to_close?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      lenders: {
        Row: {
          avg_close_days: number | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_preferred: boolean | null
          name: string
          notes: string | null
          success_rate: number | null
          type: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          avg_close_days?: number | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_preferred?: boolean | null
          name: string
          notes?: string | null
          success_rate?: number | null
          type?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          avg_close_days?: number | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_preferred?: boolean | null
          name?: string
          notes?: string | null
          success_rate?: number | null
          type?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      nda_extension_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          nda_id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          nda_id: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          nda_id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nda_extension_tokens_nda_id_fkey"
            columns: ["nda_id"]
            isOneToOne: false
            referencedRelation: "company_nda_acceptances"
            referencedColumns: ["id"]
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
          ip_address: unknown
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
          ip_address?: unknown
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
          ip_address?: unknown
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
      partner_deal_access: {
        Row: {
          access_from: string | null
          access_until: string | null
          can_answer_dd_questions: boolean | null
          can_approve_data_room: boolean | null
          can_edit_deal_info: boolean | null
          can_manage_users: boolean | null
          can_message_buyers: boolean | null
          can_upload_documents: boolean | null
          can_view_buyer_activity: boolean | null
          can_view_data_room: boolean | null
          deal_id: string
          granted_at: string | null
          granted_by: string | null
          id: string
          last_accessed_at: string | null
          partner_id: string
          partner_role: string
          revenue_share_percent: number | null
        }
        Insert: {
          access_from?: string | null
          access_until?: string | null
          can_answer_dd_questions?: boolean | null
          can_approve_data_room?: boolean | null
          can_edit_deal_info?: boolean | null
          can_manage_users?: boolean | null
          can_message_buyers?: boolean | null
          can_upload_documents?: boolean | null
          can_view_buyer_activity?: boolean | null
          can_view_data_room?: boolean | null
          deal_id: string
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          last_accessed_at?: string | null
          partner_id: string
          partner_role: string
          revenue_share_percent?: number | null
        }
        Update: {
          access_from?: string | null
          access_until?: string | null
          can_answer_dd_questions?: boolean | null
          can_approve_data_room?: boolean | null
          can_edit_deal_info?: boolean | null
          can_manage_users?: boolean | null
          can_message_buyers?: boolean | null
          can_upload_documents?: boolean | null
          can_view_buyer_activity?: boolean | null
          can_view_data_room?: boolean | null
          deal_id?: string
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          last_accessed_at?: string | null
          partner_id?: string
          partner_role?: string
          revenue_share_percent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_deal_access_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_deal_access_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "partner_deal_access_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      partner_teams: {
        Row: {
          company_name: string
          created_at: string | null
          id: string
          primary_contact_email: string
          team_name: string
          team_type: string | null
          updated_at: string | null
        }
        Insert: {
          company_name: string
          created_at?: string | null
          id?: string
          primary_contact_email: string
          team_name: string
          team_type?: string | null
          updated_at?: string | null
        }
        Update: {
          company_name?: string
          created_at?: string | null
          id?: string
          primary_contact_email?: string
          team_name?: string
          team_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          onboarding_completed: boolean | null
          onboarding_skipped: boolean | null
          partner_team_id: string | null
          profile_picture_url: string | null
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
          onboarding_skipped?: boolean | null
          partner_team_id?: string | null
          profile_picture_url?: string | null
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
          onboarding_skipped?: boolean | null
          partner_team_id?: string | null
          profile_picture_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_partner_team_id_fkey"
            columns: ["partner_team_id"]
            isOneToOne: false
            referencedRelation: "partner_teams"
            referencedColumns: ["id"]
          },
        ]
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
      request_documents: {
        Row: {
          attached_by: string | null
          created_at: string
          data_room_document_id: string | null
          document_id: string | null
          id: string
          request_id: string
        }
        Insert: {
          attached_by?: string | null
          created_at?: string
          data_room_document_id?: string | null
          document_id?: string | null
          id?: string
          request_id: string
        }
        Update: {
          attached_by?: string | null
          created_at?: string
          data_room_document_id?: string | null
          document_id?: string | null
          id?: string
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_documents_data_room_document_id_fkey"
            columns: ["data_room_document_id"]
            isOneToOne: false
            referencedRelation: "data_room_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_documents_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_documents_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "deal_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      request_responses: {
        Row: {
          created_at: string
          id: string
          request_id: string
          response_text: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          request_id: string
          response_text: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          request_id?: string
          response_text?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "request_responses_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "deal_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_log: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
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
          ip_address: unknown
          severity: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
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
      tasks: {
        Row: {
          assigned_to: string
          created_at: string
          deal_id: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: Database["public"]["Enums"]["task_priority"]
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to: string
          created_at?: string
          deal_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string
          created_at?: string
          deal_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          deal_id: string | null
          expires_at: string
          id: string
          invitation_token: string
          invitee_email: string
          invitee_name: string | null
          inviter_id: string
          permissions: Json | null
          personal_message: string | null
          role: string
          status: Database["public"]["Enums"]["team_invitation_status"]
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          deal_id?: string | null
          expires_at?: string
          id?: string
          invitation_token?: string
          invitee_email: string
          invitee_name?: string | null
          inviter_id: string
          permissions?: Json | null
          personal_message?: string | null
          role?: string
          status?: Database["public"]["Enums"]["team_invitation_status"]
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          deal_id?: string | null
          expires_at?: string
          id?: string
          invitation_token?: string
          invitee_email?: string
          invitee_name?: string | null
          inviter_id?: string
          permissions?: Json | null
          personal_message?: string | null
          role?: string
          status?: Database["public"]["Enums"]["team_invitation_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_log: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown
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
          ip_address?: unknown
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
          ip_address?: unknown
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_activity_log_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_company_access: {
        Row: {
          access_level: string
          company_id: string
          granted_at: string
          granted_by: string | null
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          access_level: string
          company_id: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          access_level?: string
          company_id?: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_company_access_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_company_access_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_with_custom"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_company_access_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_with_growth"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_company_access_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "public_company_teasers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          ip_address: unknown
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
          ip_address?: unknown
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
          ip_address?: unknown
          is_active?: boolean
          last_activity?: string
          location_data?: Json | null
          session_token?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_sessions_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      widget_settings: {
        Row: {
          ask_button_label: string | null
          auto_open_delay: number | null
          auto_open_enabled: boolean | null
          away_message: string | null
          broker_email_notifications: boolean | null
          bubble_style: string | null
          calendly_link: string | null
          call_button_label: string | null
          created_at: string | null
          enable_emojis: boolean | null
          enable_file_attachments: boolean | null
          enable_manual_scheduling: boolean | null
          enable_typing_indicators: boolean | null
          id: string
          info_button_label: string | null
          info_request_options: Json | null
          initial_greeting: string | null
          interest_button_label: string | null
          investor_email_notifications: boolean | null
          minimized_tooltip: string | null
          placeholder_text: string | null
          primary_color: string | null
          show_online_status: boolean | null
          updated_at: string | null
          updated_by: string | null
          widget_position: string | null
          widget_size: string | null
          widget_title: string | null
        }
        Insert: {
          ask_button_label?: string | null
          auto_open_delay?: number | null
          auto_open_enabled?: boolean | null
          away_message?: string | null
          broker_email_notifications?: boolean | null
          bubble_style?: string | null
          calendly_link?: string | null
          call_button_label?: string | null
          created_at?: string | null
          enable_emojis?: boolean | null
          enable_file_attachments?: boolean | null
          enable_manual_scheduling?: boolean | null
          enable_typing_indicators?: boolean | null
          id?: string
          info_button_label?: string | null
          info_request_options?: Json | null
          initial_greeting?: string | null
          interest_button_label?: string | null
          investor_email_notifications?: boolean | null
          minimized_tooltip?: string | null
          placeholder_text?: string | null
          primary_color?: string | null
          show_online_status?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
          widget_position?: string | null
          widget_size?: string | null
          widget_title?: string | null
        }
        Update: {
          ask_button_label?: string | null
          auto_open_delay?: number | null
          auto_open_enabled?: boolean | null
          away_message?: string | null
          broker_email_notifications?: boolean | null
          bubble_style?: string | null
          calendly_link?: string | null
          call_button_label?: string | null
          created_at?: string | null
          enable_emojis?: boolean | null
          enable_file_attachments?: boolean | null
          enable_manual_scheduling?: boolean | null
          enable_typing_indicators?: boolean | null
          id?: string
          info_button_label?: string | null
          info_request_options?: Json | null
          initial_greeting?: string | null
          interest_button_label?: string | null
          investor_email_notifications?: boolean | null
          minimized_tooltip?: string | null
          placeholder_text?: string | null
          primary_color?: string | null
          show_online_status?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
          widget_position?: string | null
          widget_size?: string | null
          widget_title?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      company_with_custom: {
        Row: {
          asking_price: string | null
          created_at: string | null
          custom_fields: Json | null
          ebitda: string | null
          fit_score: number | null
          highlights: Json | null
          id: string | null
          industry: string | null
          is_draft: boolean | null
          is_published: boolean | null
          location: string | null
          name: string | null
          owner_id: string | null
          passcode: string | null
          priority: Database["public"]["Enums"]["priority_level"] | null
          publish_at: string | null
          revenue: string | null
          risks: Json | null
          stage: Database["public"]["Enums"]["company_stage"] | null
          summary: string | null
          teaser_payload: Json | null
          updated_at: string | null
        }
        Relationships: []
      }
      company_with_growth: {
        Row: {
          asking_price: string | null
          created_at: string | null
          ebitda: string | null
          fit_score: number | null
          growth_opportunities: Json | null
          highlights: Json | null
          id: string | null
          industry: string | null
          is_draft: boolean | null
          is_published: boolean | null
          location: string | null
          name: string | null
          owner_id: string | null
          passcode: string | null
          priority: Database["public"]["Enums"]["priority_level"] | null
          publish_at: string | null
          revenue: string | null
          risks: Json | null
          stage: Database["public"]["Enums"]["company_stage"] | null
          summary: string | null
          teaser_payload: Json | null
          updated_at: string | null
        }
        Relationships: []
      }
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
      accept_company_nda: { Args: { p_company_id: string }; Returns: Json }
      can_access_document: {
        Args: { p_document_id: string; p_user_id: string }
        Returns: boolean
      }
      check_deal_stage_triggers: { Args: { p_deal_id: string }; Returns: Json }
      create_data_room_from_template: {
        Args: { p_deal_id: string; p_template_name: string }
        Returns: undefined
      }
      create_diligence_notification: {
        Args: {
          p_deal_id: string
          p_message: string
          p_request_id: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      expire_team_invitations: { Args: never; Returns: undefined }
      get_user_access_level: {
        Args: { p_company_id: string; p_user_id: string }
        Returns: string
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      investor_has_deal_access: {
        Args: { p_deal_id: string; p_investor_email: string }
        Returns: boolean
      }
      is_on_same_deal_team: {
        Args: { _target_user_id: string; _user_id: string }
        Returns: boolean
      }
      log_deal_activity: {
        Args: {
          p_activity_type: Database["public"]["Enums"]["deal_activity_type"]
          p_deal_id: string
          p_entity_id?: string
          p_entity_type: string
          p_metadata?: Json
        }
        Returns: string
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
      mark_diligence_request_viewed: {
        Args: { p_request_id: string }
        Returns: undefined
      }
      notify_all_assignees: {
        Args: {
          p_deal_id: string
          p_exclude_user_id?: string
          p_message: string
          p_request_id: string
          p_title: string
          p_type: string
        }
        Returns: undefined
      }
      progress_deal_stage: {
        Args: {
          p_deal_id: string
          p_new_stage: string
          p_trigger_event?: string
          p_triggered_by?: string
        }
        Returns: Json
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
      condition_status:
        | "pending"
        | "in_progress"
        | "submitted"
        | "approved"
        | "waived"
        | "rejected"
      deal_activity_type:
        | "document_uploaded"
        | "document_deleted"
        | "document_moved"
        | "document_approved"
        | "document_rejected"
        | "document_downloaded"
        | "request_created"
        | "request_updated"
        | "request_status_changed"
        | "request_completed"
        | "comment_added"
        | "team_member_added"
        | "team_member_removed"
        | "permission_changed"
        | "nda_signed"
        | "deal_stage_changed"
        | "deal_created"
        | "deal_updated"
      deal_status: "active" | "archived" | "draft"
      deal_team_role:
        | "deal_lead"
        | "analyst"
        | "external_reviewer"
        | "investor"
        | "seller"
        | "advisor"
      diligence_priority: "high" | "medium" | "low"
      diligence_status: "open" | "in_progress" | "completed" | "blocked"
      document_tag:
        | "cim"
        | "nda"
        | "financials"
        | "buyer_notes"
        | "legal"
        | "due_diligence"
        | "other"
      financing_doc_status:
        | "required"
        | "requested"
        | "received"
        | "under_review"
        | "approved"
        | "rejected"
        | "waived"
      financing_stage:
        | "pre_qualification"
        | "application_submitted"
        | "under_review"
        | "additional_docs_requested"
        | "conditional_approval"
        | "final_approval"
        | "closing"
        | "funded"
        | "declined"
        | "withdrawn"
      financing_type:
        | "sba_7a"
        | "sba_504"
        | "conventional"
        | "seller_financing"
        | "mezzanine"
        | "equity"
        | "bridge"
        | "line_of_credit"
        | "other"
      invitation_status: "pending" | "accepted" | "expired" | "revoked"
      priority_level: "low" | "medium" | "high"
      referral_source: "referral" | "social_media" | "search" | "other"
      task_priority: "high" | "medium" | "low"
      task_status: "open" | "in_progress" | "completed"
      team_invitation_status: "pending" | "accepted" | "expired" | "revoked"
      user_role: "admin" | "editor" | "viewer" | "super_admin"
      workflow_phase:
        | "listing_received"
        | "under_review"
        | "listing_approved"
        | "data_room_build"
        | "qa_compliance"
        | "ready_for_distribution"
        | "live_active"
        | "under_loi"
        | "due_diligence"
        | "closing"
        | "closed"
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
      condition_status: [
        "pending",
        "in_progress",
        "submitted",
        "approved",
        "waived",
        "rejected",
      ],
      deal_activity_type: [
        "document_uploaded",
        "document_deleted",
        "document_moved",
        "document_approved",
        "document_rejected",
        "document_downloaded",
        "request_created",
        "request_updated",
        "request_status_changed",
        "request_completed",
        "comment_added",
        "team_member_added",
        "team_member_removed",
        "permission_changed",
        "nda_signed",
        "deal_stage_changed",
        "deal_created",
        "deal_updated",
      ],
      deal_status: ["active", "archived", "draft"],
      deal_team_role: [
        "deal_lead",
        "analyst",
        "external_reviewer",
        "investor",
        "seller",
        "advisor",
      ],
      diligence_priority: ["high", "medium", "low"],
      diligence_status: ["open", "in_progress", "completed", "blocked"],
      document_tag: [
        "cim",
        "nda",
        "financials",
        "buyer_notes",
        "legal",
        "due_diligence",
        "other",
      ],
      financing_doc_status: [
        "required",
        "requested",
        "received",
        "under_review",
        "approved",
        "rejected",
        "waived",
      ],
      financing_stage: [
        "pre_qualification",
        "application_submitted",
        "under_review",
        "additional_docs_requested",
        "conditional_approval",
        "final_approval",
        "closing",
        "funded",
        "declined",
        "withdrawn",
      ],
      financing_type: [
        "sba_7a",
        "sba_504",
        "conventional",
        "seller_financing",
        "mezzanine",
        "equity",
        "bridge",
        "line_of_credit",
        "other",
      ],
      invitation_status: ["pending", "accepted", "expired", "revoked"],
      priority_level: ["low", "medium", "high"],
      referral_source: ["referral", "social_media", "search", "other"],
      task_priority: ["high", "medium", "low"],
      task_status: ["open", "in_progress", "completed"],
      team_invitation_status: ["pending", "accepted", "expired", "revoked"],
      user_role: ["admin", "editor", "viewer", "super_admin"],
      workflow_phase: [
        "listing_received",
        "under_review",
        "listing_approved",
        "data_room_build",
        "qa_compliance",
        "ready_for_distribution",
        "live_active",
        "under_loi",
        "due_diligence",
        "closing",
        "closed",
      ],
    },
  },
} as const
