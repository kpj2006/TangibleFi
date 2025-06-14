// Web3 Smart Contract Integration for TangibleFi
import { ethers } from "ethers";

// Contract ABIs (simplified for key functions)
export const DIAMOND_ABI = [
    "function mintAuthNFT(address to, string memory tokenURI, uint256 valuation) public returns (uint256)",
    "function tokenURI(uint256 tokenId) public view returns (string)",
    "function ownerOf(uint256 tokenId) public view returns (address)",
    "function balanceOf(address owner) public view returns (uint256)",
    "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)",
    "function totalSupply() public view returns (uint256)",
    "function owner() public view returns (address)",
    "function transferOwnership(address newOwner) public",
];

export const DIAMOND_CUT_ABI = [
    "function diamondCut((address facetAddress, uint8 action, bytes4[] functionSelectors)[] memory _diamondCut, address _init, bytes memory _calldata) external",
];

export interface ContractAddresses {
    diamond: string;
    diamondCutFacet: string;
    authUserFacet: string;
}

// Contract addresses for different networks
export const CONTRACT_ADDRESSES: Record<string, ContractAddresses> = {
    ethereum: {
        diamond: process.env.NEXT_PUBLIC_DIAMOND_CONTRACT_ADDRESS ||
            "0x0000000000000000000000000000000000000000",
        diamondCutFacet: process.env.NEXT_PUBLIC_DIAMOND_CUT_FACET_ADDRESS ||
            "0x0000000000000000000000000000000000000000",
        authUserFacet: process.env.NEXT_PUBLIC_AUTH_USER_FACET_ADDRESS ||
            "0x0000000000000000000000000000000000000000",
    },
    polygon: {
        diamond: process.env.NEXT_PUBLIC_POLYGON_DIAMOND_ADDRESS ||
            "0x0000000000000000000000000000000000000000",
        diamondCutFacet: process.env.NEXT_PUBLIC_POLYGON_DIAMOND_CUT_ADDRESS ||
            "0x0000000000000000000000000000000000000000",
        authUserFacet: process.env.NEXT_PUBLIC_POLYGON_AUTH_USER_ADDRESS ||
            "0x0000000000000000000000000000000000000000",
    },
    arbitrum: {
        diamond: process.env.NEXT_PUBLIC_ARBITRUM_DIAMOND_ADDRESS ||
            "0x0000000000000000000000000000000000000000",
        diamondCutFacet: process.env.NEXT_PUBLIC_ARBITRUM_DIAMOND_CUT_ADDRESS ||
            "0x0000000000000000000000000000000000000000",
        authUserFacet: process.env.NEXT_PUBLIC_ARBITRUM_AUTH_USER_ADDRESS ||
            "0x0000000000000000000000000000000000000000",
    },
};

// Network configurations
export const NETWORK_CONFIG = {
    ethereum: {
        chainId: "0x1",
        chainName: "Ethereum Mainnet",
        rpcUrls: [
            process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL ||
            "https://mainnet.infura.io/v3/",
        ],
        blockExplorerUrls: ["https://etherscan.io"],
        nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    },
    polygon: {
        chainId: "0x89",
        chainName: "Polygon Mainnet",
        rpcUrls: [
            process.env.NEXT_PUBLIC_POLYGON_RPC_URL ||
            "https://polygon-rpc.com",
        ],
        blockExplorerUrls: ["https://polygonscan.com"],
        nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
    },
    arbitrum: {
        chainId: "0xa4b1",
        chainName: "Arbitrum One",
        rpcUrls: [
            process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL ||
            "https://arb1.arbitrum.io/rpc",
        ],
        blockExplorerUrls: ["https://arbiscan.io"],
        nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    },
};

export class Web3Service {
    private provider: ethers.BrowserProvider | null = null;
    private signer: ethers.Signer | null = null;
    private currentNetwork: string = "ethereum";

    constructor() {
        if (typeof window !== "undefined" && window.ethereum) {
            this.provider = new ethers.BrowserProvider(window.ethereum);
        }
    }

    async connect(): Promise<string> {
        if (!this.provider) {
            console.log("MetaMask not detected, using development mode");
            // Return a mock address for development (40 hex characters = 20 bytes)
            const mockAddress = "0x" +
                Array.from(
                    { length: 40 },
                    () => Math.floor(Math.random() * 16).toString(16),
                ).join("");
            return mockAddress;
        }

        const accounts = await this.provider.send("eth_requestAccounts", []);
        this.signer = await this.provider.getSigner();
        return accounts[0];
    }

