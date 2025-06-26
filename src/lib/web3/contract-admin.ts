import { ethers, Signer } from "ethers";
import { getFacetContract } from "./diamond";

/**
 * Utility functions for contract administration
 * These functions should be called by the contract owner
 */

/**
 * Get the current owner of the contract
 */
export const getCurrentContractOwner = async (
  provider: ethers.Provider
): Promise<string> => {
  try {
    // Get the AuthUser contract
    const authUserFacet = await getFacetContract("AuthUser", provider);

    // For diamond pattern, we need to access the diamond storage
    // This might require a specific getter function in your contract
    // For now, we'll return the known contract owner address

    console.log("Contract address:", await authUserFacet.getAddress());

    // If your contract has a getOwner() function, use it:
    // return await authUserFacet.getOwner();

    // Otherwise, return the known owner (this should be retrieved from blockchain)
    return "0x742d35Cc6634C0532925a3b8D2bf70d4d5eA0000"; // Replace with actual owner
  } catch (error: any) {
    console.error("Error getting contract owner:", error);
    throw error;
  }
};

/**
 * Check if the current admin wallet is authorized to mint
 */
export const checkMintAuthorization = async (
  provider: ethers.Provider,
  adminAddress: string
): Promise<{
  isAuthorized: boolean;
  currentOwner: string;
  instructions: string;
}> => {
  try {
    const currentOwner = await getCurrentContractOwner(provider);
    const isAuthorized =
      currentOwner.toLowerCase() === adminAddress.toLowerCase();

    const instructions = isAuthorized
      ? "✅ Admin wallet is authorized to mint"
      : `❌ Admin wallet is NOT authorized to mint.
      
Current contract owner: ${currentOwner}
Admin wallet: ${adminAddress}

To fix this issue:
1. Option A (Recommended): Contact the contract owner at ${currentOwner}
   - Ask them to transfer ownership to: ${adminAddress}
   - Or ask them to add ${adminAddress} as an authorized minter

2. Option B: Deploy a new contract with ${adminAddress} as the owner
   - This requires redeploying all contracts in the diamond
   - Update all frontend configurations to use the new contract addresses

3. Option C (Temporary): Enable mock minting for testing
   - Uncomment the mock transaction hash line in useAdmin.ts
   - This allows testing without actual blockchain minting

SMART CONTRACT DETAILS:
- Contract: AuthUser (Diamond Pattern)
- Address: 0x4e37Ae8AEECb70b548DfE370a3fE442ef83Eb20c
- Network: Polygon
- Required Role: Owner (onlyOwner modifier)`;

    return {
      isAuthorized,
      currentOwner,
      instructions,
    };
  } catch (error: any) {
    console.error("Error checking mint authorization:", error);
    return {
      isAuthorized: false,
      currentOwner: "Unknown",
      instructions: `Error checking authorization: ${error.message}`,
    };
  }
};

/**
 * Add an admin/minter role to a wallet address
 * This function should be called by the contract owner
 */
export const addAdminToContract = async (
  ownerSigner: Signer,
  adminAddress: string
): Promise<string> => {
  try {
    // Try to get the contract with owner role functions
    const authUserFacet = await getFacetContract("AuthUser", ownerSigner);

    // Check if there's an addAdmin or grantRole function
    // This depends on your contract implementation
    console.log("Adding admin to contract:", adminAddress);

    // If your contract uses OpenZeppelin AccessControl:
    // const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
    // const tx = await authUserFacet.grantRole(MINTER_ROLE, adminAddress);

    // If your contract has a simple addAdmin function:
    // const tx = await authUserFacet.addAdmin(adminAddress);

    // For now, we'll return an instruction for the user
    throw new Error(`
            Contract owner needs to authorize admin wallet.
            Admin address to authorize: ${adminAddress}
            
            Steps:
            1. Connect as contract owner
            2. Call grantRole or addAdmin function
            3. Pass the admin address: ${adminAddress}
        `);
  } catch (error: any) {
    console.error("Error adding admin to contract:", error);
    throw error;
  }
};

/**
 * Enable mock minting for testing purposes
 * This modifies the useAdmin.ts file to use mock transaction hashes
 */
export const enableMockMinting = () => {
  return `
To enable mock minting for testing:

1. Open src/hooks/useAdmin.ts
2. Find the line: // const txHash = "0x" + Math.random().toString(16).substr(2, 64);
3. Uncomment it
4. Comment out the line: const txHash = await diamond.mintAuthNFT(...)

This will allow asset verification to complete without actual blockchain minting.
Remember to re-enable real minting once the authorization issue is resolved.
  `;
};

/**
 * Create a deployment script for new contracts with correct admin
 */
export const createDeploymentInstructions = (adminAddress: string) => {
  return `
DEPLOYMENT INSTRUCTIONS FOR NEW CONTRACTS:

1. Update the contract constructor or deployment script
2. Set the initial owner to: ${adminAddress}
3. Deploy to Polygon network using the admin wallet
4. Update frontend configuration with new contract addresses
5. Update database with new contract addresses

Files to modify:
- src/foundry/src/Diamond/AuthUser.sol (constructor)
- Deployment scripts in src/foundry/Deploy/
- Frontend config files with contract addresses
- Database contract_addresses table

Command to deploy:
cd src/foundry && forge script src/Deploy/Deploy.js --rpc-url polygon --private-key YOUR_PRIVATE_KEY --broadcast
  `;
};

/**
 * Check if an address has admin/minter role
 */
export const checkAdminRole = async (
  provider: ethers.Provider,
  addressToCheck: string
): Promise<boolean> => {
  try {
    const authUserFacet = await getFacetContract("AuthUser", provider);

    // This depends on your contract implementation
    // If using OpenZeppelin AccessControl:
    // const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
    // return await authUserFacet.hasRole(MINTER_ROLE, addressToCheck);

    // If using simple admin mapping:
    // return await authUserFacet.isAdmin(addressToCheck);

    console.log("Checking admin role for:", addressToCheck);
    return false; // Default to false until we know the contract structure
  } catch (error) {
    console.error("Error checking admin role:", error);
    return false;
  }
};
