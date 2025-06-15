// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "../src/Diamond/AuthUser.sol";
import "../src/Diamond/DiamondStorage.sol";
import "../src/Diamond/AutomationLoan.sol";
import {viewFacet} from "../src/Diamond/ViewFacet.sol";

/**
 * @title Additional TangibleFi Test Suite
 * @notice Additional tests focusing on contract behavior and edge cases
 */
contract TangibleFiAdditionalTests is Test {
    // Contracts
    AuthUser authUser;
    viewFacet vf;
    AutomationLoan loanContract;

    // Test addresses
    address owner = address(0x1);
    address borrower = address(0x2);
    address treasury = address(0x3);

    // Test parameters
    uint256 valuationAmount = 3000 * 10 ** 6;
    uint256 loanAmount = 1000 * 10 ** 6;
    uint256 loanDuration = 45 days;

    function setUp() public {
        // Setup accounts
        vm.startPrank(owner);
        vm.deal(owner, 100 ether);
        vm.deal(borrower, 5 ether);
        vm.deal(treasury, 10 ether);

        // Deploy contracts
        vf = new viewFacet();
        authUser = new AuthUser();
        
        vm.stopPrank();
    }

    // Simple test to verify setup
    function testSetup() public {
        assertTrue(address(vf) != address(0), "ViewFacet should be deployed");
        assertTrue(address(authUser) != address(0), "AuthUser should be deployed");
    }

    // Test interest rate calculation
    function testInterestRateCalculation() public {
        uint256 rate30Days = vf.calculateInterestRate(30 days);
        uint256 rate60Days = vf.calculateInterestRate(60 days);
        uint256 rate365Days = vf.calculateInterestRate(365 days);

        console.log("30 days rate:", rate30Days);
        console.log("60 days rate:", rate60Days);
        console.log("365 days rate:", rate365Days);

        assertTrue(rate60Days > rate30Days, "Longer duration should have higher rate");
        assertTrue(rate365Days > rate60Days, "Longest duration should have highest rate");
    }

    // Test loan terms calculation
    function testLoanTermsCalculation() public {
        (uint256 totalDebt, uint256 bufferAmount) = vf.calculateLoanTerms(
            loanAmount,
            loanDuration
        );

        assertTrue(totalDebt > loanAmount, "Total debt should be greater than loan amount");
        assertTrue(bufferAmount > 0, "Buffer amount should be positive");
        assertEq(totalDebt, loanAmount + bufferAmount, "Total debt should equal loan + buffer");
    }
}

//     // Test 1: Verify buffer is correctly calculated and transferred
//     function testBufferTransferOnly() public {
//         vm.startPrank(owner);
//         uint256 tokenId = authUser.mintAuthNFT(
//             borrower,
//             "ipfs://QmRWA123456789",
//             valuationAmount
//         );
//         vm.stopPrank();

//         vm.startPrank(borrower);

//         // Calculate expected buffer
//         (uint256 totalDebt, uint256 bufferAmount) = vf.calculateLoanTerms(
//             loanAmount,
//             loanDuration
//         );

//         console.log("Loan amount:", loanAmount);
//         console.log("Buffer amount:", bufferAmount);
//         console.log("Total debt:", totalDebt);

//         // Approve only the buffer amount
//         uint256 accountId = userAccountNFT.mint(borrower);
//         usdc.approve(address(loanContract), bufferAmount);
//         authUser.approve(address(loanContract), tokenId);

//         // Capture borrower's balance before
//         uint256 balanceBefore = usdc.balanceOf(borrower);
//         uint256 contractBalanceBefore = usdc.balanceOf(address(loanContract));

//         // Try to create loan with minimally modified behavior
//         try
//             MockModifiedLoan(address(loanContract)).createLoanBufferOnly(
//                 tokenId,
//                 accountId,
//                 loanDuration,
//                 loanAmount,
//                 address(usdc)
//             )
//         {
//             // Check that only buffer was transferred
//             uint256 balanceAfter = usdc.balanceOf(borrower);
//             uint256 contractBalanceAfter = usdc.balanceOf(
//                 address(loanContract)
//             );

//             assertEq(
//                 balanceBefore - balanceAfter,
//                 bufferAmount,
//                 "Should only transfer buffer amount"
//             );
//             assertEq(
//                 contractBalanceAfter - contractBalanceBefore,
//                 bufferAmount,
//                 "Contract should receive buffer"
//             );

