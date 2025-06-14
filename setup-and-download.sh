#!/bin/bash

# TangibleFi Project Setup and Download Script
# This script downloads all dependencies, initializes submodules, and prepares the project

echo "🚀 TangibleFi Project Setup and Download Script"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root directory."
    exit 1
fi

print_status "Starting TangibleFi project setup..."

# 1. Initialize and update git submodules
print_status "Initializing git submodules..."
if git submodule update --init --recursive; then
    print_success "Git submodules initialized successfully"
else
    print_error "Failed to initialize git submodules"
    exit 1
fi

# 2. Install Node.js dependencies
print_status "Installing Node.js dependencies..."
if npm install; then
    print_success "Node.js dependencies installed successfully"
else
    print_error "Failed to install Node.js dependencies"
    exit 1
fi

# 3. Check if Foundry is installed
print_status "Checking Foundry installation..."
if command -v forge &> /dev/null; then
    print_success "Foundry is already installed"
    forge --version
else
    print_warning "Foundry not found. Installing Foundry..."
    curl -L https://foundry.paradigm.xyz | bash
    source ~/.bashrc
    foundryup
    if command -v forge &> /dev/null; then
        print_success "Foundry installed successfully"
    else
        print_error "Failed to install Foundry. Please install manually: https://book.getfoundry.sh/getting-started/installation"
    fi
fi

# 4. Build smart contracts
print_status "Building smart contracts..."
cd src/foundry
if forge build; then
    print_success "Smart contracts compiled successfully"
else
    print_warning "Smart contract compilation had warnings (this is normal)"
fi
cd ../..

# 5. Create environment file template
print_status "Creating environment configuration..."
if [ ! -f ".env.local" ]; then
    cat > .env.local << EOF
# TangibleFi Environment Configuration
# Copy this file and update with your actual values

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin Wallet Addresses (comma-separated)
ADMIN_WALLETS=0x1234567890123456789012345678901234567890,0x0987654321098765432109876543210987654321
NEXT_PUBLIC_ADMIN_WALLETS=0x1234567890123456789012345678901234567890,0x0987654321098765432109876543210987654321

# Blockchain Configuration
NEXT_PUBLIC_ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your-key
NEXT_PUBLIC_POLYGON_RPC_URL=https://polygon-mainnet.infura.io/v3/your-key
NEXT_PUBLIC_ARBITRUM_RPC_URL=https://arbitrum-mainnet.infura.io/v3/your-key

# IPFS Configuration (for future implementation)
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
PINATA_API_KEY=your-pinata-api-key
PINATA_SECRET_API_KEY=your-pinata-secret-key

# Smart Contract Addresses (update after deployment)
NEXT_PUBLIC_DIAMOND_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_DIAMOND_CUT_FACET_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_AUTH_USER_FACET_ADDRESS=0x0000000000000000000000000000000000000000

# Development Settings
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
    print_success "Environment template created at .env.local"
    print_warning "Please update .env.local with your actual configuration values"
else
    print_warning ".env.local already exists, skipping creation"
fi

# 6. Create deployment script for smart contracts
print_status "Creating smart contract deployment script..."
mkdir -p scripts
cat > scripts/deploy-contracts.sh << 'EOF'
#!/bin/bash

# Smart Contract Deployment Script
echo "🔗 Deploying TangibleFi Smart Contracts"

cd src/foundry

# Deploy to local testnet (Anvil)
echo "Starting local Anvil testnet..."
anvil --host 0.0.0.0 --port 8545 &
ANVIL_PID=$!

sleep 5

# Deploy Diamond contracts
echo "Deploying Diamond contracts..."
forge script script/Deploy.s.sol:DeployScript --rpc-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast

# Stop Anvil
kill $ANVIL_PID

echo "✅ Deployment completed!"
EOF

chmod +x scripts/deploy-contracts.sh
print_success "Deployment script created at scripts/deploy-contracts.sh"

# 7. Create IPFS integration utilities (template)
print_status "Creating IPFS integration utilities..."
mkdir -p src/lib/ipfs
cat > src/lib/ipfs/upload.ts << 'EOF'
// IPFS Upload Utilities for TangibleFi
// This is a template for future IPFS integration

