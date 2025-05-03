import { config } from "dotenv";
import { ethers } from "ethers";
import solc from "solc";
import chalk from "chalk";
import ora from "ora";
import readline from "readline";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_FILE = path.join(__dirname, "../deploy.log");

async function logToFile(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    try {
        await fs.appendFile(LOG_FILE, logMessage);
    } catch (error) {
        console.error(chalk.red(`Failed to write to log file: ${error.message}`));
    }
}

const RPC_URLS = [
    "https://testnet-rpc.monorail.xyz",
    "https://testnet-rpc.monad.xyz",
    "https://monad-testnet.drpc.org"
];

const chemicalTerms = [
    "Atom", "Molecule", "Electron", "Proton", "Neutron", "Ion", "Isotope", "Reaction", "Catalyst", "Solution",
    "Acid", "Base", "pH", "Oxidation", "Reduction", "Bond", "Valence", "Electrolyte", "Polymer", "Monomer",
    "Enzyme", "Substrate", "Covalent", "Ionic", "Metal", "Nonmetal", "Gas", "Liquid", "Solid", "Plasma",
    "Entropy", "Enthalpy", "Thermodynamics", "OrganicChemistry", "InorganicChemistry", "Biochemistry", "PhysicalChemistry", "Analytical", "Synthesis", "Decomposition",
    "Exothermic", "Endothermic", "Stoichiometry", "Concentration", "Molarity", "Molality", "Titration", "Indicator", "Chromatography", "Spectroscopy",
    "Electrochemistry", "GalvanicCell", "Electrolysis", "Anode", "Cathode", "Electrode", "Hydrolysis", "Hydrogenation", "Dehydrogenation", "Polymerization",
    "Depolymerization", "Catalyst", "Inhibitor", "Adsorption", "Absorption", "Diffusion", "Osmosis", "Colloid", "Suspension", "Emulsion",
    "Aerosol", "Surfactant", "Detergent", "Soap", "AminoAcid", "Protein", "Carbohydrate", "Lipid", "Nucleotide", "DNA",
    "RNA", "ActivationEnergy", "Complex", "Ligand", "Coordination", "Crystal", "Amorphous", "Isomer", "Stereochemistry"
];

const planets = [
    "Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto", "Ceres",
    "Eris", "Haumea", "Makemake", "Ganymede", "Titan", "Callisto", "Io", "Europa", "Triton", "Charon",
    "Titania", "Oberon", "Rhea", "Iapetus", "Dione", "Tethys", "Enceladus", "Miranda", "Ariel", "Umbriel",
    "Proteus", "Nereid", "Phobos", "Deimos", "Amalthea", "Himalia", "Elara", "Pasiphae", "Sinope", "Lysithea",
    "Carme", "Ananke", "Leda", "Thebe", "Adrastea", "Metis", "Callirrhoe", "Themisto", "Megaclite", "Taygete",
    "Chaldene", "Harpalyke", "Kalyke", "Iocaste", "Erinome", "Isonoe", "Praxidike", "Autonoe", "Thyone", "Hermippe",
    "Aitne", "Eurydome", "Euanthe", "Euporie", "Orthosie", "Sponde", "Kale", "Pasithee", "Hegemone", "Mneme",
    "Aoede", "Thelxinoe", "Arche", "Kallichore", "Helike", "Carpo", "Eukelade", "Cyllene", "Kore", "Herse",
    "Dia", "S2003J2", "S2003J3", "S2003J4", "S2003J5", "S2003J9", "S2003J10", "S2003J12", "S2003J15"
];

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

async function connectToRpc() {
    for (const url of RPC_URLS) {
        try {
            const provider = new ethers.providers.JsonRpcProvider(url);
            await provider.getNetwork();
            const message = `Connected to RPC: ${url}`;
            console.log(chalk.blue(message));
            await logToFile(message);
            return provider;
        } catch (error) {
            const message = `Failed to connect to ${url}: ${error.message}`;
            console.log(chalk.yellow(message));
            await logToFile(message);
        }
    }
    const errorMessage = "Unable to connect to any RPC";
    console.error(chalk.red(errorMessage));
    await logToFile(errorMessage);
    throw new Error(errorMessage);
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
        const message = `Loaded wallet: ${selectedWallet.id} (${selectedWallet.address})`;
        console.log(chalk.green(message));
        await logToFile(message);
        return selectedWallet;
    } catch (error) {
        const errorMessage = `Failed to load wallet: ${error.message}`;
        console.error(chalk.red(errorMessage));
        await logToFile(errorMessage);
        process.exit(1);
    }
}

function generateRandomName() {
    const combinedTerms = [...chemicalTerms, ...planets];
    const shuffled = combinedTerms.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3).join("");
}

