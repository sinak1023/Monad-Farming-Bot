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

const EXPLORER_URL = "https://testnet.monadexplorer.com/tx/";
const contractAddress = "0x2c9C959516e9AAEdB2C748224a41249202ca8BE7";
const gasLimitStake = 500000;
const gasLimitUnstake = 800000;

const STAKE_AMOUNT = ethers.utils.parseEther("0.1");
const UNSTAKE_DELAY = 5 * 60 * 1000;

async function connectToRpc() {
    for (const url of RPC_URLS) {
        try {
            const provider = new ethers.providers.JsonRpcProvider(url);
            await provider.getNetwork();
            console.log(`🚀 Connected to RPC: ${url}`.blue);
            return provider;
        } catch (error) {
            console.log(`Failed to connect to ${url}: ${error.message}`.yellow);
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
        console.log(`💳 Loaded wallet: ${selectedWallet.id} (${selectedWallet.address})`.green);
        return selectedWallet;
    } catch (error) {
        console.error(`❌ Failed to load wallet: ${error.message}`.red);
        process.exit(1);
    }
}

async function stakeMON(wallet) {
    try {
        console.log(`🔄 Staking: ${ethers.utils.formatEther(STAKE_AMOUNT)} MON`.magenta);

        const tx = {
            to: contractAddress,
            data: "0xd5575982",
            gasLimit: ethers.utils.hexlify(gasLimitStake),
            value: STAKE_AMOUNT,
        };

        console.log(`✅ Initiating Stake`.green);
        const txResponse = await wallet.sendTransaction(tx);
        console.log(`➡️ Transaction Hash: ${EXPLORER_URL}${txResponse.hash}`.yellow);
        console.log(`⏳ Awaiting Confirmation`.grey);
        await txResponse.wait();
        console.log(`✅ Stake Completed`.green);

        return STAKE_AMOUNT;
    } catch (error) {
        console.error(`❌ Staking failed: ${error.message}`.red);
        throw error;
    }
}

async function unstakeGMON(wallet, amountToUnstake) {
    try {
        console.log(`✅ Unstaking: ${ethers.utils.formatEther(amountToUnstake)} gMON`.green);

        const functionSelector = "0x6fed1ea7";
        const paddedAmount = ethers.utils.hexZeroPad(amountToUnstake.toHexString(), 32);
        const data = functionSelector + paddedAmount.slice(2);

        const tx = {
            to: contractAddress,
            data: data,
            gasLimit: ethers.utils.hexlify(gasLimitUnstake),
        };

        console.log(`✅ Initiating Unstake`.green);
        const txResponse = await wallet.sendTransaction(tx);
        console.log(`➡️ Transaction Hash: ${EXPLORER_URL}${txResponse.hash}`.yellow);
        console.log(`⏳ Awaiting Confirmation`.grey);
        await txResponse.wait();
        console.log(`✅ Unstake Completed!`.green);
    } catch (error) {
        console.error(`❌ Unstaking failed: ${error.message}`.red);
        throw error;
    }
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runAutoCycle(wallet) {
    try {
        const stakeAmount = await stakeMON(wallet);
        console.log(`⏳ Waiting 5 minutes before unstaking`.grey);
        await delay(UNSTAKE_DELAY);
        await unstakeGMON(wallet, stakeAmount);
    } catch (error) {
        console.error(`❌ Operation failed: ${error.message}`.red);
        throw error;
    }
}

async function main() {
    console.log(`🚀 Starting Kitsu Module 🚀`.blue);
    const walletData = await loadWallet();
    const provider = await connectToRpc();
    const wallet = new ethers.Wallet(walletData.privateKey, provider);
    await runAutoCycle(wallet);
}

main().catch(error => {
    console.error(`❌ Main execution failed: ${error.message}`.red);
    process.exit(1);
});
