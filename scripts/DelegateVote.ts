import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers, getDefaultProvider, Wallet } from "ethers";
import { Ballot, Ballot__factory } from "../typechain-types";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  //const provider = ethers.getDefaultProvider("goerli", {infura});
  const provider = ethers.getDefaultProvider("goerli");
  const lastBlock = provider.getBlock("latest");
  console.log(lastBlock);
  //Use only 1 of theee, depending on  if you're using private key or mnemonic.
  //But never log either to the console unless you're just checking a purely
  //test account!  Comment out whichever one you're not using
  console.log(process.env.PRIVATE_KEY?.length);
  console.log(process.env.MNEMONIC?.length); //just checking the length

  //make it fail quickly if we don't have the key / mnemonic, using ??
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
  
  //for allowing the right to vote.  Needs test .ts too in /tests/ folder
  const args = process.argv;
  const params = args.slice(2); //3nd parameter is the 1st passed in parameter
  const contractAddress = params[0]; //the passed in address of the contract
  const newVoterAccount = params[1]; //should be the passed address or new voter
  const ballotContractFactory = new Ballot__factory(signer);
  let ballotContract : Ballot = await ballotContractFactory.attach(
    contractAddress);
  const tx = await ballotContract.giveRightToVote(newVoterAccount);
  const receipt = await tx.wait();
  
  console.log(`receipt hashcode for tx is: ${receipt.transactionHash}`);
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
