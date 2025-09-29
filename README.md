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

 - Players Table -- `players`
```
CREATE TABLE public.players (
  employee_code bigint PRIMARY KEY,  -- Employee code as number
  name text NOT NULL,
  role text NOT NULL,                -- Batsman, Bowler, All-rounder, etc.
  date_of_birth date NOT NULL,
  contact text NOT NULL,
  email text,
  created_at timestamptz DEFAULT now()
);

-- -- Indexes for performance
CREATE INDEX idx_players_role ON public.players(role);
CREATE INDEX idx_players_ecode ON public.players(employee_code);
CREATE INDEX idx_players_email ON public.players(email);
```
 - RLS (Row Level Security) Policies
 ```
 -- Enable RLS
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert new player registrations
CREATE POLICY "Anyone can register a player"
ON public.players
FOR INSERT
TO public
WITH CHECK (true);

-- Allow only admins to update or delete player records
CREATE POLICY "Admins can update players"
ON public.players
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.admins a
    WHERE a.auth_uid = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admins a
    WHERE a.auth_uid = auth.uid()
  )
);

CREATE POLICY "Admins can delete players"
ON public.players
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.admins a
    WHERE a.auth_uid = auth.uid()
  )
);

-- Optional: Admins can read player data
CREATE POLICY "Admins can read players"
ON public.players
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admins a
    WHERE a.auth_uid = auth.uid()
  )
);
```

