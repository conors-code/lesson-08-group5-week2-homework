import { Ballot } from "../typechain-types/Ballot";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { getAccountPath } from "ethers/lib/utils";

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
        await ballotContract
        .connect(accounts[0])
        .giveRightToVote(accounts[1].address);
    });
    
    describe("when a voter delegates a vote", async () => {
        it("must increase delegate weight by 1", async () => {
            const delegator = await ballotContract.voters(accounts[1].address);
            const delegatee = await ballotContract.voters(accounts[0].address);
            const delegateeWeight = delegatee.weight;
            await ballotContract
            .connect(accounts[1])
            .delegate(accounts[0].address);
            const updatedDelegatee = await ballotContract.voters(accounts[0].address);
            expect(updatedDelegatee.weight).to.eq(delegateeWeight.add(1));
        });
        
        it("must update the voter delegate to the delegatee", async () => {
            await ballotContract
            .connect(accounts[1])
            .delegate(accounts[0].address);
            const delegator = await ballotContract.voters(accounts[1].address);
            expect(delegator.delegate).to.eq(accounts[0].address);
        });

        it("must not allow a voter to delegate to a non-voter", async () => {
            await expect(ballotContract.connect(accounts[1]).delegate(accounts[2].address))
            .to.be.reverted;
        });
    });
});