// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.11;

contract Lottery {
    address public manager;

    address[] public players;

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    constructor () {
        manager = msg.sender;
    }
    
    function enter() public payable {

        require(msg.value > 0.01 ether);

        players.push(msg.sender);
    }

    function random() private view returns(uint) {
        return uint(keccak256(abi.encode(block.difficulty, block.timestamp, players)));             //sha3 algorithm to generate a random hash (It is not truly random because block difficulty, players and timestamp can be predictable before time)
    }

    function pickWinner() public restricted {

        uint index = random() % players.length;
        payable(players[index]).transfer(address(this).balance);
        players = new address[](0);                 // intialize with new dynamic array with initial size 0
    }

    function getPlayers() public view returns(address[] memory) {
        return players;
    }
    
}