//             // Verify NFT ownership
//             assertEq(
//                 authUser.ownerOf(tokenId),
//                 address(loanContract),
//                 "NFT should be transferred to contract"
//             );
//         } catch Error(string memory reason) {
//             console.log("Test failed with reason:", reason);
//             fail("Buffer-only loan creation failed");
//         }

//         vm.stopPrank();
//     }

//     // Test 2: Fund contract first, then test full loan flow with proper disbursement
//     function testWithContractPreFunded() public {
//         // Contract is pre-funded in setup

//         // Create loan with proper NFT valuation
//         vm.startPrank(owner);
//         uint256 tokenId = authUser.mintAuthNFT(
//             borrower,
//             "ipfs://QmRWA123456789",
//             valuationAmount * 10 // Make valuation higher to avoid LTV issues
//         );
//         vm.stopPrank();

//         vm.startPrank(borrower);

//         // Get loan terms
//         (uint256 totalDebt, uint256 bufferAmount) = vf.calculateLoanTerms(
//             loanAmount,
//             loanDuration
//         );

//         // Track initial balances
//         uint256 borrowerInitial = usdc.balanceOf(borrower);
//         uint256 contractInitial = usdc.balanceOf(address(loanContract));

//         console.log("Initial borrower balance:", borrowerInitial);
//         console.log("Initial contract balance:", contractInitial);

//         // Approve tokens and NFT
//         uint256 accountId = userAccountNFT.mint(borrower);
//         usdc.approve(address(loanContract), totalDebt); // Approve full amount including interest
//         authUser.approve(address(loanContract), tokenId);

//         // Record loan creation for tracking
//         vm.recordLogs();

//         // Create loan
//         loanContract.createLoan(
//             tokenId,
//             accountId,
//             loanDuration,
//             loanAmount,
//             address(usdc)
//         );

//         // Extract loan ID
//         Vm.Log[] memory entries = vm.getRecordedLogs();
//         bytes32 loanCreatedSig = 0x6bed453259640f0e1d2bd144b3cfa6b931d35f7023635806212eeecffbaacdf0;
//         td.loanId = 0;

//         for (uint i = 0; i < entries.length; i++) {
//             if (entries[i].topics[0] == loanCreatedSig) {
//                 td.loanId = uint256(entries[i].topics[1]);
//                 break;
//             }
//         }

//         require(td.loanId > 0, "Loan ID not found in events");

//         // Verify final balances
//         uint256 borrowerFinal = usdc.balanceOf(borrower);
//         uint256 contractFinal = usdc.balanceOf(address(loanContract));

//         console.log("Final borrower balance:", borrowerFinal);
//         console.log("Final contract balance:", contractFinal);

//         // Borrower should have received loan amount minus buffer
//         assertEq(
//             borrowerFinal,
//             borrowerInitial + loanAmount - bufferAmount,
//             "Borrower should receive loan minus buffer"
//         );

//         // Contract should have gained buffer amount
//         assertEq(
//             contractFinal,
//             contractInitial + bufferAmount - loanAmount,
//             "Contract should hold buffer minus disbursed loan"
//         );

//         vm.stopPrank();
//     }

//     // Test 3: Cross-chain loan creation
//     function testCrossChainLoanCreation() public {
//         vm.startPrank(owner);
//         uint256 tokenId = authUser.mintAuthNFT(
//             borrower,
//             "ipfs://QmRWA123456789",
//             valuationAmount
//         );
//         vm.stopPrank();

//         vm.startPrank(borrower);

//         uint256 accountId = userAccountNFT.mint(borrower);
//         authUser.approve(address(loanContract), tokenId);

//         // Record events
//         vm.recordLogs();

//         // Create cross-chain loan (sourceChainSelector != 0)
//         loanContract.createLoan(
//             tokenId,
//             accountId,
//             loanDuration,
//             loanAmount,
//             address(usdc),
//             12345, // sourceChainSelector
//             borrower // sourceAddress
//         );

//         // Verify LoanRequested event was emitted
//         Vm.Log[] memory entries = vm.getRecordedLogs();
//         bool loanRequestedFound = false;

//         for (uint i = 0; i < entries.length; i++) {
//             // LoanRequested event signature
//             if (entries[i].topics.length > 0) {
//                 loanRequestedFound = true;
//                 break;
//             }
//         }

//         assertTrue(loanRequestedFound, "LoanRequested event should be emitted");

