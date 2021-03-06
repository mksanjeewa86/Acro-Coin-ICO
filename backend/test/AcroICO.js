const { expect } = require("chai");
const { ethers } = require("hardhat");
const { SignerWithAddress } = require("@nomiclabs/hardhat-ethers/dist/src/signer-with-address");

describe("Project", () => {
  let account1 = SignerWithAddress;
  let account2 = SignerWithAddress;
  let account3 = SignerWithAddress;

  beforeEach(async () => {
    const [address1, address2, address3] = await ethers.getSigners();
    account1 = address1;
    account2 = address2;
    account3 = address3;
  });

  const deployProject = async () => {
    const acroToken = await ethers.getContractFactory("AcroICO", account1);
    const contract = await acroToken.deploy(true);
    await contract.deployed();
    return contract;
  };

  describe("acroICO", () => {
    let project;
    beforeEach(async () => {
      project = await deployProject();
    });
    describe("constructor", () => {
      it("constructor variables", async () => {
        const goal = await project.GOAL();
        expect(goal).to.equal(ethers.utils.parseEther("30000"));
        const phase = await project.phase();
        expect(phase).to.equal(0);
        const state = await project.state();
        expect(state).to.equal(0);
        const rate = await project.RATE();
        expect(rate).to.equal(5);
        const totalLimit = await project.maximumTotalPrivateContributionLimit();
        expect(totalLimit).to.equal(ethers.utils.parseEther("15000"));
        const individualLimit = await project.individualContributionLimit();
        expect(individualLimit).to.equal(ethers.utils.parseEther("1500"));
        const totalContributions = await project.totalContributions();
        expect(totalContributions).to.equal(0);
        const totalTaxes = await project.totalTaxes();
        expect(totalTaxes).to.equal(0);
        const isTaxable = await project.isTaxable();
        expect(isTaxable).to.equal(true);
      });
    });
    describe("phase forward", () => {
      it("phase forward by owner", async () => {
        await project.phaseForward();
        const phase = await project.phase();
        expect(phase).to.equal(1);
      });
      it("phase forward by other than the owner", async () => {
        await expect(project.connect(account2).phaseForward()
        ).to.be.revertedWith("Only owner can");
      });
      it("try to phase forward in open phase", async () => {
        await project.phaseForward();
        await project.phaseForward();
        await expect(project.phaseForward()
        ).to.be.revertedWith("Already open");
      });
      it("maximumTotalPrivateContributionLimit in general phase", async () => {
        await project.phaseForward();
        const totalLimit = await project.maximumTotalPrivateContributionLimit();
        expect(totalLimit).to.equal(ethers.utils.parseEther("30000"));
      });
      it("individualContributionLimit in general phase", async () => {
        await project.phaseForward();
        const totalLimit = await project.individualContributionLimit();
        expect(totalLimit).to.equal(ethers.utils.parseEther("1000"));
      });
      it("maximumTotalPrivateContributionLimit in general phase", async () => {
        await project.phaseForward();
        await project.phaseForward();
        const totalLimit = await project.maximumTotalPrivateContributionLimit();
        expect(totalLimit).to.equal(ethers.utils.parseEther("30000"));
      });
      it("emit phase forward event in open phase", async () => {
        const currentTimestamp = Date.now();
        await ethers.provider.send("evm_setNextBlockTimestamp", [
          currentTimestamp,
        ]);
        await expect(project.phaseForward()
        ).to.emit(project, "PhaseForwardEvent").withArgs("General phase", currentTimestamp);
      });
      it("emit phase forward event in open phase", async () => {
        const currentTimestamp = Date.now();
        await ethers.provider.send("evm_setNextBlockTimestamp", [
          currentTimestamp,
        ]);
        await project.phaseForward();
        await expect(project.phaseForward()
        ).to.emit(project, "PhaseForwardEvent").withArgs("Open phase", currentTimestamp + 1);
      });
    });
    describe("whitelist", () => {
      it("emit add to whitelist event", async () => {
        await expect(project.whitelistedCrowdsale([account1.address])
        ).to.emit(project, "WhitelistOperations").withArgs(account1.address);
      });
      it("try to whitelisted other than the owner", async () => {
        await expect(project.connect(account3).whitelistedCrowdsale([account2.address])
      ).to.be.revertedWith("Only owner can");
      });
    });
    describe("buy token", () => {
      describe("in phase seed", () => {
        it("send ethers from whitelisted account", async () => {
          await project.whitelistedCrowdsale([account2.address]);
          await project.connect(account2).buyToken({ value: ethers.utils.parseEther("100") });
          const contributions = await project.totalContributions();
          expect(contributions).to.equal(ethers.utils.parseEther("100"));
        });
        it("send ethers without whitelisted", async () => {
          await expect(project.connect(account2).buyToken({ value: ethers.utils.parseEther("100") })
          ).to.be.revertedWith("Not whitelisted");
        });
        it("exceed individual contribution limit", async () => {
          await project.whitelistedCrowdsale([account2.address, account3.address]);
          await project.connect(account2).buyToken({ value: ethers.utils.parseEther("1500") });
          await expect(project.connect(account3).buyToken({ value: ethers.utils.parseEther("6000") })
          ).to.be.revertedWith("exceed individual limit");
        });
      });
      describe("in general phase", () => {
        it("send ethers without witelisted", async () => {
          await project.phaseForward();
          await project.connect(account2).buyToken({ value: ethers.utils.parseEther("500") });
          const contributions = await project.totalContributions();
          expect(contributions).to.equal(ethers.utils.parseEther("500"));
        });
        it("exceed indivudual limit", async () => {
          await project.phaseForward();
          await expect(project.connect(account2).buyToken({ value: ethers.utils.parseEther("1500") })
          ).to.be.revertedWith("exceed individual limit");
        });
      });
      describe("in open phase", () => {
        it("send ethers without whitelisted", async () => {
          await project.phaseForward();
          await project.phaseForward();
          await project.connect(account2).buyToken({ value: ethers.utils.parseEther("1500") });
          const contributions = await project.totalContributions();
          expect(contributions).to.equal(ethers.utils.parseEther("1500"));
        });
        it("send ethers and check the token balance", async () => {
          await project.phaseForward();
          await project.phaseForward();
          await project.connect(account2).buyToken({ value: ethers.utils.parseEther("100") });
          const tokens = await project.balanceOf(account2.address);
          expect(tokens).to.equal(ethers.utils.parseEther("490"));
        });
      });
    });
    describe("contributions", () => {
      describe("in seed phase", () => {
        it("send contribution from whitelisted inverstor", async () => {
          await project.whitelistedCrowdsale([account2.address]);
          await project.connect(account2).buyToken({ value: ethers.utils.parseEther("150") });
          const contribution = await project.returnContributions(account2.address);
          expect(contribution).to.equal(ethers.utils.parseEther("150"));
        });
        it("send contribution from whitelisted inverstor and phase forward to general", async () => {
          await project.whitelistedCrowdsale([account2.address]);
          await project.connect(account2).buyToken({ value: ethers.utils.parseEther("150") });
          await project.phaseForward();
          const contribution = await project.returnContributions(account2.address);
          expect(contribution).to.equal(ethers.utils.parseEther("150"));
        });
        it("send contribution from whitelisted inverstor and phase forward to open", async () => {
          await project.whitelistedCrowdsale([account2.address]);
          await project.connect(account2).buyToken({ value: ethers.utils.parseEther("150") });
          await project.phaseForward();
          await project.phaseForward();
          await project.connect(account2).withdrawTokens();
          const contribution = await project.returnContributions(account2.address);
          expect(contribution).to.equal(0);
        });
        it("send contribution from whitelisted inverstor and phase forward to open", async () => {
          await project.whitelistedCrowdsale([account2.address]);
          await project.connect(account2).buyToken({ value: ethers.utils.parseEther("150") });
          await project.phaseForward();
          await project.phaseForward();
          await project.connect(account2).withdrawTokens();
          const contribution = await project.balanceOf(account2.address);
          expect(contribution).to.equal(ethers.utils.parseEther("735"));
        });
      });
      describe("contribution in general phase", () => {
        it("send contribution and phase forward", async () => {
          await project.phaseForward();
          await project.connect(account2).buyToken({ value: ethers.utils.parseEther("150") });
          const contribution = await project.returnContributions(account2.address);
          expect(contribution).to.equal(ethers.utils.parseEther("150"));
        });
        it("send contribution and phase forward and check token balance", async () => {
          await project.phaseForward();
          await project.connect(account2).buyToken({ value: ethers.utils.parseEther("150") });
          const contribution = await project.returnContributions(account2.address);
          expect(contribution).to.equal(ethers.utils.parseEther("150"));
          const tokens = await project.balanceOf(account2.address);
          expect(tokens).to.equal(0);
        });
      });
      describe("contribution in open phase", () => {
        it("phase forward to open and send contributions", async () => {
          await project.phaseForward();
          await project.phaseForward();
          await project.connect(account2).buyToken({ value: ethers.utils.parseEther("150") });
          const contribution = await project.returnContributions(account2.address);
          expect(contribution).to.equal(0);
          const tokens = await project.balanceOf(account2.address);
          expect(tokens).to.equal(ethers.utils.parseEther("735"));
        });
      });
    });
    describe("tax", () => {
      it("calculate tax after contribution", async () => {
        await project.whitelistedCrowdsale([account2.address]);
        await project.connect(account2).buyToken({ value: ethers.utils.parseEther("100") });
        await project.phaseForward();
        await project.phaseForward();
        await project.connect(account2).withdrawTokens();
        const contribution = await project.returnTotalTaxes();
        expect(contribution).to.equal(ethers.utils.parseEther("2"));
      });
    });
    describe("pausable", () => {
      it("pause the project", async () => {
        await project.pause();
        const result = await project.state();
        expect(result).to.equal(1);
      });
      it("unpause the project", async () => {
        await project.pause();
        await project.unpause();
        const result = await project.state();
        expect(result).to.equal(0);
      });
      it("unpause the project without pause", async () => {
        await expect(project.unpause()
        ).to.be.revertedWith("Not paused");
      });
      it("pause twice", async () => {
        await project.pause();
        await expect(project.pause()
        ).to.be.revertedWith("Already paused");
      });
      it("try to pause other than the owner", async () => {
        await expect(project.connect(account2).pause()
        ).to.be.revertedWith("Only owner can");
      });
      it("emit Pause event", async () => {
        const currentTimestamp = Date.now();
        await ethers.provider.send("evm_setNextBlockTimestamp", [
          currentTimestamp,
        ]);
        await expect(project.pause()
        ).to.emit(project, "ChangeState").withArgs("paused", currentTimestamp);
      });
      it("emit Unpause event", async () => {
        const currentTimestamp = Date.now();
        await ethers.provider.send("evm_setNextBlockTimestamp", [
          currentTimestamp,
        ]);
        await project.pause();
        await expect(project.unpause()
        ).to.emit(project, "ChangeState").withArgs("active", currentTimestamp + 1);
      });
    });
  });
});
