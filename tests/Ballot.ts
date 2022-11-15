import { Ballot } from "../typechain-types/Ballot";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { TIMEOUT } from "dns";

const PROPOSALS = ["neapolitan", "chocolate","baileys","blackcurrant"];


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

    beforeEach(async () => {
        const ballotContractFactory = await ethers.getContractFactory("Ballot");
        //this needs to be converted from the Byte32 to String.  It must be 
        //done for each of them.  it could be done with a helper function to
        //loop through the array for each String entrty, or a map.
        ballotContract = await ballotContractFactory.deploy(convertStringArrayToBytes32(PROPOSALS)) as Ballot;
        
        accounts = await ethers.getSigners();
    });

    describe("when the contract is deployed", async () => {
        it("has the provided proposals", async () => {
            //this won't work because we can't get the array at once
            //if array of Structs, etc.  Can only get an array type of
            //bytes at once. 
            /*
            const proposals = await ballotContract.proposals();
            expect(proposals).to.equal(PROPOSALS);
            */
           //can get each el one at a time
            for (let i = 0; i < PROPOSALS.length; i++) {
                const proposal = await ballotContract.proposals(i);
                expect(ethers.utils.parseBytes32String(proposal.name)).to.eq(PROPOSALS[i]);
            }
        });
        
        it("sets the deployer address as chairperson", async () => {
            const chairperson = await ballotContract.chairperson();
            expect(chairperson).to.equal(accounts[0].address);
        });

        it("sets the voting weight of the chairperson to 1",async () => {
            const chairpersonVoter = await ballotContract.voters(accounts[0].address);
            expect(chairpersonVoter.weight).to.eq(1);
        });
    });
});