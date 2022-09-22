const Token = artifacts.require("Token");
const { expect } = require("chai");
const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("deployer:", deployer);

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy();

  console.log("Token address:", token.address);
  console.log("Token deploy result", token);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
