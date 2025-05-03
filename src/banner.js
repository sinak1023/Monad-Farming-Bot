require("colors");

function displayHeader() {
  process.stdout.write("\x1Bc"); 

  console.log(`
            ${"✅ Prepare faucet MON".bold}
            ${"✅ 1 IP 1 wallet".bold}
            ${"✅ No multi address".bold}
            ${"✅ Gas fee auto detect".bold}
            ${"✅ Send address random amount & random generate new address".bold}
            ${"✅ If the transaction fails, it is very normal because the network is congested,".bold}
            ${"   and the testnet chain, if all of them are successful, is called Mainnet.".bold}
            ${"❤️  Please appreciate with join my group:".bold} ${"https://t.me/ostadkachal".underline.brightCyan}
            ${"❤️  This ensures users can join the Telegram community easily and stay engaged with updates and discussions.".bold}
  `.split("\n").join("\n")); 
}

module.exports = displayHeader;
