import { ethers, getDefaultProvider, Wallet } from "ethers";
import { Ballot, Ballot__factory } from "../typechain-types";
import * as dotenv from "dotenv";
import { InfuraProvider } from "@ethersproject/providers";
dotenv.config();

async function main() {
  //const provider = ethers.getDefaultProvider("goerli", {infura});
  const provider = new InfuraProvider("goerli", process.env.INFURA_KEY);
  const lastBlock = provider.getBlock("latest");
  //Use only 1 of theee, depending on  if you're using private key or mnemonic.
  //But never log private key to the console unless you're checking a purely
  //test account!  Show the length to indicate that it has found a private key
  console.log(process.env.PRIVATE_KEY?.length);

  //make it fail quickly if we don't have the key / mnemonic, using ??
  const wallet = new Wallet(process.env.PRIVATE_KEY ?? "");

  const signer = wallet.connect(provider);
  //balance is a big number.  Show the balance to indicate that we can afford
  //a transaction
  const balanceBN = await signer.getBalance();
  console.log(
    `Connected to the account of address ${signer.address}\n
    This account has a balance of ${balanceBN.toString()} Wei`
  );

  //for allowing the right to vote.  Needs test .ts too in /tests/ folder
  const args = process.argv;
  const params = args.slice(2); //3nd parameter is the 1st passed in parameter
  const contractAddress = params[0]; //the passed in address of the contract
  const proposalIndex = params[1]; //should be the passed number: 0,1,2 etc: index of proposal

  const ballotContractFactory = new Ballot__factory(signer);
  let ballotContract: Ballot = await ballotContractFactory.attach(
    contractAddress
  );

  const castVoteTx = await ballotContract.vote(proposalIndex);

  const castVoteReceipt = await castVoteTx.wait();

  console.log(
    `receipt hashcode for tx casting vote is: ${castVoteReceipt.transactionHash}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
