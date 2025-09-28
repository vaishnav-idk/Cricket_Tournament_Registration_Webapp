-- Cricket Tournament Registration Database Schema

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Teams table
CREATE TABLE teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    institution TEXT,
    captain_name TEXT NOT NULL,
    captain_phone TEXT NOT NULL,
    captain_email TEXT NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players table
CREATE TABLE players (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper', 'Captain', 'Vice-captain')),
    jersey_number INTEGER NOT NULL,
    date_of_birth DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, jersey_number)
);

-- Registrations table
CREATE TABLE registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID UNIQUE REFERENCES teams(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
    notes TEXT,
    registration_date TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Storage bucket for team logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('team-logos', 'team-logos', true);

-- RLS Policies

-- Teams table policies
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Allow public to insert (register teams)
CREATE POLICY "Allow public team registration" ON teams
    FOR INSERT TO anon WITH CHECK (true);

-- Allow public to read own team data
CREATE POLICY "Allow public to read teams" ON teams
    FOR SELECT TO anon USING (true);

-- Allow authenticated users (admins) to read and update all teams
CREATE POLICY "Allow authenticated users full access to teams" ON teams
    FOR ALL TO authenticated USING (true);

-- Players table policies
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Allow public to insert players during registration
CREATE POLICY "Allow public player registration" ON players
    FOR INSERT TO anon WITH CHECK (true);

-- Allow public to read players
CREATE POLICY "Allow public to read players" ON players
    FOR SELECT TO anon USING (true);

-- Allow authenticated users full access to players
CREATE POLICY "Allow authenticated users full access to players" ON players
    FOR ALL TO authenticated USING (true);

-- Registrations table policies
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Allow public to insert registration records
CREATE POLICY "Allow public registration creation" ON registrations
    FOR INSERT TO anon WITH CHECK (true);

-- Only authenticated users can read registrations
CREATE POLICY "Allow authenticated users to read registrations" ON registrations
    FOR SELECT TO authenticated USING (true);

-- Only authenticated users can update registration status
CREATE POLICY "Allow authenticated users to update registrations" ON registrations
    FOR UPDATE TO authenticated USING (true);

-- Storage policies
CREATE POLICY "Allow public uploads to team-logos bucket" ON storage.objects
    FOR INSERT TO anon WITH CHECK (bucket_id = 'team-logos');

CREATE POLICY "Allow public read access to team-logos bucket" ON storage.objects
    FOR SELECT TO anon USING (bucket_id = 'team-logos');

CREATE POLICY "Allow authenticated users full access to team-logos bucket" ON storage.objects
    FOR ALL TO authenticated USING (bucket_id = 'team-logos');

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for better performance
CREATE INDEX idx_teams_name ON teams(name);
CREATE INDEX idx_teams_created_at ON teams(created_at);
CREATE INDEX idx_players_team_id ON players(team_id);
CREATE INDEX idx_players_jersey_number ON players(team_id, jersey_number);
CREATE INDEX idx_registrations_team_id ON registrations(team_id);
CREATE INDEX idx_registrations_status ON registrations(status);