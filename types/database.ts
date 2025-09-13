// Supabase 인증 전용 타입 정의
// 비즈니스 로직과 데이터 관리는 otto-handler 백엔드(NestJS)에서 처리됩니다.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Supabase 인증을 위한 최소한의 Database 인터페이스
export interface Database {
  public: {
    Tables: {
      // 인증 관련 테이블만 정의 (필요시 확장)
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
    };
  };
}
