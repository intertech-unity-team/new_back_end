// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Uni is ERC20 {
    constructor() ERC20("UNI", "UnityCoin") {
        _mint(msg.sender, 5000 * 10**18);
    }
}