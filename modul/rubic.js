const { ethers } = require("ethers");
const colors = require("colors");
const cfonts = require("cfonts");
const fs = require("fs").promises;
const path = require("path");

const displayHeader = require("../src/banner.js");

displayHeader();

const RPC_URLS = [
    "https://testnet-rpc.monorail.xyz",
    "https://testnet-rpc.monad.xyz",
    "https://monad-testnet.drpc.org"
];

const WMON_CONTRACT = "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701";
const EXPLORER_URL = "https://testnet.monadexplorer.com/tx/";

async function connectToRpc() {
    for (const url of RPC_URLS) {
        try {
            const provider = new ethers.providers.JsonRpcProvider(url);
            await provider.getNetwork();
            console.log(`🚀 Connected to RPC: ${url}`.blue);
            return provider;
        } catch (error) {
            console.log(`Failed to connect to ${url}, trying another...`.yellow);
        }
    }
    throw new Error(`❌ Unable to connect to any RPC`.red);
}

async function loadWallet() {
    const WALLET_FILE = path.join(__dirname, "../wallets.json");
    try {
        const data = await fs.readFile(WALLET_FILE, "utf8");
        const wallets = JSON.parse(data);
        if (!wallets.length) {
            throw new Error("No wallets found in wallets.json");
        }
        const selectedWallet = wallets.find(w => w.id === process.env.WALLET_ID) || wallets[0];
        if (!selectedWallet.privateKey) {
            throw new Error("No private key found for selected wallet");
        }
        return selectedWallet;
    } catch (error) {
        console.error(`❌ Failed to load wallet: ${error.message}`.red);
        process.exit(1);
    }
}

function getRandomAmount() {
    const min = 0.01;
    const max = 0.05;
    const randomAmount = Math.random() * (max - min) + min;
    return ethers.utils.parseEther(randomAmount.toFixed(4));
}

function getRandomDelay() {
    const minDelay = 1 * 60 * 1000;
    const maxDelay = 3 * 60 * 1000;
    return Math.floor(Math.random() * (maxDelay - minDelay + 1) + minDelay);
}

async function wrapMON(wallet, amount) {
    try {
        const contract = new ethers.Contract(
            WMON_CONTRACT,
            [
                "function deposit() public payable",
                "function withdraw(uint256 amount) public",
            ],
            wallet
        );

        console.log(`🔄 Wrapping ${ethers.utils.formatEther(amount)} MON to WMON`.magenta);
        const tx = await contract.deposit({ value: amount, gasLimit: 500000 });
        console.log(`✅ Successfully wrapped MON to WMON`.green);
        console.log(`➡️ Transaction Hash: ${EXPLORER_URL}${tx.hash}`.yellow);
        await tx.wait();
    } catch (error) {
        console.error(`❌ Error wrapping MON: ${error.message}`.red);
        throw error;
    }
}

async function unwrapMON(wallet, amount) {
    try {
        const contract = new ethers.Contract(
            WMON_CONTRACT,
            [
                "function deposit() public payable",
                "function withdraw(uint256 amount) public",
            ],
            wallet
        );

        console.log(`🔄 Unwrapping ${ethers.utils.formatEther(amount)} WMON to MON`.magenta);
        const tx = await contract.withdraw(amount, { gasLimit: 500000 });
        console.log(`✅ Successfully unwrapped WMON to MON`.green);
        console.log(`➡️ Transaction Hash: ${EXPLORER_URL}${tx.hash}`.yellow);
        await tx.wait();
    } catch (error) {
        console.error(`❌ Error unwrapping WMON: ${error.message}`.red);
        throw error;
    }
}

async function runSwapCycle(wallet, cycles = 1) {
    for (let i = 0; i < cycles; i++) {
        try {
            const randomAmount = getRandomAmount();
            const randomDelay = getRandomDelay();
            await wrapMON(wallet, randomAmount);
            await unwrapMON(wallet, randomAmount);
            console.log(`⏳ Waiting ${randomDelay / 1000 / 60} minutes`.grey);
            await new Promise((resolve) => setTimeout(resolve, randomDelay));
        } catch (error) {
            console.error(`❌ Cycle ${i + 1} failed: ${error.message}`.red);
        }
    }
}

async function main() {
    console.log(`🚀 Starting Rubic Module 🚀`.blue);
    const walletData = await loadWallet();
    const provider = await connectToRpc();
    const wallet = new ethers.Wallet(walletData.privateKey, provider);
    await runSwapCycle(wallet);
}

main().catch(error => {
    console.error(`❌ Main execution failed: ${error.message}`.red);
});
