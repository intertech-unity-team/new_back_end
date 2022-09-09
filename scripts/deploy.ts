import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

let signers:SignerWithAddress[]

async function main() {
  signers = await ethers.getSigners();

  const MyProject = await ethers.getContractFactory("MyProject", signers[0]);
  const myproject = await MyProject.deploy();

  const Uni = await ethers.getContractFactory("Uni", signers[1]);
  const uni = await Uni.deploy();

  const Usdt= await ethers.getContractFactory("Usdt", signers[1]);
  const usdt = await Usdt.deploy();


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