    async switchNetwork(network: string): Promise<void> {
        if (!window.ethereum) {
            throw new Error("MetaMask not detected");
        }

        const networkConfig =
            NETWORK_CONFIG[network as keyof typeof NETWORK_CONFIG];
        if (!networkConfig) {
            throw new Error(`Unsupported network: ${network}`);
        }

        try {
            await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: networkConfig.chainId }],
            });
            this.currentNetwork = network;
        } catch (switchError: any) {
            // This error code indicates that the chain has not been added to MetaMask
            if (switchError.code === 4902) {
                await window.ethereum.request({
                    method: "wallet_addEthereumChain",
                    params: [networkConfig],
                });
                this.currentNetwork = network;
            } else {
                throw switchError;
            }
        }
    }

    async mintAssetNFT(
        to: string,
        tokenURI: string,
        valuation: string,
        network: string = this.currentNetwork,
    ): Promise<{ txHash: string; tokenId: number }> {
        const addresses = CONTRACT_ADDRESSES[network];

        // Check if we're in development mode with no contracts deployed
        if (
            !addresses.diamond ||
            addresses.diamond === "0x0000000000000000000000000000000000000000"
        ) {
            console.log("Development mode: Simulating NFT minting");
            // Return mock data for development
            const mockTxHash = "0x" +
                Array.from(
                    { length: 64 },
                    () => Math.floor(Math.random() * 16).toString(16),
                ).join("");

            return {
                txHash: mockTxHash,
                tokenId: Math.floor(Math.random() * 10000) + 1,
            };
        }

        if (!this.signer) {
            throw new Error("Wallet not connected");
        }

        const contract = new ethers.Contract(
            addresses.diamond,
            DIAMOND_ABI,
            this.signer,
        );

        try {
            const valuationWei = ethers.parseEther(valuation);
            const tx = await contract.mintAuthNFT(to, tokenURI, valuationWei);
            const receipt = await tx.wait();

            // Extract token ID from logs
            const mintEvent = receipt.logs.find((log: any) =>
                log.topics[0] === ethers.id("Transfer(address,address,uint256)")
            );

            const tokenId = mintEvent ? parseInt(mintEvent.topics[3], 16) : 0;

            return {
                txHash: receipt.hash,
                tokenId,
            };
        } catch (error) {
            console.error("Minting error:", error);
            throw new Error(`Failed to mint NFT: ${error}`);
        }
    }

    async getAssetDetails(
        tokenId: number,
        network: string = this.currentNetwork,
    ): Promise<{
        owner: string;
        tokenURI: string;
        metadata?: any;
    }> {
        if (!this.provider) {
            throw new Error("Provider not available");
        }

        const addresses = CONTRACT_ADDRESSES[network];
        if (!addresses.diamond) {
            throw new Error(`Contract not deployed on ${network}`);
        }

        const contract = new ethers.Contract(
            addresses.diamond,
            DIAMOND_ABI,
            this.provider,
        );

        try {
            const [owner, tokenURI] = await Promise.all([
                contract.ownerOf(tokenId),
                contract.tokenURI(tokenId),
            ]);

            return { owner, tokenURI };
        } catch (error) {
            console.error("Error fetching asset details:", error);
            throw new Error(`Failed to fetch asset details: ${error}`);
        }
    }

    async getUserAssets(
        userAddress: string,
        network: string = this.currentNetwork,
    ): Promise<number[]> {
        if (!this.provider) {
            throw new Error("Provider not available");
        }

        const addresses = CONTRACT_ADDRESSES[network];
        if (!addresses.diamond) {
            throw new Error(`Contract not deployed on ${network}`);
        }

        const contract = new ethers.Contract(
            addresses.diamond,
            DIAMOND_ABI,
            this.provider,
        );

        try {
            const balance = await contract.balanceOf(userAddress);
            const tokenIds: number[] = [];

            for (let i = 0; i < balance; i++) {
                const tokenId = await contract.tokenOfOwnerByIndex(
                    userAddress,
                    i,
                );
                tokenIds.push(Number(tokenId));
            }

            return tokenIds;
        } catch (error) {
            console.error("Error fetching user assets:", error);
            return [];
        }
    }

    async isContractOwner(
        userAddress: string,
        network: string = this.currentNetwork,
    ): Promise<boolean> {
        if (!this.provider) {
            return false;
        }

        const addresses = CONTRACT_ADDRESSES[network];
        if (!addresses.diamond) {
            return false;
        }

        try {
            const contract = new ethers.Contract(
                addresses.diamond,
                DIAMOND_ABI,
                this.provider,
            );
            const owner = await contract.owner();
            return owner.toLowerCase() === userAddress.toLowerCase();
        } catch (error) {
            console.error("Error checking contract ownership:", error);
            return false;
        }
    }

    getCurrentNetwork(): string {
        return this.currentNetwork;
    }

    getContractAddress(network: string = this.currentNetwork): string {
        return CONTRACT_ADDRESSES[network]?.diamond || "";
    }

    getBlockExplorerUrl(
        txHash: string,
        network: string = this.currentNetwork,
    ): string {
        const config = NETWORK_CONFIG[network as keyof typeof NETWORK_CONFIG];
        return config ? `${config.blockExplorerUrls[0]}/tx/${txHash}` : "";
    }
}

// Export singleton instance
export const web3Service = new Web3Service();
