/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */
const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

const newLocal = "bignumber.js";
// eslint-disable-next-line import/no-dynamic-require
const { BigNumber } = require(newLocal);

BigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_DOWN });

const toBn = (num) => {
  return new BigNumber(num.toString());
};
const numToWei = (amount, decimals) => {
  const amt = toBn(amount);
  const dec = toBn(decimals);
  const ten = toBn(10);

  const result = amt.times(ten.pow(dec));
  return result.toFixed(0, 1); // rounding mode: Round_down
};
use(solidity);

describe("NFTMarket", function () {
  it("Should create and execute market sales", async function () {
    const Market = await ethers.getContractFactory("NFTMarket");
    const market = await Market.deploy();
    await market.deployed();
    const marketAddress = market.address;

    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(marketAddress);
    await nft.deployed();
    const nftContractAddress = nft.address;

    let listingPrice = await market.getListingPrice();
    // eslint-disable-next-line no-unused-vars
    listingPrice = listingPrice.toString();

    const auctionPrice = ethers.utils.parseUnits("100", "ether");

    await nft.createToken("https://www.mytokenloaction.com");
    await nft.createToken("https://www.mytokenlocation2.com");
    const [_, buyerAddress] = await ethers.getSigners();

    await market.createMarketItem(
      nftContractAddress,
      _.address,
      1,
      auctionPrice,
      {
        value: listingPrice,
      }
    );
    await market.createMarketItem(
      nftContractAddress,
      _.address,
      2,
      auctionPrice,
      {
        value: listingPrice,
      }
    );

    await market.connect(buyerAddress).createMarketSale(nftContractAddress, 1, {
      value: auctionPrice,
    });

    const items = await market.fetchMarketItems();

    console.log("items: ", items);
  });
});

describe("Fractinalize NFT ", function () {
  const AddressZero = ethers.constants.AddressZero;
  const erc20Name = "Fractionalized NFT";
  const erc20Symbol = "fNFT";

  let admin;
  let user1;
  let user2;
  let fractionalizeI;
  let nft;
  let market;
  before(async () => {
    [user1, user2] = await ethers.getSigners();

    const Market = await ethers.getContractFactory("NFTMarket");
    market = await Market.deploy();
    await market.deployed();
    const marketAddress = market.address;

    const NFT = await ethers.getContractFactory("NFT");
    nft = await NFT.deploy(marketAddress);
    await nft.deployed();
    const nftContractAddress = nft.address;
    console.log("nft address ", nftContractAddress);
    const Fractionalize = await ethers.getContractFactory("Fractionalize");
    fractionalizeI = await Fractionalize.deploy(nft.address);
    await fractionalizeI.deployed();
  });

  it("Should have the base contract deployments", async () => {
    expect(nft.address).to.exist;
    console.log(await nft.name(), await nft.symbol(), await nft.baseURI());
    expect(await nft.name()).to.exist;
    expect(await nft.symbol()).to.exist;
    expect(await nft.baseURI()).to.exist;
    expect(fractionalizeI.address).to.exist;
    expect(await fractionalizeI.nft()).to.equal(nft.address);
  });

  it("Should be able to mint & Fractionalize the nft ", async () => {
    await nft.createToken("https://www.mytokenloactionwqedxcewsacx.com");
    await nft.createToken("https://weew.dxisx.com");
    let listingPrice = await market.getListingPrice();
    // eslint-disable-next-line no-unused-vars
    listingPrice = listingPrice.toString();

    const auctionPrice = ethers.utils.parseUnits("100", "ether");
    await market.createMarketItem(nft.address, user1.address, 1, auctionPrice, {
      value: listingPrice,
    });
    await market.connect(user2).createMarketSale(nft.address, 1, {
      value: auctionPrice,
    });

    console.log(await market.fetchMyNFTs(user2.address));
    expect(await nft.ownerOf(1)).to.equal(user2.address);

    const tokenId = 1;
    const erc20Amount = numToWei(1000, 18);
    expect(await nft.ownerOf(tokenId)).to.equal(user2.address);
    expect(await fractionalizeI.erc20s(tokenId)).to.equal(AddressZero);

    await nft.connect(user2).approve(fractionalizeI.address, tokenId);
    await fractionalizeI.connect(user2).lockAndMint(tokenId, erc20Amount);

    expect(await nft.ownerOf(tokenId)).to.not.equal(user2.address);
    expect(await nft.ownerOf(tokenId)).to.equal(fractionalizeI.address);

    const erc20Fracd = await fractionalizeI.erc20s(tokenId);
    expect(erc20Fracd).to.not.equal(AddressZero);
    const erc20I = await ethers.getContractAt(
      "FractionalizedERC20",
      erc20Fracd
    );
    expect(await erc20I.name()).to.equal(erc20Name);
    expect(await erc20I.symbol()).to.equal(erc20Symbol);
    expect(await erc20I.totalSupply()).to.equal(erc20Amount);
    expect(await erc20I.balanceOf(user2.address)).to.equal(erc20Amount);
    expect(await erc20I.balanceOf(fractionalizeI.address)).to.equal(0);
  });
});

