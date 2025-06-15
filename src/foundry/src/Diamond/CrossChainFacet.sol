// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Client} from "@chainlink/contracts/src/v0.8/ccip/libraries/Client.sol";
import {CCIPReceiver} from "@chainlink/contracts/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {LibCrossChain} from "./LibCrossChain.sol"; // NEW: Import the logic library

contract CrossChainFacet is CCIPReceiver {
    // You still deploy this with the CCIP Router address for your chain.
    constructor(address router) CCIPReceiver(router) {}

    /**
     * @notice The single entry point for all incoming CCIP messages.
     * @dev Its only job is to pass the raw message to the LibCrossChain for processing.
     *      This keeps the facet clean and separates the entry point from the business logic.
     */
    function _ccipReceive(
        Client.Any2EVMMessage memory message
    ) internal override {
        LibCrossChain.EVMTokenAmount[] memory tokens = new LibCrossChain.EVMTokenAmount[](
            message.destTokenAmounts.length // Changed from tokenAmounts to destTokenAmounts
        );

        for (uint i = 0; i < message.destTokenAmounts.length; i++) {
            // Changed here too
            tokens[i] = LibCrossChain.EVMTokenAmount({
                token: message.destTokenAmounts[i].token, // And here
                amount: message.destTokenAmounts[i].amount // And here
            });
        }

        LibCrossChain.processIncomingPayment(message.data, tokens);
    }
} 