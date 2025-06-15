import { ethers } from "ethers";
import { blockchainDataService } from "@/lib/web3/blockchain-data-service";
import { ipfsService } from "@/lib/ipfs/ipfs-service";
import {
    getNetworkConfig,
    SUPPORTED_NETWORKS,
} from "@/lib/web3/blockchain-config";

// Lazy import wallet provider to avoid server-side issues
let walletProvider: any = null;
const getWalletProvider = async () => {
    if (typeof window === "undefined") {
        return null;
    }
    if (!walletProvider) {
        const { walletProvider: wp } = await import(
            "@/lib/web3/wallet-provider"
        );
        walletProvider = wp;
    }
    return walletProvider;
};

export interface AdminUser {
    id: string;
    walletAddress: string;
    email?: string;
    fullName?: string;
    kycStatus: "pending" | "verified" | "rejected";
    accountStatus: "active" | "suspended" | "banned";
    totalAssets: number;
    totalLoans: number;
    riskScore: number;
    joinedAt: string;
    lastActivity: string;
}

export interface AdminAsset {
    id: string;
    userId: string;
    name: string;
    type: string;
    currentValue: number;
    originalValue: number;
    verificationStatus: "pending" | "verified" | "rejected";
    documents: string[];
    location?: string;
    blockchain: string;
    tokenAddress?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ContractInfo {
    address: string;
    name: string;
    network: string;
    deployedAt: string;
    version: string;
    isActive: boolean;
    functions: string[];
}

export interface SystemMetrics {
    totalUsers: number;
    totalAssets: number;
    totalValueLocked: number;
    activeLoans: number;
    pendingVerifications: number;
    systemHealth: "healthy" | "warning" | "critical";
    gasUsage24h: number;
    transactionCount24h: number;
}

export interface AdminAction {
    id: string;
    adminAddress: string;
    action: string;
    target: string;
    details: any;
    timestamp: string;
    result: "success" | "failure";
}

class AdminService {
    private readonly ADMIN_WALLET_ADDRESS = typeof process !== "undefined"
        ? process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS
        : undefined;

    // Check if current wallet is admin
    isAdmin(): boolean {
        // Return false on server side
        if (typeof window === "undefined") {
            return false;
        }

        try {
            const wp = walletProvider;
            if (!wp) return false;

            const wallet = wp.getState();
            return !!(
                wallet.isConnected &&
                wallet.address &&
                this.ADMIN_WALLET_ADDRESS &&
                wallet.address.toLowerCase() ===
                    this.ADMIN_WALLET_ADDRESS.toLowerCase()
            );
        } catch (error) {
            console.error("Error checking admin status:", error);
            return false;
        }
    }

    // Verify admin access with signature
    async verifyAdminAccess(): Promise<boolean> {
        if (typeof window === "undefined") {
            return false;
        }

        if (!this.isAdmin()) return false;

        try {
            const wp = await getWalletProvider();
            if (!wp) return false;

            const message = `Admin access verification - ${Date.now()}`;
            await wp.signMessage(message);
            return true;
        } catch (error) {
            console.error("Admin verification failed:", error);
            return false;
        }
    }

