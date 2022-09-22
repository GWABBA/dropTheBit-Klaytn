const Token = artifacts.require("Token");
const { expect } = require("chai");
const { arrayify, id } = require("ethers/lib/utils");

const hre = require("hardhat");

async function main() {
  // const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  // const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
  // const unlockTime = currentTimestampInSeconds + ONE_YEAR_IN_SECS;

  // const lockedAmount = hre.ethers.utils.parseEther("1");

  // const Lock = await hre.ethers.getContractFactory("Lock");
  // const lock = await Lock.deploy(unlockTime, { value: lockedAmount });

  // await lock.deployed();

  // console.log(
  //   `Lock with 1 ETH and unlock timestamp ${unlockTime} deployed to ${lock.address}`
  // );

  const TokenContract = "0x81a77887A433Be529FBCdcdB9688cC07dFB81D00";
  const TokenAddress = "0x81a77887A433Be529FBCdcdB9688cC07dFB81D00";
  let campaignID = "";
  let cost = "1";
  let num = 3;
  let duration = 30;
  const [_validator, _client, _addr2, _addr3, ..._addrs] =
    await hre.ethers.getSigners();
  let validator = _validator;

  const DropContract = await hre.ethers.getContractFactory("LinkDropProd");
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < 30; i++) {
    campaignID += characters.charAt(
      Math.floor(Math.random() * charactersLength)
    );
  }

  Drop = await DropContract.deploy(
    TokenAddress,
    TokenContract,
    duration,
    hre.ethers.utils.parseEther(cost),
    num,
    campaignID
  );

  console.log(Drop);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
