# Monad Farming Bot

A Node.js-based bot designed for automated farming on the Monad Testnet. This bot supports multiple wallets and executes various modules for staking, swapping, and deploying contracts on the Monad blockchain.

## Features
- **Multi-Wallet Support**: Manage multiple wallets for farming operations.
- **Modular Design**: Includes modules for Uniswap, Rubic Swap, Bean Swap, Magma Staking, Izumi Swap, aPriori Staking, Bebob Swap, Monorail, Kitsu, AutoSend, and Contract Deployment.
- **Fully English Interface**: All logs and messages are in English for universal accessibility.
- **Automated Transactions**: Performs staking, unstaking, token swaps, and contract deployments with random delays and amounts for natural transaction patterns.

## Prerequisites
- **Node.js**: Version 16 or higher.
- **npm**: Node package manager.
- **Monad Testnet Access**: RPC URLs and testnet tokens (MON).
- **Environment Variables**: A `.env` file with wallet private keys.

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/monad-farming-bot.git
   cd monad-farming-bot
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your private key(s):
   ```env
   PRIVATE_KEY=your_private_key_here
   ```
   For multi-wallet support, wallets are managed via a `wallets.json` file (auto-generated on first run).

## Usage
1. Run the bot:
   ```bash
   node main.js
   ```
2. Follow the prompts to:
   - Select or add wallets.
   - Choose modules to execute (e.g., Uniswap, Rubic Swap, etc.).
   - Specify the number of execution loops.
3. The bot will execute the selected modules sequentially, logging transaction details and statuses.

## Modules
- **Uniswap**: Swaps MON for various tokens and back.
- **Rubic Swap**: Wraps and unwraps MON to WMON.
- **Bean Swap**: Swaps MON for multiple tokens and reverses.
- **Magma Staking**: Stakes and unstakes random amounts of MON.
- **Izumi Swap**: Wraps and unwraps MON to WMON.
- **aPriori Staking**: Stakes, unstakes, and claims MON.
- **Bebob Swap**: Wraps and unwraps MON to WMON.
- **Monorail**: Executes specific transactions on the Monad Testnet.
- **Kitsu**: Stakes and unstakes fixed amounts of MON.
- **AutoSend**: Sends random small amounts of MON to newly generated wallets.
- **Deploy Contract**: Deploys multiple Solidity contracts with random names.

## Wallet Management
- Wallets are stored in `wallets.json`.
- Use the interactive prompt to add new wallets or select an existing one.
- Each wallet requires an `id`, `address`, and `privateKey`.

## Security Notes
- **Private Keys**: Store private keys securely in the `.env` file or `wallets.json`. Never share them publicly.
- **Testnet Only**: This bot is designed for the Monad Testnet. Do not use mainnet wallets or funds.
- **Random Delays**: The bot uses random delays to mimic natural transaction patterns, reducing the risk of detection.

## Contributing
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add your feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a Pull Request.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Disclaimer
This bot is for educational and testing purposes only. Use it at your own risk. The authors are not responsible for any financial losses or other issues arising from its use.

# Support the Project

If you find this project helpful, consider supporting it by buying me a coffee! Your contributions help keep the project alive and growing.

**Wallet Address (Base):**  
`0x7A43342707de2FA07b0C4cCe132dFD49fdA2a711`

Thank you for your support! ☕
