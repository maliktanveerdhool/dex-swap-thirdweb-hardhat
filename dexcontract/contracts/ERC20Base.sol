// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC20Base is ERC20, Ownable {
    constructor(
        address _defaultAdmin,
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol) Ownable(_defaultAdmin) {
        _mint(_defaultAdmin, 1000000 * 10 ** decimals()); // Mint 1,000,000 tokens to admin
    }
}