const contractSource = `
pragma solidity ^0.8.0;

contract Counter {
    uint256 private count;
    
    event CountIncremented(uint256 newCount);
    
    function increment() public {
        count += 1;
        emit CountIncremented(count);
    }
    
    function getCount() public view returns (uint256) {
        return count;
    }
}
`;

function compileContract() {
    const spinner = ora("Compiling contract...").start();

    try {
        const input = {
            language: "Solidity",
            sources: { "Counter.sol": { content: contractSource } },
            settings: { outputSelection: { "*": { "*": ["abi", "evm.bytecode"] } } }
        };

        const output = JSON.parse(solc.compile(JSON.stringify(input)));

        const contract = output.contracts["Counter.sol"].Counter;

        spinner.succeed(chalk.green("Contract compiled successfully!"));
        logToFile("Contract compiled successfully!");
        return { abi: contract.abi, bytecode: contract.evm.bytecode.object };
    } catch (error) {
        spinner.fail(chalk.red("Contract compilation failed!"));
        const errorMessage = `Contract compilation failed: ${error.message}\n${error.stack}`;
        console.error(error);
        logToFile(errorMessage);
        process.exit(1);
    }
}

async function deployContract(wallet, contractName) {
    const { abi, bytecode } = compileContract();
    const spinner = ora(`Deploying contract ${contractName} to blockchain...`).start();

    try {
        const nonce = await wallet.provider.getTransactionCount(wallet.address, "latest");
        const nonceMessage = `Using nonce: ${nonce}`;
        console.log(chalk.gray(nonceMessage));
        await logToFile(nonceMessage);

        const factory = new ethers.ContractFactory(abi, bytecode, wallet);
        const contract = await factory.deploy();

        console.log("⏳ Awaiting transaction confirmation...");
        await logToFile("Awaiting transaction confirmation...");
        const txReceipt = await contract.deployTransaction.wait();

        if (!txReceipt) {
            const errorMessage = "Failed to get transaction receipt.";
            console.log(chalk.red(errorMessage));
            await logToFile(errorMessage);
            process.exit(1);
        }

        if (txReceipt.status !== 1) {
            const errorMessage = "Deployment failed!";
            console.log(chalk.red(errorMessage));
            await logToFile(errorMessage);
            process.exit(1);
        } else {
            spinner.succeed(chalk.green(`Contract ${contractName} deployed successfully!`));
            const successMessage = `Contract ${contractName} deployed successfully!\nContract Address: ${contract.address}\nTransaction Hash: ${txReceipt.transactionHash}`;
            console.log(chalk.cyan.bold("\n📌 Contract Address: ") + chalk.yellow(contract.address));
            console.log(chalk.cyan.bold("\n📜 Transaction Hash: ") + chalk.yellow(txReceipt.transactionHash));
            console.log(chalk.green("\n✅ Deployment complete! 🎉\n"));
            await logToFile(successMessage);
        }
    } catch (error) {
        const errorMessage = `Deployment failed: ${error.message}\n${error.stack}`;
        spinner.fail(chalk.red(errorMessage));
        console.error(error);
        await logToFile(errorMessage);
        process.exit(1);
    }
}

async function main() {
    console.log(chalk.blue("🚀 Starting Contract Deployment 🚀"));
    await logToFile("Starting Contract Deployment");
    
    const walletData = await loadWallet();
    const provider = await connectToRpc();
    const wallet = new ethers.Wallet(walletData.privateKey, provider);

    const numberOfContracts = 5;

    for (let i = 0; i < numberOfContracts; i++) {
        const contractName = generateRandomName();
        const deployMessage = `Deploying contract ${i + 1}/${numberOfContracts}: ${contractName}`;
        console.log(chalk.yellow(`\n🔨 ${deployMessage}`));
        await logToFile(deployMessage);
        await deployContract(wallet, contractName);

        const delay = Math.floor(Math.random() * (6000 - 4000 + 1)) + 4000;
        const delayMessage = `Waiting for ${delay / 1000} seconds`;
        console.log(chalk.gray(`⏳ ${delayMessage}`));
        await logToFile(delayMessage);
        await new Promise((resolve) => setTimeout(resolve, delay));
    }

    const completeMessage = "All contracts deployed successfully!";
    console.log(chalk.green.bold(`\n✅ ${completeMessage} 🎉\n`));
    await logToFile(completeMessage);
    rl.close();
}

main().catch(async error => {
    const errorMessage = `Main execution failed: ${error.message}\n${error.stack}`;
    console.error(chalk.red(errorMessage));
    await logToFile(errorMessage);
    process.exit(1);
});
