import { BigNumber, ethers, getDefaultProvider, Wallet } from "ethers";
import { Ballot, Ballot__factory } from "../typechain-types";
import * as dotenv from "dotenv";
import { InfuraProvider } from "@ethersproject/providers";
dotenv.config();

async function main() {
  const provider = new InfuraProvider("goerli", process.env.INFURA_KEY);
  //Use only 1 of theee, depending on  if you're using private key or mnemonic.
  //But never log private key to the console unless you're checking a purely
  //test account!  Show the length to indicate that it has found a private key
  console.log(process.env.PRIVATE_KEY?.length);

  //make it fail quickly if we don't have the key / mnemonic, using ??
  const wallet = new Wallet(process.env.PRIVATE_KEY ?? "");

  const signer = wallet.connect(provider);

  const args = process.argv;
  const params = args.slice(2); //3nd parameter is the 1st passed in parameter
  const contractAddress = params[0]; //the passed in address of the contract

  const ballotContractFactory = new Ballot__factory(signer);
  let ballotContract: Ballot = await ballotContractFactory.attach(
    contractAddress
  );

  const winningProposalNumber: BigNumber =
    await ballotContract.winningProposal();

  const winnerNameBytes32 = await ballotContract.winnerName(
    winningProposalNumber
  );

  const winnerName = ethers.utils.parseBytes32String(winnerNameBytes32);

  console.log(`Winning proposal name is: ${winnerName}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
