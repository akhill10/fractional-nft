// deploy/00_deploy_your_contract.js

const fs = require("fs");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const obj = await deploy("YourCollectible", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    // args: ["Hello"],
    log: true,
  });
  console.log(obj.address);
  const nftMarket = await deploy("NFTMarket", {
    from: deployer,
    log: true,
  });
  const nft = await deploy("NFT", {
    from: deployer,
    args: [nftMarket.address],
    log: true,
  });
  const fractionalize = await deploy("Fractionalize", {
    from: deployer,
    args: [nft.address],
    log: true,
  });

  const config = `
  export const nftmarketaddress = "${nftMarket.address}"
  export const nftaddress = "${nft.address}"
  export const fractionalize ="${fractionalize.address}"
  `

  const data = JSON.stringify(config)
  fs.writeFileSync("../react-app/src/config.js", JSON.parse(data));
  /*
    // Getting a previously deployed contract
    const YourContract = await ethers.getContract("YourContract", deployer);
    await YourContract.setPurpose("Hello");
    //const yourContract = await ethers.getContractAt('YourContract', "0xaAC799eC2d00C013f1F11c37E654e59B0429DF6A") //<-- if you want to instantiate a version of a contract at a specific address!
  */
};
module.exports.tags = ["YourCollectible", "NFTMarket", "NFT", "Fractionalize"];

/*
Tenderly verification
let verification = await tenderly.verify({
  name: contractName,
  address: contractAddress,
  network: targetNetwork,
});
*/
