import { Ballot } from "../typechain-types/Ballot";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";

const PROPOSALS = ["Matheus 4 President", "Steve 4 chancellor", "Encode FTW"];


//won't work with long strings that can't be represented in 32 bytes.
function convertStringArrayToBytes32(array: string[]) {
    const bytes32Array = [];
    for (let index = 0; index < array.length; index++) {
      bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
    }
    return bytes32Array;
  }
      

describe("Ballot Winner", async function () {
//describe("Ballot", async () => {  //cannot use this keyword with lambda.
    //15 seconds: default 2 sconds too short. Using this keyword, hence no 
    //fat arrow in the outer describe and addition of function keyword.
    this.timeout(15000); 
    let ballotContract: Ballot;
    let accounts : SignerWithAddress[];

    beforeEach(async () => {
        const ballotContractFactory = await ethers.getContractFactory("Ballot");
        //this needs to be converted from the Byte32 to String.  It must be 
        //done for each of them.  it could be done with a helper function to
        //loop through the array for each String entrty, or a map.
        ballotContract = await ballotContractFactory.deploy(convertStringArrayToBytes32(PROPOSALS)) as Ballot;
        
        accounts = await ethers.getSigners();
    });

    describe("The winning proposal", async () => {
        it("must have the most votes", async () => {
            const contractAddress = ballotContract.address;
            //vote for a proposal to give it the most votes.  This index should be returned
            const chosenProposalIndex = 1;
            const firstVoteTxReceipt = await ballotContract.vote(chosenProposalIndex);
            const winningProposalNumber = await ballotContract.winningProposal();
            
            expect(chosenProposalIndex,
              `Voted for proposal ${chosenProposalIndex} but ${winningProposalNumber} won.`
            ).to.equal(winningProposalNumber);

        });
        
        it("must have proposal name matching correct index", async () => {
          //vote for a proposal to give it the most votes.  index should match proposal name
          const chosenProposalIndex = 2;
          const firstVoteTxReceipt = await ballotContract.vote(chosenProposalIndex);
          const winningProposalNumber = await ballotContract.winningProposal();

          const expectedWinnerName = PROPOSALS[chosenProposalIndex];

          const winnerNameBytes32 = await ballotContract.winnerName();
          const winnerName = ethers.utils.parseBytes32String(winnerNameBytes32);

          expect(winnerName,
            `Winner name should be ${expectedWinnerName} but is ${winnerName}.`
          ).to.equal(expectedWinnerName);
        });
    });
});