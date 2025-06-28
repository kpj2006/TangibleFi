# Blockchain Transaction Integration

## Overview
The transactions page has been updated to fetch real transaction data directly from the blockchain using Foundry ViewFacet contracts instead of mock database data.

## Implementation Details

### New Hook: `useBlockchainTransactions`
Located at: `src/hooks/use-blockchain-transactions.tsx`

**Features:**
- Real-time blockchain data fetching from smart contracts
- Fetches loan creation, payment, and repayment events
- Automatic wallet connection detection
- Error handling for network issues
- Transaction filtering and search capabilities
- Automatic stats calculation from blockchain data

**Event Types Tracked:**
1. **Loan Creation** (`LoanCreated`) - New loans from AutomationLoan contract
2. **Payments** (`EMIPaid`) - Monthly payments to loans
3. **Loan Repayments** (`LoanRepaid`) - Full loan repayments
4. **NFT Minting** (`Transfer` with from=0x0) - NFT minting from AuthUser contract
5. **Asset Tokenization** (placeholder for future implementation)

### Updated Components

**TransactionTable.tsx:**
- Updated to use `BlockchainTransaction` interface
- Fixed property references (`hash` instead of `transaction_hash`)
- Supports blockchain explorer links

**TransactionStatsCards.tsx:**
- Updated to use `BlockchainTransactionStats` interface
- Real-time statistics from blockchain data

**Transactions Page:**
- Enhanced error handling for wallet connection issues
- Real-time status indicators
- Blockchain connection status display
- Better loading states

### Transaction Data Structure
```typescript
interface BlockchainTransaction {
  id: string;
  hash: string;
  type: "loan_creation" | "payment" | "loan_repayment" | "asset_tokenization" | "nft_mint" | "transfer";
  status: "completed" | "pending" | "failed";
  amount: number;
  currency: string;
  fee: number;
  loan_id?: number;
  token_id?: number;
  token_uri?: string;
  from_address?: string;
  to_address?: string;
  blockchain: string;
  block_number: number;
  gas_used: number;
  gas_price: number;
  description: string;
  created_at: string;
  user_id: string;
}
```

### Requirements
- MetaMask or compatible wallet must be connected
- User must be on a supported network (Ethereum, Polygon, Arbitrum, etc.)
- Smart contracts must be deployed and accessible

### Error Handling
- Displays wallet connection prompts when wallet is not connected
- Shows network switching guidance for unsupported networks
- Fallback error messages for contract interaction failures
- Retry mechanisms for temporary connection issues

### Benefits
1. **Real-time Data**: Live blockchain transaction tracking
2. **Accuracy**: Direct smart contract data, no database sync required
3. **Transparency**: Users can verify transactions on blockchain explorers
4. **Performance**: Efficient event filtering reduces unnecessary data fetching
5. **Security**: Direct blockchain reading, no intermediary database vulnerabilities

### Future Enhancements
- Support for additional contract events (asset tokenization, transfers)
- Multi-chain aggregation across all supported networks
- Transaction caching for improved performance
- Push notifications for new transactions
- Advanced filtering and analytics

## NFT Minting Integration

### Overview
The system now tracks NFT minting events from the AuthUser contract (ERC721URIStorage) by monitoring `Transfer` events where the `from` address is the zero address (`0x0000000000000000000000000000000000000000`).

### NFT Minting Features
- **Real-time tracking**: Detects NFT mints as they happen on the blockchain
- **Token metadata**: Attempts to fetch `tokenURI` for each minted NFT
- **Visual distinction**: Special pink styling and wallet icon for NFT mint transactions
- **Token information**: Displays token ID and URI information in transaction details
- **Integrated filtering**: NFT minting appears as a filter option in transaction table

### Technical Implementation
- Uses AuthUser contract ABI with `Transfer` event filtering
- Filters for minting events by checking `from` address equals zero address
- Fetches token URI using `tokenURI()` function call
- Handles errors gracefully when token URI is not available
- Properly displays token ID instead of monetary amount in transaction table

### Contract Integration
The AuthUser contract (`AuthRWA` - ARWA) implements ERC721URIStorage and emits standard Transfer events on minting through the `mintAuthNFT()` function. The system captures these events and integrates them seamlessly with other blockchain transactions.
