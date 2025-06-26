import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import {
    CONTRACT_ABIS,
    formatChainId,
    getNetworkConfig,
    SUPPORTED_NETWORKS,
} from "./blockchain-config";
import { createClient } from "../../../supabase/client";
export interface WalletState {
    isConnected: boolean;
    address: string | null;
    chainId: number | null;
    balance: string;
    network: string | null;
    provider: ethers.BrowserProvider | null;
    signer: ethers.JsonRpcSigner | null;
}

export interface TokenBalance {
    address: string;
    symbol: string;
    name: string;
    balance: string;
    decimals: number;
    usdValue?: number;
}

export interface WalletError {
    code: number;
    message: string;
}

class WalletProvider {
    private state: WalletState = {
        isConnected: false,
        address: null,
        chainId: null,
        balance: "0",
        network: null,
        provider: null,
        signer: null,
    };

    private listeners: ((state: WalletState) => void)[] = [];
    private ethereum: any = null;
    private _isInitialized = false;

    constructor() {
        // Only initialize on client side
        if (typeof window !== "undefined") {
            this.initializeProvider();
        }
    }
    private async _saveAddressToProfile(address: string) {
        // This is a "fire and forget" operation from the wallet's perspective.
        // We don't want to block the wallet connection flow if this fails.
        // We just log errors to the console.
        try {
            const supabase = createClient();
            // Get the currently logged-in user from Supabase Auth
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Check if a profile already exists
                const { data: profile, error: fetchError } = await supabase
                    .from('profiles')
                    .select('wallet_address')
                    .eq('id', user.id)
                    .single();

                if (fetchError && fetchError.code !== 'PGRST116') { // Ignore 'no rows' error
                    throw fetchError;
                }

                // Only update if the address is different or not set
                if (!profile || profile.wallet_address !== address) {
                    const { error: updateError } = await supabase
                        .from('profiles')
                        .update({
                            wallet_address: address,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', user.id);

                    if (updateError) throw updateError;

                    console.log("Wallet address saved to user profile successfully.");
                }
            }
        } catch (error) {
            console.error("Error saving wallet address to profile:", error);
        }
    }

    private async initializeProvider() {
        // Double check we're on client side
        if (typeof window === "undefined") {
            console.warn(
                "Wallet provider can only be initialized on client side",
            );
            return;
        }

        try {
            this.ethereum = await detectEthereumProvider();
            if (this.ethereum) {
                this.setupEventListeners();
                await this.checkConnection();
            }
            this._isInitialized = true;
        } catch (error) {
            console.error("Failed to initialize wallet provider:", error);
        }
    }

    private setupEventListeners() {
        if (!this.ethereum || typeof window === "undefined") return;

        // Account changes
        this.ethereum.on("accountsChanged", async (accounts: string[]) => {
            if (accounts.length === 0) {
                await this.disconnect();
            } else {
                this.state.address = accounts[0];
                await this.updateBalance();
                this.notifyListeners();
            }
        });

        // Chain changes
        this.ethereum.on("chainChanged", async (chainId: string) => {
            const numericChainId = parseInt(chainId, 16);
            this.state.chainId = numericChainId;
            this.state.network = getNetworkConfig(numericChainId)?.name || null;

            // Recreate provider and signer for new network
            if (this.state.isConnected) {
                this.state.provider = new ethers.BrowserProvider(this.ethereum);
                this.state.signer = await this.state.provider.getSigner();
                await this.updateBalance();
            }

            this.notifyListeners();
        });

        // Disconnection
        this.ethereum.on("disconnect", () => {
            this.disconnect();
        });
    }

    private async checkConnection() {
        if (!this.ethereum || typeof window === "undefined") return;

        try {
            const accounts = await this.ethereum.request({
                method: "eth_accounts",
            });
            if (accounts.length > 0) {
                await this.connect();
            }
        } catch (error) {
            console.error("Failed to check wallet connection:", error);
        }
    }

    async connect(): Promise<WalletState> {
        if (typeof window === "undefined") {
            throw new Error("Wallet connection only available on client side");
        }

        if (!this.ethereum) {
            throw new Error("MetaMask not detected. Please install MetaMask.");
        }

        try {
            // Request account access
            const accounts = await this.ethereum.request({
                method: "eth_requestAccounts",
            });

            if (accounts.length === 0) {
                throw new Error("No accounts found");
            }

            // Get chain ID
            const chainId = await this.ethereum.request({
                method: "eth_chainId",
            });
            const numericChainId = parseInt(chainId, 16);

            // Create provider and signer
            const provider = new ethers.BrowserProvider(this.ethereum);
            const signer = await provider.getSigner();

            // Update state
            this.state = {
                isConnected: true,
                address: accounts[0],
                chainId: numericChainId,
                balance: "0",
                network: getNetworkConfig(numericChainId)?.name || null,
                provider,
                signer,
            };

            // Get balance
            await this.updateBalance();
            this._saveAddressToProfile(accounts[0]);
            this.notifyListeners();
            return this.state;
        } catch (error: any) {
            console.error("Failed to connect wallet:", error);
            throw new Error(error.message || "Failed to connect wallet");
        }
    }

    async disconnect(): Promise<void> {
        this.state = {
            isConnected: false,
            address: null,
            chainId: null,
            balance: "0",
            network: null,
            provider: null,
            signer: null,
        };
        this.notifyListeners();
    }

    async switchNetwork(chainId: number): Promise<void> {
        if (typeof window === "undefined") {
            throw new Error("Network switching only available on client side");
        }

        if (!this.ethereum) throw new Error("MetaMask not detected");

        try {
            await this.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: formatChainId(chainId) }],
            });
        } catch (error: any) {
            // If network doesn't exist, add it
            if (error.code === 4902) {
                const networkConfig = getNetworkConfig(chainId);
                if (networkConfig) {
                    await this.addNetwork(networkConfig);
                }
            } else {
                throw error;
            }
        }
    }

    async addNetwork(networkConfig: any): Promise<void> {
        if (typeof window === "undefined") {
            throw new Error("Network addition only available on client side");
        }

        if (!this.ethereum) throw new Error("MetaMask not detected");

        await this.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
                {
                    chainId: formatChainId(networkConfig.chainId),
                    chainName: networkConfig.name,
                    nativeCurrency: networkConfig.nativeCurrency,
                    rpcUrls: [networkConfig.rpcUrl],
                    blockExplorerUrls: [networkConfig.blockExplorer],
                },
            ],
        });
    }

    private async updateBalance(): Promise<void> {
        if (
            !this.state.provider || !this.state.address ||
            typeof window === "undefined"
        ) return;

        try {
            const balance = await this.state.provider.getBalance(
                this.state.address,
            );
            this.state.balance = ethers.formatEther(balance);
        } catch (error) {
            console.error("Failed to update balance:", error);
            this.state.balance = "0";
        }
    }

    async getTokenBalance(tokenAddress: string): Promise<TokenBalance | null> {
        if (
            !this.state.provider || !this.state.address ||
            typeof window === "undefined"
        ) return null;

        try {
            const contract = new ethers.Contract(
                tokenAddress,
                CONTRACT_ABIS.ERC20,
                this.state.provider,
            );

            const [balance, symbol, name, decimals] = await Promise.all([
                contract.balanceOf(this.state.address),
                contract.symbol(),
                contract.name(),
                contract.decimals(),
            ]);

            return {
                address: tokenAddress,
                symbol,
                name,
                balance: ethers.formatUnits(balance, decimals),
                decimals,
            };
        } catch (error) {
            console.error(
                `Failed to get token balance for ${tokenAddress}:`,
                error,
            );
            return null;
        }
    }

    async getAllTokenBalances(
        tokenAddresses: string[],
    ): Promise<TokenBalance[]> {
        if (typeof window === "undefined") return [];

        const balances = await Promise.allSettled(
            tokenAddresses.map((address) => this.getTokenBalance(address)),
        );

        return balances
            .filter((result): result is PromiseFulfilledResult<TokenBalance> =>
                result.status === "fulfilled" && result.value !== null
            )
            .map((result) => result.value);
    }

    async sendTransaction(
        to: string,
        value: string,
        data?: string,
    ): Promise<string> {
        if (!this.state.signer || typeof window === "undefined") {
            throw new Error("Wallet not connected");
        }

        try {
            const tx = await this.state.signer.sendTransaction({
                to,
                value: ethers.parseEther(value),
                data,
            });

            return tx.hash;
        } catch (error: any) {
            console.error("Failed to send transaction:", error);
            throw new Error(error.message || "Transaction failed");
        }
    }

    async sendTokenTransaction(
        tokenAddress: string,
        to: string,
        amount: string,
    ): Promise<string> {
        if (!this.state.signer || typeof window === "undefined") {
            throw new Error("Wallet not connected");
        }

        try {
            const contract = new ethers.Contract(
                tokenAddress,
                CONTRACT_ABIS.ERC20,
                this.state.signer,
            );

            const decimals = await contract.decimals();
            const tx = await contract.transfer(
                to,
                ethers.parseUnits(amount, decimals),
            );

            return tx.hash;
        } catch (error: any) {
            console.error("Failed to send token transaction:", error);
            throw new Error(error.message || "Token transaction failed");
        }
    }

    async signMessage(message: string): Promise<string> {
        if (!this.state.signer || typeof window === "undefined") {
            throw new Error("Wallet not connected");
        }

        try {
            return await this.state.signer.signMessage(message);
        } catch (error: any) {
            console.error("Failed to sign message:", error);
            throw new Error(error.message || "Message signing failed");
        }
    }

    async callContractFunction(
        contractAddress: string,
        abi: any[],
        functionName: string,
        args: any[] = [],
        value?: string,
    ): Promise<any> {
        if (!this.state.signer || typeof window === "undefined") {
            throw new Error("Wallet not connected");
        }

        try {
            const contract = new ethers.Contract(
                contractAddress,
                abi,
                this.state.signer,
            );
            const options = value ? { value: ethers.parseEther(value) } : {};
            const tx = await contract[functionName](...args, options);
            return tx.hash;
        } catch (error: any) {
            console.error(
                `Failed to call contract function ${functionName}:`,
                error,
            );
            throw new Error(error.message || "Contract call failed");
        }
    }

    async readContractFunction(
        contractAddress: string,
        abi: any[],
        functionName: string,
        args: any[] = [],
    ): Promise<any> {
        if (!this.state.provider || typeof window === "undefined") {
            throw new Error("Provider not available");
        }

        try {
            const contract = new ethers.Contract(
                contractAddress,
                abi,
                this.state.provider,
            );
            return await contract[functionName](...args);
        } catch (error: any) {
            console.error(
                `Failed to read contract function ${functionName}:`,
                error,
            );
            throw new Error(error.message || "Contract read failed");
        }
    }

    getState(): WalletState {
        return { ...this.state };
    }

    subscribe(callback: (state: WalletState) => void): () => void {
        this.listeners.push(callback);
        return () => {
            const index = this.listeners.indexOf(callback);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    private notifyListeners(): void {
        this.listeners.forEach((callback) => callback(this.getState()));
    }

    isConnected(): boolean {
        return this.state.isConnected;
    }

    getAddress(): string | null {
        return this.state.address;
    }

    getChainId(): number | null {
        return this.state.chainId;
    }

    getNetwork(): string | null {
        return this.state.network;
    }

    getBalance(): string {
        return this.state.balance;
    }

    isMetaMaskAvailable(): boolean {
        return typeof window !== "undefined" && !!this.ethereum;
    }

    isInitialized(): boolean {
        return this._isInitialized;
    }
}

// Create singleton instance
export const walletProvider = new WalletProvider();

// React hook for wallet state
export function useWallet() {
    // This hook should only be used on client side
    if (typeof window === "undefined") {
        return {
            ...walletProvider.getState(),
            connect: async () => walletProvider.getState(),
            disconnect: async () => { },
            switchNetwork: async () => { },
            isMetaMaskAvailable: false,
        };
    }

    return {
        ...walletProvider.getState(),
        connect: () => walletProvider.connect(),
        disconnect: () => walletProvider.disconnect(),
        switchNetwork: (chainId: number) =>
            walletProvider.switchNetwork(chainId),
        isMetaMaskAvailable: walletProvider.isMetaMaskAvailable(),
    };
}