//         vm.stopPrank();
//     }

//     // Test 4: Monthly payment functionality
//     function testMonthlyPayment() public {
//         // First create a loan
//         vm.startPrank(owner);
//         uint256 tokenId = authUser.mintAuthNFT(
//             borrower,
//             "ipfs://QmRWA123456789",
//             valuationAmount * 10
//         );
//         vm.stopPrank();

//         vm.startPrank(borrower);

//         uint256 accountId = userAccountNFT.mint(borrower);
//         usdc.approve(address(loanContract), type(uint256).max);
//         authUser.approve(address(loanContract), tokenId);

//         // Create loan
//         loanContract.createLoan(
//             tokenId,
//             accountId,
//             loanDuration,
//             loanAmount,
//             address(usdc),
//             0, // same-chain
//             address(0)
//         );

//         // Get loan ID from events
//         vm.recordLogs();
//         Vm.Log[] memory entries = vm.getRecordedLogs();
//         uint256 loanId = 1; // Assuming first loan

//         // Fast forward time to next month
//         vm.warp(block.timestamp + 31 days);

//         // Make monthly payment
//         loanContract.makeMonthlyPayment(loanId);

//         vm.stopPrank();
//     }

//     // Test 5: Loan liquidation
//     function testLoanLiquidation() public {
//         // Create loan first
//         vm.startPrank(owner);
//         uint256 tokenId = authUser.mintAuthNFT(
//             borrower,
//             "ipfs://QmRWA123456789",
//             valuationAmount * 10
//         );
//         vm.stopPrank();

//         vm.startPrank(borrower);

//         uint256 accountId = userAccountNFT.mint(borrower);
//         usdc.approve(address(loanContract), type(uint256).max);
//         authUser.approve(address(loanContract), tokenId);

//         loanContract.createLoan(
//             tokenId,
//             accountId,
//             loanDuration,
//             loanAmount,
//             address(usdc),
//             0,
//             address(0)
//         );

//         vm.stopPrank();

//         // Fast forward past payment due date
//         vm.warp(block.timestamp + 35 days);

//         // Trigger upkeep to liquidate
//         (bool upkeepNeeded, bytes memory performData) = loanContract
//             .checkUpkeep("");

//         if (upkeepNeeded) {
//             loanContract.performUpkeep(performData);
//         }
//     }

//     // Test 6: Full loan repayment
//     function testFullLoanRepayment() public {
//         // Create loan
//         vm.startPrank(owner);
//         uint256 tokenId = authUser.mintAuthNFT(
//             borrower,
//             "ipfs://QmRWA123456789",
//             valuationAmount * 10
//         );
//         vm.stopPrank();

//         vm.startPrank(borrower);

//         uint256 accountId = userAccountNFT.mint(borrower);
//         usdc.approve(address(loanContract), type(uint256).max);
//         authUser.approve(address(loanContract), tokenId);

//         loanContract.createLoan(
//             tokenId,
//             accountId,
//             loanDuration,
//             loanAmount,
//             address(usdc),
//             0,
//             address(0)
//         );

//         uint256 loanId = 1;

//         // Repay full loan
//         loanContract.repayLoanFull(loanId);

//         vm.stopPrank();
//     }

//     // Test 7: Interest rate calculation
//     function testInterestRateCalculation() public {
//         uint256 rate30Days = vf.calculateInterestRate(30 days);
//         uint256 rate60Days = vf.calculateInterestRate(60 days);
//         uint256 rate365Days = vf.calculateInterestRate(365 days);

//         console.log("30 days rate:", rate30Days);
//         console.log("60 days rate:", rate60Days);
//         console.log("365 days rate:", rate365Days);

//         assertTrue(rate60Days > rate30Days, "Longer duration should have higher rate");
//         assertTrue(rate365Days > rate60Days, "Longest duration should have highest rate");
//     }

//     // Test 8: Loan terms calculation
//     function testLoanTermsCalculation() public {
//         (uint256 totalDebt, uint256 bufferAmount) = vf.calculateLoanTerms(
//             loanAmount,
//             loanDuration
//         );

//         assertTrue(totalDebt > loanAmount, "Total debt should be greater than loan amount");
//         assertTrue(bufferAmount > 0, "Buffer amount should be positive");
//         assertEq(totalDebt, loanAmount + bufferAmount, "Total debt should equal loan + buffer");
//     }

