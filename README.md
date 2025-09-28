# Cricket Tournament - Registration

## Supabase Setup

  1 Login to Supabase
  2 Start your project
  3 New Project and Create a project
  4 Note down Project URL & API Key
  5 Update .env file with the credentials

## Supabase DB Setup queries
Admins Table -- admins
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

Players Table -- players
```
CREATE TABLE public.players (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  role text NOT NULL,  -- Batsman, Bowler, All-rounder, etc.
  date_of_birth date NOT NULL,
  contact text,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending'  -- pending, confirmed, rejected
);

-- Indexes for performance
CREATE INDEX idx_players_status ON public.players(status);
CREATE INDEX idx_players_email ON public.players(email);
```

Player Status Audit
```
CREATE TABLE public.player_status_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id uuid REFERENCES public.players(id) ON DELETE CASCADE,
  old_status text,
  new_status text,
  changed_by uuid REFERENCES public.admins(auth_uid),
  changed_at timestamptz DEFAULT now()
);

-- Trigger function to log status changes
CREATE OR REPLACE FUNCTION log_player_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.player_status_history(player_id, old_status, new_status, changed_by)
    VALUES (OLD.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to players table
CREATE TRIGGER trg_log_player_status
AFTER UPDATE OF status ON public.players
FOR EACH ROW
EXECUTE FUNCTION log_player_status_change();
```

Row-Level Security (RLS)
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
CREATE POLICY "Admins can update player status"
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

