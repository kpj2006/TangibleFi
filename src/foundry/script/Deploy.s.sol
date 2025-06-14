// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/Diamond/Diamond.sol";
import "../src/Diamond/DiamondCutFacet.sol";
import "../src/Diamond/DiamondLoupeFacet.sol";
import "../src/Diamond/OwnershipFacet.sol";
import "../src/Diamond/AuthUser.sol";
import "../interfaces/IDiamondCut.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying contracts with account:", deployer);
        console.log("Account balance:", deployer.balance);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy DiamondCutFacet
        DiamondCutFacet diamondCutFacet = new DiamondCutFacet();
        console.log("DiamondCutFacet deployed to:", address(diamondCutFacet));

        // Deploy Diamond
        Diamond diamond = new Diamond(deployer, address(diamondCutFacet));
        console.log("Diamond deployed to:", address(diamond));

        // Deploy DiamondLoupeFacet
        DiamondLoupeFacet diamondLoupeFacet = new DiamondLoupeFacet();
        console.log("DiamondLoupeFacet deployed to:", address(diamondLoupeFacet));

        // Deploy OwnershipFacet
        OwnershipFacet ownershipFacet = new OwnershipFacet();
        console.log("OwnershipFacet deployed to:", address(ownershipFacet));

        // Deploy AuthUser facet
        AuthUser authUserFacet = new AuthUser();
        console.log("AuthUser deployed to:", address(authUserFacet));

        // Prepare facet cuts for adding facets
        IDiamondCut.FacetCut[] memory cuts = new IDiamondCut.FacetCut[](3);

        // Add DiamondLoupeFacet
        bytes4[] memory loupeSelectors = new bytes4[](5);
        loupeSelectors[0] = DiamondLoupeFacet.facets.selector;
        loupeSelectors[1] = DiamondLoupeFacet.facetFunctionSelectors.selector;
        loupeSelectors[2] = DiamondLoupeFacet.facetAddresses.selector;
        loupeSelectors[3] = DiamondLoupeFacet.facetAddress.selector;
        loupeSelectors[4] = DiamondLoupeFacet.supportsInterface.selector;

        cuts[0] = IDiamondCut.FacetCut({
            facetAddress: address(diamondLoupeFacet),
            action: IDiamondCut.FacetCutAction.Add,
            functionSelectors: loupeSelectors
        });

        // Add OwnershipFacet
        bytes4[] memory ownershipSelectors = new bytes4[](2);
        ownershipSelectors[0] = OwnershipFacet.transferOwnership.selector;
        ownershipSelectors[1] = OwnershipFacet.owner.selector;

        cuts[1] = IDiamondCut.FacetCut({
            facetAddress: address(ownershipFacet),
            action: IDiamondCut.FacetCutAction.Add,
            functionSelectors: ownershipSelectors
        });

        // Add AuthUser facet
        bytes4[] memory authSelectors = new bytes4[](1);
        authSelectors[0] = AuthUser.mintAuthNFT.selector;

        cuts[2] = IDiamondCut.FacetCut({
            facetAddress: address(authUserFacet),
            action: IDiamondCut.FacetCutAction.Add,
            functionSelectors: authSelectors
        });

        // Execute diamond cut
        IDiamondCut(address(diamond)).diamondCut(cuts, address(0), "");

        console.log("All facets added to diamond successfully!");

        vm.stopBroadcast();

        // Log deployment addresses for frontend configuration
        console.log("\n=== DEPLOYMENT ADDRESSES ===");
        console.log("Diamond (Main Contract):", address(diamond));
        console.log("DiamondCutFacet:", address(diamondCutFacet));
        console.log("DiamondLoupeFacet:", address(diamondLoupeFacet));
        console.log("OwnershipFacet:", address(ownershipFacet));
        console.log("AuthUser:", address(authUserFacet));
        
        console.log("\n=== ENVIRONMENT VARIABLES ===");
        console.log("NEXT_PUBLIC_DIAMOND_CONTRACT_ADDRESS=", address(diamond));
        console.log("NEXT_PUBLIC_DIAMOND_CUT_FACET_ADDRESS=", address(diamondCutFacet));
        console.log("NEXT_PUBLIC_AUTH_USER_FACET_ADDRESS=", address(authUserFacet));
    }
} 