//     // Test 9: Edge case - Invalid loan duration
//     function testInvalidLoanDuration() public {
//         vm.startPrank(owner);
//         uint256 tokenId = authUser.mintAuthNFT(
//             borrower,
//             "ipfs://QmRWA123456789",
//             valuationAmount
//         );
//         vm.stopPrank();

//         vm.startPrank(borrower);

//         uint256 accountId = userAccountNFT.mint(borrower);
//         authUser.approve(address(loanContract), tokenId);

//         // Try to create loan with invalid duration (too short)
//         vm.expectRevert();
//         loanContract.createLoan(
//             tokenId,
//             accountId,
//             15 days, // Too short
//             loanAmount,
//             address(usdc),
//             0,
//             address(0)
//         );

//         // Try to create loan with invalid duration (too long)
//         vm.expectRevert();
//         loanContract.createLoan(
//             tokenId,
//             accountId,
//             400 days, // Too long
//             loanAmount,
//             address(usdc),
//             0,
//             address(0)
//         );

//         vm.stopPrank();
//     }

//     // Test 10: Multiple loans per user
//     function testMultipleLoansPerUser() public {
//         vm.startPrank(owner);
//         uint256 tokenId1 = authUser.mintAuthNFT(
//             borrower,
//             "ipfs://QmRWA123456789",
//             valuationAmount * 10
//         );
//         uint256 tokenId2 = authUser.mintAuthNFT(
//             borrower,
//             "ipfs://QmRWA987654321",
//             valuationAmount * 10
//         );
//         vm.stopPrank();

//         vm.startPrank(borrower);

//         uint256 accountId1 = userAccountNFT.mint(borrower);
//         uint256 accountId2 = userAccountNFT.mint(borrower);

//         usdc.approve(address(loanContract), type(uint256).max);
//         authUser.approve(address(loanContract), tokenId1);
//         authUser.approve(address(loanContract), tokenId2);

//         // Create first loan
//         loanContract.createLoan(
//             tokenId1,
//             accountId1,
//             loanDuration,
//             loanAmount,
//             address(usdc),
//             0,
//             address(0)
//         );

//         // Create second loan
//         loanContract.createLoan(
//             tokenId2,
//             accountId2,
//             loanDuration,
//             loanAmount / 2,
//             address(usdc),
//             0,
//             address(0)
//         );

//         // Verify user has multiple loans
//         uint256[] memory userLoans = vf.getUserLoans(borrower);
//         assertEq(userLoans.length, 2, "User should have 2 loans");

//         vm.stopPrank();
//     }
// }

// // Mock contracts for testing
// contract MockToken {
//     mapping(address => uint256) public balanceOf;
//     mapping(address => mapping(address => uint256)) public allowance;

//     constructor() {
//         balanceOf[msg.sender] = 1000000 * 10**6; // 1M tokens
//     }

//     function transfer(address to, uint256 amount) external returns (bool) {
//         balanceOf[msg.sender] -= amount;
//         balanceOf[to] += amount;
//         return true;
//     }

//     function transferFrom(address from, address to, uint256 amount) external returns (bool) {
//         allowance[from][msg.sender] -= amount;
//         balanceOf[from] -= amount;
//         balanceOf[to] += amount;
//         return true;
//     }

//     function approve(address spender, uint256 amount) external returns (bool) {
//         allowance[msg.sender][spender] = amount;
//         return true;
//     }
// }

// contract MockNFT {
//     uint256 private _tokenIdCounter;
//     mapping(uint256 => address) public ownerOf;

//     function mint(address to) external returns (uint256) {
//         uint256 tokenId = ++_tokenIdCounter;
//         ownerOf[tokenId] = to;
//         return tokenId;
//     }
// }

// contract MockModifiedLoan {
//     address private target;

//     constructor(address _target) {
//         target = _target;
//     }

//     function createLoanBufferOnly(
//         uint256 tokenId,
//         uint256 accountId,
//         uint256 duration,
//         uint256 amount,
//         address tokenAddress
//     ) external {
//         // This would be a modified version that only takes buffer
//         // Implementation would depend on the actual contract modification
//         revert("Mock implementation");
//     }
// }

// contract LoanTracker {
//     // Mock loan tracking contract
//     mapping(uint256 => bool) public trackedLoans;

//     function trackLoan(uint256 loanId) external {
//         trackedLoans[loanId] = true;
//     }
// } 