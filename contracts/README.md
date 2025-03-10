# VISE Network Smart Contracts

This directory contains the core smart contracts for the VISE Network protocol, built using Foundry.

## Contract Architecture

### Core Contracts

1. **VISENetwork.sol**
   - Main protocol contract managing video indexing and node operations
   - Handles task assignment, completion, and reward distribution
   - Implements deadline-based task management and reassignment

2. **VISEToken.sol**
   - ERC20 token with permit functionality
   - 8 decimals precision
   - Controlled minting for node rewards

## Development Setup

### Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation.html)
- Solidity ^0.8.20
- OpenZeppelin Contracts

### Installation

1. Clone the repository
2. Install dependencies:
```shell
forge install
```

## Building

```shell
$ forge build
```

## Testing

Run the full test suite:
```shell
$ forge test
```

Run tests with gas reporting:
```shell
$ forge test --gas-report
```

## Contract Deployment

1. Set up environment variables:
```shell
export RPC_URL=<your_rpc_url>
export PRIVATE_KEY=<your_private_key>
```

2. Deploy contracts:
```shell
$ forge script script/Deploy.s.sol:DeployScript --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast
```

## Development Tools

### Local Testing
```shell
$ anvil
```

### Contract Interaction
```shell
$ cast call <contract_address> <function_signature> [args...]
```

### Code Formatting
```shell
$ forge fmt
```

### Gas Snapshots
```shell
$ forge snapshot
```

## Documentation

For detailed Foundry documentation, visit: https://book.getfoundry.sh/

## Security

Before deploying:
- Run all tests
- Perform gas optimization
- Consider running a security audit
- Review all access controls and reentrancy guards

## License

MIT License
