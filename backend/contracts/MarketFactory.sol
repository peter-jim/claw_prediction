// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./PredictionMarket.sol";

/**
 * @title MarketFactory
 * @dev Factory contract to create and track PredictionMarket instances
 */
contract MarketFactory is Ownable {
    address public collateralToken;
    address[] public markets;
    mapping(address => bool) public isMarket;
    
    event MarketCreated(
        address indexed market,
        string question,
        string category,
        uint256 endTime,
        uint256 index
    );
    
    constructor(address _collateralToken) Ownable(msg.sender) {
        collateralToken = _collateralToken;
    }
    
    /**
     * @dev Create a new prediction market
     */
    function createMarket(
        string calldata question,
        string calldata category,
        uint256 endTime
    ) external onlyOwner returns (address) {
        require(endTime > block.timestamp, "End time must be future");
        
        PredictionMarket market = new PredictionMarket(
            collateralToken,
            question,
            category,
            endTime,
            owner()
        );
        
        address marketAddr = address(market);
        markets.push(marketAddr);
        isMarket[marketAddr] = true;
        
        emit MarketCreated(marketAddr, question, category, endTime, markets.length - 1);
        return marketAddr;
    }
    
    /**
     * @dev Get all markets
     */
    function getMarkets() external view returns (address[] memory) {
        return markets;
    }
    
    /**
     * @dev Get number of markets
     */
    function getMarketsCount() external view returns (uint256) {
        return markets.length;
    }
}
