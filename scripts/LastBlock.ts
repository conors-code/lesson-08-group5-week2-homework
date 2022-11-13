import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
//import { ethers } from "hardhat";
import { ethers, getDefaultProvider, Wallet } from "ethers";
import { Ballot, Ballot__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();


//won't work with long strings that can't be represented in 32 bytes.
function convertStringArrayToBytes32(array: string[]) {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
  }
  return bytes32Array;
}

async function main() {
   let args = process.argv;
   console.log(args);
   let proposals = args.slice(2); //slice(2) returns 3rd and following parts

   if (proposals.length <= 0) throw new Error("Too few args provided");
   console.log("Deploying Ballot contract");
   console.log("Proposals: ");


  //const provider = ethers.getDefaultProvider("goerli", {infura});
  const provider = ethers.getDefaultProvider("goerli");
  const lastBlock = provider.getBlock("latest");
  console.log(lastBlock);
  console.log(process.env.PRIVATE_KEY?.length); //don't show the private key
  console.log(process.env.MNEMONIC?.length); //don't show the mnemonic

  //make it fail quickly without the key / mnemonic, using ??
  const wallet = new Wallet(process.env.PRIVATE_KEY ?? "");
  //or
  //const wallet2 = ethers.Wallet.fromMnemonic(process.env.MNEMONIC ?? "");
  const signer = wallet.connect(provider);
  //balaance is a big number
  const balanceBN = await signer.getBalance();
  console.log(
    `Connected to the account of address ${signer.address}\n
    This account has a balance of ${balanceBN.toString()} Wei`
  );
  const ballotContractFactory = new Ballot__factory(signer);


  // let args = process.argv;
  // console.log(args);
  // let proposals = args.slice(2); //slice(2) returns 3rd and following parts

  // if (proposals.length <= 0) throw new Error("Too few args provided");
  // console.log("Deploying Ballot contract");
  // console.log("Proposals: ");
  
  // proposals.forEach((element, index) => {
  //   console.log(`Proposal N. ${index + 1}: ${element}`);
  // });
  
  // let ballotContract: Ballot;

  // let accounts : SignerWithAddress[];
  // accounts = await ethers.getSigners();
  
  // //in this case, we can use the scripted ballot factory.  Gain independence
  // //  from hardhat here by using the Ballot__factory
  // //const ballotContractFactory = await ethers.getContractFactory("Ballot");
  // const ballotContractFactory = new Ballot__factory(accounts[0]);

  // //this needs to be converted from the Byte32 to String.  It must be 
  // //done for each of them.  it could be done with a helper function to
  // //loop through the array for each String entrty, or a map.
  // ballotContract = await ballotContractFactory.deploy(convertStringArrayToBytes32(proposals)) as Ballot;
  // await ballotContract.deployed();
  
  // console.log(`The contract was deployed at address ${ballotContract.address}`);

  
  // const chairperson = await ballotContract.chairperson();

  // console.log(`The chairperson for this ballot is ${chairperson}`);

}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
