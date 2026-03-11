// Contract address and ABI for PredictionMarket
// This is auto-generated from the deployment — update if you redeploy

export const PREDICTION_MARKET_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as const;

export const PREDICTION_MARKET_ABI = [
  // View functions
  {
    inputs: [{ name: "_marketId", type: "uint256" }],
    name: "getMarket",
    outputs: [
      { name: "id", type: "uint256" },
      { name: "title", type: "string" },
      { name: "description", type: "string" },
      { name: "category", type: "string" },
      { name: "imageUrl", type: "string" },
      { name: "endTime", type: "uint256" },
      { name: "status", type: "uint8" },
      { name: "resolvedOutcome", type: "uint8" },
      { name: "yesShares", type: "uint256" },
      { name: "noShares", type: "uint256" },
      { name: "yesPool", type: "uint256" },
      { name: "noPool", type: "uint256" },
      { name: "creator", type: "address" },
      { name: "createdAt", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_marketId", type: "uint256" }, { name: "_user", type: "address" }],
    name: "getPosition",
    outputs: [
      { name: "yesShares", type: "uint256" },
      { name: "noShares", type: "uint256" },
      { name: "yesCost", type: "uint256" },
      { name: "noCost", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_marketId", type: "uint256" }],
    name: "getYesPrice",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_marketId", type: "uint256" }],
    name: "getNoPrice",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getMarketCount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "nextMarketId",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // Write functions
  {
    inputs: [
      { name: "_title", type: "string" },
      { name: "_description", type: "string" },
      { name: "_category", type: "string" },
      { name: "_imageUrl", type: "string" },
      { name: "_endTime", type: "uint256" },
    ],
    name: "createMarket",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "_marketId", type: "uint256" },
      { name: "_outcome", type: "uint8" },
    ],
    name: "buyShares",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { name: "_marketId", type: "uint256" },
      { name: "_outcome", type: "uint8" },
      { name: "_shares", type: "uint256" },
    ],
    name: "sellShares",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "_marketId", type: "uint256" },
      { name: "_outcome", type: "uint8" },
    ],
    name: "resolveMarket",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_marketId", type: "uint256" }],
    name: "claimWinnings",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "marketId", type: "uint256" },
      { indexed: false, name: "title", type: "string" },
      { indexed: false, name: "category", type: "string" },
      { indexed: false, name: "endTime", type: "uint256" },
      { indexed: false, name: "creator", type: "address" },
    ],
    name: "MarketCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "marketId", type: "uint256" },
      { indexed: true, name: "buyer", type: "address" },
      { indexed: false, name: "outcome", type: "uint8" },
      { indexed: false, name: "shares", type: "uint256" },
      { indexed: false, name: "cost", type: "uint256" },
    ],
    name: "SharesBought",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "marketId", type: "uint256" },
      { indexed: true, name: "seller", type: "address" },
      { indexed: false, name: "outcome", type: "uint8" },
      { indexed: false, name: "shares", type: "uint256" },
      { indexed: false, name: "payout", type: "uint256" },
    ],
    name: "SharesSold",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "marketId", type: "uint256" },
      { indexed: false, name: "outcome", type: "uint8" },
    ],
    name: "MarketResolved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "marketId", type: "uint256" },
      { indexed: true, name: "user", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
    name: "WinningsClaimed",
    type: "event",
  },
] as const;
