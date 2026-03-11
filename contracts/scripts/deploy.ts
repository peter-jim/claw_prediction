import { ethers, upgrades } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  const PredictionMarket = await ethers.getContractFactory("PredictionMarket");
  // Deploying as UUPS Proxy
  const market = await upgrades.deployProxy(PredictionMarket, [
    deployer.address, // initialOwner
    deployer.address, // oracle
    deployer.address  // treasury
  ], { kind: 'uups' });
  
  await market.waitForDeployment();

  const address = await market.getAddress();
  console.log("PredictionMarket Proxy deployed to:", address);

  // Save deployment info for frontend and backend
  const deploymentInfo = {
    address,
    chainId: 31337,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
  };

  // Save to contracts/deployments/
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(deploymentsDir, "localhost.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  // Copy ABI to shared location
  const artifactPath = path.join(__dirname, "..", "artifacts", "contracts", "PredictionMarket.sol", "PredictionMarket.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));
  fs.writeFileSync(
    path.join(deploymentsDir, "PredictionMarketABI.json"),
    JSON.stringify(artifact.abi, null, 2)
  );

  console.log("Deployment info saved to contracts/deployments/localhost.json");
  console.log("ABI saved to contracts/deployments/PredictionMarketABI.json");

  // Now seed initial markets
  console.log("\n--- Seeding markets ---");
  await seedMarkets(market);
}

async function seedMarkets(market: any) {
  const ONE_YEAR = 365 * 24 * 60 * 60;
  const now = Math.floor(Date.now() / 1000);

  const seedData = [
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

  for (let i = 0; i < seedData.length; i++) {
    const d = seedData[i];
    const tx = await market.createMarket(d.title, d.description, d.category, d.imageUrl, d.endTime);
    await tx.wait();
    console.log(`  Created market ${i}: ${d.title.substring(0, 50)}...`);
  }

  // Add some initial liquidity to first few markets using deployer
  const [deployer, user1, user2] = await ethers.getSigners();
  const buyAmount = ethers.parseEther("1.0"); // 1 ETH per side

  // Seed liquidity for each market with varied ratios to make prices interesting
  const liquidityRatios = [
    [1.04, 0.96],  // BTC: 52% Yes
    [1.5, 0.5],    // ETH ETF: 75% Yes
    [0.6, 1.4],    // Fed: 30% Yes
    [1.76, 0.24],  // Oscars: 88% Yes
    [0.9, 1.1],    // GPT-5: 45% Yes
    [1.2, 0.8],    // Election: 60% Yes
    [1.3, 0.7],    // Lakers: 65% Yes
    [0.64, 1.36],  // Champions: 32% Yes
    [0.84, 1.16],  // GDP: 42% Yes
    [0.5, 1.5],    // Vision Pro: 25% Yes
    [0.76, 1.24],  // Solana: 38% Yes
    [0.96, 1.04],  // Super Bowl: 48% Yes
    [1.44, 0.56],  // Grammys: 72% Yes
    [1.1, 0.9],    // UK Election: 55% Yes
  ];

  for (let i = 0; i < Math.min(seedData.length, liquidityRatios.length); i++) {
    const [yesMultiplier, noMultiplier] = liquidityRatios[i];
    const yesAmount = ethers.parseEther(yesMultiplier.toString());
    const noAmount = ethers.parseEther(noMultiplier.toString());
    const deadline = now + 86400; // 1 day deadline
    
    // User1 buys Yes
    await market.connect(user1).buyShares(i, 1, 0, deadline, { value: yesAmount }); // 1 = Yes
    // User2 buys No
    await market.connect(user2).buyShares(i, 2, 0, deadline, { value: noAmount }); // 2 = No
    console.log(`  Seeded liquidity for market ${i}: Yes=${yesMultiplier} ETH, No=${noMultiplier} ETH`);
  }

  console.log(`\nSeeded ${seedData.length} markets with liquidity`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
