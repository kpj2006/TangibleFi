"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import {
  SUPPORTED_NETWORKS,
  CONTRACT_ABIS,
  getNetworkConfig,
} from "@/lib/web3/blockchain-config";

export interface BlockchainTransaction {
  id: string;
  hash: string;
  type: "loan_creation" | "payment" | "loan_repayment" | "asset_tokenization" | "nft_mint" | "transfer";
  status: "completed" | "pending" | "failed";
  amount: number;
  currency: string;
  fee: number;
  asset_id?: string;
  asset_name?: string;
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

export interface BlockchainTransactionStats {
  total_volume: number;
  total_transactions: number;
  success_rate: number;
  average_fee: number;
  volume_change_24h: number;
  transaction_count_change_24h: number;
  fee_change_24h: number;
}

export interface TransactionFilters {
  type: string;
  status: string;
  date_range: string;
  min_amount: number;
  max_amount: number;
  search_term: string;
}

export interface BlockchainTransactionData {
  transactions: BlockchainTransaction[];
  stats: BlockchainTransactionStats;
  loading: boolean;
  error: string | null;
  filters: TransactionFilters;
  last_updated: Date | null;
}

// Get provider for blockchain connection
const getProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return null;
};

// Get contract instance
const getContract = (contractAddress: string, abi: any, provider: any) => {
  return new ethers.Contract(contractAddress, abi, provider);
};