describe("Should Perform ERC20s Operations", () => {
  const AddressZero = ethers.constants.AddressZero;
  let user1;
  let user2;
  let user3;
  let fractionalizeI;
  let nft;
  let market;
  before(async () => {
    [user1, user2, user3] = await ethers.getSigners();

    const Market = await ethers.getContractFactory("NFTMarket");
    market = await Market.deploy();
    await market.deployed();
    const marketAddress = market.address;

    const NFT = await ethers.getContractFactory("NFT");
    nft = await NFT.deploy(marketAddress);
    await nft.deployed();
    const nftContractAddress = nft.address;
    console.log("nft address ", nftContractAddress);
    const Fractionalize = await ethers.getContractFactory("Fractionalize");
    fractionalizeI = await Fractionalize.deploy(nft.address);
    await fractionalizeI.deployed();

    await nft.createToken("https://www.mytokenloactionwqedxcewsacx.com");
    let listingPrice = await market.getListingPrice();
    // eslint-disable-next-line no-unused-vars
    listingPrice = listingPrice.toString();

    const auctionPrice = ethers.utils.parseUnits("100", "ether");
    await market.createMarketItem(nft.address, user1.address, 1, auctionPrice, {
      value: listingPrice,
    });
    await market.connect(user2).createMarketSale(nft.address, 1, {
      value: auctionPrice,
    });
    expect(await nft.ownerOf(1)).to.equal(user2.address);

    const tokenId = 1;
    const erc20Amount = numToWei(1000, 18);

    await nft.connect(user2).approve(fractionalizeI.address, tokenId);
    await fractionalizeI.connect(user2).lockAndMint(tokenId, erc20Amount);
  });

  it("Should perform necessary ERC20 operations but cannot burn ", async () => {
    const tokenId = 1;
    const erc20Amount = numToWei(1000, 18);
    const erc20Fracd = await fractionalizeI.erc20s(tokenId);
    expect(erc20Fracd).to.not.equal(AddressZero);
    const erc20I = await ethers.getContractAt(
      "FractionalizedERC20",
      erc20Fracd
    );
    await erc20I.connect(user2).transfer(user1.address, erc20Amount);
    expect(await erc20I.balanceOf(user1.address)).to.equal(erc20Amount);

    await expect(
      erc20I.connect(user1).transfer(AddressZero, erc20Amount)
    ).to.be.revertedWith("ERC20: transfer to the zero address");
    await expect(
      erc20I.connect(user1).transfer(AddressZero, 0)
    ).to.be.revertedWith("ERC20: transfer to the zero address");
    expect(await erc20I.balanceOf(user1.address)).to.equal(erc20Amount);
    await erc20I.connect(user1).transfer(user2.address, erc20Amount);

    expect(await erc20I.owner()).to.equal(fractionalizeI.address);
    await expect(
      erc20I.connect(user2).burnFrom(user2.address, 0)
    ).to.be.revertedWith("Ownable: caller is not the owner");

    await erc20I.connect(user2).transfer(user3.address, 100);
    expect(await erc20I.balanceOf(user3.address)).to.equal(100);
    await erc20I.connect(user3).transfer(user2.address, 100);
  });

  it("Should not be able to redeem NFT with partial erc20 re-payment", async () => {
    const tokenId = 1;

    const erc20Fracd = await fractionalizeI.erc20s(tokenId);
    const erc20I = await ethers.getContractAt(
      "FractionalizedERC20",
      erc20Fracd
    );
    const totalSupply = await erc20I.totalSupply();
    const halfSupply = toBn(totalSupply).div(2).toFixed();

    await erc20I.connect(user2).transfer(user3.address, halfSupply);
    await erc20I.connect(user2).approve(fractionalizeI.address, totalSupply);
    await expect(
      fractionalizeI.connect(user2).unlockAndRedeem(tokenId)
    ).to.be.revertedWith("ERC20: burn amount exceeds balance");
    await erc20I.connect(user3).transfer(user2.address, halfSupply);
  });

  it("Should be able to redeem NFT with full ecr20 payment", async () => {
    const tokenId = 1;
    const erc20Fracd = await fractionalizeI.erc20s(tokenId);
    const erc20I = await ethers.getContractAt(
      "FractionalizedERC20",
      erc20Fracd
    );
    const totalSupply = await erc20I.totalSupply();
    await erc20I.connect(user2).approve(fractionalizeI.address, totalSupply);
    await expect(fractionalizeI.connect(user2).unlockAndRedeem(tokenId))
      .to.emit(erc20I, "Transfer")
      .withArgs(user2.address, AddressZero, totalSupply);
    expect(await fractionalizeI.erc20s(tokenId)).to.equal(AddressZero);
    expect(await erc20I.balanceOf(user2.address)).to.equal(0);
    expect(await erc20I.balanceOf(fractionalizeI.address)).to.equal(0);
    expect(await erc20I.totalSupply()).to.equal(0);
    expect(await nft.ownerOf(tokenId)).to.equal(user2.address);
    expect(await nft.balanceOf(user2.address)).to.equal(1);
  });
});
