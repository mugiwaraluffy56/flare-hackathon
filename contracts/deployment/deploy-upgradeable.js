const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("🚀 Deploying FACE Compliance Engine (Upgradeable)...\n");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString(), "\n");

    // Deploy ComplianceEngine as upgradeable proxy
    console.log("📝 Deploying ComplianceEngineV2...");
    const ComplianceEngine = await ethers.getContractFactory("ComplianceEngineV2");

    const complianceEngine = await upgrades.deployProxy(
        ComplianceEngine,
        [deployer.address], // admin address
        {
            initializer: "initialize",
            kind: "uups"
        }
    );

    await complianceEngine.deployed();

    console.log("✅ ComplianceEngine Proxy deployed to:", complianceEngine.address);
    console.log("   Implementation:", await upgrades.erc1967.getImplementationAddress(complianceEngine.address));
    console.log("   Admin:", await upgrades.erc1967.getAdminAddress(complianceEngine.address), "\n");

    // Grant roles
    console.log("🔐 Setting up roles...");
    const OPERATOR_ROLE = await complianceEngine.OPERATOR_ROLE();
    const VERIFIER_ROLE = await complianceEngine.VERIFIER_ROLE();
    const PAUSER_ROLE = await complianceEngine.PAUSER_ROLE();

    console.log("   OPERATOR_ROLE:", OPERATOR_ROLE);
    console.log("   VERIFIER_ROLE:", VERIFIER_ROLE);
    console.log("   PAUSER_ROLE:", PAUSER_ROLE, "\n");

    // Deploy SmartAccountFactory (if needed)
    console.log("📝 Deploying SmartAccountFactory...");
    const SmartAccountFactory = await ethers.getContractFactory("SmartAccountFactory");
    const smartAccountFactory = await SmartAccountFactory.deploy();
    await smartAccountFactory.deployed();
    console.log("✅ SmartAccountFactory deployed to:", smartAccountFactory.address, "\n");

    // Deploy FDCVerifier (if needed)
    console.log("📝 Deploying FDCVerifier...");
    const FDCVerifier = await ethers.getContractFactory("FDCVerifier");
    const fdcVerifier = await FDCVerifier.deploy();
    await fdcVerifier.deployed();
    console.log("✅ FDCVerifier deployed to:", fdcVerifier.address, "\n");

    // Configure ComplianceEngine
    console.log("⚙️  Configuring ComplianceEngine...");

    let tx = await complianceEngine.setSmartAccountFactory(smartAccountFactory.address);
    await tx.wait();
    console.log("   ✓ SmartAccountFactory set");

    tx = await complianceEngine.setFDCVerifier(fdcVerifier.address);
    await tx.wait();
    console.log("   ✓ FDCVerifier set\n");

    // Save deployment info
    const deploymentInfo = {
        network: network.name,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        contracts: {
            ComplianceEngine: {
                proxy: complianceEngine.address,
                implementation: await upgrades.erc1967.getImplementationAddress(complianceEngine.address)
            },
            SmartAccountFactory: smartAccountFactory.address,
            FDCVerifier: fdcVerifier.address
        },
        roles: {
            OPERATOR_ROLE: OPERATOR_ROLE,
            VERIFIER_ROLE: VERIFIER_ROLE,
            PAUSER_ROLE: PAUSER_ROLE
        }
    };

    console.log("📄 Deployment Summary:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    // Save to file
    const fs = require("fs");
    const path = require("path");
    const deploymentsDir = path.join(__dirname, "../deployments");

    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const filename = `${network.name}-${Date.now()}.json`;
    fs.writeFileSync(
        path.join(deploymentsDir, filename),
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log(`\n💾 Deployment info saved to: deployments/${filename}`);

    console.log("\n✅ Deployment complete!");
    console.log("\n📋 Next steps:");
    console.log("   1. Verify contracts on block explorer");
    console.log("   2. Grant OPERATOR_ROLE to backend service");
    console.log("   3. Update frontend with contract addresses");
    console.log("   4. Test contract functionality");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
