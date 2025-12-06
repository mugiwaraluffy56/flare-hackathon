const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("🔄 Upgrading ComplianceEngine...\n");

    const [deployer] = await ethers.getSigners();
    console.log("Upgrading with account:", deployer.address);

    // Get proxy address from previous deployment
    const PROXY_ADDRESS = process.env.COMPLIANCE_ENGINE_ADDRESS;

    if (!PROXY_ADDRESS) {
        throw new Error("Please set COMPLIANCE_ENGINE_ADDRESS environment variable");
    }

    console.log("Proxy address:", PROXY_ADDRESS, "\n");

    // Get current implementation
    const currentImpl = await upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS);
    console.log("Current implementation:", currentImpl);

    // Deploy new implementation
    console.log("\n📝 Deploying new implementation...");
    const ComplianceEngineV2 = await ethers.getContractFactory("ComplianceEngineV2");

    const upgraded = await upgrades.upgradeProxy(PROXY_ADDRESS, ComplianceEngineV2);
    await upgraded.deployed();

    const newImpl = await upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS);
    console.log("✅ New implementation:", newImpl);

    // Verify upgrade
    console.log("\n🔍 Verifying upgrade...");
    const contract = await ethers.getContractAt("ComplianceEngineV2", PROXY_ADDRESS);

    const totalRecords = await contract.getTotalRecords();
    console.log("   Total records (preserved):", totalRecords.toString());

    const stats = await contract.getStatistics();
    console.log("   Total checks (preserved):", stats.totalChecks.toString());

    // Save upgrade info
    const upgradeInfo = {
        network: network.name,
        upgrader: deployer.address,
        timestamp: new Date().toISOString(),
        proxy: PROXY_ADDRESS,
        previousImplementation: currentImpl,
        newImplementation: newImpl
    };

    console.log("\n📄 Upgrade Summary:");
    console.log(JSON.stringify(upgradeInfo, null, 2));

    // Save to file
    const fs = require("fs");
    const path = require("path");
    const upgradesDir = path.join(__dirname, "../upgrades");

    if (!fs.existsSync(upgradesDir)) {
        fs.mkdirSync(upgradesDir, { recursive: true });
    }

    const filename = `${network.name}-upgrade-${Date.now()}.json`;
    fs.writeFileSync(
        path.join(upgradesDir, filename),
        JSON.stringify(upgradeInfo, null, 2)
    );

    console.log(`\n💾 Upgrade info saved to: upgrades/${filename}`);
    console.log("\n✅ Upgrade complete!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
