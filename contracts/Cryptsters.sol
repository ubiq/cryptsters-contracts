// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import { IERC2981, IERC165 } from "@openzeppelin/contracts/interfaces/IERC2981.sol";

contract Cryptsters is ERC721Enumerable, IERC2981, Ownable {
    /* ========== STATE VARIABLES ========== */
    uint256 public constant MAX_SUPPLY = 888;
    uint256 public constant MAX_MINT_PER_TX = 10;
    uint256 public constant MINT_PRICE = 100 ether;
    bool public isActive = false;
    address public beneficiary;
    address public royalties;
    string public baseURI;

    /* ========== CONSTRUCTOR ========== */
    constructor(
        address _beneficiary,
        address _royalties,
        string memory _initialBaseURI
    ) ERC721("Cryptsters", "CRYPTSTERS") Ownable() {
        require(_beneficiary != address(0));
        require(_royalties != address(0));
        beneficiary = _beneficiary;
        royalties = _royalties;
        baseURI = _initialBaseURI;
    }

    /* ========== RESTRICTED FUNCTIONS ========== */
    function setBaseURI(string memory uri) public onlyOwner {
        baseURI = uri;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function setActive(bool _isActive) public onlyOwner {
        isActive = _isActive;
    }

    function setBeneficiary(address _beneficiary) public onlyOwner {
        beneficiary = _beneficiary;
    }

    function setRoyalties(address _royalties) public onlyOwner {
        royalties = _royalties;
    }

    function withdraw() public onlyOwner {
        payable(beneficiary).transfer(address(this).balance);
    }

    function mint(uint quantity) public payable {
        require(isActive, "Sale must be active to mint Tokens");
        require(quantity <= MAX_MINT_PER_TX, "Exceeded max token purchase");
        require(totalSupply() + quantity <= MAX_SUPPLY, "Purchase would exceed max supply of tokens");
        require(MINT_PRICE * quantity <= msg.value, "UBQ value sent is not correct");

        for(uint i = 1; i < quantity; i++) {
            uint mintIndex = totalSupply();
            if (totalSupply() < MAX_SUPPLY) {
                _safeMint(msg.sender, mintIndex + i);
            }
        }
    }

    /* ========== ROYALTIES - ERC2981 ========== */
    // ERC165
    function supportsInterface(bytes4 interfaceId) public view override(ERC721Enumerable, IERC165) returns (bool) {
        return interfaceId == type(IERC2981).interfaceId || super.supportsInterface(interfaceId);
    }

    // IERC2981
    function royaltyInfo(uint256 _tokenId, uint256 _salePrice) external view returns (address, uint256 royaltyAmount) {
        _tokenId; // silence solc warning
        royaltyAmount = (_salePrice / 100) * 5;
        return (royalties, royaltyAmount);
    }
}
