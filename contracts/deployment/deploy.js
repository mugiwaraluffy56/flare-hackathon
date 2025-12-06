const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying FACE contracts to Coston2...\n");

    // Get deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());
    console.log("");

    // Deploy FDCVerifier
    console.log("📝 Deploying FDCVerifier...");
    const FDCVerifier = await hre.ethers.getContractFactory("FDCVerifier");
    const fdcVerifier = await FDCVerifier.deploy();
    await fdcVerifier.waitForDeployment();
    const fdcVerifierAddress = await fdcVerifier.getAddress();
    console.log("✅ FDCVerifier deployed to:", fdcVerifierAddress);
    console.log("");

    // Deploy ComplianceEngine
    console.log("📝 Deploying ComplianceEngine...");
    const ComplianceEngine = await hre.ethers.getContractFactory("ComplianceEngine");
    const complianceEngine = await ComplianceEngine.deploy();
    await complianceEngine.waitForDeployment();
    const complianceEngineAddress = await complianceEngine.getAddress();
    console.log("✅ ComplianceEngine deployed to:", complianceEngineAddress);
    console.log("");

    // Deploy SmartAccountFactory
    console.log("📝 Deploying SmartAccountFactory...");
    const SmartAccountFactory = await hre.ethers.getContractFactory("SmartAccountFactory");
    const smartAccountFactory = await SmartAccountFactory.deploy();
    await smartAccountFactory.waitForDeployment();
    const smartAccountFactoryAddress = await smartAccountFactory.getAddress();
    console.log("✅ SmartAccountFactory deployed to:", smartAccountFactoryAddress);
    console.log("");

    // Configure contracts
    console.log("⚙️  Configuring contracts...");

    // Set FDC Verifier in ComplianceEngine
    await complianceEngine.setFDCVerifier(fdcVerifierAddress);
    console.log("✅ Set FDC Verifier in ComplianceEngine");

    // Set Smart Account Factory in ComplianceEngine
    await complianceEngine.setSmartAccountFactory(smartAccountFactoryAddress);
    console.log("✅ Set Smart Account Factory in ComplianceEngine");

    // Set Compliance Engine in Smart Account Factory
    await smartAccountFactory.setComplianceEngine(complianceEngineAddress);
    console.log("✅ Set Compliance Engine in Smart Account Factory");
    console.log("");

    // Summary
    console.log("🎉 Deployment Complete!\n");
    console.log("=".repeat(60));
    console.log("Contract Addresses:");
    console.log("=".repeat(60));
    console.log("FDCVerifier:          ", fdcVerifierAddress);
    console.log("ComplianceEngine:     ", complianceEngineAddress);
    console.log("SmartAccountFactory:  ", smartAccountFactoryAddress);
    console.log("=".repeat(60));
    console.log("");
    console.log("📋 Add these to your .env file:");
    console.log(`COMPLIANCE_ENGINE_ADDRESS=${complianceEngineAddress}`);
    console.log(`SMART_ACCOUNT_FACTORY_ADDRESS=${smartAccountFactoryAddress}`);
    console.log(`FDC_VERIFIER_ADDRESS=${fdcVerifierAddress}`);
    console.log("");
    console.log("🔍 Verify contracts on Coston2 Explorer:");
    console.log(`https://coston2-explorer.flare.network/address/${complianceEngineAddress}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
