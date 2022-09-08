import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

let owner:SignerWithAddress
let signers:SignerWithAddress[]

async function main() {
  signers = await ethers.getSigners();

  const MyProject = await ethers.getContractFactory("MyProject", signers[0]);
  const myproject = await MyProject.deploy();

  const Uni = await ethers.getContractFactory("Uni", signers[1]);
  const uni = await Uni.deploy();

  const Usdt= await ethers.getContractFactory("Usdt", signers[1]);
  const usdt = await Usdt.deploy();

  await myproject.whitelistToken(
    ethers.utils.formatBytes32String('Uni'),
    uni.address
  );

  await myproject.whitelistToken(
    ethers.utils.formatBytes32String('Usdt'),
    usdt.address
  );

  await myproject.whitelistToken(
    ethers.utils.formatBytes32String('Eth'),
    "0xd8d49576c7D5e5878AA9e2cf5DacbF95c178922D"
  );


  console.log("Myproject deployed to:", myproject.address, "by" , signers[0].address);
  console.log("Uni deployed to:", uni.address, "by" , signers[1].address);
  console.log("Usdt deployed to:", usdt.address, "by" , signers[1].address);
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});