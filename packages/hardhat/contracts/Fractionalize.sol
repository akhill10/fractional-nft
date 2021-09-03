// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.6.0 <0.7.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "./FractionalizedERC20.sol";
import "hardhat/console.sol";

contract Fractionalize is IERC721Receiver {
    address public nft;
    mapping(uint256 => address) public erc20s;

    constructor(address _nft) public {
        nft = _nft;
    }

    function lockAndMint(uint256 tokenId, uint256 amount) public {
        require(erc20s[tokenId] == address(0), "exists");
        IERC721(nft).safeTransferFrom(msg.sender, address(this), tokenId);
        FractionalizedERC20 erc20 = new FractionalizedERC20("Fractionalized NFT", "fNFT", msg.sender, amount);
        erc20s[tokenId] = address(erc20);
    }

    function unlockAndRedeem(uint256 tokenId) public {
        address erc20 = erc20s[tokenId];
        require(erc20 != address(0), "nft not locked");
        uint256 totalSupply = FractionalizedERC20(erc20).totalSupply();
        require(totalSupply != 0, "totalSupply should not be zero");

        delete erc20s[tokenId];
        FractionalizedERC20(erc20).burnFrom(msg.sender, totalSupply);
        IERC721(nft).safeTransferFrom(address(this), msg.sender, tokenId);
    }

    /**
     * @dev See {IERC721Receiver-onERC721Received}.
     *
     * Always returns `IERC721Receiver.onERC721Received.selector`.
     */
    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
