import { NextRequest, NextResponse } from "next/server";
import { adminService } from "@/lib/admin/admin-service";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const type = searchParams.get("type") || "overview";

        // Verify admin access
        if (!adminService.isAdmin()) {
            return NextResponse.json(
                { error: "Admin access required" },
                { status: 403 },
            );
        }

        switch (type) {
            case "overview":
                const metrics = await adminService.getSystemMetrics();
                const networkStats = await adminService.getNetworkStats();
                const contracts = await adminService.getContracts();

                return NextResponse.json({
                    success: true,
                    data: {
                        metrics,
                        networkStats,
                        contracts: contracts.length,
                        timestamp: Date.now(),
                    },
                });

            case "users":
                const page = parseInt(searchParams.get("page") || "1");
                const limit = parseInt(searchParams.get("limit") || "50");
                const users = await adminService.getUsers(page, limit);

                return NextResponse.json({
                    success: true,
                    data: users,
                });

            case "assets":
                const assetPage = parseInt(searchParams.get("page") || "1");
                const assetLimit = parseInt(searchParams.get("limit") || "50");
                const status = searchParams.get("status") || undefined;
                const assets = await adminService.getAssets(
                    assetPage,
                    assetLimit,
                    status,
                );

                return NextResponse.json({
                    success: true,
                    data: assets,
                });

            case "contracts":
                const contractList = await adminService.getContracts();

                return NextResponse.json({
                    success: true,
                    data: contractList,
                });

            case "actions":
                const actionPage = parseInt(searchParams.get("page") || "1");
                const actionLimit = parseInt(searchParams.get("limit") || "50");
                const actions = await adminService.getAdminActions(
                    actionPage,
                    actionLimit,
                );

                return NextResponse.json({
                    success: true,
                    data: actions,
                });

            case "network_stats":
                const networkData = await adminService.getNetworkStats();

                return NextResponse.json({
                    success: true,
                    data: networkData,
                });

            default:
                return NextResponse.json(
                    { error: "Invalid type parameter" },
                    { status: 400 },
                );
        }
    } catch (error) {
        console.error("Admin dashboard API error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch admin data",
                details: error instanceof Error
                    ? error.message
                    : "Unknown error",
            },
            { status: 500 },
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, ...params } = body;

        // Verify admin access
        if (!adminService.isAdmin()) {
            return NextResponse.json(
                { error: "Admin access required" },
                { status: 403 },
            );
        }

        switch (action) {
            case "verify_admin":
                const isVerified = await adminService.verifyAdminAccess();
                return NextResponse.json({
                    success: true,
                    data: { verified: isVerified },
                });

            case "update_user_status":
                const { userId, status } = params;
                const userUpdateResult = await adminService.updateUserStatus(
                    userId,
                    status,
                );
                return NextResponse.json({
                    success: userUpdateResult,
                    message: userUpdateResult
                        ? "User status updated successfully"
                        : "Failed to update user status",
                });

            case "update_kyc_status":
                const { userId: kycUserId, status: kycStatus } = params;
                const kycUpdateResult = await adminService.updateKYCStatus(
                    kycUserId,
                    kycStatus,
                );
                return NextResponse.json({
                    success: kycUpdateResult,
                    message: kycUpdateResult
                        ? "KYC status updated successfully"
                        : "Failed to update KYC status",
                });

            case "verify_asset":
                const { assetId, status: assetStatus, notes } = params;
                const assetVerifyResult = await adminService.verifyAsset(
                    assetId,
                    assetStatus,
                    notes,
                );
                return NextResponse.json({
                    success: assetVerifyResult,
                    message: assetVerifyResult
                        ? "Asset verification updated successfully"
                        : "Failed to update asset verification",
                });

            case "update_asset_value":
                const { assetId: valueAssetId, newValue } = params;
                const valueUpdateResult = await adminService.updateAssetValue(
                    valueAssetId,
                    newValue,
                );
                return NextResponse.json({
                    success: valueUpdateResult,
                    message: valueUpdateResult
                        ? "Asset value updated successfully"
                        : "Failed to update asset value",
                });

            case "execute_contract_function":
                const { contractAddress, functionName, args, network } = params;
                const txHash = await adminService.executeContractFunction(
                    contractAddress,
                    functionName,
                    args,
                    network,
                );
                return NextResponse.json({
                    success: true,
                    data: { transactionHash: txHash },
                    message: "Contract function executed successfully",
                });

            case "pause_contract":
                const { contractAddress: pauseAddress, network: pauseNetwork } =
                    params;
                const pauseTxHash = await adminService.pauseContract(
                    pauseAddress,
                    pauseNetwork,
                );
                return NextResponse.json({
                    success: true,
                    data: { transactionHash: pauseTxHash },
                    message: "Contract paused successfully",
                });

            case "unpause_contract":
                const {
                    contractAddress: unpauseAddress,
                    network: unpauseNetwork,
                } = params;
                const unpauseTxHash = await adminService.unpauseContract(
                    unpauseAddress,
                    unpauseNetwork,
                );
                return NextResponse.json({
                    success: true,
                    data: { transactionHash: unpauseTxHash },
                    message: "Contract unpaused successfully",
                });

            case "update_system_fees":
                const { feeType, newFee } = params;
                const feeUpdateResult = await adminService.updateSystemFees(
                    feeType,
                    newFee,
                );
                return NextResponse.json({
                    success: feeUpdateResult,
                    message: feeUpdateResult
                        ? "System fees updated successfully"
                        : "Failed to update system fees",
                });

            case "export_data":
                const { type } = params;
                const exportData = await adminService.exportSystemData(type);
                return NextResponse.json({
                    success: true,
                    data: exportData,
                    message: "Data exported successfully",
                });

            default:
                return NextResponse.json(
                    { error: "Invalid action" },
                    { status: 400 },
                );
        }
    } catch (error) {
        console.error("Admin dashboard API POST error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to process admin request",
                details: error instanceof Error
                    ? error.message
                    : "Unknown error",
            },
            { status: 500 },
        );
    }
}
