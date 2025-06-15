# 🏢 TangibleFi - Complete Project Guide

**Version**: 1.0.0 | **Status**: Production Ready | **Last Updated**: December 2024

[![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green)](https://supabase.com/)
[![Ethereum](https://img.shields.io/badge/Ethereum-Multi--Chain-purple)](https://ethereum.org/)

> **A comprehensive DeFi platform for tokenizing real-world assets (RWA) and enabling collateralized lending across multiple blockchains.**

## 🚀 Quick Start (5 Minutes Setup)

```bash
# 1. Clone and install
git clone <your-repo-url>
cd rwa-main
npm install

# 2. Setup environment
cp env.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Start development
npm run dev
# Open http://localhost:3000
```

## 📋 Table of Contents

- [🎯 Project Overview](#-project-overview)
- [✨ Key Features](#-key-features)
- [🏗️ Architecture](#️-architecture)
- [📁 Project Structure](#-project-structure)
- [🚀 Quick Start](#-quick-start)
- [🔧 Configuration](#-configuration)
- [📊 Core Components](#-core-components)
- [🔗 Blockchain Integration](#-blockchain-integration)
- [🗄️ Database Schema](#️-database-schema)
- [🎨 UI Components](#-ui-components)
- [🐛 Troubleshooting](#-troubleshooting)
- [🚀 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)

## 🎯 Project Overview

TangibleFi revolutionizes the DeFi space by bridging real-world assets with blockchain technology. Users can tokenize physical assets (real estate, commodities, equipment) as NFTs and use them as collateral for decentralized lending.

### 🌟 What Makes TangibleFi Special?

- **Real-World Asset Tokenization**: Convert physical assets into blockchain-based NFTs
- **Multi-Chain Support**: Ethereum, Polygon, Arbitrum, Optimism, BSC
- **Diamond Pattern Smart Contracts**: Upgradeable and modular contract architecture
- **Collateralized Lending**: Use tokenized assets as loan collateral
- **Professional Verification**: Expert asset verification and valuation
- **Cross-Chain Bridge**: Move assets between different blockchains
- **Advanced Analytics**: Real-time portfolio tracking and market insights

## ✨ Key Features

### 🏠 Asset Management

- **Asset Tokenization**: Upload documents, get professional verification, mint NFTs
- **Portfolio Tracking**: Real-time asset valuation and performance monitoring
- **Document Management**: IPFS-based decentralized storage for asset documents
- **Verification System**: Professional asset verification and compliance

### 💰 DeFi Features

- **Collateralized Loans**: Use verified assets as loan collateral
- **Multi-Chain Lending**: Access liquidity across different blockchains
- **Automated Liquidation**: Smart contract-based risk management
- **Yield Farming**: Earn rewards on deposited assets

### 📊 Analytics & Insights

- **Portfolio Dashboard**: Comprehensive asset and loan management
- **Market Data**: Real-time cryptocurrency and RWA market information
- **Performance Metrics**: Track asset appreciation and loan performance
- **Risk Assessment**: Automated portfolio health monitoring

### 🔗 Cross-Chain Capabilities

- **Multi-Chain Wallet**: Connect to multiple blockchains simultaneously
- **Asset Bridging**: Move tokenized assets between chains
- **Unified Portfolio**: View assets across all connected networks
- **Gas Optimization**: Intelligent network selection for transactions

## 🏗️ Architecture

### Frontend Architecture

```
Next.js 15 App Router
├── Server Components (SSR)
├── Client Components (CSR)
├── API Routes
├── Middleware (Auth)
└── Static Generation
```

### Backend Architecture

```
Supabase (Database & Auth)
├── PostgreSQL Database
├── Row Level Security (RLS)
├── Real-time Subscriptions
├── Edge Functions
└── Storage (Files)
```

### Blockchain Architecture

```
Diamond Pattern Smart Contracts
├── Diamond Proxy
├── Facets (Modular Logic)
├── Storage Contracts
└── Upgrade Mechanism
```

### Data Flow

```
User Interface → API Routes → Services → Database/Blockchain
                ↓
            Real-time Updates
                ↓
        Component State Management
```

## 📁 Project Structure

```
rwa-main/
├── 📂 src/
│   ├── 📂 app/                          # Next.js 15 App Router
│   │   ├── 📂 (auth)/                   # Authentication routes
│   │   │   ├── sign-in/                 # Login page
│   │   │   ├── sign-up/                 # Registration page
│   │   │   └── forgot-password/         # Password reset
│   │   ├── 📂 admin/                    # Admin dashboard
│   │   │   ├── page.tsx                 # Admin overview
│   │   │   ├── assets/                  # Asset management
│   │   │   ├── users/                   # User management
│   │   │   └── settings/                # System settings
│   │   ├── 📂 api/                      # API routes
│   │   │   ├── admin/                   # Admin APIs
│   │   │   ├── blockchain/              # Blockchain APIs
│   │   │   └── wallet-connections/      # Wallet APIs
│   │   ├── 📂 dashboard/                # Main user dashboard
│   │   │   ├── page.tsx                 # Main dashboard
│   │   │   ├── assets/                  # Asset management
│   │   │   ├── loans/                   # Loan management
│   │   │   ├── cross-chain/             # Cross-chain features
│   │   │   ├── portfolio/               # Portfolio analytics
│   │   │   └── settings/                # User settings
│   │   ├── layout.tsx                   # Root layout
│   │   ├── page.tsx                     # Landing page
│   │   └── globals.css                  # Global styles
│   ├── 📂 components/                   # Reusable UI components
│   │   ├── 📂 ui/                       # Base UI components (shadcn/ui)
│   │   ├── 📂 dashboard/                # Dashboard-specific components
│   │   ├── 📂 admin/                    # Admin components
│   │   └── 📂 common/                   # Shared components
│   ├── 📂 hooks/                        # Custom React hooks
│   │   ├── useBlockchainData.ts         # Blockchain data management
│   │   ├── usePortfolioDashboard.ts     # Portfolio state
│   │   ├── useAdmin.ts                  # Admin functionality
│   │   └── use-*.ts                     # Other custom hooks
│   ├── 📂 lib/                          # Utility libraries
│   │   ├── 📂 web3/                     # Blockchain utilities
│   │   │   ├── wallet-provider.ts       # Wallet connection
│   │   │   ├── blockchain-config.ts     # Network configuration
│   │   │   ├── blockchain-data-service.ts # Data aggregation
│   │   │   ├── price-service.ts         # Price data
│   │   │   └── contracts/               # Smart contract interfaces
│   │   ├── 📂 admin/                    # Admin utilities
│   │   ├── 📂 dashboard/                # Dashboard utilities
│   │   ├── 📂 ipfs/                     # IPFS integration
│   │   └── utils.ts                     # General utilities
│   └── 📂 types/                        # TypeScript definitions
├── 📂 supabase/                         # Database configuration
│   ├── client.ts                        # Client-side connection
│   ├── server.ts                        # Server-side connection
│   └── migrations/                      # Database migrations
├── 📂 public/                           # Static assets
├── 📂 docs/                             # Documentation
├── package.json                         # Dependencies
├── .env.local                           # Environment variables
├── .env.example                         # Environment template
├── next.config.js                       # Next.js configuration
├── tailwind.config.js                   # Tailwind CSS configuration
├── tsconfig.json                        # TypeScript configuration
└── README.md                            # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- MetaMask or compatible Web3 wallet

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-username/tangiblefi.git
cd tangiblefi
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Set up environment variables**

```bash
cp .env.example .env.local
```

4. **Configure your environment** (see [Configuration](#-configuration) section)

5. **Start development server**

```bash
npm run dev
# or
yarn dev
```

6. **Open your browser**

```
http://localhost:3000
```

### First-Time Setup

1. **Create a Supabase account** at [supabase.com](https://supabase.com)
2. **Create a new project** and get your credentials
3. **Set up authentication** in Supabase dashboard
4. **Configure your wallet** (MetaMask recommended)
5. **Get API keys** for external services (optional for development)

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```bash
# ========================================
# CORE CONFIGURATION
# ========================================

# Database & Authentication (Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# ========================================
# BLOCKCHAIN CONFIGURATION
# ========================================

# Mainnet RPCs (Production) - Using public endpoints for development
NEXT_PUBLIC_ETHEREUM_RPC_URL=https://cloudflare-eth.com
NEXT_PUBLIC_POLYGON_RPC_URL=https://polygon-rpc.com
NEXT_PUBLIC_ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc
NEXT_PUBLIC_OPTIMISM_RPC_URL=https://mainnet.optimism.io
NEXT_PUBLIC_BSC_RPC_URL=https://bsc-dataseed1.binance.org

# Testnet RPCs (Development)
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://rpc.sepolia.org
NEXT_PUBLIC_POLYGON_MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com

# ========================================
# DEPLOYED SMART CONTRACTS (Sepolia)
# ========================================

# Main Diamond Contract
NEXT_PUBLIC_SEPOLIA_DIAMOND_ADDRESS=0x4e37Ae8AEECb70b548DfE370a3fE442ef83Eb20c

# Core Facets
NEXT_PUBLIC_SEPOLIA_AUTH_USER_ADDRESS=0xF21BaC0864E865B34d94F6D117B81f5Ff00a522B
NEXT_PUBLIC_SEPOLIA_DIAMOND_CUT_ADDRESS=0x91ca68e0152F39a79E49e1434937ae15e07db95E
NEXT_PUBLIC_SEPOLIA_CROSSCHAIN_ADDRESS=0x6B8AeAD3c9f279ffC6b72bBB20703c597aB6fC2d

# ========================================
# EXTERNAL SERVICES
# ========================================

# IPFS Storage (Pinata)
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key
NEXT_PUBLIC_PINATA_SECRET_KEY=your_pinata_secret_key
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/

# Price Data APIs
COINGECKO_API_KEY=your_coingecko_api_key
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key

# Wallet Integration
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# ========================================
# ADMIN CONFIGURATION
# ========================================

# Admin Wallet Addresses
NEXT_PUBLIC_ADMIN_WALLETS=0xa396430CF2F0B78107Ed786c8156C6de492Eec3c
ADMIN_PRIVATE_KEY=your_admin_private_key_keep_secret

# ========================================
# DEVELOPMENT SETTINGS
# ========================================

NODE_ENV=development
NEXT_PUBLIC_ENABLE_TESTNET=true
NEXT_PUBLIC_ENABLE_CROSS_CHAIN=true
```

### Getting API Keys

#### Supabase Setup

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings > API
4. Copy URL, anon key, and service_role key

#### Pinata IPFS Setup

1. Go to [pinata.cloud](https://pinata.cloud)
2. Create free account (1GB free)
3. Go to API Keys
4. Create new key with all permissions

#### CoinGecko API (Optional)

1. Go to [coingecko.com/api](https://www.coingecko.com/en/api)
2. Sign up for free account
3. For production, upgrade to Pro plan

## 📊 Core Components

### 1. Dashboard System

#### Main Dashboard (`src/app/dashboard/page.tsx`)

The central hub for user interaction featuring:

```typescript
// Key Features:
- Portfolio Overview with real-time values
- Quick Action buttons for common tasks
- Achievement tracking and progress bars
- Market insights and recommendations
- Recent activity feed
- Multi-chain network status

// Data Sources:
- Supabase (user assets and loans)
- Blockchain networks (balances and transactions)
- CoinGecko API (price data)
- Mock data system (development)
```

#### Asset Management (`src/app/dashboard/assets/`)

Comprehensive asset lifecycle management:

```typescript
// Asset Creation Flow:
1. User uploads documents → IPFS storage
2. Metadata creation with IPFS hashes
3. Asset data stored in Supabase
4. Professional verification process
5. NFT minting on blockchain
6. Asset available for collateralization

// Asset Detail View:
- Complete asset information
- Valuation history and trends
- Document management
- Verification status
- Collateralization options
```

### 2. Blockchain Integration

#### Wallet Provider (`src/lib/web3/wallet-provider.ts`)

Manages wallet connections and blockchain interactions:

```typescript
class WalletProvider {
  // Features:
  - MetaMask integration
  - WalletConnect support
  - Multi-chain switching
  - Balance tracking
  - Transaction signing
  - Event listening

  // SSR Safety:
  - Client-side only initialization
  - Dynamic imports
  - Graceful fallbacks
}
```

#### Blockchain Data Service (`src/lib/web3/blockchain-data-service.ts`)

Aggregates data from multiple blockchain networks:

```typescript
class BlockchainDataService {
  // Capabilities:
  - Portfolio data aggregation
  - Multi-chain balance tracking
  - Transaction history (mock data)
  - Market data integration
  - Caching and rate limiting
  - Real-time updates

  // Performance:
  - 5-minute cache duration
  - Parallel network queries
  - Error handling and fallbacks
}
```

### 3. Authentication System

#### Middleware (`middleware.ts`)

Protects routes and manages authentication:

```typescript
// Protected Routes:
- /dashboard/* (requires authentication)
- /admin/* (requires admin privileges)
- /api/admin/* (admin API endpoints)

// Public Routes:
- / (landing page)
- /sign-in, /sign-up (authentication)
- /docs (documentation)
```

#### Auth Flow

```
1. User visits protected route
2. Middleware checks Supabase session
3. Redirect to sign-in if not authenticated
4. Validate user permissions
5. Allow access or redirect appropriately
```

## 🔗 Blockchain Integration

### Supported Networks

| Network  | Chain ID | RPC Endpoint                      | Status     |
| -------- | -------- | --------------------------------- | ---------- |
| Ethereum | 1        | https://cloudflare-eth.com        | ✅ Active  |
| Polygon  | 137      | https://polygon-rpc.com           | ✅ Active  |
| Arbitrum | 42161    | https://arb1.arbitrum.io/rpc      | ✅ Active  |
| Optimism | 10       | https://mainnet.optimism.io       | ✅ Active  |
| BSC      | 56       | https://bsc-dataseed1.binance.org | ✅ Active  |
| Sepolia  | 11155111 | https://rpc.sepolia.org           | 🧪 Testnet |

### Smart Contract Architecture

#### Diamond Pattern Implementation

```solidity
// Diamond Proxy Contract
contract Diamond {
    // Delegatecall to facets
    fallback() external payable {
        LibDiamond.DiamondStorage storage ds;
        bytes32 position = LibDiamond.DIAMOND_STORAGE_POSITION;
        assembly { ds.slot := position }

        address facet = ds.selectorToFacetAndPosition[msg.sig].facetAddress;
        require(facet != address(0), "Diamond: Function does not exist");

        assembly {
            calldatacopy(0, 0, calldatasize())
            let result := delegatecall(gas(), facet, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())

            switch result
            case 0 { revert(0, returndatasize()) }
            default { return(0, returndatasize()) }
        }
    }
}
```

#### Deployed Contracts (Sepolia Testnet)

```typescript
// Main Diamond Proxy
DIAMOND_ADDRESS = "0x4e37Ae8AEECb70b548DfE370a3fE442ef83Eb20c";

// Core Facets
AUTH_USER_FACET = "0xF21BaC0864E865B34d94F6D117B81f5Ff00a522B";
DIAMOND_CUT_FACET = "0x91ca68e0152F39a79E49e1434937ae15e07db95E";
DIAMOND_LOUPE_FACET = "0x7c5BF88225a3a4feB15EAE2dFda5f3Ac490A9E2a";

// Business Logic Facets
CROSSCHAIN_FACET = "0x6B8AeAD3c9f279ffC6b72bBB20703c597aB6fC2d";
AUTOMATION_LOAN_FACET = "0x9AE7E7F0d6E4767ad4602633f0806Adb5E0F49C7";
```

### Transaction Flow

```
1. User initiates action (e.g., asset tokenization)
2. Frontend validates input and prepares transaction
3. Wallet provider prompts user for signature
4. Transaction submitted to appropriate network
5. Smart contract executes business logic
6. Event emitted and indexed
7. Frontend updates UI with transaction status
8. Database updated with new state
```

## 🗄️ Database Schema

### Core Tables

#### Users (Managed by Supabase Auth)

```sql
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  -- Additional profile fields
  full_name TEXT,
  avatar_url TEXT,
  wallet_address TEXT
);
```

#### Assets

```sql
assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  asset_type TEXT NOT NULL, -- 'real_estate', 'commodity', 'equipment', etc.
  current_value DECIMAL(15,2) NOT NULL,
  original_value DECIMAL(15,2) NOT NULL,
  verification_status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  collateralization_status TEXT DEFAULT 'available', -- 'available', 'collateralized'
  location TEXT,
  blockchain TEXT DEFAULT 'ethereum',
  token_id TEXT, -- NFT token ID after minting
  contract_address TEXT, -- Smart contract address
  ipfs_hash TEXT, -- IPFS hash for metadata
  documents JSONB, -- Array of document IPFS hashes
  metadata JSONB, -- Additional asset metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Loans

```sql
loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  loan_amount DECIMAL(15,2) NOT NULL,
  outstanding_balance DECIMAL(15,2) NOT NULL,
  interest_rate DECIMAL(5,4) NOT NULL, -- Annual percentage rate
  monthly_payment DECIMAL(15,2) NOT NULL,
  loan_term_months INTEGER NOT NULL,
  next_payment_date DATE NOT NULL,
  loan_status TEXT DEFAULT 'active', -- 'active', 'paid', 'defaulted'
  blockchain TEXT DEFAULT 'ethereum',
  contract_address TEXT, -- Loan contract address
  collateral_ratio DECIMAL(5,4) NOT NULL, -- Loan-to-value ratio
  liquidation_threshold DECIMAL(5,4) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Transactions

```sql
transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
  loan_id UUID REFERENCES loans(id) ON DELETE SET NULL,
  transaction_hash TEXT UNIQUE NOT NULL,
  transaction_type TEXT NOT NULL, -- 'mint', 'transfer', 'loan', 'payment', etc.
  amount DECIMAL(15,2),
  token_symbol TEXT,
  blockchain TEXT NOT NULL,
  block_number BIGINT,
  gas_used BIGINT,
  gas_price BIGINT,
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'failed'
  created_at TIMESTAMP DEFAULT NOW(),
  confirmed_at TIMESTAMP
);
```

### Row Level Security (RLS)

```sql
-- Users can only access their own data
CREATE POLICY "Users can view own assets" ON assets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assets" ON assets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assets" ON assets
  FOR UPDATE USING (auth.uid() = user_id);

-- Similar policies for loans and transactions
```

## 🎨 UI Components

### Design System

#### Base Components (shadcn/ui)

```typescript
// Located in src/components/ui/
- Button: Customizable button component
- Card: Container component for content sections
- Input: Form input with validation
- Badge: Status and category indicators
- Dialog: Modal dialogs and overlays
- Toast: Notification system
- Progress: Progress bars and loading indicators
```

#### Custom Components

```typescript
// Dashboard Components (src/components/dashboard/)
- EnhancedDashboard: Advanced dashboard features
- PortfolioChart: Interactive portfolio visualization
- AssetCard: Individual asset display
- TransactionHistory: Transaction list with filtering
- MarketInsights: AI-powered recommendations

// Admin Components (src/components/admin/)
- AdminDashboard: Administrative interface
- UserManagement: User administration
- AssetApproval: Asset verification workflow
- SystemMetrics: Platform analytics
```

### Styling System

#### Tailwind CSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          500: "#3b82f6",
          900: "#1e3a8a",
        },
        // Custom color palette
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
```

#### Theme System

```typescript
// Dark/Light mode support
const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={theme}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
```

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. React Suspense Error (FIXED)

```
Error: Expected a suspended thenable. This is a bug in React.
```

**Solution**: Updated params handling in dynamic routes

```typescript
// Before (causing error)
const { id } = use(params);

// After (fixed)
const { id } = params;
```

#### 2. Server-Side Rendering Errors (FIXED)

```
ReferenceError: window is not defined
```

**Solution**: Dynamic imports and client-side checks

```typescript
// SSR-safe wallet provider loading
const getWalletProvider = async () => {
  if (typeof window === "undefined") return null;
  const { walletProvider } = await import("./wallet-provider");
  return walletProvider;
};
```

#### 3. Blockchain RPC Errors (FIXED)

```
Error: server response 401 Unauthorized
```

**Solution**: Using public RPC endpoints and mock data

```typescript
// Development configuration with public RPCs
NEXT_PUBLIC_ETHEREUM_RPC_URL=https://cloudflare-eth.com
NEXT_PUBLIC_POLYGON_RPC_URL=https://polygon-rpc.com
```

#### 4. API Rate Limiting (FIXED)

```
Error: Request failed with status code 429
```

**Solution**: Implemented request queuing and caching

```typescript
class PriceService {
  private requestQueue = [];
  private cache = new Map();

  async queueRequest(requestFn) {
    // Rate limiting and caching logic
  }
}
```

### Development Tips

#### 1. Environment Setup

- Always use `.env.local` for local development
- Never commit sensitive keys to version control
- Use public RPC endpoints for development
- Test with Sepolia testnet before mainnet

#### 2. Database Management

- Use Supabase dashboard for data inspection
- Enable RLS policies for security
- Regular database backups
- Monitor query performance

#### 3. Blockchain Development

- Test transactions on testnets first
- Monitor gas prices and optimize
- Implement proper error handling
- Use event listeners for real-time updates

## 🚀 Deployment

### Production Deployment

#### 1. Vercel Deployment (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard
```

#### 2. Environment Configuration

```bash
# Production environment variables
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production

# Use production RPC endpoints
NEXT_PUBLIC_ETHEREUM_RPC_URL=your_production_ethereum_rpc
NEXT_PUBLIC_POLYGON_RPC_URL=your_production_polygon_rpc

# Production database
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
```

#### 3. Domain Configuration

```javascript
// next.config.js
module.exports = {
  async redirects() {
    return [
      {
        source: "/app",
        destination: "/dashboard",
        permanent: true,
      },
    ];
  },
  images: {
    domains: ["gateway.pinata.cloud"],
  },
};
```

### Monitoring and Analytics

#### 1. Error Tracking

```typescript
// Sentry integration
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

#### 2. Performance Monitoring

```typescript
// Vercel Analytics
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
```

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Commit with conventional commits**
   ```bash
   git commit -m "feat: add new asset verification system"
   ```
6. **Push and create a pull request**

### Code Standards

#### TypeScript

- Use strict TypeScript configuration
- Define interfaces for all data structures
- Implement proper error handling
- Document complex functions

#### React

- Use functional components with hooks
- Implement proper error boundaries
- Optimize re-renders with useMemo/useCallback
- Follow React best practices

#### Styling

- Use Tailwind CSS for styling
- Follow mobile-first responsive design
- Maintain consistent spacing and typography
- Use semantic HTML elements

### Testing

#### Unit Tests

```bash
# Run unit tests
npm run test

# Run with coverage
npm run test:coverage
```

#### Integration Tests

```bash
# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e
```

## 📞 Support

### Getting Help

- **Documentation**: Check this README and inline code comments
- **Issues**: Create GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Discord**: Join our community Discord server

### Reporting Issues

When reporting issues, please include:

- Operating system and version
- Node.js version
- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Console errors and logs

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **Supabase** for the backend infrastructure
- **shadcn/ui** for the beautiful UI components
- **Ethereum Foundation** for blockchain technology
- **OpenZeppelin** for smart contract standards

---

**Built with ❤️ by the TangibleFi Team**

_Bridging Real-World Assets with DeFi Innovation_
