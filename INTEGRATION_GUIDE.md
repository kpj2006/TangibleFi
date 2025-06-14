# 🔗 TangibleFi Smart Contract & IPFS Integration Guide

## 🎯 Overview

This guide explains how to fully integrate the TangibleFi frontend with smart contracts and IPFS for complete RWA tokenization functionality.

## 📋 Prerequisites

### Required Accounts & Services

1. **Pinata Account** (for IPFS): https://pinata.cloud
2. **Infura/Alchemy Account** (for RPC): https://infura.io or https://alchemy.com
3. **MetaMask Wallet** with test ETH/MATIC
4. **Supabase Project** (already configured)

### Required Tools

- Node.js 18+
- Foundry (for smart contracts)
- Git

## 🚀 Step-by-Step Integration

### Step 1: Environment Configuration

Copy the content from `environment-template.txt` to your `.env.local` file and fill in the values:

```bash
# Copy template
cp environment-template.txt .env.local

# Edit with your actual values
nano .env.local
```

**Required Values:**

- `NEXT_PUBLIC_PINATA_API_KEY`: Get from Pinata dashboard
- `NEXT_PUBLIC_PINATA_SECRET_KEY`: Get from Pinata dashboard
- `NEXT_PUBLIC_ETHEREUM_RPC_URL`: Your Infura/Alchemy Ethereum endpoint
- `NEXT_PUBLIC_POLYGON_RPC_URL`: Your Infura/Alchemy Polygon endpoint
- `NEXT_PUBLIC_ARBITRUM_RPC_URL`: Your Infura/Alchemy Arbitrum endpoint

### Step 2: Smart Contract Deployment

#### Deploy to Testnet (Recommended for testing)

```bash
# Navigate to foundry directory
cd src/foundry

# Install dependencies
forge install

# Set up environment for deployment
echo "PRIVATE_KEY=your_private_key_here" > .env

# Deploy to Polygon Mumbai (testnet)
forge script script/Deploy.s.sol:DeployScript --rpc-url https://rpc-mumbai.maticvigil.com --broadcast --verify

# Deploy to Ethereum Sepolia (testnet)
forge script script/Deploy.s.sol:DeployScript --rpc-url https://sepolia.infura.io/v3/YOUR_KEY --broadcast --verify
```

#### Update Environment with Contract Addresses

After deployment, update your `.env.local` with the deployed contract addresses:

```bash
# Example for Polygon Mumbai
NEXT_PUBLIC_POLYGON_DIAMOND_ADDRESS=0x1234567890123456789012345678901234567890
NEXT_PUBLIC_POLYGON_DIAMOND_CUT_ADDRESS=0x2345678901234567890123456789012345678901
NEXT_PUBLIC_POLYGON_AUTH_USER_ADDRESS=0x3456789012345678901234567890123456789012
```

### Step 3: Database Schema Updates

Add the new columns to your Supabase `assets` table:

```sql
-- Add new columns for blockchain integration
ALTER TABLE assets
ADD COLUMN token_id INTEGER,
ADD COLUMN contract_address TEXT,
ADD COLUMN metadata_uri TEXT,
ADD COLUMN ipfs_hash TEXT,
ADD COLUMN transaction_hash TEXT,
ADD COLUMN blockchain TEXT DEFAULT 'ethereum';

-- Create index for better performance
CREATE INDEX idx_assets_token_id ON assets(token_id);
CREATE INDEX idx_assets_blockchain ON assets(blockchain);
CREATE INDEX idx_assets_verification_status ON assets(verification_status);
```

### Step 4: Frontend Integration Testing

#### Test Asset Creation Flow

1. **Start Development Server**

   ```bash
   npm run dev
   ```

2. **Navigate to Asset Creation**

   - Go to `/dashboard/assets/new`
   - Connect your MetaMask wallet
   - Fill in asset details
   - Upload test documents and images
   - Submit the form

3. **Verify Integration Points**
   - Check IPFS uploads in Pinata dashboard
   - Verify database entries in Supabase
   - Check transaction on blockchain explorer

#### Test Admin Approval Flow

