// deploy/00_deploy_your_contract.js

// module.exports = async ({ getNamedAccounts, deployments }) => {
//   const { deploy } = deployments;
//   const { deployer } = await getNamedAccounts();
//   await deploy("YourCollectible", {
//     // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
//     from: deployer,
//     // args: ["Hello"],
//     log: true,
//   });

//   /*
//     // Getting a previously deployed contract
//     const YourContract = await ethers.getContract("YourContract", deployer);
//     await YourContract.setPurpose("Hello");
//     //const yourContract = await ethers.getContractAt('YourContract', "0xaAC799eC2d00C013f1F11c37E654e59B0429DF6A") //<-- if you want to instantiate a version of a contract at a specific address!
//   */
// };
// module.exports.tags = ["YourCollectible"];

/*
Tenderly verification
let verification = await tenderly.verify({
  name: contractName,
  address: contractAddress,
  network: targetNetwork,
});
*/

const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const NFTMarket = await hre.ethers.getContractFactory("NFTMarket");
  const nftMarket = await NFTMarket.deploy();
  await nftMarket.deployed();
  console.log("nftMarket deployed to :", `${nftMarket.address}`);

  const NFT = await hre.ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(nftMarket.address);
  await nft.deployed();
  console.log("nft deployed to:", nft.address);

  const Fractionalize = await hre.ethers.getContractFactory("Fractionalize");
  const fractionalize = await Fractionalize.deploy(nft.address);
  await fractionalize.deployed();
  console.log("Fractionalize deployed to:", fractionalize.address);

  const config = `
  export const nftmarketaddress = "${nftMarket.address}"
  export const nftaddress = "${nft.address}"
  export const fractinalize = "${fractionalize.address}"
  `;

  const data = JSON.stringify(config);
  fs.writeFileSync("config.js", JSON.parse(data));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
