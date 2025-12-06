/**
 * FACE AI Risk Engine
 * Multi-factor risk scoring algorithm for compliance assessment
 */

// Risk thresholds
const RISK_THRESHOLDS = {
    LOW: 30,
    MEDIUM: 60,
    HIGH: 85
};

// Asset risk profiles
const ASSET_RISK_PROFILES = {
    // Stablecoins - lowest risk
    'USDT': { baseRisk: 5, volatilityMultiplier: 0.5 },
    'USDC': { baseRisk: 5, volatilityMultiplier: 0.5 },
    'DAI': { baseRisk: 8, volatilityMultiplier: 0.6 },

    // Major cryptocurrencies - medium risk
    'BTC': { baseRisk: 20, volatilityMultiplier: 1.2 },
    'ETH': { baseRisk: 22, volatilityMultiplier: 1.3 },

    // Altcoins - higher risk
    'XRP': { baseRisk: 30, volatilityMultiplier: 1.5 },
    'FLR': { baseRisk: 35, volatilityMultiplier: 1.6 },

    // Default for unknown assets
    'DEFAULT': { baseRisk: 40, volatilityMultiplier: 1.8 }
};

/**
 * Analyze transaction risk using multi-factor algorithm
 * @param {Object} params - Risk analysis parameters
 * @returns {Object} Risk analysis result
 */
function analyzeRisk(params) {
    const {
        assetType,
        amount,
        price,
        volatility,
        fdcVerified,
        userHistory
    } = params;

    // Get asset risk profile
    const profile = ASSET_RISK_PROFILES[assetType] || ASSET_RISK_PROFILES.DEFAULT;

    // Calculate individual risk factors
    const factors = [];
    let totalRisk = 0;

    // Factor 1: Base asset risk (0-40 points)
    const assetRisk = profile.baseRisk;
    totalRisk += assetRisk;
    factors.push(`Asset type: ${assetRisk} points`);

    // Factor 2: Volatility risk (0-25 points)
    const volatilityRisk = Math.min(25, volatility * 100 * profile.volatilityMultiplier);
    totalRisk += volatilityRisk;
    factors.push(`Volatility: ${volatilityRisk.toFixed(1)} points`);

    // Factor 3: Transaction size risk (0-20 points)
    const transactionValue = amount * price;
    let sizeRisk = 0;

    if (transactionValue > 100000) {
        sizeRisk = 20;
    } else if (transactionValue > 50000) {
        sizeRisk = 15;
    } else if (transactionValue > 10000) {
        sizeRisk = 10;
    } else if (transactionValue > 1000) {
        sizeRisk = 5;
    }

    totalRisk += sizeRisk;
    factors.push(`Transaction size: ${sizeRisk} points`);

    // Factor 4: FDC verification (0 or +15 points)
    if (!fdcVerified) {
        const fdcRisk = 15;
        totalRisk += fdcRisk;
        factors.push(`FDC not verified: +${fdcRisk} points`);
    } else {
        factors.push('FDC verified: 0 points');
    }

    // Factor 5: User history (-10 to 0 points)
    // More history = lower risk
    const historyBonus = Math.min(10, userHistory * 2);
    totalRisk -= historyBonus;
    if (historyBonus > 0) {
        factors.push(`User history bonus: -${historyBonus} points`);
    }

    // Ensure risk score is within 0-100 range
    const riskScore = Math.max(0, Math.min(100, Math.round(totalRisk)));

    // Determine recommendation
    const recommendation = getRecommendation(riskScore, fdcVerified);

    return {
        riskScore,
        recommendation,
        factors,
        analysis: {
            assetRisk: Math.round(assetRisk),
            volatilityRisk: Math.round(volatilityRisk),
            sizeRisk,
            fdcVerified,
            userHistoryBonus: Math.round(historyBonus),
            transactionValue: Math.round(transactionValue)
        }
    };
}

/**
 * Get recommendation based on risk score
 */
function getRecommendation(riskScore, fdcVerified) {
    if (!fdcVerified) {
        return 'REJECT - FDC verification failed';
    }

    if (riskScore < RISK_THRESHOLDS.LOW) {
        return 'APPROVE - Low risk transaction';
    } else if (riskScore < RISK_THRESHOLDS.MEDIUM) {
        return 'REVIEW - Medium risk, manual review recommended';
    } else if (riskScore < RISK_THRESHOLDS.HIGH) {
        return 'REVIEW - High risk, thorough review required';
    } else {
        return 'REJECT - Risk score exceeds acceptable threshold';
    }
}

/**
 * Detect anomalous patterns in transaction
 */
function detectAnomalies(params) {
    const anomalies = [];

    // Check for unusual transaction sizes
    const transactionValue = params.amount * params.price;
    if (transactionValue > 500000) {
        anomalies.push('Unusually large transaction value');
    }

    // Check for extreme volatility
    if (params.volatility > 0.5) {
        anomalies.push('Extremely high volatility detected');
    }

    // Check for new user with large transaction
    if (params.userHistory === 0 && transactionValue > 10000) {
        anomalies.push('New user with large transaction');
    }

    return anomalies;
}

/**
 * Calculate confidence score for the risk assessment
 */
function calculateConfidence(params) {
    let confidence = 100;

    // Reduce confidence if FDC not verified
    if (!params.fdcVerified) {
        confidence -= 30;
    }

    // Reduce confidence for unknown assets
    if (!ASSET_RISK_PROFILES[params.assetType]) {
        confidence -= 20;
    }

    // Reduce confidence for new users
    if (params.userHistory === 0) {
        confidence -= 15;
    }

    return Math.max(0, confidence);
}

module.exports = {
    analyzeRisk,
    detectAnomalies,
    calculateConfidence,
    RISK_THRESHOLDS
};
