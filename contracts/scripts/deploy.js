"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var hardhat_1 = require("hardhat");
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var deployer, _a, _b, _c, _d, _e, PredictionMarket, market, address, deploymentInfo, deploymentsDir, artifactPath, artifact;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0: return [4 /*yield*/, hardhat_1.ethers.getSigners()];
                case 1:
                    deployer = (_f.sent())[0];
                    console.log("Deploying contracts with:", deployer.address);
                    _b = (_a = console).log;
                    _c = ["Account balance:"];
                    _e = (_d = hardhat_1.ethers).formatEther;
                    return [4 /*yield*/, hardhat_1.ethers.provider.getBalance(deployer.address)];
                case 2:
                    _b.apply(_a, _c.concat([_e.apply(_d, [_f.sent()]), "ETH"]));
                    return [4 /*yield*/, hardhat_1.ethers.getContractFactory("PredictionMarket")];
                case 3:
                    PredictionMarket = _f.sent();
                    return [4 /*yield*/, PredictionMarket.deploy()];
                case 4:
                    market = _f.sent();
                    return [4 /*yield*/, market.waitForDeployment()];
                case 5:
                    _f.sent();
                    return [4 /*yield*/, market.getAddress()];
                case 6:
                    address = _f.sent();
                    console.log("PredictionMarket deployed to:", address);
                    deploymentInfo = {
                        address: address,
                        chainId: 31337,
                        deployer: deployer.address,
                        deployedAt: new Date().toISOString(),
                    };
                    deploymentsDir = path_1.default.join(__dirname, "..", "deployments");
                    if (!fs_1.default.existsSync(deploymentsDir)) {
                        fs_1.default.mkdirSync(deploymentsDir, { recursive: true });
                    }
                    fs_1.default.writeFileSync(path_1.default.join(deploymentsDir, "localhost.json"), JSON.stringify(deploymentInfo, null, 2));
                    artifactPath = path_1.default.join(__dirname, "..", "artifacts", "contracts", "PredictionMarket.sol", "PredictionMarket.json");
                    artifact = JSON.parse(fs_1.default.readFileSync(artifactPath, "utf-8"));
                    fs_1.default.writeFileSync(path_1.default.join(deploymentsDir, "PredictionMarketABI.json"), JSON.stringify(artifact.abi, null, 2));
                    console.log("Deployment info saved to contracts/deployments/localhost.json");
                    console.log("ABI saved to contracts/deployments/PredictionMarketABI.json");
                    // Now seed initial markets
                    console.log("\n--- Seeding markets ---");
                    return [4 /*yield*/, seedMarkets(market)];
                case 7:
                    _f.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function seedMarkets(market) {
    return __awaiter(this, void 0, void 0, function () {
        var ONE_YEAR, now, seedData, i, d, tx, _a, deployer, user1, user2, buyAmount, liquidityRatios, i, _b, yesMultiplier, noMultiplier, yesAmount, noAmount;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    ONE_YEAR = 365 * 24 * 60 * 60;
                    now = Math.floor(Date.now() / 1000);
                    seedData = [
                        {
                            title: "Will Bitcoin reach $100k by the end of March?",
                            description: 'This market resolves to "Yes" if the official index price of Bitcoin (BTC) reaches or exceeds $100,000.00 USD.',
                            category: "Crypto",
                            imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/46/Bitcoin.svg",
                            endTime: now + ONE_YEAR,
                        },
                        {
                            title: "Ethereum ETF approved by SEC before Q3?",
                            description: 'This market resolves to "Yes" if the U.S. SEC approves a spot Ethereum ETF.',
                            category: "Crypto",
                            imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/01/Ethereum_logo_translucent.svg",
                            endTime: now + ONE_YEAR,
                        },
                        {
                            title: "Will the Fed cut interest rates in May?",
                            description: 'This market resolves to "Yes" if the Federal Reserve announces a rate cut at the May FOMC meeting.',
                            category: "Economy",
                            imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Money_Flat_Icon.svg/512px-Money_Flat_Icon.svg.png",
                            endTime: now + ONE_YEAR,
                        },
                        {
                            title: "Oscar for Best Picture: Oppenheimer?",
                            description: 'This market resolves to "Yes" if Oppenheimer wins the Academy Award for Best Picture.',
                            category: "Pop Culture",
                            imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Popcorn.svg/512px-Popcorn.svg.png",
                            endTime: now + ONE_YEAR,
                        },
                        {
                            title: "Will GPT-5 be announced before June?",
                            description: 'This market resolves to "Yes" if OpenAI officially announces GPT-5 before June 1.',
                            category: "Tech",
                            imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/ChatGPT_logo.svg/512px-ChatGPT_logo.svg.png",
                            endTime: now + ONE_YEAR,
                        },
                        {
                            title: "US Presidential Election 2024 Winner?",
                            description: "This market resolves based on the winner of the 2024 US Presidential Election.",
                            category: "Politics",
                            imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Vote_icon.svg/512px-Vote_icon.svg.png",
                            endTime: now + ONE_YEAR,
                        },
                        {
                            title: "Will the Lakers make the NBA Playoffs?",
                            description: 'This market resolves to "Yes" if the Los Angeles Lakers qualify for the 2024 NBA Playoffs.',
                            category: "Sports",
                            imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Los_Angeles_Lakers_logo.svg/220px-Los_Angeles_Lakers_logo.svg.png",
                            endTime: now + ONE_YEAR,
                        },
                        {
                            title: "Champions League Winner: Real Madrid?",
                            description: 'This market resolves to "Yes" if Real Madrid CF wins the 2023-24 UEFA Champions League.',
                            category: "Sports",
                            imageUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/220px-Real_Madrid_CF.svg.png",
                            endTime: now + ONE_YEAR,
                        },
                        {
                            title: "US GDP growth above 3% in Q1 2024?",
                            description: 'This market resolves to "Yes" if the U.S. BEA reports Q1 2024 GDP growth at or above 3.0%.',
                            category: "Economy",
                            imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Nuvola_apps_kchart.svg/512px-Nuvola_apps_kchart.svg.png",
                            endTime: now + ONE_YEAR,
                        },
                        {
                            title: "Apple Vision Pro sells 1M units in 2024?",
                            description: 'This market resolves to "Yes" if Apple sells at least 1 million Vision Pro units in 2024.',
                            category: "Tech",
                            imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/202px-Apple_logo_black.svg.png",
                            endTime: now + ONE_YEAR,
                        },
                        {
                            title: "Solana price above $200 by April?",
                            description: 'This market resolves to "Yes" if Solana (SOL) reaches or exceeds $200 on any major exchange.',
                            category: "Crypto",
                            imageUrl: "https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png",
                            endTime: now + ONE_YEAR,
                        },
                        {
                            title: "Super Bowl LVIII: 49ers win?",
                            description: 'This market resolves to "Yes" if the San Francisco 49ers win Super Bowl LVIII.',
                            category: "Sports",
                            imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/San_Francisco_49ers_logo.svg/200px-San_Francisco_49ers_logo.svg.png",
                            endTime: now + ONE_YEAR,
                        },
                        {
                            title: "Taylor Swift wins Grammy for Album of the Year?",
                            description: 'This market resolves to "Yes" if Taylor Swift wins Album of the Year at the 66th Grammys.',
                            category: "Pop Culture",
                            imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Grammy_Award.svg/200px-Grammy_Award.svg.png",
                            endTime: now + ONE_YEAR,
                        },
                        {
                            title: "UK general election called before October?",
                            description: 'This market resolves to "Yes" if the UK PM calls a general election before October 1, 2024.',
                            category: "Politics",
                            imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Flag_of_the_United_Kingdom.svg/255px-Flag_of_the_United_Kingdom.svg.png",
                            endTime: now + ONE_YEAR,
                        },
                    ];
                    i = 0;
                    _c.label = 1;
                case 1:
                    if (!(i < seedData.length)) return [3 /*break*/, 5];
                    d = seedData[i];
                    return [4 /*yield*/, market.createMarket(d.title, d.description, d.category, d.imageUrl, d.endTime)];
                case 2:
                    tx = _c.sent();
                    return [4 /*yield*/, tx.wait()];
                case 3:
                    _c.sent();
                    console.log("  Created market ".concat(i, ": ").concat(d.title.substring(0, 50), "..."));
                    _c.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 1];
                case 5: return [4 /*yield*/, hardhat_1.ethers.getSigners()];
                case 6:
                    _a = _c.sent(), deployer = _a[0], user1 = _a[1], user2 = _a[2];
                    buyAmount = hardhat_1.ethers.parseEther("1.0");
                    liquidityRatios = [
                        [1.04, 0.96], // BTC: 52% Yes
                        [1.5, 0.5], // ETH ETF: 75% Yes
                        [0.6, 1.4], // Fed: 30% Yes
                        [1.76, 0.24], // Oscars: 88% Yes
                        [0.9, 1.1], // GPT-5: 45% Yes
                        [1.2, 0.8], // Election: 60% Yes
                        [1.3, 0.7], // Lakers: 65% Yes
                        [0.64, 1.36], // Champions: 32% Yes
                        [0.84, 1.16], // GDP: 42% Yes
                        [0.5, 1.5], // Vision Pro: 25% Yes
                        [0.76, 1.24], // Solana: 38% Yes
                        [0.96, 1.04], // Super Bowl: 48% Yes
                        [1.44, 0.56], // Grammys: 72% Yes
                        [1.1, 0.9], // UK Election: 55% Yes
                    ];
                    i = 0;
                    _c.label = 7;
                case 7:
                    if (!(i < Math.min(seedData.length, liquidityRatios.length))) return [3 /*break*/, 11];
                    _b = liquidityRatios[i], yesMultiplier = _b[0], noMultiplier = _b[1];
                    yesAmount = hardhat_1.ethers.parseEther(yesMultiplier.toString());
                    noAmount = hardhat_1.ethers.parseEther(noMultiplier.toString());
                    // User1 buys Yes
                    return [4 /*yield*/, market.connect(user1).buyShares(i, 1, { value: yesAmount })];
                case 8:
                    // User1 buys Yes
                    _c.sent(); // 1 = Yes
                    // User2 buys No
                    return [4 /*yield*/, market.connect(user2).buyShares(i, 2, { value: noAmount })];
                case 9:
                    // User2 buys No
                    _c.sent(); // 2 = No
                    console.log("  Seeded liquidity for market ".concat(i, ": Yes=").concat(yesMultiplier, " ETH, No=").concat(noMultiplier, " ETH"));
                    _c.label = 10;
                case 10:
                    i++;
                    return [3 /*break*/, 7];
                case 11:
                    console.log("\nSeeded ".concat(seedData.length, " markets with liquidity"));
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(function (error) {
    console.error(error);
    process.exitCode = 1;
});