export function useBlockchainTransactions() {
  const [data, setData] = useState<BlockchainTransactionData>({
    transactions: [],
    stats: {
      total_volume: 0,
      total_transactions: 0,
      success_rate: 0,
      average_fee: 0,
      volume_change_24h: 0,
      transaction_count_change_24h: 0,
      fee_change_24h: 0,
    },
    loading: true,
    error: null,
    filters: {
      type: "all",
      status: "all",
      date_range: "all",
      min_amount: 0,
      max_amount: 0,
      search_term: "",
    },
    last_updated: null,
  });

  const fetchTransactionsFromBlockchain = useCallback(async (): Promise<BlockchainTransaction[]> => {
    try {
      const provider = getProvider();
      if (!provider) {
        throw new Error("No wallet provider found");
      }

      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      const network = await provider.getNetwork();
      const networkConfig = getNetworkConfig(Number(network.chainId));
      
      if (!networkConfig?.contracts?.diamond) {
        console.warn('No diamond contract address for network:', network.chainId);
        return [];
      }

      const viewFacet = getContract(
        networkConfig.contracts.diamond,
        CONTRACT_ABIS.ViewFacet,
        signer
      );

      const transactions: BlockchainTransaction[] = [];
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 10000); // Last ~10k blocks

      // 1. Fetch Loan Creation Events
      try {
        const automationLoanContract = getContract(
          networkConfig.contracts.diamond,
          CONTRACT_ABIS.AutomationLoan,
          provider
        );

        const loanCreatedFilter = automationLoanContract.filters.LoanCreated();
        const loanEvents = await automationLoanContract.queryFilter(loanCreatedFilter, fromBlock, currentBlock);

        for (const event of loanEvents) {
          if ('args' in event && event.args) {
            const receipt = await provider.getTransactionReceipt(event.transactionHash);
            const block = await provider.getBlock(event.blockNumber);
            
            transactions.push({
              id: `loan_${event.args.loanId}_${event.transactionHash}`,
              hash: event.transactionHash,
              type: "loan_creation",
              status: receipt?.status === 1 ? "completed" : "failed",
              amount: Number(ethers.formatEther(event.args.loanAmount)),
              currency: "USDC",
              fee: Number(ethers.formatEther(receipt?.gasUsed || "0")) * Number(ethers.formatUnits(receipt?.gasPrice || "0", "gwei")) / 1e9,
              loan_id: Number(event.args.loanId),
              from_address: userAddress,
              to_address: networkConfig.contracts.diamond,
              blockchain: networkConfig.name,
              block_number: event.blockNumber,
              gas_used: Number(receipt?.gasUsed || 0),
              gas_price: Number(receipt?.gasPrice || 0),
              description: `Loan #${event.args.loanId} created`,
              created_at: new Date((block?.timestamp || 0) * 1000).toISOString(),
              user_id: userAddress,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching loan creation events:', error);
      }

      // 2. Fetch Payment Events (EMI Payments)
      try {
        const automationLoanContract = getContract(
          networkConfig.contracts.diamond,
          CONTRACT_ABIS.AutomationLoan,
          provider
        );

        const emiPaidFilter = automationLoanContract.filters.EMIPaid();
        const paymentEvents = await automationLoanContract.queryFilter(emiPaidFilter, fromBlock, currentBlock);

        for (const event of paymentEvents) {
          if ('args' in event && event.args) {
            const receipt = await provider.getTransactionReceipt(event.transactionHash);
            const block = await provider.getBlock(event.blockNumber);
            
            transactions.push({
              id: `payment_${event.args.loanId}_${event.transactionHash}`,
              hash: event.transactionHash,
              type: "payment",
              status: receipt?.status === 1 ? "completed" : "failed",
              amount: Number(ethers.formatEther(event.args.amount)),
              currency: "USDC",
              fee: Number(ethers.formatEther(receipt?.gasUsed || "0")) * Number(ethers.formatUnits(receipt?.gasPrice || "0", "gwei")) / 1e9,
              loan_id: Number(event.args.loanId),
              from_address: userAddress,
              to_address: networkConfig.contracts.diamond,
              blockchain: networkConfig.name,
              block_number: event.blockNumber,
              gas_used: Number(receipt?.gasUsed || 0),
              gas_price: Number(receipt?.gasPrice || 0),
              description: `Payment for Loan #${event.args.loanId}`,
              created_at: new Date((block?.timestamp || 0) * 1000).toISOString(),
              user_id: userAddress,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching payment events:', error);
      }

      // 3. Fetch Loan Repayment Events
      try {
        const automationLoanContract = getContract(
          networkConfig.contracts.diamond,
          CONTRACT_ABIS.AutomationLoan,
          provider
        );

        const loanRepaidFilter = automationLoanContract.filters.LoanRepaid();
        const repaymentEvents = await automationLoanContract.queryFilter(loanRepaidFilter, fromBlock, currentBlock);

        for (const event of repaymentEvents) {
          if ('args' in event && event.args) {
            const receipt = await provider.getTransactionReceipt(event.transactionHash);
            const block = await provider.getBlock(event.blockNumber);
            
            transactions.push({
              id: `repayment_${event.args.loanId}_${event.transactionHash}`,
              hash: event.transactionHash,
              type: "loan_repayment",
              status: receipt?.status === 1 ? "completed" : "failed",
              amount: Number(ethers.formatEther(event.args.amount)),
              currency: "USDC",
              fee: Number(ethers.formatEther(receipt?.gasUsed || "0")) * Number(ethers.formatUnits(receipt?.gasPrice || "0", "gwei")) / 1e9,
              loan_id: Number(event.args.loanId),
              from_address: userAddress,
              to_address: networkConfig.contracts.diamond,
              blockchain: networkConfig.name,
              block_number: event.blockNumber,
              gas_used: Number(receipt?.gasUsed || 0),
              gas_price: Number(receipt?.gasPrice || 0),
              description: `Full repayment for Loan #${event.args.loanId}`,
              created_at: new Date((block?.timestamp || 0) * 1000).toISOString(),
              user_id: userAddress,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching repayment events:', error);
      }

      // 4. Fetch NFT Minting Events from AuthUser Contract
      try {
        if (networkConfig.contracts.authUser) {
          const authUserContract = getContract(
            networkConfig.contracts.authUser,
            CONTRACT_ABIS.AuthUser,
            provider
          );

          // Filter for Transfer events where 'from' is zero address (minting)
          const mintFilter = authUserContract.filters.Transfer(
            "0x0000000000000000000000000000000000000000", // from (zero address for minting)
            null, // to (any address)
            null  // tokenId (any token)
          );
          
          const mintEvents = await authUserContract.queryFilter(mintFilter, fromBlock, currentBlock);

          for (const event of mintEvents) {
            if ('args' in event && event.args) {
              const receipt = await provider.getTransactionReceipt(event.transactionHash);
              const block = await provider.getBlock(event.blockNumber);
              
              // Try to get token URI if available
              let tokenUri = '';
              try {
                tokenUri = await authUserContract.tokenURI(event.args.tokenId);
              } catch (error) {
                console.warn(`Could not fetch token URI for token ${event.args.tokenId}:`, error);
              }
              
              transactions.push({
                id: `nft_mint_${event.args.tokenId}_${event.transactionHash}`,
                hash: event.transactionHash,
                type: "nft_mint",
                status: receipt?.status === 1 ? "completed" : "failed",
                amount: 0, // NFT minting typically doesn't have a monetary amount
                currency: networkConfig.symbol,
                fee: Number(ethers.formatEther(receipt?.gasUsed || "0")) * Number(ethers.formatUnits(receipt?.gasPrice || "0", "gwei")) / 1e9,
                token_id: Number(event.args.tokenId),
                token_uri: tokenUri,
                from_address: event.args.from, // Should be zero address
                to_address: event.args.to,
                blockchain: networkConfig.name,
                block_number: event.blockNumber,
                gas_used: Number(receipt?.gasUsed || 0),
                gas_price: Number(receipt?.gasPrice || 0),
                description: `NFT #${event.args.tokenId} minted to ${event.args.to}`,
                created_at: new Date((block?.timestamp || 0) * 1000).toISOString(),
                user_id: userAddress,
              });
            }
          }
        }
      } catch (error) {
        console.error('Error fetching NFT minting events:', error);
      }

      // 5. Fetch Asset Tokenization Events (if available)
      try {
        // This would depend on your asset tokenization contract events
        // Add similar logic for asset tokenization events
        console.log('Asset tokenization events fetch would go here');
      } catch (error) {
        console.error('Error fetching asset tokenization events:', error);
      }

      // Sort transactions by timestamp (newest first)
      return transactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    } catch (error) {
      console.error('Error fetching blockchain transactions:', error);
      return [];
    }
  }, []);

  const calculateStats = useCallback((transactions: BlockchainTransaction[]): BlockchainTransactionStats => {
    const completedTransactions = transactions.filter(tx => tx.status === "completed");
    const totalVolume = completedTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const totalFees = completedTransactions.reduce((sum, tx) => sum + tx.fee, 0);
    const averageFee = completedTransactions.length > 0 ? totalFees / completedTransactions.length : 0;
    const successRate = transactions.length > 0 ? (completedTransactions.length / transactions.length) * 100 : 0;

    // Calculate 24h changes (simplified - you could enhance this with actual historical data)
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recent24hTxs = transactions.filter(tx => new Date(tx.created_at) > yesterday);
    const recentVolume = recent24hTxs.reduce((sum, tx) => sum + (tx.status === "completed" ? tx.amount : 0), 0);

    return {
      total_volume: totalVolume,
      total_transactions: transactions.length,
      success_rate: successRate,
      average_fee: averageFee,
      volume_change_24h: recentVolume > 0 ? 15.2 : -5.4, // Mock percentage change
      transaction_count_change_24h: recent24hTxs.length > 0 ? 8 : -2, // Mock count change
      fee_change_24h: averageFee > 0 ? -6.4 : 0, // Mock fee change
    };
  }, []);

  const refreshData = useCallback(async () => {
    setData(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const transactions = await fetchTransactionsFromBlockchain();
      const stats = calculateStats(transactions);
      
      setData(prev => ({
        ...prev,
        transactions,
        stats,
        loading: false,
        last_updated: new Date(),
      }));
    } catch (error) {
      console.error('Error refreshing transaction data:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch transactions',
      }));
    }
  }, [fetchTransactionsFromBlockchain, calculateStats]);

  const updateFilters = useCallback((newFilters: Partial<TransactionFilters>) => {
    setData(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
    }));
  }, []);

  const filteredTransactions = useCallback(() => {
    let filtered = data.transactions;

    // Apply type filter
    if (data.filters.type !== "all") {
      filtered = filtered.filter(tx => tx.type === data.filters.type);
    }

    // Apply status filter
    if (data.filters.status !== "all") {
      filtered = filtered.filter(tx => tx.status === data.filters.status);
    }

    // Apply search filter
    if (data.filters.search_term) {
      const searchTerm = data.filters.search_term.toLowerCase();
      filtered = filtered.filter(tx => 
        tx.hash.toLowerCase().includes(searchTerm) ||
        tx.description.toLowerCase().includes(searchTerm) ||
        tx.currency.toLowerCase().includes(searchTerm)
      );
    }

    // Apply amount filters
    if (data.filters.min_amount > 0) {
      filtered = filtered.filter(tx => tx.amount >= data.filters.min_amount);
    }
    if (data.filters.max_amount > 0) {
      filtered = filtered.filter(tx => tx.amount <= data.filters.max_amount);
    }

    // Apply date range filter
    if (data.filters.date_range !== "all") {
      const now = new Date();
      let cutoffDate: Date;
      
      switch (data.filters.date_range) {
        case "24h":
          cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "7d":
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          return filtered;
      }
      
      filtered = filtered.filter(tx => new Date(tx.created_at) > cutoffDate);
    }

    return filtered;
  }, [data.transactions, data.filters]);

  // Initial data fetch
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    ...data,
    transactions: filteredTransactions(),
    refreshData,
    updateFilters,
  };
}
