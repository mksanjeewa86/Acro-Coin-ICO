// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract AcroToken is ERC20 {

  uint256 public totalTokenSupply = 500000;
  address private admin;

    // constructor
    constructor () ERC20("AcroToken", "ACR") {
      admin = msg.sender;
      _mint(msg.sender, totalTokenSupply * 10 ** decimals());
    }

    function transferToken(address _recipient, uint256 _amount) public returns (bool) {
      _transfer(admin, _recipient, _amount);
      return true;
    }

}