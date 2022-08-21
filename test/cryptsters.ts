import { expect } from "chai";
import { ethers } from "hardhat";
import { beforeEach } from "mocha";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("Cryptsters", function () {
  let crypstersContract: Contract;
  let owner: SignerWithAddress;
  const mintPrice = 100000000000000000000n; // 100 UBQ

  beforeEach(async () => {
    [owner] = await ethers.getSigners();

    const Cryptsters = await ethers.getContractFactory("Cryptsters");
    crypstersContract = await Cryptsters.deploy(owner.address, owner.address, "https://crypstersapi.ubiqsmart.com/cryptster/")
  });

  it("Should fail to mint when sale is inactive", async () => {
    await expect(crypstersContract.mint(1, { value: mintPrice }))
      .to.be.revertedWith("Sale must be active to mint Tokens");
  });

  it("Should mint with Token ID 1", async () => {
    await crypstersContract.setActive(true);
    await expect(crypstersContract.mint(1, { value: mintPrice }))
      .to.emit(crypstersContract, "Transfer")
      .withArgs(ethers.constants.AddressZero, owner.address, 1);
  });

  it("Should fail to mint when incorrect value sent", async () => {
    await crypstersContract.setActive(true);
    await expect(crypstersContract.mint(1, { value: 10 }))
      .to.be.revertedWith("UBQ value sent is not correct");
  });

  it("Should get tokenURI", async () => {
    Promise.all(
      [
        crypstersContract.setActive(true),
        crypstersContract.mint(1, { value: mintPrice }),
      ])
    expect(await crypstersContract.tokenURI(1))
      .to.be.equal("https://crypstersapi.ubiqsmart.com/cryptster/1");
  });

  it("Should increment total supply - Single mint", async () => {
    Promise.all(
      [
        crypstersContract.setActive(true),
        crypstersContract.mint(1, { value: mintPrice }),
        crypstersContract.mint(1, { value: mintPrice }),
      ])
    expect(await crypstersContract.totalSupply()).to.be.equal(2);
  });

  it("Should increment total supply - Multiple mint", async () => {
    Promise.all(
      [
        crypstersContract.setActive(true),
        crypstersContract.mint(10, { value: 1000000000000000000000n })
      ])
    expect(await crypstersContract.totalSupply()).to.be.equal(10);
  });

  it("Should fail to mint when exceeded max token purchase", async () => {
    await crypstersContract.setActive(true);
    await expect(crypstersContract.mint(11, { value: 1100000000000000000000n }))
      .to.be.revertedWith("Exceeded max token purchase");
  });

  it("Should fail to mint when exceeded supply", async () => {
    await crypstersContract.setActive(true);
    // Mint 880
    for (let i = 0; i < 88; i++) {
      await expect(crypstersContract.mint(10, { value: 1000000000000000000000n }))
    }

    // Mint 8
    await crypstersContract.mint(8, { value: 800000000000000000000n })
    expect(await crypstersContract.totalSupply()).to.be.equal(888);

    await expect(crypstersContract.mint(1, { value: mintPrice }))
      .to.be.revertedWith("Purchase would exceed max supply of tokens");    
  });
});