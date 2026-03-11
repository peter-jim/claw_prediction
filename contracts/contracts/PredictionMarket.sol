// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title PredictionMarket
 * @notice A prediction market contract where users can buy/sell shares on Yes/No outcomes
 * @dev Uses ETH as the trading currency. Each market has a Yes and No outcome pool.
 */
contract PredictionMarket is Pausable {
    enum Outcome { None, Yes, No }
    enum MarketStatus { Open, Resolved, Cancelled }

    struct Market {
        uint256 id;
        string title;
        string description;
        string category;
        string imageUrl;
        uint256 endTime;
        MarketStatus status;
        Outcome resolvedOutcome;
        uint256 yesShares;    // total Yes shares minted
        uint256 noShares;     // total No shares minted
        uint256 yesPool;      // ETH in Yes pool
        uint256 noPool;       // ETH in No pool
        address creator;
        uint256 createdAt;
    }

    struct Position {
        uint256 yesShares;
        uint256 noShares;
        uint256 yesCost;      // total ETH spent on Yes
        uint256 noCost;       // total ETH spent on No
    }

    // State
    uint256 public nextMarketId;
    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => Position)) public positions;
    address public admin;

    // Events
    event MarketCreated(
        uint256 indexed marketId,
        string title,
        string category,
        uint256 endTime,
        address creator
    );

    event SharesBought(
        uint256 indexed marketId,
        address indexed buyer,
        Outcome outcome,
        uint256 shares,
        uint256 cost
    );

    event SharesSold(
        uint256 indexed marketId,
        address indexed seller,
        Outcome outcome,
        uint256 shares,
        uint256 payout
    );

    event MarketResolved(
        uint256 indexed marketId,
        Outcome outcome
    );

    event WinningsClaimed(
        uint256 indexed marketId,
        address indexed user,
        uint256 amount
    );

    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier marketExists(uint256 _marketId) {
        require(_marketId < nextMarketId, "Market does not exist");
        _;
    }

    modifier marketOpen(uint256 _marketId) {
        require(markets[_marketId].status == MarketStatus.Open, "Market not open");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function pause() external onlyAdmin {
        _pause();
    }

    function unpause() external onlyAdmin {
        _unpause();
    }

    /**
     * @notice Create a new prediction market
     */
    function createMarket(
        string calldata _title,
        string calldata _description,
        string calldata _category,
        string calldata _imageUrl,
        uint256 _endTime
    ) external whenNotPaused returns (uint256) {
        require(_endTime > block.timestamp, "End time must be in the future");

        uint256 marketId = nextMarketId++;
        Market storage m = markets[marketId];
        m.id = marketId;
        m.title = _title;
        m.description = _description;
        m.category = _category;
        m.imageUrl = _imageUrl;
        m.endTime = _endTime;
        m.status = MarketStatus.Open;
        m.resolvedOutcome = Outcome.None;
        m.creator = msg.sender;
        m.createdAt = block.timestamp;

        emit MarketCreated(marketId, _title, _category, _endTime, msg.sender);
        return marketId;
    }

    /**
     * @notice Buy shares of a market outcome
     * @dev Price is determined by the LMSR-inspired constant product formula
     *      Shares = msg.value * totalShares / pool (simplified AMM)
     */
    function buyShares(uint256 _marketId, Outcome _outcome)
        external
        payable
        marketExists(_marketId)
        marketOpen(_marketId)
        whenNotPaused
    {
        require(_outcome == Outcome.Yes || _outcome == Outcome.No, "Invalid outcome");
        require(msg.value > 0, "Must send ETH");

        Market storage m = markets[_marketId];
        Position storage pos = positions[_marketId][msg.sender];

        uint256 shares;

        if (_outcome == Outcome.Yes) {
            // If pool is empty (first buyer), shares = amount (1:1)
            if (m.yesPool == 0) {
                shares = msg.value;
            } else {
                // Simple AMM: shares = amount * totalShares / pool
                shares = (msg.value * m.yesShares) / m.yesPool;
            }
            m.yesPool += msg.value;
            m.yesShares += shares;
            pos.yesShares += shares;
            pos.yesCost += msg.value;
        } else {
            if (m.noPool == 0) {
                shares = msg.value;
            } else {
                shares = (msg.value * m.noShares) / m.noPool;
            }
            m.noPool += msg.value;
            m.noShares += shares;
            pos.noShares += shares;
            pos.noCost += msg.value;
        }

        emit SharesBought(_marketId, msg.sender, _outcome, shares, msg.value);
    }

    /**
     * @notice Sell shares back to the pool
     */
    function sellShares(uint256 _marketId, Outcome _outcome, uint256 _shares)
        external
        marketExists(_marketId)
        marketOpen(_marketId)
        whenNotPaused
    {
        require(_outcome == Outcome.Yes || _outcome == Outcome.No, "Invalid outcome");
        require(_shares > 0, "Must sell > 0 shares");

        Market storage m = markets[_marketId];
        Position storage pos = positions[_marketId][msg.sender];

        uint256 payout;

        if (_outcome == Outcome.Yes) {
            require(pos.yesShares >= _shares, "Not enough Yes shares");
            // payout = shares * pool / totalShares
            payout = (_shares * m.yesPool) / m.yesShares;
            m.yesPool -= payout;
            m.yesShares -= _shares;
            pos.yesShares -= _shares;
            // Adjust cost basis proportionally
            uint256 costReduction = (_shares * pos.yesCost) / (pos.yesShares + _shares);
            pos.yesCost -= costReduction;
        } else {
            require(pos.noShares >= _shares, "Not enough No shares");
            payout = (_shares * m.noPool) / m.noShares;
            m.noPool -= payout;
            m.noShares -= _shares;
            pos.noShares -= _shares;
            uint256 costReduction = (_shares * pos.noCost) / (pos.noShares + _shares);
            pos.noCost -= costReduction;
        }

        (bool success, ) = payable(msg.sender).call{value: payout}("");
        require(success, "ETH transfer failed");

        emit SharesSold(_marketId, msg.sender, _outcome, _shares, payout);
    }

    /**
     * @notice Admin resolves a market with the winning outcome
     */
    function resolveMarket(uint256 _marketId, Outcome _outcome)
        external
        onlyAdmin
        marketExists(_marketId)
        marketOpen(_marketId)
    {
        require(_outcome == Outcome.Yes || _outcome == Outcome.No, "Invalid outcome");

        Market storage m = markets[_marketId];
        m.status = MarketStatus.Resolved;
        m.resolvedOutcome = _outcome;

        emit MarketResolved(_marketId, _outcome);
    }

    /**
     * @notice Claim winnings from a resolved market
     */
    function claimWinnings(uint256 _marketId)
        external
        marketExists(_marketId)
    {
        Market storage m = markets[_marketId];
        require(m.status == MarketStatus.Resolved, "Market not resolved");

        Position storage pos = positions[_marketId][msg.sender];
        uint256 totalPool = m.yesPool + m.noPool;
        uint256 payout;

        if (m.resolvedOutcome == Outcome.Yes) {
            require(pos.yesShares > 0, "No winning shares");
            // Winner gets proportional share of total pool
            payout = (pos.yesShares * totalPool) / m.yesShares;
            pos.yesShares = 0;
            pos.yesCost = 0;
        } else {
            require(pos.noShares > 0, "No winning shares");
            payout = (pos.noShares * totalPool) / m.noShares;
            pos.noShares = 0;
            pos.noCost = 0;
        }

        (bool success, ) = payable(msg.sender).call{value: payout}("");
        require(success, "ETH transfer failed");

        emit WinningsClaimed(_marketId, msg.sender, payout);
    }

    // ─── View Functions ───────────────────────────────────────

    function getMarket(uint256 _marketId) external view returns (
        uint256 id,
        string memory title,
        string memory description,
        string memory category,
        string memory imageUrl,
        uint256 endTime,
        MarketStatus status,
        Outcome resolvedOutcome,
        uint256 yesShares,
        uint256 noShares,
        uint256 yesPool,
        uint256 noPool,
        address creator,
        uint256 createdAt
    ) {
        Market storage m = markets[_marketId];
        return (
            m.id, m.title, m.description, m.category, m.imageUrl,
            m.endTime, m.status, m.resolvedOutcome,
            m.yesShares, m.noShares, m.yesPool, m.noPool,
            m.creator, m.createdAt
        );
    }

    function getPosition(uint256 _marketId, address _user) external view returns (
        uint256 yesShares,
        uint256 noShares,
        uint256 yesCost,
        uint256 noCost
    ) {
        Position storage pos = positions[_marketId][_user];
        return (pos.yesShares, pos.noShares, pos.yesCost, pos.noCost);
    }

    /**
     * @notice Get the current price of Yes outcome in basis points (0-10000)
     * @dev 5000 = 50%, based on pool ratio
     */
    function getYesPrice(uint256 _marketId) external view returns (uint256) {
        Market storage m = markets[_marketId];
        if (m.yesPool == 0 && m.noPool == 0) return 5000; // 50% default
        uint256 total = m.yesPool + m.noPool;
        return (m.yesPool * 10000) / total;
    }

    function getNoPrice(uint256 _marketId) external view returns (uint256) {
        Market storage m = markets[_marketId];
        if (m.yesPool == 0 && m.noPool == 0) return 5000;
        uint256 total = m.yesPool + m.noPool;
        return (m.noPool * 10000) / total;
    }

    function getMarketCount() external view returns (uint256) {
        return nextMarketId;
    }
}
