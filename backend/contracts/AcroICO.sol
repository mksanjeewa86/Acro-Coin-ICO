// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./AcroToken.sol";

contract AcroICO is Ownable, AcroToken {
  
  using SafeMath for uint256;

  enum State {
    Active,
    Paused
  }

  enum Phase {
    Seed,
    General,
    Open
  }

  modifier whenNotPaused() {
    require (state == State.Active, "this project is paused");
    _;
  }

  // modifier
  modifier whenPaused {
    require (state == State.Paused, "this project is not paused") ;
    _;
  }

  // events
  event changeState(string state, uint256 timestamp);
  event phaseForwardEvent(string currentPhase, uint256 timestamp);
  event WhitelistOperations(address addr);

  // mapping
  mapping(address => uint256) public contributions;
  mapping (address => bool) public whitelist;
  mapping(address => uint256) public taxes;
  address[] public addressIndex;

  // state variables
  uint256 public goal = 30000 ether;
  Phase public phase;
  State public state;
  uint8 public rate = 5;
  uint256 public maximumTotalPrivateContributionLimit;
  uint256 public individualContributionLimit;
  uint256 public totalContributions = 0;
  uint256 public _totalTaxes = 0;
  bool public _isTaxable = false;

  // constructor
  constructor(bool isTaxable) AcroToken() {
    phase = Phase.Seed;
    state = State.Active;
    _isTaxable = isTaxable;
    maximumTotalPrivateContributionLimit = 15000 ether;
    individualContributionLimit = 1500 ether;
  }

  // functions
  function phaseForward() external onlyOwner whenNotPaused {
    require(phase != Phase.Open, "this project already in open phase");
    string memory currentPhase;
    if (phase == Phase.Seed) {
      phase = Phase.General;
      currentPhase = "General phase";
      maximumTotalPrivateContributionLimit = goal - totalContributions;
      individualContributionLimit = 1000 ether;
    } else if (phase == Phase.General) {
      phase = Phase.Open;
      currentPhase = "Open phase";
      maximumTotalPrivateContributionLimit = goal - totalContributions;
      sendToken();
    }
    emit phaseForwardEvent(currentPhase, block.timestamp);
  }

  function buyToken(address _sender, uint256 _amount) external payable whenNotPaused {
    // only in phase seed
    if (phase == Phase.Seed) {
      bool whitelisted = isWhitelisted(_sender);
      require(whitelisted, "address is not whitelisted");
    }
    // in phase seed and phase general
    if (phase != Phase.Open) {
      require(contributions[_sender] + _amount <= individualContributionLimit, "exceed the individual limit");
      require(totalContributions + _amount <= maximumTotalPrivateContributionLimit, "exceed the total limit");
      if (contributions[_sender] == 0) {
        addressIndex.push(_sender);
      }
      contributions[_sender] = _amount;
    }
    if (phase == Phase.Open) {
      require(_amount <= maximumTotalPrivateContributionLimit, "exceed the total limit");
      uint256 value = calculateValueAfterTax(_amount, _isTaxable);
      uint256 tax = calculateTaxAmount(_amount);
      _totalTaxes += tax;
      uint256 sendTokens = (value / 1 ether) * rate;
      approve(_sender, sendTokens);
      transferToken(_sender, sendTokens);
    }
    totalContributions += _amount;
  }

  // send tokens to contributors of general phase and seed phase
  function sendToken() internal {
    for (uint i = 0; i < addressIndex.length; i++) {
      uint256 value = calculateValueAfterTax(contributions[addressIndex[i]], _isTaxable);
      uint256 sendTokens = (value / 1 ether) * rate;
      approve(addressIndex[i], sendTokens);
      transferToken(addressIndex[i], sendTokens);
      uint256 tax = calculateTaxAmount(contributions[addressIndex[i]]);
      _totalTaxes += tax;
      contributions[addressIndex[i]] = 0;
    }
  }

  function pause() public onlyOwner whenNotPaused returns (bool) {
    state = State.Paused;
    emit changeState("paused", block.timestamp);
    return true;
  }

  function unpause() public onlyOwner whenPaused returns (bool) {
    state = State.Active;
    emit changeState("active", block.timestamp);
    return true;
  }

  function returnTotalTaxes() external view returns (uint256) {
    return _totalTaxes;
  }

  function calculateValueAfterTax(uint256 _amount, bool isTaxable) internal pure returns (uint256) {
    uint256 afterTax = _amount;
    if (isTaxable == true) {
      afterTax = _amount.div(100).mul(98);
    }
    return afterTax;
  }

  function calculateTaxAmount(uint256 _amount) internal pure returns (uint256) {
    return _amount.div(100).mul(2);
  }

  function returnContributions(address _owner) external view returns (uint256) {
    return contributions[_owner];
  }

  function WhitelistedCrowdsale(address[] memory _whiteList) public {
    for (uint i = 0; i < _whiteList.length; i++) {
      whitelist[_whiteList[i]] = true;
      addressIndex.push(_whiteList[i]);
      emit WhitelistOperations(_whiteList[i]);
      contributions[_whiteList[i]] = 0;
    }
  }

  function isWhitelisted(address _addr) internal view returns (bool) {
    if (whitelist[_addr] == true) {
      return true;
    }
    return false;
  }

}