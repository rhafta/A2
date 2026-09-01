// supabase/migrations/*.sql 스키마와 수동 동기화.
// 실제 Supabase 프로젝트 연결 후에는 `supabase gen types typescript`로 재생성 권장.

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      github_usernames: {
        Row: {
          id: string;
          user_id: string;
          username: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          username: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["github_usernames"]["Insert"]>;
      };
      quarters: {
        Row: {
          id: string;
          user_id: string;
          year: number;
          quarter: number;
          photo_url: string;
          grid_cols: number;
          grid_rows: number;
          status: "active" | "archived";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          year: number;
          quarter: number;
          photo_url: string;
          grid_cols: number;
          grid_rows: number;
          status?: "active" | "archived";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["quarters"]["Insert"]>;
      };
      puzzle_pieces: {
        Row: {
          id: string;
          quarter_id: string;
          date: string;
          piece_index: number;
          revealed: boolean;
          revealed_at: string | null;
        };
        Insert: {
          id?: string;
          quarter_id: string;
          date: string;
          piece_index: number;
          revealed?: boolean;
          revealed_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["puzzle_pieces"]["Insert"]>;
      };
      commit_days: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          count: number;
          synced_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          count?: number;
          synced_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["commit_days"]["Insert"]>;
      };
    };
  };
}
