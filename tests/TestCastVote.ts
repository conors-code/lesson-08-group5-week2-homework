import { Ballot } from "../typechain-types/Ballot";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { TIMEOUT } from "dns";
import { Ballot__factory } from "../typechain-types";
import { fail } from "assert";

const PROPOSALS = ["Matheus 4 President", "Steve 4 chancellor", "Encode FTW"];


//won't work with long strings that can't be represented in 32 bytes.
function convertStringArrayToBytes32(array: string[]) {
    const bytes32Array = [];
    for (let index = 0; index < array.length; index++) {
      bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
    }
    return bytes32Array;
  }
      

describe("Ballot", async function () {
//describe("Ballot", async () => {  //cannot use this keyword with lambda.
    //15 seconds: default 2 sconds too short. Using this keyword, hence no 
    //fat arrow in the outer describe and addition of function keyword.
    this.timeout(15000); 
    let ballotContract: Ballot;
    let accounts : SignerWithAddress[];
    const nonVoterAtStartAdress = "abcd";

    beforeEach(async () => {
        const ballotContractFactory = await ethers.getContractFactory("Ballot");
        //this needs to be converted from the Byte32 to String.  It must be 
        //done for each of them.  it could be done with a helper function to
        //loop through the array for each String entrty, or a map.
        ballotContract = await ballotContractFactory.deploy(convertStringArrayToBytes32(PROPOSALS)) as Ballot;
        
        accounts = await ethers.getSigners();
    });

    describe("When the account casts a vote", async () => {
        it("it must have the right to vote", async () => {
            const contractAddress = ballotContract.address;
            console.log(`seeing contract address as ${contractAddress}`);
            //attach as any other address, that doesn't have the right to vote
            const ballotContractNonVoter = ballotContract.connect(accounts[1]);
            await expect(ballotContractNonVoter.vote(0)).to.be.
                revertedWith("Has no right to vote");
            //expect (await ballotContractNonVoter.vote(0)).to.throw("Has no right to vote");

        });
        
        it("must not have already voted", async () => {
            //voted is read only outside the contract, so cannot set it directly.
            //instead, vote once to set it, then try voting again.
            const preVoteStatus = (await ballotContract.voters(accounts[0].address)).voted;
            const firstVoteTxReceipt = await ballotContract.vote(0);
            const betweenVotesStatus = (await ballotContract.voters(accounts[0].address)).voted;
            console.log(`preVoteStatus is ${preVoteStatus}, 
              betweenVotesStatus is ${betweenVotesStatus}. 
              Now try to vote again and it should revert`);
            await expect(ballotContract.vote(2)).to.be.
                revertedWith("Already voted.");
        });
        
        it("sets the account status to voted", async () => {
            const statusPreVote = (await ballotContract.voters(accounts[0].address)).voted;
            const voteTxReceipt = await ballotContract.vote(2);
            const statusPostVote = (await ballotContract.voters(accounts[0].address)).voted;
            expect(statusPreVote,`vote status wasn't correctly set:\n
              before had ${statusPreVote} status, after had ${statusPostVote} status.`).
              to.not.equal(statusPostVote);
        });

        it("adds the vote to the chosen proposal",async () => {
            const signerVoter = accounts[0].address;
            //let's vote for the 1st one
            const beforeVoteCount = (await ballotContract.proposals(0)).voteCount;
            const voteTxReceipt = await ballotContract.vote(0);
            const afterVoteCount = (await ballotContract.proposals(0)).voteCount;
            expect(afterVoteCount,`vote wasn't added correctly to proposal:\n
                before had ${beforeVoteCount} votes, after had ${afterVoteCount} votes.`).
                to.equal(beforeVoteCount.add(1));
            const chairpersonVoter = await ballotContract.voters(accounts[0].address);
            expect(chairpersonVoter.weight).to.eq(1);
        });
        
        it("doesn't add the vote to the non-chosen proposals",async () => {
            const signerVoter = accounts[0].address;
            console.log("Voting for the 1st of 3 proposals");
            const beforeVoteCount2 = (await ballotContract.proposals(1)).voteCount;
            const beforeVoteCount3 = (await ballotContract.proposals(2)).voteCount;
            const voteTxReceipt = await ballotContract.vote(0);
            const afterVoteCount2 = (await ballotContract.proposals(1)).voteCount;
            const afterVoteCount3 = (await ballotContract.proposals(2)).voteCount;
            expect(beforeVoteCount2 == afterVoteCount2,
              `vote was added incorrectly to 2nd proposal:\n
                before had ${beforeVoteCount2} votes, after had ${afterVoteCount2} votes.`);
            expect(beforeVoteCount3 == afterVoteCount3,
              `vote was added incorrectly to 3nd proposal:\n
                before had ${beforeVoteCount3} votes, after had ${afterVoteCount3} votes.`);
        });
    });
});