1. **Access Admin Dashboard**

   - Go to `/admin`
   - Connect with admin wallet (configured in env)
   - Navigate to Asset Approval section

2. **Approve Assets**
   - Review pending assets
   - Approve an asset to trigger NFT minting
   - Verify NFT creation on blockchain

## 🔧 Integration Components

### Web3 Service (`src/lib/web3/contracts.ts`)

- **Purpose**: Handles all blockchain interactions
- **Key Functions**:
  - `connect()`: Connect MetaMask wallet
  - `mintAssetNFT()`: Mint NFT for approved assets
  - `getAssetDetails()`: Fetch NFT metadata
  - `switchNetwork()`: Change blockchain networks

### IPFS Service (`src/lib/ipfs/service.ts`)

- **Purpose**: Manages file uploads and metadata
- **Key Functions**:
  - `uploadFile()`: Upload images/documents
  - `createAssetMetadata()`: Generate NFT metadata
  - `updateAssetMetadata()`: Update metadata on approval/rejection

### Updated Components

- **Asset Creation** (`src/app/dashboard/assets/new/page.tsx`)
- **Admin Approval** (`src/components/admin/asset-approval.tsx`)

## 🧪 Testing Scenarios

### 1. Complete Asset Tokenization Flow

```
User submits asset → Files uploaded to IPFS → Metadata created →
Database entry → Admin reviews → Admin approves → NFT minted →
Asset ready for lending
```

### 2. Multi-Chain Support

- Test asset creation on different blockchains
- Verify network switching functionality
- Check contract addresses for each network

### 3. Error Handling

- Test with invalid IPFS credentials
- Test with insufficient wallet balance
- Test network connection issues

## 🔍 Monitoring & Debugging

### IPFS Monitoring

- Check Pinata dashboard for uploaded files
- Monitor IPFS gateway accessibility
- Verify metadata structure

### Blockchain Monitoring

- Use block explorers (Etherscan, Polygonscan)
- Monitor transaction confirmations
- Check contract interactions

### Database Monitoring

- Verify asset records in Supabase
- Check data consistency
- Monitor query performance

## 🚨 Common Issues & Solutions

### Issue: IPFS Upload Fails

**Solution**:

- Verify Pinata API keys
- Check file size limits
- Ensure proper CORS configuration

### Issue: NFT Minting Fails

**Solution**:

- Check wallet balance for gas fees
- Verify contract addresses
- Ensure proper network selection

### Issue: MetaMask Connection Issues

**Solution**:

- Clear browser cache
- Reset MetaMask connection
- Check network configuration

## 🔐 Security Considerations

### Smart Contract Security

- Contracts use Diamond pattern for upgradeability
- Owner-only functions for admin operations
- Input validation on all functions

### IPFS Security

- Files are publicly accessible via IPFS
- Sensitive documents should be encrypted
- Use content addressing for integrity

### Frontend Security

- Environment variables for sensitive data
- Wallet connection validation
- Admin access control

## 📈 Performance Optimization

### IPFS Performance

- Use CDN for faster access
- Implement caching strategies
- Optimize file sizes

### Blockchain Performance

- Use appropriate gas limits
- Implement transaction queuing
- Monitor network congestion

## 🎉 Deployment Checklist

- [ ] Environment variables configured
- [ ] Smart contracts deployed to target networks
- [ ] IPFS service configured and tested
- [ ] Database schema updated
- [ ] Admin wallets configured
- [ ] Frontend tested on all target networks
- [ ] Error handling verified
- [ ] Performance optimized
- [ ] Security audit completed

## 📞 Support

For integration support:

1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test each component individually
4. Check network connectivity and wallet configuration

## 🔄 Continuous Integration

The integration supports:

- **Multi-chain deployment**: Ethereum, Polygon, Arbitrum
- **Automatic metadata updates**: On approval/rejection
- **Real-time synchronization**: Between blockchain and database
- **Error recovery**: Graceful handling of failed operations

This integration provides a complete end-to-end solution for RWA tokenization with proper error handling, security measures, and performance optimization.
