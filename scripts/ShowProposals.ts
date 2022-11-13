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
   const params = args.splice(2);
   const contractAddress = params[0];

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
  //balance is a big number :-)  Ensure we have enough for gas anyway.
  const balanceBN = await signer.getBalance();
  console.log(
    `Connected to the account of address ${signer.address}\n
    This account has a balance of ${balanceBN.toString()} Wei`
  );
  const ballotContractFactory = new Ballot__factory(signer);
  let ballotContract: Ballot;
  ballotContract = await ballotContractFactory.attach(contractAddress);
  
  let maxProposalNumber = 0;
  const proposals:string[] = [];
  let keepIterating = true;
  while(keepIterating) {
    try {
      const contractProposal = await ballotContract.proposals(maxProposalNumber);
      const stringProposal = ethers.utils.parseBytes32String(contractProposal.name);
      proposals.push("Proposal " + maxProposalNumber + " is " + stringProposal); 
      maxProposalNumber++;
    } catch {
      keepIterating = false;
      console.log(`Total number of proposals is ${maxProposalNumber}`);
    }
  }
  //now show the proposal choices (if any) with their number, for casting a vote.
  proposals.forEach(function (proposal) { 
     console.log(proposal)
  }); 
  
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
