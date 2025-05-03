require("dotenv").config();
const { ethers } = require("ethers");
const colors = require("colors");
const cfonts = require("cfonts");
const displayHeader = require("../src/banner.js");

displayHeader();

const RPC_URL = "https://testnet-rpc.monorail.xyz";
const EXPLORER_URL = "https://testnet.monadexplorer.com/tx/";
const WMON_CONTRACT = "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701";

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

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
    console.log(`➡️ Transaction Hash: ${tx.hash}`.yellow);
    await tx.wait();
  } catch (error) {
    console.error(`❌ Error wrapping MON:`.red, error);
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
    console.log(`➡️ Transaction Hash: ${tx.hash}`.yellow);
    await tx.wait();
  } catch (error) {
    console.error(`❌ Error unwrapping WMON:`.red, error);
  }
}

async function runSwapCycle(wallet, cycles = 1) {
  for (let i = 0; i < cycles; i++) {
    const randomAmount = getRandomAmount();
    const randomDelay = getRandomDelay();
    await wrapMON(wallet, randomAmount);
    await unwrapMON(wallet, randomAmount);
    console.log(`⏳ Waiting ${randomDelay / 1000 / 60} minutes`.grey);
    await new Promise((resolve) => setTimeout(resolve, randomDelay));
  }
}

async function main() {
  console.log(`🚀 Starting Rubic Module 🚀`.blue);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  await runSwapCycle(wallet);
}

main();