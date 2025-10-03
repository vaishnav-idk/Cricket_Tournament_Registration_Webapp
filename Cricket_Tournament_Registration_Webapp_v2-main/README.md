# Cricket Tournament - Registration

## Supabase Setup
 - Login to Supabase
 - Start your project
 - New Project and Create a project
 - Note down `Project URL` & `API Key`
 - Create `.env` file with the credentials
   - `.env.example` is there for reference

## Supabase DB Setup queries
 - Admins Table -- `admins`
```
-- Table
CREATE TABLE public.admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_uid uuid UNIQUE NOT NULL,  -- Links to Supabase Auth
  email text UNIQUE NOT NULL,
  name text,
  role text DEFAULT 'admin',
  created_at timestamptz DEFAULT now()
);

-- Index for faster lookups
CREATE INDEX idx_admins_auth_uid ON public.admins(auth_uid);
```

 - ENUMs for Players Table
 ```
CREATE TYPE league_type AS ENUM ('men', 'women');
CREATE TYPE player_rel AS ENUM ('Self', 'Spouse', 'Ward');
CREATE TYPE profile_type AS ENUM ('Batter', 'Bowler', 'Batting Allrounder', 'Bowling Allrounder');
CREATE TYPE bat_style AS ENUM ('Right', 'Left');
CREATE TYPE bowl_style AS ENUM ('Right Pace', 'Right Spin', 'Left Pace', 'Left Spin');
```
 - Players Table [for both Men's & Women's League]
 ```
 CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code_number INT NOT NULL,
  player_name TEXT NOT NULL,
  league league_type NOT NULL,
  club_member_name TEXT NOT NULL,
  relationship player_rel NOT NULL,
  date_of_birth DATE NOT NULL,
  contact VARCHAR(15) NOT NULL,
  player_profile profile_type NOT NULL,
  wicket_keeper BOOLEAN NOT NULL DEFAULT false,
  batting_style bat_style,
  bowling_style bowl_style,
  available_on_jan_10_2026 BOOLEAN NOT NULL DEFAULT false,
  available_on_jan_11_2026 BOOLEAN NOT NULL DEFAULT false,
  available_on_jan_18_2026 BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT player_league_unique UNIQUE (code_number, player_name, league)
);
```
