// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PredictionMarket
 * @dev A binary prediction market using LMSR (Logarithmic Market Scoring Rule)
 * Users buy YES or NO shares, prices determined by market maker algorithm
 */
contract PredictionMarket is Ownable, ReentrancyGuard {
    IERC20 public immutable collateralToken;
    
    uint256 public constant PRECISION = 1e18;
    uint256 public constant b = 100 * PRECISION; // Liquidity parameter
    
    string public question;
    string public category;
    uint256 public endTime;
    bool public resolved;
    bool public outcomeYes;
    
    uint256 public qYes;  // quantity of YES shares sold
    uint256 public qNo;   // quantity of NO shares sold
    uint256 public totalCollateral;
    
    mapping(address => uint256) public yesShares;
    mapping(address => uint256) public noShares;
    
    event SharesBought(address indexed buyer, bool isYes, uint256 amount, uint256 cost);
    event SharesSold(address indexed seller, bool isYes, uint256 amount, uint256 proceeds);
    event MarketResolved(bool outcome);
    event WinningsClaimed(address indexed claimer, uint256 amount);
    
    constructor(
        address _collateralToken,
        string memory _question,
        string memory _category,
        uint256 _endTime,
        address _owner
    ) Ownable(_owner) {
        collateralToken = IERC20(_collateralToken);
        question = _question;
        category = _category;
        endTime = _endTime;
    }
    
    /**
     * @dev Calculate cost to buy `amount` YES or NO shares using LMSR
     */
    function getCost(bool isYes, uint256 amount) public view returns (uint256) {
        uint256 avgShares = (isYes ? qYes : qNo) + amount / 2;
        uint256 totalShares = qYes + qNo + b / PRECISION;
        uint256 avgPrice = (avgShares * PRECISION) / totalShares;
        
        return (avgPrice * amount) / PRECISION;
    }
    
    /**
     * @dev Buy YES or NO shares
     * @param isYes True to buy YES shares, false for NO shares
     * @param amount Number of shares to buy (in PRECISION units)
     * @param maxCost Maximum collateral to spend
     */
    function buyShares(bool isYes, uint256 amount, uint256 maxCost) external nonReentrant {
        require(!resolved, "Market resolved");
        require(block.timestamp < endTime, "Market ended");
        require(amount > 0, "Amount must be positive");
        
        uint256 cost = getCost(isYes, amount);
        require(cost <= maxCost, "Cost exceeds maximum");
        require(collateralToken.transferFrom(msg.sender, address(this), cost), "Transfer failed");
        
        if (isYes) {
            qYes += amount;
            yesShares[msg.sender] += amount;
        } else {
            qNo += amount;
            noShares[msg.sender] += amount;
        }
        
        totalCollateral += cost;
        emit SharesBought(msg.sender, isYes, amount, cost);
    }
    
    /**
     * @dev Sell YES or NO shares back to the market
     * @param isYes True to sell YES shares, false for NO shares  
     * @param amount Number of shares to sell
     * @param minProceeds Minimum collateral to receive
     */
    function sellShares(bool isYes, uint256 amount, uint256 minProceeds) external nonReentrant {
        require(!resolved, "Market resolved");
        require(block.timestamp < endTime, "Market ended");
        require(amount > 0, "Amount must be positive");
        
        if (isYes) {
            require(yesShares[msg.sender] >= amount, "Insufficient YES shares");
        } else {
            require(noShares[msg.sender] >= amount, "Insufficient NO shares");
        }
        
        uint256 proceeds = getSellProceeds(isYes, amount);
        require(proceeds >= minProceeds, "Proceeds below minimum");
        
        if (isYes) {
            qYes -= amount;
            yesShares[msg.sender] -= amount;
        } else {
            qNo -= amount;
            noShares[msg.sender] -= amount;
        }
        
        totalCollateral -= proceeds;
        require(collateralToken.transfer(msg.sender, proceeds), "Transfer failed");
        emit SharesSold(msg.sender, isYes, amount, proceeds);
    }
    
    /**
     * @dev Get sell proceeds for shares
     */
    function getSellProceeds(bool isYes, uint256 amount) public view returns (uint256) {
        uint256 currentShares = isYes ? qYes : qNo;
        require(currentShares >= amount, "Insufficient market shares");
        
        uint256 avgShares = currentShares - amount / 2;
        uint256 totalShares = qYes + qNo + b / PRECISION;
        uint256 avgPrice = (avgShares * PRECISION) / totalShares;
        
        return (avgPrice * amount) / PRECISION;
    }
    
    /**
     * @dev Get current YES price (0-1 scaled by PRECISION)
     */
    function getYesPrice() external view returns (uint256) {
        uint256 total = qYes + qNo;
        if (total == 0) return PRECISION / 2;
        return (qYes * PRECISION) / total;
    }
    
    /**
     * @dev Resolve the market - only owner
     */
    function resolve(bool _outcomeYes) external onlyOwner {
        require(!resolved, "Already resolved");
        require(block.timestamp >= endTime, "Market not ended");
        resolved = true;
        outcomeYes = _outcomeYes;
        emit MarketResolved(_outcomeYes);
    }
    
    /**
     * @dev Claim winnings after resolution
     */
    function claimWinnings() external nonReentrant {
        require(resolved, "Not resolved");
        
        uint256 shares = outcomeYes ? yesShares[msg.sender] : noShares[msg.sender];
        require(shares > 0, "No winning shares");
        
        if (outcomeYes) {
            yesShares[msg.sender] = 0;
        } else {
            noShares[msg.sender] = 0;
        }
        
        uint256 payout = shares;
        require(collateralToken.transfer(msg.sender, payout), "Transfer failed");
        emit WinningsClaimed(msg.sender, payout);
    }
    
    /**
     * @dev Get market info
     */
    function getMarketInfo() external view returns (
        string memory _question,
        string memory _category,
        uint256 _endTime,
        bool _resolved,
        bool _outcomeYes,
        uint256 _qYes,
        uint256 _qNo,
        uint256 _totalCollateral
    ) {
        return (question, category, endTime, resolved, outcomeYes, qYes, qNo, totalCollateral);
    }
}
