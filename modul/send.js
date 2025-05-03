const { ethers } = require('ethers');
require('dotenv').config();
const fs = require('fs');
const colors = require("colors");
const cfonts = require("cfonts");
const displayHeader = require("../src/banner.js");

displayHeader();

const network = {
    name: "Monad Testnet",
    chainId: 10143,
    rpc: "https://testnet-rpc.monorail.xyz",
    symbol: "MON",
    explorer: "https://testnet.monadexplorer.com"
};

const provider = new ethers.providers.JsonRpcProvider(network.rpc);

function generateNewWallet() {
    const wallet = ethers.Wallet.createRandom();
    return {
        address: wallet.address,
        privateKey: wallet.privateKey
    };
}

async function transferTokens(wallet, index) {
    const newWallet = generateNewWallet();
    
    const randomAmount = (Math.max(Math.random() * (0.001 - 0.0001) + 0.0001, 0.0001)).toFixed(6);
    
    const tx = {
        to: newWallet.address,
        value: ethers.utils.parseEther(randomAmount)
    };

    const transaction = await wallet.sendTransaction(tx);
    const shortAddress = newWallet.address.slice(-5);

    console.log(`✅ (${index + 1}/50) [Confirmed]: ${randomAmount} ${network.symbol} sent to ${shortAddress}: ${transaction.hash}`.green);
}

async function handleTokenTransfers(wallet) {
    console.log(`🚀 Starting AutoSend Module 🚀`.blue);
    for (let i = 0; i < 50; i++) {
        await transferTokens(wallet, i);
    }

    console.log('✅ All transactions completed successfully!'.green);
}

async function main() {
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    await handleTokenTransfers(wallet);
}

main().catch(console.error);