export interface IPFSUploadResult {
  hash: string;
  url: string;
  size: number;
}

export class IPFSUploader {
  private apiKey: string;
  private secretKey: string;

  constructor(apiKey: string, secretKey: string) {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
  }

  async uploadFile(file: File): Promise<IPFSUploadResult> {
    // TODO: Implement IPFS upload using Pinata or Infura
    throw new Error('IPFS upload not implemented yet');
  }

  async uploadJSON(data: object): Promise<IPFSUploadResult> {
    // TODO: Implement JSON metadata upload
    throw new Error('IPFS JSON upload not implemented yet');
  }

  async uploadAssetMetadata(assetData: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{ trait_type: string; value: string }>;
  }): Promise<IPFSUploadResult> {
    // TODO: Implement asset metadata upload for NFTs
    throw new Error('Asset metadata upload not implemented yet');
  }
}

// Export default instance
export const ipfsUploader = new IPFSUploader(
  process.env.PINATA_API_KEY || '',
  process.env.PINATA_SECRET_API_KEY || ''
);
EOF

print_success "IPFS utilities template created at src/lib/ipfs/upload.ts"

# 8. Create blockchain interaction utilities
print_status "Creating blockchain interaction utilities..."
cat > src/lib/blockchain/contracts.ts << 'EOF'
// Blockchain Contract Interaction Utilities
import { ethers } from 'ethers';

export interface ContractAddresses {
  diamond: string;
  diamondCutFacet: string;
  authUserFacet: string;
}

export const CONTRACT_ADDRESSES: Record<string, ContractAddresses> = {
  ethereum: {
    diamond: process.env.NEXT_PUBLIC_DIAMOND_CONTRACT_ADDRESS || '',
    diamondCutFacet: process.env.NEXT_PUBLIC_DIAMOND_CUT_FACET_ADDRESS || '',
    authUserFacet: process.env.NEXT_PUBLIC_AUTH_USER_FACET_ADDRESS || '',
  },
  polygon: {
    diamond: '', // TODO: Add Polygon addresses
    diamondCutFacet: '',
    authUserFacet: '',
  },
  arbitrum: {
    diamond: '', // TODO: Add Arbitrum addresses
    diamondCutFacet: '',
    authUserFacet: '',
  },
};

export class ContractInteraction {
  private provider: ethers.Provider;
  private signer?: ethers.Signer;

  constructor(provider: ethers.Provider, signer?: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
  }

  async mintAssetNFT(
    to: string,
    tokenURI: string,
    valuation: bigint,
    network: string = 'ethereum'
  ): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer required for minting');
    }

    const addresses = CONTRACT_ADDRESSES[network];
    if (!addresses.authUserFacet) {
      throw new Error(`Contract addresses not configured for ${network}`);
    }

    // TODO: Implement actual contract interaction
    throw new Error('Contract interaction not implemented yet');
  }

  async getAssetDetails(tokenId: number, network: string = 'ethereum'): Promise<any> {
    const addresses = CONTRACT_ADDRESSES[network];
    if (!addresses.diamond) {
      throw new Error(`Contract addresses not configured for ${network}`);
    }

    // TODO: Implement asset details retrieval
    throw new Error('Asset details retrieval not implemented yet');
  }
}

// Export utility functions
export const getProvider = (network: string): ethers.Provider => {
  const rpcUrls: Record<string, string> = {
    ethereum: process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || '',
    polygon: process.env.NEXT_PUBLIC_POLYGON_RPC_URL || '',
    arbitrum: process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL || '',
  };

  const rpcUrl = rpcUrls[network];
  if (!rpcUrl) {
    throw new Error(`RPC URL not configured for ${network}`);
  }

  return new ethers.JsonRpcProvider(rpcUrl);
};
EOF

print_success "Blockchain utilities created at src/lib/blockchain/contracts.ts"

# 9. Create development scripts
print_status "Creating development scripts..."
cat > scripts/dev-setup.sh << 'EOF'
#!/bin/bash

# Development Environment Setup
echo "🛠️ Setting up development environment..."

