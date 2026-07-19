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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      assets: {
        Row: {
          brand: string | null
          created_at: string
          dealer: string | null
          icon: string | null
          id: string
          model: string | null
          name: string
          owner_id: string | null
          price: number | null
          purchase_date: string | null
          room_or_unit: string | null
          serial_or_rc: string | null
          type: Database["public"]["Enums"]["asset_type"]
        }
        Insert: {
          brand?: string | null
          created_at?: string
          dealer?: string | null
          icon?: string | null
          id?: string
          model?: string | null
          name: string
          owner_id?: string | null
          price?: number | null
          purchase_date?: string | null
          room_or_unit?: string | null
          serial_or_rc?: string | null
          type: Database["public"]["Enums"]["asset_type"]
        }
        Update: {
          brand?: string | null
          created_at?: string
          dealer?: string | null
          icon?: string | null
          id?: string
          model?: string | null
          name?: string
          owner_id?: string | null
          price?: number | null
          purchase_date?: string | null
          room_or_unit?: string | null
          serial_or_rc?: string | null
          type?: Database["public"]["Enums"]["asset_type"]
        }
        Relationships: [
          {
            foreignKeyName: "assets_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          created_at: string
          id: string
          linked_asset_id: string | null
          linked_person_id: string | null
          name: string
          notes: string | null
          phone: string | null
          role: Database["public"]["Enums"]["contact_role"]
        }
        Insert: {
          created_at?: string
          id?: string
          linked_asset_id?: string | null
          linked_person_id?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          role: Database["public"]["Enums"]["contact_role"]
        }
        Update: {
          created_at?: string
          id?: string
          linked_asset_id?: string | null
          linked_person_id?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["contact_role"]
        }
        Relationships: [
          {
            foreignKeyName: "contacts_linked_asset_id_fkey"
            columns: ["linked_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_linked_person_id_fkey"
            columns: ["linked_person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          amount: number | null
          asset_id: string | null
          created_at: string
          doc_type: Database["public"]["Enums"]["document_type"]
          expiry_date: string | null
          extracted_json: Json | null
          file_url: string | null
          id: string
          issue_date: string | null
          owner_id: string | null
        }
        Insert: {
          amount?: number | null
          asset_id?: string | null
          created_at?: string
          doc_type: Database["public"]["Enums"]["document_type"]
          expiry_date?: string | null
          extracted_json?: Json | null
          file_url?: string | null
          id?: string
          issue_date?: string | null
          owner_id?: string | null
        }
        Update: {
          amount?: number | null
          asset_id?: string | null
          created_at?: string
          doc_type?: Database["public"]["Enums"]["document_type"]
          expiry_date?: string | null
          extracted_json?: Json | null
          file_url?: string | null
          id?: string
          issue_date?: string | null
          owner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number | null
          asset_id: string | null
          category: string | null
          created_at: string
          date: string | null
          document_id: string | null
          id: string
          name: string
          person_id: string | null
        }
        Insert: {
          amount?: number | null
          asset_id?: string | null
          category?: string | null
          created_at?: string
          date?: string | null
          document_id?: string | null
          id?: string
          name: string
          person_id?: string | null
        }
        Update: {
          amount?: number | null
          asset_id?: string | null
          category?: string | null
          created_at?: string
          date?: string | null
          document_id?: string | null
          id?: string
          name?: string
          person_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      people: {
        Row: {
          color: string | null
          created_at: string
          dob: string | null
          id: string
          initial: string | null
          name: string
          role: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          dob?: string | null
          id?: string
          initial?: string | null
          name: string
          role?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string
          dob?: string | null
          id?: string
          initial?: string | null
          name?: string
          role?: string | null
        }
        Relationships: []
      }
      person_facts: {
        Row: {
          created_at: string
          document_id: string | null
          id: string
          kind: Database["public"]["Enums"]["person_fact_kind"]
          person_id: string
          value: string | null
        }
        Insert: {
          created_at?: string
          document_id?: string | null
          id?: string
          kind: Database["public"]["Enums"]["person_fact_kind"]
          person_id: string
          value?: string | null
        }
        Update: {
          created_at?: string
          document_id?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["person_fact_kind"]
          person_id?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "person_facts_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "person_facts_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          amount: number | null
          asset_id: string | null
          created_at: string
          document_id: string | null
          due_date: string
          id: string
          name: string
          person_id: string | null
          recurrence: string | null
          status: Database["public"]["Enums"]["reminder_status"]
          type: Database["public"]["Enums"]["reminder_type"]
        }
        Insert: {
          amount?: number | null
          asset_id?: string | null
          created_at?: string
          document_id?: string | null
          due_date: string
          id?: string
          name: string
          person_id?: string | null
          recurrence?: string | null
          status?: Database["public"]["Enums"]["reminder_status"]
          type: Database["public"]["Enums"]["reminder_type"]
        }
        Update: {
          amount?: number | null
          asset_id?: string | null
          created_at?: string
          document_id?: string | null
          due_date?: string
          id?: string
          name?: string
          person_id?: string | null
          recurrence?: string | null
          status?: Database["public"]["Enums"]["reminder_status"]
          type?: Database["public"]["Enums"]["reminder_type"]
        }
        Relationships: [
          {
            foreignKeyName: "reminders_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      asset_type: "appliance" | "vehicle"
      contact_role:
        | "doctor"
        | "plumber"
        | "electrician"
        | "ac_tech"
        | "car_workshop"
        | "car_cleaner"
        | "other"
      document_type:
        | "invoice"
        | "warranty"
        | "amc"
        | "insurance"
        | "rc"
        | "puc"
        | "identity"
        | "property"
        | "other"
      person_fact_kind:
        | "allergy"
        | "condition"
        | "blood_group"
        | "insurance"
        | "note"
      reminder_status: "upcoming" | "paid" | "dismissed"
      reminder_type:
        | "warranty"
        | "insurance"
        | "amc"
        | "puc"
        | "emi"
        | "service"
        | "identity"
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
      asset_type: ["appliance", "vehicle"],
      contact_role: [
        "doctor",
        "plumber",
        "electrician",
        "ac_tech",
        "car_workshop",
        "car_cleaner",
        "other",
      ],
      document_type: [
        "invoice",
        "warranty",
        "amc",
        "insurance",
        "rc",
        "puc",
        "identity",
        "property",
        "other",
      ],
      person_fact_kind: [
        "allergy",
        "condition",
        "blood_group",
        "insurance",
        "note",
      ],
      reminder_status: ["upcoming", "paid", "dismissed"],
      reminder_type: [
        "warranty",
        "insurance",
        "amc",
        "puc",
        "emi",
        "service",
        "identity",
      ],
    },
  },
} as const
