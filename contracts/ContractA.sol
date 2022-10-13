// SPDX-License-Identifier: MIT

pragma solidity 0.8.16;

/**
 * @title Lab contract A
 * @dev A contract to research
 */
contract ContractA {
    uint256 public x;

    event SetX(address indexed sender, uint256 oldX, uint256 newX);

    function isDeployed() external pure returns (bool) {
        return true;
    }

    function setX(uint256 newX) external {
        emit SetX(msg.sender, x, newX);
        x = newX;
    }

    function setDifferentX(uint256 newX) external {
        uint256 oldX = x;
        require(
            oldX != newX,
            "The provided value is the same as the stored one"
        );
        emit SetX(msg.sender, oldX, newX);
        x = newX;
    }
}
