-- Add tx_hash column to assets table for storing blockchain transaction hashes
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assets' AND column_name = 'tx_hash') THEN
        ALTER TABLE assets ADD COLUMN tx_hash TEXT;
    END IF;
END $$;

-- Add index for faster lookups by transaction hash
CREATE INDEX IF NOT EXISTS idx_assets_tx_hash ON assets(tx_hash);

-- Add comment to document the column
COMMENT ON COLUMN assets.tx_hash IS 'Blockchain transaction hash for minted NFT assets'; 