"use client";

import { useState, useCallback } from "react";
import { web3Service } from "@/lib/web3/contracts";

export interface LoanTerms {
  totalDebt: string;
  bufferAmount: string;
  interestRate: string;
}

export interface LoanCreationParams {
  tokenId: number;
  accountTokenId: number;
  duration: number; // in seconds
  amount: string;
  tokenAddress: string;
  crossChain?: boolean;
  sourceChain?: string;
  network?: string;
}

export interface LoanPaymentParams {
  loanId: number;
  network?: string;
}

export function useLoanManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateLoanTerms = useCallback(
    async (
      amount: string,
      durationMonths: number,
      network?: string
    ): Promise<LoanTerms | null> => {
      setIsLoading(true);
      setError(null);

      try {
        // Convert months to seconds
        const durationSeconds = durationMonths * 30 * 24 * 60 * 60;

        const terms = await web3Service.calculateLoanTerms(
          amount,
          durationSeconds,
          network
        );

        return terms;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to calculate loan terms";
        setError(errorMessage);
        console.error("Error calculating loan terms:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const createLoan = useCallback(
    async (
      params: LoanCreationParams
    ): Promise<{ txHash: string; loanId?: number } | null> => {
      setIsLoading(true);
      setError(null);

      try {
        let result;

        if (params.crossChain && params.sourceChain) {
          // Cross-chain loan creation
          const sourceChainSelector = web3Service.getChainSelector(
            params.sourceChain
          );
          const sourceAddress = await web3Service.connect(); // Get user's address

          result = await web3Service.createCrossChainLoan(
            params.tokenId,
            params.accountTokenId,
            params.duration,
            params.amount,
            params.tokenAddress,
            sourceChainSelector,
            sourceAddress,
            params.network
          );
        } else {
          // Same-chain loan creation
          result = await web3Service.createLoan(
            params.tokenId,
            params.accountTokenId,
            params.duration,
            params.amount,
            params.tokenAddress,
            0, // sourceChainSelector = 0 for same-chain
            "0x0000000000000000000000000000000000000000", // sourceAddress = zero for same-chain
            params.network
          );
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create loan";
        setError(errorMessage);
        console.error("Error creating loan:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const makeMonthlyPayment = useCallback(
    async (params: LoanPaymentParams): Promise<{ txHash: string } | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await web3Service.makeMonthlyPayment(
          params.loanId,
          params.network
        );

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to make monthly payment";
        setError(errorMessage);
        console.error("Error making monthly payment:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const repayLoanFull = useCallback(
    async (params: LoanPaymentParams): Promise<{ txHash: string } | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await web3Service.repayLoanFull(
          params.loanId,
          params.network
        );

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to repay loan";
        setError(errorMessage);
        console.error("Error repaying loan:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getUserLoans = useCallback(
    async (userAddress: string, network?: string): Promise<number[] | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const loanIds = await web3Service.getUserLoans(userAddress, network);
        return loanIds;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch user loans";
        setError(errorMessage);
        console.error("Error fetching user loans:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const connectWallet = useCallback(async (): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const address = await web3Service.connect();
      return address;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to connect wallet";
      setError(errorMessage);
      console.error("Error connecting wallet:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const switchNetwork = useCallback(
    async (network: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        await web3Service.switchNetwork(network);
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to switch network";
        setError(errorMessage);
        console.error("Error switching network:", err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getSupportedNetworks = useCallback((): string[] => {
    return web3Service.getSupportedNetworks();
  }, []);

  const getCurrentNetwork = useCallback((): string => {
    return web3Service.getCurrentNetwork();
  }, []);

  const getBlockExplorerUrl = useCallback(
    (txHash: string, network?: string): string => {
      return web3Service.getBlockExplorerUrl(txHash, network);
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isLoading,
    error,

    // Loan operations
    calculateLoanTerms,
    createLoan,
    makeMonthlyPayment,
    repayLoanFull,
    getUserLoans,

    // Wallet operations
    connectWallet,
    switchNetwork,

    // Utility functions
    getSupportedNetworks,
    getCurrentNetwork,
    getBlockExplorerUrl,
    clearError,
  };
}
