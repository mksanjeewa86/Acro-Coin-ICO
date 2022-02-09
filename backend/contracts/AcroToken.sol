// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract AcroToken is ERC20 {

  uint256 public _totalSupply = 500000;
  address public admin;

    // constructor
    constructor () ERC20("AcroToken", "ACR") {
      admin = msg.sender;
      _mint(msg.sender, _totalSupply);
      emit Transfer(address(0), msg.sender, _totalSupply);
    }

    function transferToken(address _recipient, uint256 _amount) public returns (bool) {
      _transfer(admin, _recipient, _amount);
      return true;
    }

}