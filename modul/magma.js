require("dotenv").config();
const ethers = require("ethers");
const colors = require("colors");
const cfonts = require("cfonts");
const displayHeader = require("../src/banner.js");

displayHeader();

const RPC_URL = "https://testnet-rpc.monad.xyz";
const EXPLORER_URL = "https://testnet.monadexplorer.com/tx/";
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

const contractAddress = "0x2c9C959516e9AAEdB2C748224a41249202ca8BE7";
const gasLimitStake = 500000;
const gasLimitUnstake = 800000;

function getRandomAmount() {
    const min = 0.01;
    const max = 0.05;
    const randomAmount = Math.random() * (max - min) + min;
    return ethers.utils.parseEther(randomAmount.toFixed(4));
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function stakeMON(wallet) {
    try {
        const stakeAmount = getRandomAmount();
        console.log(`🚀 Starting Magma Module 🚀`.blue);
        console.log(`🔄 Staking: ${ethers.utils.formatEther(stakeAmount)} MON`.magenta);

        const tx = {
            to: contractAddress,
            data: "0xd5575982",
            gasLimit: ethers.utils.hexlify(gasLimitStake),
            value: stakeAmount,
        };

        console.log(`🔄 Initiating Stake`.green);
        const txResponse = await wallet.sendTransaction(tx);
        console.log(`➡️ Transaction Hash: ${txResponse.hash}`.yellow);
        console.log(`🔄 Awaiting Confirmation`.green);
        await txResponse.wait();
        console.log(`✅ Stake Completed`.green);

        return stakeAmount;
    } catch (error) {
        console.error(`❌ Staking failed:`.red, error.message);
        throw error;
    }
}

async function unstakeGMON(wallet, amountToUnstake) {
    try {
        console.log(`🔄 Unstaking: ${ethers.utils.formatEther(amountToUnstake)} gMON`.green);

        const functionSelector = "0x6fed1ea7";
        const paddedAmount = ethers.utils.hexZeroPad(amountToUnstake.toHexString(), 32);
        const data = functionSelector + paddedAmount.slice(2);

        const tx = {
            to: contractAddress,
            data: data,
            gasLimit: ethers.utils.hexlify(gasLimitUnstake),
        };

        console.log(`🔄 Initiating Unstake`.green);
        const txResponse = await wallet.sendTransaction(tx);
        console.log(`➡️ Transaction Hash: ${txResponse.hash}`.yellow);
        console.log(`🔄 Awaiting Confirmation`.green);
        await txResponse.wait();
        console.log(`✅ Unstake Completed`.green);
    } catch (error) {
        console.error(`❌ Unstaking failed:`.red, error.message);
        throw error;
    }
}

async function runAutoCycle(wallet) {
    try {
        const stakeAmount = await stakeMON(wallet);
        console.log(`🔄 Awaiting unstake eligibility`.yellow);
        await delay(73383);
        await unstakeGMON(wallet, stakeAmount);
    } catch (error) {
        console.error(`❌ Operation failed:`.red, error.message);
    }
}

async function main() {
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    await runAutoCycle(wallet);
}

main();