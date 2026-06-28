export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      elders: {
        Row: {
          id: string;
          name: string;
          photo_url: string | null;
          date_of_birth: string | null;
          notes: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          photo_url?: string | null;
          date_of_birth?: string | null;
          notes?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          photo_url?: string | null;
          date_of_birth?: string | null;
          notes?: string | null;
          created_by?: string;
          created_at?: string;
        };
      };
      family_members: {
        Row: {
          id: string;
          elder_id: string;
          user_id: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          elder_id: string;
          user_id: string;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          elder_id?: string;
          user_id?: string;
          role?: string;
          created_at?: string;
        };
      };
      medications: {
        Row: {
          id: string;
          elder_id: string;
          name: string;
          dosage: string;
          frequency: string;
          time_of_day: string[];
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          elder_id: string;
          name: string;
          dosage: string;
          frequency: string;
          time_of_day: string[];
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          elder_id?: string;
          name?: string;
          dosage?: string;
          frequency?: string;
          time_of_day?: string[];
          notes?: string | null;
          created_at?: string;
        };
      };
      check_ins: {
        Row: {
          id: string;
          elder_id: string;
          user_id: string;
          status: "ok" | "needs_help" | "missed";
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          elder_id: string;
          user_id: string;
          status: "ok" | "needs_help" | "missed";
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          elder_id?: string;
          user_id?: string;
          status?: "ok" | "needs_help" | "missed";
          notes?: string | null;
          created_at?: string;
        };
      };
      emergency_contacts: {
        Row: {
          id: string;
          elder_id: string;
          name: string;
          phone: string;
          relationship: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          elder_id: string;
          name: string;
          phone: string;
          relationship: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          elder_id?: string;
          name?: string;
          phone?: string;
          relationship?: string;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
