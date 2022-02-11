// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./AcroToken.sol";

contract AcroICO is AcroToken {

  enum State {
    Active,
    Paused
  }

  enum Phase {
    Seed,
    General,
    Open
  }

  // modifier
  modifier whenNotPaused() {
    require (state == State.Active, "Already paused");
    _;
  }

  modifier whenPaused {
    require (state == State.Paused, "Not paused") ;
    _;
  }

  modifier isPhaseOpen {
    require (phase == Phase.Open, "Not open");
    _;
  }

  modifier onlyOwner {
    require(msg.sender == admin, "Only owner can");
    _;
  }

  // events
  event ChangeState(string state, uint256 timestamp);
  event PhaseForwardEvent(string currentPhase, uint256 timestamp);
  event WhitelistOperations(address addr);

  // mapping
  mapping(address => uint256) public contributions;
  mapping (address => bool) public whitelist;
  mapping(address => uint256) public taxes;

  // state variables
  uint256 public constant GOAL = 30000 ether;
  uint8 public constant RATE = 5;
  Phase public phase;
  State public state;
  uint256 public maximumTotalPrivateContributionLimit;
  uint256 public individualContributionLimit;
  uint256 public totalContributions = 0;
  uint256 public totalTaxes = 0;
  bool public isTaxable = false;
  address private admin;

  // constructor
  constructor(bool _isTaxable) AcroToken() {
    admin = msg.sender;
    phase = Phase.Seed;
    state = State.Active;
    isTaxable = _isTaxable;
    maximumTotalPrivateContributionLimit = 15000 ether;
    individualContributionLimit = 1500 ether;
  }

  // functions
  function phaseForward() external onlyOwner whenNotPaused {
    require(phase != Phase.Open, "Already open");
    string memory currentPhase;
    if (phase == Phase.Seed) {
      phase = Phase.General;
      currentPhase = "General phase";
      maximumTotalPrivateContributionLimit = GOAL - totalContributions;
      individualContributionLimit = 1000 ether;
    } else if (phase == Phase.General) {
      phase = Phase.Open;
      currentPhase = "Open phase";
      maximumTotalPrivateContributionLimit = GOAL - totalContributions;
    }
    emit PhaseForwardEvent(currentPhase, block.timestamp);
  }

  function buyToken() external payable whenNotPaused {
    // only in phase seed
    if (phase == Phase.Seed) {
      bool whitelisted = isWhitelisted(msg.sender);
      require(whitelisted, "Not whitelisted");
    }
    // in phase seed and phase general
    if (phase != Phase.Open) {
      require(contributions[msg.sender] + msg.value <= individualContributionLimit, "exceed individual limit");
      require(totalContributions + msg.value <= maximumTotalPrivateContributionLimit, "exceed total limit");
      contributions[msg.sender] += msg.value;
    }
    if (phase == Phase.Open) {
      require(msg.value <= maximumTotalPrivateContributionLimit, "exceed total limit");
      uint256 value = calculateValueAfterTax(msg.value);
      uint256 tax = calculateTaxAmount(msg.value);
      totalTaxes += tax;
      uint256 sendTokens = value * RATE;
      approve(msg.sender, sendTokens);
      transferToken(msg.sender, sendTokens);
    }
    totalContributions += msg.value;
  }

  // withdraw tokens for contributors of general phase and seed phase
  function withdrawTokens() external payable isPhaseOpen {
    require(contributions[msg.sender] > 0, "No contributions");
    uint256 value = calculateValueAfterTax(contributions[msg.sender]);
    uint256 sendTokens = value * RATE;
    approve(msg.sender, sendTokens);
    transferToken(msg.sender, sendTokens);
    uint256 tax = calculateTaxAmount(contributions[msg.sender]);
    totalTaxes += tax;
    contributions[msg.sender] = 0;
  }

  function pause() external onlyOwner whenNotPaused returns (bool) {
    state = State.Paused;
    emit ChangeState("paused", block.timestamp);
    return true;
  }

  function unpause() external onlyOwner whenPaused returns (bool) {
    state = State.Active;
    emit ChangeState("active", block.timestamp);
    return true;
  }

  function returnTotalTaxes() external view returns (uint256) {
    return totalTaxes;
  }

  function calculateValueAfterTax(uint256 _amount) internal view returns (uint256) {
    uint256 afterTax = _amount;
    if (isTaxable == true) {
      afterTax = (_amount * 98) / 100;
    }
    return afterTax;
  }

  function calculateTaxAmount(uint256 _amount) internal pure returns (uint256) {
    return (_amount * 2) / 100;
  }

  function returnContributions(address _owner) external view returns (uint256) {
    return contributions[_owner];
  }

  function whitelistedCrowdsale(address[] memory _whiteList) external onlyOwner {
    for (uint i = 0; i < _whiteList.length; i++) {
      whitelist[_whiteList[i]] = true;
      emit WhitelistOperations(_whiteList[i]);
    }
  }

  function isWhitelisted(address _addr) internal view returns (bool) {
    return whitelist[_addr];
  }

}