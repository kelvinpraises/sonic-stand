// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {VIToken} from "../src/Token.sol";
import {VISENetwork} from "../src/Protocol.sol";

contract Deploy is Script {
    function run() external {
        // Private key for deployer account
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying contracts from address:", deployer);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Step 1: Deploy VIToken with deployer as initial owner
        VIToken token = new VIToken(deployer);
        console.log("VIToken deployed at address:", address(token));
        console.log("Token name:", token.name());
        console.log("Token symbol:", token.symbol());
        console.log("Token decimals:", token.decimals());
        
        // Step 2: Deploy VISENetwork protocol with token address
        VISENetwork protocol = new VISENetwork(address(token));
        console.log("VISENetwork protocol deployed at address:", address(protocol));
        
        // Step 3: Transfer token ownership to the protocol
        token.transferOwnership(address(protocol));
        console.log("Token ownership transferred to protocol");
        
        vm.stopBroadcast();
    }
}

// For Anvil local testnet:
// forge script contracts/script/Deploy.s.sol:Deploy \
// --rpc-url http://localhost:8545 \
// --broadcast -vvvv
//
// For deployment to Sonic Blaze testnet:
// forge script contracts/script/Deploy.s.sol:Deploy \
// --rpc-url https://sonic-blaze-rpc.publicnode.com \
// --broadcast -vvvv 