import { useState } from 'react';
import { useWallet } from '@/lib/web3/wallet-provider';
import * as diamond from '@/lib/web3/diamond';

export const useLoanActions = () => {
    const { signer } = useWallet();
    const [isCreatingLoan, setIsCreatingLoan] = useState(false);
    const [loanCreationError, setLoanCreationError] = useState<string | null>(null);

    const handleCreateLoan = async (
        collateralTokenId: number,
        accountTokenId: number,
        durationInSeconds: number,
        amount: string,
        tokenAddress: string
    ) => {
        if (!signer) {
            setLoanCreationError("Wallet not connected. Please connect to create a loan.");
            return;
        }

        setIsCreatingLoan(true);
        setLoanCreationError(null);

        try {
            const txHash = await diamond.createLoan(
                signer,
                collateralTokenId,
                accountTokenId,
                durationInSeconds,
                amount,
                tokenAddress
            );

            console.log("Successfully created loan with txHash:", txHash);
            // You can trigger a success notification and a refetch of user loans here
            return txHash;

        } catch (error: any) {
            setLoanCreationError(error.message || "An unknown error occurred.");
        } finally {
            setIsCreatingLoan(false);
        }
    };

    return {
        handleCreateLoan,
        isCreatingLoan,
        loanCreationError,
    };
};