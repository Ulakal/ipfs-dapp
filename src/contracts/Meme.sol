pragma solidity ^0.5.8;

contract Meme {
    string public memeHash;

    function set(string calldata _memeHash) external {
        memeHash = _memeHash;
    }
}