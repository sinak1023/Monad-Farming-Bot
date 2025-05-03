const prompts = require("prompts");
const displayHeader = require("./src/banner.js");
const { spawn } = require("child_process");
const fs = require("fs").promises;
const path = require("path");

async function loadChalk() {
  return (await import("chalk")).default;
}

(async () => {
  const chalk = await loadChalk();

  console.clear();
  displayHeader();
  console.log(chalk.blueBright.bold("\n🚀 Start Auto Modules\n"));

  const scripts = [
    { name: "Uniswap", path: "./modul/uniswap.js" },
    { name: "Deploy Contract", path: "./modul/deploy.mjs" },
    { name: "Rubic Swap", path: "./modul/rubic.js" },
    { name: "Bean Swap", path: "./modul/bean.js" },
    { name: "Magma Staking", path: "./modul/magma.js" },
    { name: "Izumi Swap", path: "./modul/izumi.js" },
    { name: "aPriori Staking", path: "./modul/apriori.js" },
    { name: "Bebob Swap", path: "./modul/bebop.js" },
    { name: "Monorail", path: "./modul/mono.js" },
    { name: "Kitsu", path: "./modul/kitsu.js" },
    { name: "AutoSend", path: "./modul/AutoSend.js" },
  ];

  const WALLET_FILE = path.join(__dirname, "wallets.json");

  async function loadWallets() {
    try {
      const data = await fs.readFile(WALLET_FILE, "utf8");
      return JSON.parse(data);
    } catch (error) {
      return [{ id: "default", address: process.env.WALLET_ADDRESS, privateKey: process.env.PRIVATE_KEY }];
    }
  }

  async function saveWallets(wallets) {
    await fs.writeFile(WALLET_FILE, JSON.stringify(wallets, null, 2));
  }

  async function manageWallets() {
    const wallets = await loadWallets();
    console.log(chalk.yellow("\n🔑 Available Wallets 🔑\n"));
    wallets.forEach((wallet, index) => {
      console.log(chalk.green(`  [${index + 1}] ${wallet.id} (${wallet.address})`));
    });

    const { action } = await prompts({
      type: "select",
      name: "action",
      message: "Select an action:",
      choices: [
        { title: "Add New Wallet", value: "add" },
        { title: "Select Wallet", value: "select" },
        { title: "Continue", value: "continue" },
      ],
    });

    if (action === "add") {
      const { id, address, privateKey } = await prompts([
        {
          type: "text",
          name: "id",
          message: "Enter wallet ID:",
          validate: (value) => (value ? true : "ID is required"),
        },
        {
          type: "text",
          name: "address",
          message: "Enter wallet address:",
          validate: (value) => (value ? true : "Address is required"),
        },
        {
          type: "text",
          name: "privateKey",
          message: "Enter private key:",
          validate: (value) => (value ? true : "Private key is required"),
        },
      ]);
      wallets.push({ id, address, privateKey });
      await saveWallets(wallets);
      console.log(chalk.green("✅ Wallet added successfully"));
      return manageWallets();
    } else if (action === "select") {
      const { selectedWallet } = await prompts({
        type: "select",
        name: "selectedWallet",
        message: "Select a wallet:",
        choices: wallets.map((wallet) => ({ title: `${wallet.id} (${wallet.address})`, value: wallet })),
      });
      return selectedWallet;
    }
    return wallets[0]; // Default wallet
  }

  console.log(chalk.yellow("🔹 Available Modules 🔹\n"));
  scripts.forEach((script, index) => {
    console.log(chalk.green(`  [${index + 1}] ${script.name}`));
  });
  console.log("");

  async function runScript(script, wallet) {
    console.log(chalk.yellow(`\n📜 Running: ${script.name} with wallet ${wallet.id}...`));

    return new Promise((resolve, reject) => {
      const env = { ...process.env, WALLET_ADDRESS: wallet.address, PRIVATE_KEY: wallet.privateKey };
      const process = spawn("node", script.path.endsWith(".mjs") ? ["--experimental-modules", script.path] : [script.path], { env });

      process.stdout.on("data", (data) => console.log(chalk.white(data.toString())));
      process.stderr.on("data", (data) => console.error(chalk.red(`Error: ${data.toString()}`)));

      process.on("close", (code) => {
        if (code === 0) {
          console.log(chalk.green(`✅ Success: ${script.name}`));
          resolve();
        } else {
          console.error(chalk.red(`❌ Failed: ${script.name} (Exit code: ${code})`));
          reject(new Error(`Module ${script.name} failed`));
        }
      });
    });
  }

  async function runScriptsSequentially(loopCount, selectedScripts, wallet) {
    for (let i = 0; i < loopCount; i++) {
      console.log(chalk.blueBright(`\n🔄 Loop ${i + 1} of ${loopCount}...\n`));
      for (const script of selectedScripts) {
        try {
          await runScript(script, wallet);
        } catch (error) {
          console.error(chalk.red(`⚠️ Skipping ${script.name} due to error`));
        }
      }
    }
  }

  async function main() {
    const wallet = await manageWallets();

    const { selectedModules } = await prompts({
      type: "multiselect",
      name: "selectedModules",
      message: "Select modules to run (use space to select):",
      instructions: `
      Instructions:
      - Use up/down arrows (↑/↓) to navigate
      - Press space (␣) to select or deselect
      - Press "a" to select all
      - Press Enter to continue`,
      choices: scripts.map((script) => ({
        title: script.name,
        value: script,
        selected: true,
      })),
      min: 1,
    });

    const { loopCount } = await prompts({
      type: "number",
      name: "loopCount",
      message: "How many times to run the modules?",
      validate: (value) => (value > 0 ? true : "Enter a number greater than 0"),
      initial: 1,
    });

    console.log(chalk.green(`\n🚀 Starting execution of ${selectedModules.length} modules for ${loopCount} loops with wallet ${wallet.id}\n`));

    await runScriptsSequentially(loopCount, selectedModules, wallet);

    console.log(chalk.green.bold("\n✅✅ All modules completed! ✅✅\n"));
  }

  main();
})();