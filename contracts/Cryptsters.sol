// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract Cryptsters is ERC721Enumerable, Ownable {
    /* ========== STATE VARIABLES ========== */
    uint256 public MAX_SUPPLY = 888;
    string private uri;

    /* ========== CONSTRUCTOR ========== */
    constructor(
        string memory initialURI
    ) ERC721("Cryptsters", "CRYPTSTERS") Ownable() {
        uri = initialURI;
    }

    /* ========== RESTRICTED FUNCTIONS ========== */
    function setBaseURI(string calldata newBaseTokenURI) public onlyOwner{
        uri = newBaseTokenURI;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory)
    {
        return string(abi.encodePacked(uri, Strings.toString(tokenId)));
    }
}