    // User Management
    async getUsers(page: number = 1, limit: number = 50): Promise<{
        users: AdminUser[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        if (!this.isAdmin()) throw new Error("Admin access required");

        try {
            // In a real implementation, this would fetch from Supabase
            const mockUsers: AdminUser[] = [
                {
                    id: "1",
                    walletAddress: "0x1234...5678",
                    email: "user1@example.com",
                    fullName: "John Doe",
                    kycStatus: "verified",
                    accountStatus: "active",
                    totalAssets: 3,
                    totalLoans: 1,
                    riskScore: 25,
                    joinedAt: "2024-01-15",
                    lastActivity: "2024-03-15",
                },
                {
                    id: "2",
                    walletAddress: "0x9876...5432",
                    email: "user2@example.com",
                    fullName: "Jane Smith",
                    kycStatus: "pending",
                    accountStatus: "active",
                    totalAssets: 2,
                    totalLoans: 0,
                    riskScore: 15,
                    joinedAt: "2024-02-01",
                    lastActivity: "2024-03-14",
                },
            ];

            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedUsers = mockUsers.slice(startIndex, endIndex);

            return {
                users: paginatedUsers,
                total: mockUsers.length,
                page,
                totalPages: Math.ceil(mockUsers.length / limit),
            };
        } catch (error) {
            console.error("Failed to fetch users:", error);
            throw new Error("Failed to fetch users");
        }
    }

    async updateUserStatus(
        userId: string,
        status: "active" | "suspended" | "banned",
    ): Promise<boolean> {
        if (!this.isAdmin()) throw new Error("Admin access required");

        try {
            // In real implementation, update Supabase database
            console.log(`Updating user ${userId} status to ${status}`);

            // Log admin action
            await this.logAdminAction("update_user_status", userId, { status });

            return true;
        } catch (error) {
            console.error("Failed to update user status:", error);
            return false;
        }
    }

    async updateKYCStatus(
        userId: string,
        status: "verified" | "rejected",
    ): Promise<boolean> {
        if (!this.isAdmin()) throw new Error("Admin access required");

        try {
            // In real implementation, update Supabase database
            console.log(`Updating user ${userId} KYC status to ${status}`);

            // Log admin action
            await this.logAdminAction("update_kyc_status", userId, { status });

            return true;
        } catch (error) {
            console.error("Failed to update KYC status:", error);
            return false;
        }
    }

    // Asset Management
    async getAssets(
        page: number = 1,
        limit: number = 50,
        status?: string,
    ): Promise<{
        assets: AdminAsset[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        if (!this.isAdmin()) throw new Error("Admin access required");

        try {
            // Mock data - in real implementation, fetch from Supabase
            const mockAssets: AdminAsset[] = [
                {
                    id: "1",
                    userId: "1",
                    name: "Luxury Apartment NYC",
                    type: "Real Estate",
                    currentValue: 850000,
                    originalValue: 800000,
                    verificationStatus: "verified",
                    documents: ["deed.pdf", "appraisal.pdf"],
                    location: "New York, NY",
                    blockchain: "Ethereum",
                    tokenAddress: "0xabc...def",
                    createdAt: "2024-01-20",
                    updatedAt: "2024-03-01",
                },
                {
                    id: "2",
                    userId: "2",
                    name: "Gold Bars (10oz)",
                    type: "Precious Metals",
                    currentValue: 25000,
                    originalValue: 24000,
                    verificationStatus: "pending",
                    documents: ["certificate.pdf"],
                    blockchain: "Polygon",
                    createdAt: "2024-02-15",
                    updatedAt: "2024-02-15",
                },
            ];

            // Filter by status if provided
            const filteredAssets = status
                ? mockAssets.filter((asset) =>
                    asset.verificationStatus === status
                )
                : mockAssets;

            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedAssets = filteredAssets.slice(startIndex, endIndex);

            return {
                assets: paginatedAssets,
                total: filteredAssets.length,
                page,
                totalPages: Math.ceil(filteredAssets.length / limit),
            };
        } catch (error) {
            console.error("Failed to fetch assets:", error);
            throw new Error("Failed to fetch assets");
        }
    }

    async verifyAsset(
        assetId: string,
        status: "verified" | "rejected",
        notes?: string,
    ): Promise<boolean> {
        if (!this.isAdmin()) throw new Error("Admin access required");

        try {
            // In real implementation, update Supabase database
            console.log(
                `Updating asset ${assetId} verification status to ${status}`,
            );

            // Log admin action
            await this.logAdminAction("verify_asset", assetId, {
                status,
                notes,
            });

            return true;
        } catch (error) {
            console.error("Failed to verify asset:", error);
            return false;
        }
    }

    async updateAssetValue(
        assetId: string,
        newValue: number,
    ): Promise<boolean> {
        if (!this.isAdmin()) throw new Error("Admin access required");

        try {
            // In real implementation, update Supabase database
            console.log(`Updating asset ${assetId} value to ${newValue}`);

            // Log admin action
            await this.logAdminAction("update_asset_value", assetId, {
                newValue,
            });

            return true;
        } catch (error) {
            console.error("Failed to update asset value:", error);
            return false;
        }
    }

    // Contract Management
    async getContracts(): Promise<ContractInfo[]> {
        if (!this.isAdmin()) throw new Error("Admin access required");

        try {
            const contracts: ContractInfo[] = [];

            // Get contract info from all supported networks
            for (
                const [networkName, networkConfig] of Object.entries(
                    SUPPORTED_NETWORKS,
                )
            ) {
                if (networkConfig.isTestnet) continue;

                // Mock contract data - in real implementation, fetch from blockchain
                contracts.push({
                    address: "0x1234567890123456789012345678901234567890",
                    name: `RWA Token (${networkConfig.name})`,
                    network: networkConfig.name,
                    deployedAt: "2024-01-01",
                    version: "1.0.0",
                    isActive: true,
                    functions: [
                        "mint",
                        "burn",
                        "transfer",
                        "approve",
                        "pause",
                        "unpause",
                    ],
                });
            }

            return contracts;
        } catch (error) {
            console.error("Failed to fetch contracts:", error);
            throw new Error("Failed to fetch contracts");
        }
    }

    async executeContractFunction(
        contractAddress: string,
        functionName: string,
        args: any[],
        network: string,
    ): Promise<string> {
        if (!this.isAdmin()) throw new Error("Admin access required");
        if (typeof window === "undefined") {
            throw new Error("Contract execution only available on client side");
        }

        try {
            const wp = await getWalletProvider();
            if (!wp) throw new Error("Wallet provider not available");

            const networkConfig = Object.values(SUPPORTED_NETWORKS).find(
                (config) => config.name === network,
            );
            if (!networkConfig) throw new Error("Unsupported network");

            // Switch to correct network if needed
            const currentChainId = wp.getChainId();
            if (currentChainId !== networkConfig.chainId) {
                await wp.switchNetwork(networkConfig.chainId);
            }

            // Execute contract function
            const txHash = await wp.callContractFunction(
                contractAddress,
                [], // ABI would be loaded based on contract type
                functionName,
                args,
            );

            // Log admin action
            await this.logAdminAction(
                "execute_contract_function",
                contractAddress,
                {
                    functionName,
                    args,
                    network,
                    txHash,
                },
            );

            return txHash;
        } catch (error) {
            console.error("Failed to execute contract function:", error);
            throw new Error("Failed to execute contract function");
        }
    }

    async pauseContract(
        contractAddress: string,
        network: string,
    ): Promise<string> {
        return this.executeContractFunction(
            contractAddress,
            "pause",
            [],
            network,
        );
    }

    async unpauseContract(
        contractAddress: string,
        network: string,
    ): Promise<string> {
        return this.executeContractFunction(
            contractAddress,
            "unpause",
            [],
            network,
        );
    }

    // System Monitoring
    async getSystemMetrics(): Promise<SystemMetrics> {
        if (!this.isAdmin()) throw new Error("Admin access required");

        try {
            // In real implementation, aggregate data from various sources
            return {
                totalUsers: 150,
                totalAssets: 45,
                totalValueLocked: 12500000,
                activeLoans: 23,
                pendingVerifications: 8,
                systemHealth: "healthy",
                gasUsage24h: 0.25,
                transactionCount24h: 127,
            };
        } catch (error) {
            console.error("Failed to fetch system metrics:", error);
            throw new Error("Failed to fetch system metrics");
        }
    }

    // Admin Action Logging
    private async logAdminAction(
        action: string,
        target: string,
        details: any,
    ): Promise<void> {
        try {
            const wp = await getWalletProvider();
            const adminAddress = wp?.getAddress() || "unknown";

            const actionLog: AdminAction = {
                id: Date.now().toString(),
                adminAddress,
                action,
                target,
                details,
                timestamp: new Date().toISOString(),
                result: "success",
            };

            // In real implementation, save to Supabase
            console.log("Admin action logged:", actionLog);
        } catch (error) {
            console.error("Failed to log admin action:", error);
        }
    }

    async getAdminActions(page: number = 1, limit: number = 50): Promise<{
        actions: AdminAction[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        if (!this.isAdmin()) throw new Error("Admin access required");

        try {
            // Mock data - in real implementation, fetch from Supabase
            const mockActions: AdminAction[] = [
                {
                    id: "1",
                    adminAddress: "0xadmin...1234",
                    action: "verify_asset",
                    target: "asset_1",
                    details: { status: "verified" },
                    timestamp: "2024-03-15T10:30:00Z",
                    result: "success",
                },
                {
                    id: "2",
                    adminAddress: "0xadmin...1234",
                    action: "update_user_status",
                    target: "user_2",
                    details: { status: "suspended" },
                    timestamp: "2024-03-14T15:45:00Z",
                    result: "success",
                },
            ];

            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedActions = mockActions.slice(startIndex, endIndex);

            return {
                actions: paginatedActions,
                total: mockActions.length,
                page,
                totalPages: Math.ceil(mockActions.length / limit),
            };
        } catch (error) {
            console.error("Failed to fetch admin actions:", error);
            throw new Error("Failed to fetch admin actions");
        }
    }

    // System Configuration
    async updateSystemFees(feeType: string, newFee: number): Promise<boolean> {
        if (!this.isAdmin()) throw new Error("Admin access required");

        try {
            // In real implementation, update system configuration
            console.log(`Updating ${feeType} fee to ${newFee}`);

            // Log admin action
            await this.logAdminAction("update_system_fees", feeType, {
                newFee,
            });

            return true;
        } catch (error) {
            console.error("Failed to update system fees:", error);
            return false;
        }
    }

    async getNetworkStats(): Promise<Record<string, any>> {
        if (!this.isAdmin()) throw new Error("Admin access required");

        try {
            const stats: Record<string, any> = {};

            for (
                const [networkName, networkConfig] of Object.entries(
                    SUPPORTED_NETWORKS,
                )
            ) {
                if (networkConfig.isTestnet) continue;

                stats[networkName] = {
                    chainId: networkConfig.chainId,
                    name: networkConfig.name,
                    rpcUrl: networkConfig.rpcUrl,
                    blockExplorer: networkConfig.blockExplorer,
                    isActive: true,
                    lastBlockNumber: 0, // Would fetch from provider
                    avgGasPrice: 0, // Would fetch from provider
                };
            }

            return stats;
        } catch (error) {
            console.error("Failed to fetch network stats:", error);
            throw new Error("Failed to fetch network stats");
        }
    }

    // Data Export
    async exportSystemData(
        type: "users" | "assets" | "transactions" | "all",
    ): Promise<any> {
        if (!this.isAdmin()) throw new Error("Admin access required");

        try {
            const data: any = {};

            if (type === "users" || type === "all") {
                const users = await this.getUsers(1, 1000);
                data.users = users.users;
            }

            if (type === "assets" || type === "all") {
                const assets = await this.getAssets(1, 1000);
                data.assets = assets.assets;
            }

            if (type === "transactions" || type === "all") {
                // In real implementation, fetch transaction data
                data.transactions = [];
            }

            // Log admin action
            await this.logAdminAction("export_system_data", type, {
                recordCount: Object.keys(data).reduce(
                    (sum, key) => sum + (data[key]?.length || 0),
                    0,
                ),
            });

            return data;
        } catch (error) {
            console.error("Failed to export system data:", error);
            throw new Error("Failed to export system data");
        }
    }
}

// Create and export singleton instance
export const adminService = new AdminService();
