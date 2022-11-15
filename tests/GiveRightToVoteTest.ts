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

describe("Ballot", async function () {
  //describe("Ballot", async () => {  //cannot use this keyword with lambda.
  //15 seconds: default 2 sconds too short. Using this keyword, hence no
  //fat arrow in the outer describe and addition of function keyword.
  // this.timeout(15000);
  let ballotContract: Ballot;
  let chairperson: SignerWithAddress,
    voter1: SignerWithAddress,
    voter2: SignerWithAddress;

  beforeEach(async () => {
    const ballotContractFactory = await ethers.getContractFactory("Ballot");
    //this needs to be converted from the Byte32 to String.  It must be
    //done for each of them.  it could be done with a helper function to
    //loop through the array for each String entrty, or a map.
    ballotContract = (await ballotContractFactory.deploy(
      convertStringArrayToBytes32(PROPOSALS)
    )) as Ballot;

    [chairperson, voter1, voter2] = await ethers.getSigners();
  });

  describe("Give right to vote", async function () {
    it("Only chairperson can give right to vote", async function () {
      const anyVoterGiveRightToVote = await ballotContract
        .connect(voter1)
        .giveRightToVote(voter2.address);

      expect(anyVoterGiveRightToVote).to.be.revertedWith(
        "Only chairperson can give right to vote."
      );
    });
    it("Chairperson can give right to vote", async () => {
      const giveRightToVoteTx = await ballotContract.giveRightToVote(
        voter1.address
      );

      expect(giveRightToVoteTx).to.not.be.reverted;

      const voter1Address = await ballotContract.voters(voter1.address);
      expect(voter1Address.weight).to.eq(1);
    });
  });
});
