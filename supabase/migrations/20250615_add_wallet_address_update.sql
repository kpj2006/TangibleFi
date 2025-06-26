-- Allow users to update their wallet address

-- First, make sure the users table has wallet_address column (it should exist from previous migrations)
-- Add an update trigger for users table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table if it doesn't exist
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policy to allow users to update their own wallet address
DROP POLICY IF EXISTS "Users can update their own wallet address" ON public.users;
CREATE POLICY "Users can update their own wallet address"
ON public.users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Create a function to safely update wallet address with validation
CREATE OR REPLACE FUNCTION public.update_user_wallet_address(
    p_user_id UUID,
    p_wallet_address TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Validate that the user is updating their own profile
    IF auth.uid() != p_user_id THEN
        RAISE EXCEPTION 'Unauthorized: Cannot update another user''s wallet address';
    END IF;
    
    -- Basic validation for wallet address format (Ethereum address)
    IF p_wallet_address IS NOT NULL AND 
       (LENGTH(p_wallet_address) != 42 OR 
        NOT p_wallet_address ~* '^0x[a-fA-F0-9]{40}$') THEN
        RAISE EXCEPTION 'Invalid wallet address format. Must be a valid Ethereum address (0x...)';
    END IF;
    
    -- Update the wallet address
    UPDATE public.users 
    SET 
        wallet_address = p_wallet_address,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Return success
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error and return false
        RAISE EXCEPTION 'Failed to update wallet address: %', SQLERRM;
END;
$$; 