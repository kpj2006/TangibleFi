import { ethers, Signer, Provider } from 'ethers';
import { getNetworkConfig, CONTRACT_ABIS } from './blockchain-config';
import { LoanData, AssetData } from './blockchain-data-service';

// Helper to get a typed contract instance based on the connected network
// New (exported)
export const getFacetContract = async (
    facetName: keyof typeof CONTRACT_ABIS,
    signerOrProvider: Signer | Provider
) => {
    const provider = 'provider' in signerOrProvider ? signerOrProvider.provider : signerOrProvider;
    if (!provider) {
        throw new Error("Provider not found");
    }

    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    const networkConfig = getNetworkConfig(chainId);

    if (!networkConfig?.contracts?.diamond) {
        throw new Error(`Diamond contract not configured for chainId ${chainId}`);
    }

    const diamondAddress = networkConfig.contracts.diamond;
    const facetAbi = CONTRACT_ABIS[facetName];

    if (!facetAbi || (Array.isArray(facetAbi) && facetAbi.length === 0)) {
        throw new Error(`ABI for ${facetName} not found or is empty.`);
    }

    return new ethers.Contract(diamondAddress, facetAbi, signerOrProvider);
};

// --- READ FUNCTIONS (use Provider) ---

export const fetchUserLoansFromContract = async (provider: Provider, userAddress: string): Promise<LoanData[]> => {
    try {
        const viewFacet = await getFacetContract('ViewFacet', provider);
        const userLoanIds = await viewFacet.getUserLoans(userAddress);

        const loanDetailsPromises = userLoanIds.map((loanId: bigint) => viewFacet.getLoanById(loanId));
        const rawLoans = await Promise.all(loanDetailsPromises);

        // Map the raw contract data to your frontend's LoanData interface
        return rawLoans.map((loan: any): LoanData => {
            const loanAmount = parseFloat(ethers.formatEther(loan.loanAmount));
            const totalDebt = parseFloat(ethers.formatEther(loan.totalDebt));
            const durationMonths = Number(loan.durationInMonths);

            return {
                id: `${loan.loanId.toString()}-sepolia`,
                loanId: Number(loan.loanId),
                assetId: loan.accountTokenId.toString(),
                assetName: `Auth NFT #${loan.accountTokenId.toString()}`,
                loanAmount,
                outstandingBalance: totalDebt, // Or calculate based on payments
                totalDebt,
                interestRate: Number(loan.interestRate),
                monthlyPayment: durationMonths > 0 ? totalDebt / durationMonths : 0,
                duration: durationMonths,
                nextPaymentDate: new Date(Number(loan.nextPaymentDueDate) * 1000).toISOString(),
                status: loan.isActive ? 'active' : 'paid',
                collateralValue: loanAmount * 1.5, // Mocked for now, needs oracle
                collateralRatio: 150, // Mocked for now
                network: 'Sepolia',
                accountTokenId: Number(loan.accountTokenId),
            };
        });
    } catch (error) {
        console.error("Error fetching user loans from contract:", error);
        return [];
    }
};

export const fetchUserAssetsFromContract = async (provider: Provider, userAddress: string): Promise<AssetData[]> => {
    try {
        const authUserFacet = await getFacetContract('AuthUser', provider);
        const balance = await authUserFacet.balanceOf(userAddress);

        if (Number(balance) === 0) return [];

        const assets: AssetData[] = [];
        for (let i = 0; i < Number(balance); i++) {
            const tokenId = await authUserFacet.tokenOfOwnerByIndex(userAddress, i);
            const tokenURI = await authUserFacet.tokenURI(tokenId);

            assets.push({
                id: `${tokenId.toString()}-sepolia-nft`,
                name: `TengibleFi Auth #${tokenId.toString()}`,
                type: 'rwa',
                symbol: 'TFAUTH',
                balance: '1',
                usdValue: 0, // Needs appraisal data from metadata
                price: 0,
                priceChange24h: 0,
                network: 'Sepolia',
                chainId: 11155111,
                contractAddress: (await authUserFacet.getAddress()),
                tokenId: tokenId.toString(),
                metadata: { tokenURI },
            });
        }
        return assets;
    } catch (error) {
        console.error("Error fetching user Auth NFTs:", error);
        return [];
    }
}

// --- WRITE FUNCTIONS (use Signer) ---

// in src/lib/web3/diamond.ts

/**
 * Mints the authentication NFT for a specific user. Called by an admin.
 * @param signer - The ADMIN's wallet signer, required to send the transaction.
 * @param toAddress - The address of the USER who will receive the NFT.
 * @param tokenURI - The IPFS CID or metadata URL for the NFT.
 * @param valuation - The initial appraised value of the asset (as a string, e.g., "1000").
 * @returns The transaction hash.
 */
