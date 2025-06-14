-- Create wallet_connections table
CREATE TABLE IF NOT EXISTS wallet_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    wallet_address TEXT NOT NULL,
    wallet_type TEXT NOT NULL DEFAULT 'Unknown',
    chain_id INTEGER NOT NULL,
    network_name TEXT NOT NULL,
    balance_eth DECIMAL(18, 8) DEFAULT 0,
    balance_usd DECIMAL(18, 2) DEFAULT 0,
    is_connected BOOLEAN DEFAULT true,
    last_connected TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wallet_connections_user_id ON wallet_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_connections_wallet_address ON wallet_connections(wallet_address);
CREATE INDEX IF NOT EXISTS idx_wallet_connections_chain_id ON wallet_connections(chain_id);
CREATE INDEX IF NOT EXISTS idx_wallet_connections_is_connected ON wallet_connections(is_connected);

-- Create unique constraint to prevent duplicate connections
CREATE UNIQUE INDEX IF NOT EXISTS idx_wallet_connections_unique 
ON wallet_connections(user_id, wallet_address, chain_id);

-- Enable Row Level Security (RLS)
ALTER TABLE wallet_connections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own wallet connections" ON wallet_connections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wallet connections" ON wallet_connections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet connections" ON wallet_connections
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wallet connections" ON wallet_connections
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_wallet_connections_updated_at 
    BEFORE UPDATE ON wallet_connections 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO wallet_connections (
    user_id, 
    wallet_address, 
    wallet_type, 
    chain_id, 
    network_name, 
    balance_eth, 
    balance_usd, 
    is_connected
) VALUES 
(
    '00000000-0000-0000-0000-000000000000', -- Replace with actual user ID
    '0x742d35cc6cbf4532b4661e5f5e2c2d1b5a8f1234',
    'MetaMask',
    1,
    'Ethereum Mainnet',
    2.5,
    5000.0,
    true
),
(
    '00000000-0000-0000-0000-000000000000', -- Replace with actual user ID
    '0x1234567890abcdef1234567890abcdef12345678',
    'WalletConnect',
    137,
    'Polygon',
    1000.0,
    800.0,
    true
),
(
    '00000000-0000-0000-0000-000000000000', -- Replace with actual user ID
    '0xabcdef1234567890abcdef1234567890abcdef12',
    'Coinbase Wallet',
    42161,
    'Arbitrum One',
    0.75,
    1500.0,
    false
)
ON CONFLICT (user_id, wallet_address, chain_id) DO NOTHING; 