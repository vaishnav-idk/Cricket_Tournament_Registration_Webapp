export interface Database {
  public: {
    Tables: {
      teams: {
        Row: {
          id: string;
          name: string;
          institution?: string;
          captain_name: string;
          captain_phone: string;
          captain_email: string;
          logo_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          institution?: string;
          captain_name: string;
          captain_phone: string;
          captain_email: string;
          logo_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          institution?: string;
          captain_name?: string;
          captain_phone?: string;
          captain_email?: string;
          logo_url?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      players: {
        Row: {
          id: string;
          team_id: string;
          name: string;
        role: 'Batsman' | 'Bowler' | 'All-rounder' | 'Wicket-keeper' | 'Captain' | 'Vice-captain';
          jersey_number: number;
          date_of_birth: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          name: string;
          role: 'Batsman' | 'Bowler' | 'All-rounder' | 'Wicket-keeper' | 'Captain' | 'Vice-captain';
          jersey_number: number;
          date_of_birth: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          name?: string;
          role?: 'Batsman' | 'Bowler' | 'All-rounder' | 'Wicket-keeper' | 'Captain' | 'Vice-captain';
          jersey_number?: number;
          date_of_birth?: string;
          created_at?: string;
        };
      };
      registrations: {
        Row: {
          id: string;
          team_id: string;
          status: 'pending' | 'confirmed' | 'rejected';
          notes?: string;
          registration_date: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          status?: 'pending' | 'confirmed' | 'rejected';
          notes?: string;
          registration_date?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          status?: 'pending' | 'confirmed' | 'rejected';
          notes?: string;
          registration_date?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type Team = Database['public']['Tables']['teams']['Row'];
export type Player = Database['public']['Tables']['players']['Row'];
export type Registration = Database['public']['Tables']['registrations']['Row'];