export const mintAuthNFT = async (
    signer: Signer,
    toAddress: string, // This will be passed as the 'to' parameter
    tokenURI: string,
    valuation: string
): Promise<string> => {
    try {
        const authUserFacet = await getFacetContract('AuthUser', signer);
        const valuationWei = ethers.parseEther(valuation);

        console.log(`Admin minting NFT to: ${toAddress} with URI: ${tokenURI}`);

        // The function call now correctly matches the smart contract:
        // It takes 3 arguments: to, _tokenURI, valuation.
        const tx = await authUserFacet.mintAuthNFT(
            toAddress,
            tokenURI,
            valuationWei
        );

        // Wait for the transaction to be mined
        await tx.wait();

        console.log("Minting transaction successful, hash:", tx.hash);
        return tx.hash;

    } catch (error: any) {
        console.error("Error in diamond.ts mintAuthNFT:", error);
        if (error.code === 'ACTION_REJECTED') {
            throw new Error("Transaction was rejected by the user.");
        }
        // Re-throw the error so the calling hook can catch it
        throw error;
    }
};


// --- CALCULATION FUNCTIONS (use Provider) ---

/**
 * Calls the ViewFacet to calculate loan terms based on amount and duration.
 */
export const calculateLoanTermsFromContract = async (
    provider: Provider,
    amount: string, // The amount as a string, e.g., "1.5"
    durationInSeconds: number
): Promise<{ totalDebt: string; bufferAmount: string; interestRate: string }> => {
    try {
        const viewFacet = await getFacetContract('ViewFacet', provider);

        // Convert the human-readable amount to Wei for the contract
        const amountWei = ethers.parseEther(amount);

        // Call both functions from the ViewFacet concurrently
        const [terms, interestRateBigInt] = await Promise.all([
            viewFacet.calculateLoanTerms(amountWei, durationInSeconds),
            viewFacet.calculateInterestRate(durationInSeconds)
        ]);

        // The contract returns a tuple [totalDebt, bufferAmount]
        const [totalDebtWei, bufferAmountWei] = terms;

        // Convert the results from Wei back to human-readable format
        const totalDebt = ethers.formatEther(totalDebtWei);
        const bufferAmount = ethers.formatEther(bufferAmountWei);

        // Assuming the interest rate is returned in basis points (e.g., 500 = 5.00%)
        const interestRate = (Number(interestRateBigInt) / 100).toFixed(2);

        return { totalDebt, bufferAmount, interestRate };

    } catch (error) {
        console.error("Error calling calculateLoanTerms on contract:", error);
        // Re-throw the error so the calling function knows it failed
        throw error;
    }
};




/**
 * Creates a new loan using the AutomationLoan facet.
 * @param signer The user's wallet signer.
 * @param collateralTokenId The ID of the NFT being used as collateral.
 * @param accountTokenId The ID of the user's AuthUser NFT.
 * @param durationInSeconds The loan duration in seconds.
 * @param amount The principal loan amount as a string (e.g., "5.5").
 * @param tokenAddress The address of the ERC20 token for the loan (e.g., USDC).
 * @returns The transaction hash.
 */
export const createLoan = async (
    signer: Signer,
    collateralTokenId: number,
    accountTokenId: number,
    durationInSeconds: number,
    amount: string,
    tokenAddress: string
): Promise<string> => {
    try {
        const automationLoanFacet = await getFacetContract('AutomationLoan', signer);

        // For a same-chain loan, sourceChainSelector is 0 and sourceAddress is address(0)
        const sourceChainSelector = 0;
        const sourceAddress = ethers.ZeroAddress;

        const amountWei = ethers.parseEther(amount); // Use parseUnits for non-18-decimal tokens

        console.log("Creating loan with params:", {
            collateralTokenId,
            accountTokenId,
            durationInSeconds,
            amount,
            tokenAddress,
        });

        const tx = await automationLoanFacet.createLoan(
            collateralTokenId,
            accountTokenId,
            durationInSeconds,
            amountWei,
            tokenAddress,
            sourceChainSelector,
            sourceAddress
        );

        await tx.wait();

        console.log("Loan creation transaction successful, hash:", tx.hash);
        return tx.hash;

    } catch (error: any) {
        console.error("Error creating loan:", error);
        if (error.code === 'ACTION_REJECTED') {
            throw new Error("Transaction was rejected by the user.");
        }
        // You can add more specific error parsing here based on your contract's revert reasons
        throw new Error("An error occurred while creating the loan.");
    }
};