import { expect } from "chai";
import { ethers } from "hardhat";
import { beforeEach } from "mocha";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("Cryptsters", function () {
  let cryptstersContract: Contract;
  let owner: SignerWithAddress;
  let beneficiary: SignerWithAddress;
  let royalties: SignerWithAddress;
  const mintPrice = 100000000000000000000n; // 100 UBQ

  beforeEach(async () => {
    [owner, beneficiary, royalties] = await ethers.getSigners();

    const Cryptsters = await ethers.getContractFactory("Cryptsters");
    cryptstersContract = await Cryptsters.deploy(beneficiary.address, royalties.address, "https://cryptstersapi.ubiqsmart.com/cryptster/")
  });

  it("Should fail to mint when sale is inactive", async () => {
    await expect(cryptstersContract.mint(1, { value: mintPrice }))
      .to.be.revertedWith("Sale must be active to mint Tokens");
  });

  it("Should mint with Token ID 1", async () => {
    await cryptstersContract.setActive(true);
    await expect(cryptstersContract.mint(1, { value: mintPrice }))
      .to.emit(cryptstersContract, "Transfer")
      .withArgs(ethers.constants.AddressZero, owner.address, 1);
  });

  it("Should fail to mint when incorrect value sent", async () => {
    await cryptstersContract.setActive(true);
    await expect(cryptstersContract.mint(1, { value: 10 }))
      .to.be.revertedWith("UBQ value sent is not correct");
  });

  it("Should get tokenURI", async () => {
    Promise.all(
      [
        cryptstersContract.setActive(true),
        cryptstersContract.mint(1, { value: mintPrice }),
      ])
    expect(await cryptstersContract.tokenURI(1))
      .to.be.equal("https://cryptstersapi.ubiqsmart.com/cryptster/1");
  });

  it("Should increment total supply - Single mint", async () => {
    Promise.all(
      [
        cryptstersContract.setActive(true),
        cryptstersContract.mint(1, { value: mintPrice }),
        cryptstersContract.mint(1, { value: mintPrice }),
      ])
    expect(await cryptstersContract.totalSupply()).to.be.equal(2);
  });

  it("Should increment total supply - Multiple mint", async () => {
    Promise.all(
      [
        cryptstersContract.setActive(true),
        cryptstersContract.mint(10, { value: 1000000000000000000000n })
      ])
    expect(await cryptstersContract.totalSupply()).to.be.equal(10);
  });

  it("Should Withdraw to beneficiary", async () => {
    let balance = await ethers.provider.getBalance(beneficiary.address);
    expect(ethers.utils.formatEther(await balance.toString())).to.equal(
      '100000.0'
    );
    Promise.all(
      [
        cryptstersContract.setActive(true),
        cryptstersContract.mint(1, { value: mintPrice })
      ]);
    
    const setWithdrawTx = await cryptstersContract.withdraw();
    await setWithdrawTx.wait();
    
    balance = await ethers.provider.getBalance(beneficiary.address);
    expect(ethers.utils.formatEther(await balance.toString())).to.equal(
      '100100.0'
    );
  });

  it("Should fail to mint when exceeded max token purchase", async () => {
    await cryptstersContract.setActive(true);
    await expect(cryptstersContract.mint(11, { value: 1100000000000000000000n }))
      .to.be.revertedWith("Exceeded max token purchase");
  });

  it("Should fail to mint when exceeded supply", async () => {
    await cryptstersContract.setActive(true);
    // Mint 880
    for (let i = 0; i < 88; i++) {
      await expect(cryptstersContract.mint(10, { value: 1000000000000000000000n }))
    }

    // Mint 8
    await cryptstersContract.mint(8, { value: 800000000000000000000n })
    expect(await cryptstersContract.totalSupply()).to.be.equal(888);

    await expect(cryptstersContract.mint(1, { value: mintPrice }))
      .to.be.revertedWith("Purchase would exceed max supply of tokens");    
  });

  it("Should support the ERC721 and ERC2198 standards", async () => {
    const ERC721InterfaceId = "0x80ac58cd";
    const ERC2981InterfaceId = "0x2a55205a";

    expect(await cryptstersContract.supportsInterface(ERC721InterfaceId))
      .to.be.equal(true);
    expect(await cryptstersContract.supportsInterface(ERC2981InterfaceId))
      .to.be.equal(true);
  });

  it("Should return the correct royalty info", async () => {
    Promise.all(
      [
        cryptstersContract.setActive(true),
        cryptstersContract.mint(1, { value: mintPrice }),
      ])
    // 5% of 1000 = 50
    let royaltyInfo = await cryptstersContract.royaltyInfo(1, 1000)
    expect (royaltyInfo.royaltyAmount.toNumber())
      .to.be.equal(50);
  });
});