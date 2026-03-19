// Contract address and ABI for PredictionMarket
// This is auto-generated from the deployment — update if you redeploy

export const PREDICTION_MARKET_ADDRESS = '0xE6E340D132b5f46d1e472DebcD681B2aBc16e57E' as const;

export const PREDICTION_MARKET_ABI = [
  "constructor()",
  "function initialize(address _initialOwner, address _oracle, address _treasury)",
  "function createMarket(string _title, string _description, string _category, string _imageUrl, uint256 _endTime) returns (uint256)",
  "function buyShares(uint256 _marketId, uint8 _outcome, uint256 _minSharesOut, uint256 _deadline) payable",
  "function sellShares(uint256 _marketId, uint8 _outcome, uint256 _shares, uint256 _minPayout, uint256 _deadline)",
  "function resolveMarket(uint256 _marketId, uint8 _outcome)",
  "function cancelMarket(uint256 _marketId)",
  "function claimWinnings(uint256 _marketId)",
  "function claimRefund(uint256 _marketId)",
  "function addLiquidity(uint256 _marketId, uint256 _deadline) payable",
  "function removeLiquidity(uint256 _marketId, uint256 _lpShares, uint256 _deadline)",
  "function getMarket(uint256 _marketId) view returns (uint256 id, string title, string description, string category, string imageUrl, uint256 endTime, uint8 status, uint8 resolvedOutcome, uint256 yesShares, uint256 noShares, uint256 yesPool, uint256 noPool, address creator, uint256 createdAt)",
  "function getPosition(uint256 _marketId, address _user) view returns (uint256 yesShares, uint256 noShares, uint256 yesCost, uint256 noCost)",
  "function getYesPrice(uint256 _marketId) view returns (uint256)",
  "function getNoPrice(uint256 _marketId) view returns (uint256)",
  "function getMarketCount() view returns (uint256)",
  "function quoteBuy(uint256 _marketId, uint8 _outcome, uint256 _amountEth) view returns (uint256)",
  "function quoteSell(uint256 _marketId, uint8 _outcome, uint256 _shares) view returns (uint256)",
  "function getPoolReserves(uint256 _marketId) view returns (uint256 yesPool, uint256 noPool, uint256 totalLp)",
  "function owner() view returns (address)",
  "function pause()",
  "function unpause()",
  "function setOracle(address _oracle)",
  "function setFeeConfiguration(uint256 _totalBps, uint256 _treasuryBps)",
  "function setTreasury(address _treasury)",
  "function claimTreasury()",
  "event MarketCreated(uint256 indexed marketId, string title, string category, uint256 endTime, address creator)",
  "event SharesBought(uint256 indexed marketId, address indexed buyer, uint8 outcome, uint256 shares, uint256 cost)",
  "event SharesSold(uint256 indexed marketId, address indexed seller, uint8 outcome, uint256 shares, uint256 payout)",
  "event MarketResolved(uint256 indexed marketId, uint8 outcome)",
  "event MarketCancelled(uint256 indexed marketId)",
  "event WinningsClaimed(uint256 indexed marketId, address indexed user, uint256 amount)",
  "event RefundClaimed(uint256 indexed marketId, address indexed user, uint256 amount)",
  "event LiquidityAdded(uint256 indexed marketId, address indexed provider, uint256 amount, uint256 lpSharesMinted)",
  "event LiquidityRemoved(uint256 indexed marketId, address indexed provider, uint256 lpSharesBurned, uint256 ethReturned)"
] as const;
