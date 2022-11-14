import { ethers, getDefaultProvider, Wallet } from "ethers";
import { Ballot, Ballot__factory } from "../typechain-types";
import * as dotenv from "dotenv";
import { messagePrefix } from "@ethersproject/hash";
import { ok } from "assert";
dotenv.config();

async function main() {
  //const provider = ethers.getDefaultProvider("goerli", {infura});
  const provider = ethers.getDefaultProvider("goerli");
  //Use only 1 of these, depending on  if you're using private key or mnemonic.
  //But never log either to the console unless you're just checking a purely
  //test account!  Comment out whichever one you're not using
  console.log(process.env.PRIVATE_KEY?.length);

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
  //Next param should be the address of account to delegate to
  const newDelegateAccount = params[1]; 
  
  //signer is passing voting rights to delegate.  Probabaly best to not to
  //have the signer same as the chairperson.  In our case, the chairperson
  //deployed the contract, so sign on this one with a different user/key/mnemonic
  //in env, 1st call GiveRightToVote.ts with that new user, then delegate to the
  //a user that does have rights to vote, e.g. chairperson's acount.

  const ballotContractFactory = new Ballot__factory(signer);
  let ballotContract : Ballot = await ballotContractFactory.attach(
    contractAddress);

  const delegateTx = await ballotContract.delegate(newDelegateAccount);
  
  const delegateReceipt = await delegateTx.wait();
  
  console.log(`receipt hashcode for tx is: ${delegateReceipt.transactionHash}`);
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
