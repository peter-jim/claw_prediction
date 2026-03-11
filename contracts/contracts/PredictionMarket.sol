// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title PredictionMarket
 * @notice A prediction market contract where users can buy/sell shares on Yes/No outcomes
 * @dev Uses ETH as the trading currency. Each market has a Yes and No outcome pool.
 *      V2: Implements Constant Product AMM (x * y = k) and Upgradability (UUPS).
 */
contract PredictionMarket is Initializable, PausableUpgradeable, OwnableUpgradeable, UUPSUpgradeable {
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
        uint256 totalLpShares; // Total LP shares minted
        address creator;
        uint256 createdAt;
    }

    struct Position {
        uint256 yesShares;
        uint256 noShares;
        uint256 yesCost;      // total ETH spent on Yes
        uint256 noCost;       // total ETH spent on No
        uint256 lpShares;     // liquidity provider shares
    }

    // State
    uint256 public nextMarketId;
    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => Position)) public positions;
    
    // Auth & Config
    address public oracle;
    uint256 public feeBasisPoints; // Total fee e.g. 20 (0.2%)
    uint256 public treasuryFeeBps; // How much of the total fee goes to treasury e.g. 10 (50% split)
    address public treasury;     // Treasury vault address
    uint256 public treasuryBalance; // Accumulated ETH for treasury

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

    event LiquidityAdded(
        uint256 indexed marketId,
        address indexed provider,
        uint256 amount,
        uint256 lpSharesMinted
    );

    event LiquidityRemoved(
        uint256 indexed marketId,
        address indexed provider,
        uint256 lpSharesBurned,
        uint256 ethReturned
    );

    // Modifiers
    modifier onlyOracleOrOwner() {
        require(msg.sender == owner() || msg.sender == oracle, "Not authorized");
        _;
    }

    modifier checkDeadline(uint256 _deadline) {
        require(block.timestamp <= _deadline, "Transaction expired");
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

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _initialOwner, address _oracle, address _treasury) initializer public {
        __Pausable_init();
        __Ownable_init(_initialOwner);

        oracle = _oracle;
        treasury = _treasury;
        feeBasisPoints = 20;  // 0.2% default
        treasuryFeeBps = 10;  // 50% of the 0.2% fee goes to treasury
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {}

    function setOracle(address _oracle) external onlyOwner {
        oracle = _oracle;
    }

    function setFeeConfiguration(uint256 _totalBps, uint256 _treasuryBps) external onlyOwner {
        require(_totalBps <= 1000, "Fee too high"); // max 10%
        require(_treasuryBps <= _totalBps, "Treasury fee exceeds total");
        feeBasisPoints = _totalBps;
        treasuryFeeBps = _treasuryBps;
    }

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid address");
        treasury = _treasury;
    }

    function claimTreasury() external {
        uint256 amount = treasuryBalance;
        require(amount > 0, "No funds");
        treasuryBalance = 0;
        (bool success, ) = payable(treasury).call{value: amount}("");
        require(success, "Transfer failed");
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
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
     * @dev CPAMM: Exact Input approach. msg.value mints equal Yes and No shares.
     *      Unwanted shares are immediately sold back to the respective pool, shifting the ratio.
     */
    function buyShares(
        uint256 _marketId, 
        Outcome _outcome, 
        uint256 _minSharesOut,
        uint256 _deadline
    )
        external
        payable
        marketExists(_marketId)
        marketOpen(_marketId)
        checkDeadline(_deadline)
    {
        require(_outcome == Outcome.Yes || _outcome == Outcome.No, "Invalid outcome");
        require(msg.value > 0, "Must send ETH");

        Market storage m = markets[_marketId];
        Position storage pos = positions[_marketId][msg.sender];

        // 1. Calculate and deduct fees
        uint256 totalFee = (msg.value * feeBasisPoints) / 10000;
        uint256 treasuryFee = (msg.value * treasuryFeeBps) / 10000;
        uint256 lpFee = totalFee - treasuryFee;
        
        uint256 netValue = msg.value - totalFee;
        treasuryBalance += treasuryFee;

        // 2. Distribute LP fee (proportional split to pools)
        uint256 yesLpFee = lpFee / 2;
        uint256 noLpFee = lpFee - yesLpFee;
        m.yesPool += yesLpFee;
        m.noPool += noLpFee;

        // 3. Virtual Minting: netValue ETH mints `netValue` YES and `netValue` NO shares
        // 4. Swap unwanted shares for desired shares via CPAMM
        uint256 sharesObtained;

        if (_outcome == Outcome.Yes) {
            // User wants YES. We virtually sell the minted NO shares to the NO pool for ETH,
            // then use that ETH to buy MORE YES shares from the YES pool.
            // Simplified AMM math for buying:
            // Pool balances effectively absorb the netValue during the swap mathematics

            sharesObtained = _quoteBuyExactIn(m.yesShares, m.noShares, netValue);
            require(sharesObtained >= _minSharesOut, "Slippage exceeded");

            m.yesShares -= (sharesObtained - netValue); // pool loses the extra YES shares
            m.noShares += netValue;                     // pool gains the unwanted NO shares
            
            // Pools absorb the ETH
            m.yesPool += netValue; 

            pos.yesShares += sharesObtained;
            pos.yesCost += msg.value;
        } else {
            // User wants NO.
            sharesObtained = _quoteBuyExactIn(m.noShares, m.yesShares, netValue);
            require(sharesObtained >= _minSharesOut, "Slippage exceeded");

            m.noShares -= (sharesObtained - netValue);
            m.yesShares += netValue;
            
            m.noPool += netValue;

            pos.noShares += sharesObtained;
            pos.noCost += msg.value;
        }

        emit SharesBought(_marketId, msg.sender, _outcome, sharesObtained, msg.value);
    }

    /**
     * @notice Sell shares back to the pool
     */
    function sellShares(
        uint256 _marketId, 
        Outcome _outcome, 
        uint256 _shares, 
        uint256 _minPayout,
        uint256 _deadline
    )
        external
        marketExists(_marketId)
        marketOpen(_marketId)
        whenNotPaused
        checkDeadline(_deadline)
    {
        require(_outcome == Outcome.Yes || _outcome == Outcome.No, "Invalid outcome");
        require(_shares > 0, "Must sell > 0 shares");

        Market storage m = markets[_marketId];
        Position storage pos = positions[_marketId][msg.sender];

        uint256 grossPayout;
        if (_outcome == Outcome.Yes) {
            require(pos.yesShares >= _shares, "Not enough Yes shares");
            grossPayout = _quoteSellExactIn(m.yesShares, m.noShares, _shares);
            
            m.yesShares += _shares;
            m.noShares -= grossPayout; // Pool pays out by giving the user's NO shares back + ETH
            m.yesPool -= grossPayout;

            pos.yesShares -= _shares;
            uint256 costReduction = (_shares * pos.yesCost) / (pos.yesShares + _shares);
            pos.yesCost -= costReduction;
        } else {
            require(pos.noShares >= _shares, "Not enough No shares");
            grossPayout = _quoteSellExactIn(m.noShares, m.yesShares, _shares);
            
            m.noShares += _shares;
            m.yesShares -= grossPayout;
            m.noPool -= grossPayout;

            pos.noShares -= _shares;
            uint256 costReduction = (_shares * pos.noCost) / (pos.noShares + _shares);
            pos.noCost -= costReduction;
        }
        
        uint256 totalFee = (grossPayout * feeBasisPoints) / 10000;
        uint256 treasuryFee = (grossPayout * treasuryFeeBps) / 10000;
        
        uint256 netPayout = grossPayout - totalFee;

        require(netPayout >= _minPayout, "Slippage exceeded: payout too low");

        treasuryBalance += treasuryFee;

        // LP fee stays distributed in pools implicitly since we didn't drain it from the pool

        (bool success, ) = payable(msg.sender).call{value: netPayout}("");
        require(success, "ETH transfer failed");

        emit SharesSold(_marketId, msg.sender, _outcome, _shares, netPayout);
    }

    /**
     * @notice Oracle or Owner resolves a market with the winning outcome
     */
    function resolveMarket(uint256 _marketId, Outcome _outcome)
        external
        onlyOracleOrOwner
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

    // ─── Liquidity Provider (LP) ───────────────────────────────

    function addLiquidity(uint256 _marketId, uint256 _deadline)
        external
        payable
        marketExists(_marketId)
        marketOpen(_marketId)
        whenNotPaused
        checkDeadline(_deadline)
    {
        require(msg.value > 0, "Must send ETH");
        Market storage m = markets[_marketId];
        Position storage pos = positions[_marketId][msg.sender];

        uint256 lpSharesMinted;
        if (m.totalLpShares == 0) {
            // Initial liquidity
            lpSharesMinted = msg.value;
            uint256 half = msg.value / 2;
            m.yesPool = half;
            m.noPool = msg.value - half;
            m.yesShares = half;
            m.noShares = msg.value - half;
        } else {
            // Subsequent liquidity: must be proportional to total pool value
            // Using ETH value as base. User provides msg.value ETH.
            // We mint relative to existing totalLpShares
            uint256 totalPool = m.yesPool + m.noPool;
            lpSharesMinted = (msg.value * m.totalLpShares) / totalPool;
            
            // Proportional split to pools and virtual shares
            uint256 yesAdd = (msg.value * m.yesPool) / totalPool;
            uint256 noAdd = msg.value - yesAdd;
            
            m.yesPool += yesAdd;
            m.noPool += noAdd;
            m.yesShares += yesAdd;
            m.noShares += noAdd;
        }
        
        m.totalLpShares += lpSharesMinted;
        pos.lpShares += lpSharesMinted;

        emit LiquidityAdded(_marketId, msg.sender, msg.value, lpSharesMinted);
    }

    function removeLiquidity(uint256 _marketId, uint256 _lpShares, uint256 _deadline)
        external
        marketExists(_marketId)
        whenNotPaused
        checkDeadline(_deadline)
    {
        require(_lpShares > 0, "Must burn > 0 lpShares");
        Market storage m = markets[_marketId];
        Position storage pos = positions[_marketId][msg.sender];
        require(pos.lpShares >= _lpShares, "Insufficient LP shares");

        uint256 yesAmt = (_lpShares * m.yesPool) / m.totalLpShares;
        uint256 noAmt = (_lpShares * m.noPool) / m.totalLpShares;
        uint256 payout = yesAmt + noAmt;

        m.totalLpShares -= _lpShares;
        pos.lpShares -= _lpShares;

        m.yesPool -= yesAmt;
        m.noPool -= noAmt;
        m.yesShares -= yesAmt;
        m.noShares -= noAmt;

        (bool success, ) = payable(msg.sender).call{value: payout}("");
        require(success, "ETH transfer failed");

        emit LiquidityRemoved(_marketId, msg.sender, _lpShares, payout);
    }

    function getPoolReserves(uint256 _marketId) external view returns (uint256 yesPool, uint256 noPool, uint256 totalLp) {
        Market storage m = markets[_marketId];
        return (m.yesPool, m.noPool, m.totalLpShares);
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
     * @dev CPAMM ratio calculation
     */
    function getYesPrice(uint256 _marketId) external view returns (uint256) {
        Market storage m = markets[_marketId];
        if (m.yesShares == 0 && m.noShares == 0) return 5000; 
        uint256 total = m.yesShares + m.noShares;
        return (m.noShares * 10000) / total; // Price of YES is bounded by scarcity of YES (i.e., NO supply)
    }

    function getNoPrice(uint256 _marketId) external view returns (uint256) {
        Market storage m = markets[_marketId];
        if (m.yesShares == 0 && m.noShares == 0) return 5000;
        uint256 total = m.yesShares + m.noShares;
        return (m.yesShares * 10000) / total;
    }

    function getMarketCount() external view returns (uint256) {
        return nextMarketId;
    }

    // ─── AMM Quoting ─────────────────────────────────────────

    function quoteBuy(uint256 _marketId, Outcome _outcome, uint256 _amountEth) external view returns (uint256) {
        Market storage m = markets[_marketId];
        uint256 totalFee = (_amountEth * feeBasisPoints) / 10000;
        uint256 netValue = _amountEth - totalFee;

        if (_outcome == Outcome.Yes) {
            if (m.yesShares == 0) return netValue;
            return _quoteBuyExactIn(m.yesShares, m.noShares, netValue);
        } else {
            if (m.noShares == 0) return netValue;
            return _quoteBuyExactIn(m.noShares, m.yesShares, netValue);
        }
    }

    function quoteSell(uint256 _marketId, Outcome _outcome, uint256 _shares) external view returns (uint256) {
        Market storage m = markets[_marketId];
        uint256 grossPayout;
        
        if (_outcome == Outcome.Yes) {
            if (m.noShares == 0) return 0;
            grossPayout = _quoteSellExactIn(m.yesShares, m.noShares, _shares);
        } else {
            if (m.yesShares == 0) return 0;
            grossPayout = _quoteSellExactIn(m.noShares, m.yesShares, _shares);
        }

        uint256 totalFee = (grossPayout * feeBasisPoints) / 10000;
        return grossPayout - totalFee;
    }

    // Mathematical formula for xy=k buying
    function _quoteBuyExactIn(uint256 targetReserves, uint256 otherReserves, uint256 netValueIn) internal pure returns (uint256) {
        // user pays netValueIn, getting netValueIn of both virtual shares.
        // Needs to swap virtual otherShares for targetShares.
        // dy = y - (k / (x + dx))
        uint256 k = targetReserves * otherReserves;
        uint256 newOtherReserves = otherReserves + netValueIn;
        uint256 newTargetReserves = k / newOtherReserves;
        
        uint256 targetSharesFromSwap = targetReserves - newTargetReserves;
        return netValueIn + targetSharesFromSwap; // base virtual mint + swap proceeds
    }

    // Mathematical formula for xy=k selling
    function _quoteSellExactIn(uint256 targetReserves, uint256 otherReserves, uint256 sharesIn) internal pure returns (uint256) {
        // user returns sharesIn.
        // dy = y - (k / (x + dx))  [where x = targetReserves, y = otherReserves]
        uint256 k = targetReserves * otherReserves;
        uint256 newTargetReserves = targetReserves + sharesIn;
        uint256 newOtherReserves = k / newTargetReserves;
        
        return otherReserves - newOtherReserves; // ETH out is equal to the other virtual shares withdrawn
    }
}
