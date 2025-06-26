-- Fix infinite recursion in RLS policies

-- First, drop the problematic policies
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.users;
DROP POLICY IF EXISTS "Service role can manage users" ON public.users;
DROP POLICY IF EXISTS "Users can update their own wallet address" ON public.users;

-- Create simpler, non-recursive policies for users table
CREATE POLICY "Enable read access for users to own data" ON public.users
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only" ON public.users
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on id" ON public.users
FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Service role policies (these don't cause recursion)
CREATE POLICY "Service role has full access" ON public.users
FOR ALL USING (
  current_setting('role') = 'service_role'
);

-- Fix assets policies to prevent recursion
DROP POLICY IF EXISTS "Users can manage their own assets" ON public.assets;
DROP POLICY IF EXISTS "Service role can manage assets" ON public.assets;

CREATE POLICY "Enable read access for users to own assets" ON public.assets
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for authenticated users only" ON public.assets
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id" ON public.assets
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Service role policy for assets
CREATE POLICY "Service role has full access to assets" ON public.assets
FOR ALL USING (
  current_setting('role') = 'service_role'
);

-- Also ensure we have a simple function to check if user exists without recursion
CREATE OR REPLACE FUNCTION public.user_exists(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = user_id);
$$; 