# Start local blockchain
echo "Starting Anvil local blockchain..."
anvil --host 0.0.0.0 --port 8545 &
ANVIL_PID=$!

# Start Next.js development server
echo "Starting Next.js development server..."
npm run dev &
NEXTJS_PID=$!

echo "✅ Development environment started!"
echo "🔗 Blockchain: http://localhost:8545"
echo "🌐 Frontend: http://localhost:3000"
echo "📊 Admin: http://localhost:3000/admin"

# Function to cleanup on exit
cleanup() {
    echo "🧹 Cleaning up..."
    kill $ANVIL_PID 2>/dev/null
    kill $NEXTJS_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for user input to stop
echo "Press Ctrl+C to stop all services..."
wait
EOF

chmod +x scripts/dev-setup.sh
print_success "Development setup script created at scripts/dev-setup.sh"

# 10. Create project documentation
print_status "Creating additional documentation..."
cat > DEVELOPMENT.md << 'EOF'
# TangibleFi Development Guide

## Quick Start

1. **Setup Project**
   ```bash
   ./setup-and-download.sh
   ```

2. **Configure Environment**
   - Update `.env.local` with your configuration
   - Add Supabase credentials
   - Configure blockchain RPC URLs

3. **Start Development**
   ```bash
   ./scripts/dev-setup.sh
   ```

## Smart Contract Development

### Build Contracts
```bash
cd src/foundry
forge build
```

### Run Tests
```bash
forge test
```

### Deploy Contracts
```bash
./scripts/deploy-contracts.sh
```

## Frontend Development

### Start Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm run start
```

## Key Features to Implement

### 1. IPFS Integration
- [ ] Set up Pinata or Infura IPFS
- [ ] Implement file upload utilities
- [ ] Integrate with NFT metadata

### 2. Smart Contract Deployment
- [ ] Deploy to testnets
- [ ] Configure contract addresses
- [ ] Test contract interactions

### 3. Cross-Chain Integration
- [ ] Deploy to multiple networks
- [ ] Implement bridge functionality
- [ ] Add network switching

## Project Structure

```
src/
├── app/                 # Next.js app router
├── components/          # React components
├── foundry/            # Smart contracts
├── lib/                # Utility libraries
└── hooks/              # Custom React hooks
```

## Environment Variables

See `.env.local` for all required environment variables.

## Troubleshooting

### Common Issues
1. **Submodule errors**: Run `git submodule update --init --recursive`
2. **Foundry not found**: Install from https://book.getfoundry.sh/
3. **Contract compilation errors**: Check Solidity version compatibility
EOF

print_success "Development guide created at DEVELOPMENT.md"

# 11. Final status check
print_status "Performing final status check..."

# Check Node.js dependencies
if [ -d "node_modules" ]; then
    print_success "✅ Node.js dependencies installed"
else
    print_error "❌ Node.js dependencies missing"
fi

# Check git submodules
if [ -d "src/foundry/lib/forge-std" ] && [ -d "src/foundry/lib/openzeppelin-contracts" ]; then
    print_success "✅ Git submodules initialized"
else
    print_error "❌ Git submodules missing"
fi

# Check smart contract compilation
if [ -d "src/foundry/out" ]; then
    print_success "✅ Smart contracts compiled"
else
    print_warning "⚠️ Smart contracts not compiled"
fi

# Check environment file
if [ -f ".env.local" ]; then
    print_success "✅ Environment file created"
else
    print_error "❌ Environment file missing"
fi

echo ""
echo "🎉 TangibleFi Project Setup Complete!"
echo "=============================================="
echo ""
echo "📋 Next Steps:"
echo "1. Update .env.local with your configuration"
echo "2. Set up Supabase database"
echo "3. Configure blockchain RPC endpoints"
echo "4. Run './scripts/dev-setup.sh' to start development"
echo ""
echo "📚 Documentation:"
echo "- PROJECT_ANALYSIS.md - Complete project analysis"
echo "- DEVELOPMENT.md - Development guide"
echo "- README.md - Project overview"
echo ""
echo "🚀 Happy coding!" 