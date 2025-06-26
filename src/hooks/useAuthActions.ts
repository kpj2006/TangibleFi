import { useState } from 'react';
import { useWallet } from '@/lib/web3/wallet-provider'; // Assuming useWallet is the hook from wallet-provider.ts
import * as diamond from '@/lib/web3/diamond';

export const useAuthActions = () => {
    const { signer } = useWallet(); // Get the signer from your wallet hook/context
    const [isMinting, setIsMinting] = useState(false);
    const [mintingError, setMintingError] = useState<string | null>(null);

    const handleMintNFT = async (tokenURI: string, valuation: string, userWalletAddress: string) => {
        if (!signer) {
            setMintingError("Wallet not connected. Please connect your wallet to mint.");
            return;
        }

        setIsMinting(true);
        setMintingError(null);
        try {
            const txHash = await diamond.mintAuthNFT(signer, tokenURI, valuation, userWalletAddress);
            // Success! You could trigger a success notification or refetch user assets here.
            console.log("Successfully minted NFT with txHash:", txHash);
            return txHash; // Return hash on success
        } catch (error: any) {
            setMintingError(error.message || "An unknown error occurred.");
        } finally {
            setIsMinting(false);
        }
    };

    return {
        handleMintNFT,
        isMinting,
        mintingError,
    };
};