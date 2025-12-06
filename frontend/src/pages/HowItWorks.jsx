import { motion } from 'framer-motion';

const HowItWorks = () => {
    const steps = [
        {
            number: '01',
            title: 'Submit Transaction Details',
            description: 'Provide information about your cross-chain transaction including asset type, amount, source chain, transaction hash, and block number.',
            details: [
                'Supported assets: BTC, ETH, XRP, FLR, USDT, USDC, and 100+ more',
                'Supported chains: Bitcoin, Ethereum, XRP Ledger, Dogecoin, Litecoin',
                'Simple form interface with real-time validation',
            ],
        },
        {
            number: '02',
            title: 'FDC Verification',
            description: 'Flare Data Connector verifies your transaction on the source blockchain using cryptographic proofs.',
            details: [
                'Trustless cross-chain verification',
                'Cryptographic attestation from multiple verifiers',
                'Immutable proof stored on Flare blockchain',
            ],
        },
        {
            number: '03',
            title: 'FTSO Price Fetching',
            description: 'Real-time asset prices are fetched from Flare Time Series Oracle for accurate valuation.',
            details: [
                'Decentralized price feeds from multiple data providers',
                'Sub-second price updates',
                'Historical volatility calculation',
            ],
        },
        {
            number: '04',
            title: 'AI Risk Analysis',
            description: 'Our multi-factor AI engine analyzes the transaction across 5+ dimensions to calculate a comprehensive risk score.',
            details: [
                'Asset risk profile (stablecoins = low, altcoins = high)',
                'Price volatility assessment',
                'Transaction size evaluation',
                'FDC verification status impact',
                'User transaction history bonus',
            ],
        },
        {
            number: '05',
            title: 'Compliance Decision',
            description: 'Based on the risk score, the system automatically approves, rejects, or flags for manual review.',
            details: [
                'Risk < 30: Auto-approved ✅',
                'Risk 30-85: Manual review required ⏳',
                'Risk ≥ 85: Auto-rejected ❌',
            ],
        },
        {
            number: '06',
            title: 'On-Chain Recording',
            description: 'The compliance decision is recorded on the Flare blockchain for immutable audit trail.',
            details: [
                'Permanent on-chain storage',
                'Transparent audit trail',
                'Smart Account can execute based on status',
            ],
        },
    ];

    return (
        <div>
            {/* Hero */}
            <section style={{
                background: 'linear-gradient(180deg, #fff 0%, #f5f5f7 100%)',
                padding: 'var(--spacing-3xl) 0',
            }}>
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}
                    >
                        <h1 className="hero-title">
                            How <span style={{ color: 'var(--color-red)' }}>FACE</span> Works
                        </h1>
                        <p className="hero-subtitle">
                            A step-by-step breakdown of our autonomous compliance engine
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Process Steps */}
            <section style={{ padding: 'var(--spacing-3xl) 0' }}>
                <div className="container">
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                style={{
                                    marginBottom: 'var(--spacing-2xl)',
                                    position: 'relative',
                                }}
                            >
                                <div style={{ display: 'flex', gap: 'var(--spacing-xl)', alignItems: 'flex-start' }}>
                                    {/* Step Number */}
                                    <div style={{
                                        fontSize: 'var(--font-size-4xl)',
                                        fontWeight: 700,
                                        color: 'var(--color-red)',
                                        minWidth: '80px',
                                    }}>
                                        {step.number}
                                    </div>

                                    {/* Content */}
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{
                                            fontSize: 'var(--font-size-2xl)',
                                            fontWeight: 700,
                                            marginBottom: 'var(--spacing-sm)',
                                            color: 'var(--color-dark-gray)',
                                        }}>
                                            {step.title}
                                        </h3>
                                        <p style={{
                                            fontSize: 'var(--font-size-base)',
                                            color: 'var(--color-gray)',
                                            lineHeight: 1.6,
                                            marginBottom: 'var(--spacing-md)',
                                        }}>
                                            {step.description}
                                        </p>

                                        {/* Details */}
                                        <div style={{
                                            background: 'var(--color-off-white)',
                                            padding: 'var(--spacing-lg)',
                                            borderRadius: 'var(--radius-lg)',
                                            borderLeft: '3px solid var(--color-red)',
                                        }}>
                                            {step.details.map((detail, i) => (
                                                <div
                                                    key={i}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'flex-start',
                                                        gap: 'var(--spacing-sm)',
                                                        marginBottom: i < step.details.length - 1 ? 'var(--spacing-sm)' : 0,
                                                        fontSize: 'var(--font-size-sm)',
                                                        color: 'var(--color-medium-gray)',
                                                    }}
                                                >
                                                    <span style={{ color: 'var(--color-red)', marginTop: '2px' }}>•</span>
                                                    <span>{detail}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Connector Line */}
                                {index < steps.length - 1 && (
                                    <div style={{
                                        position: 'absolute',
                                        left: '40px',
                                        top: '100%',
                                        width: '2px',
                                        height: 'var(--spacing-2xl)',
                                        background: 'linear-gradient(180deg, var(--color-red) 0%, transparent 100%)',
                                    }} />
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Technical Architecture */}
            <section style={{ padding: 'var(--spacing-3xl) 0', background: 'var(--color-off-white)' }}>
                <div className="container">
                    <h2 style={{
                        fontSize: 'var(--font-size-2xl)',
                        fontWeight: 700,
                        marginBottom: 'var(--spacing-xl)',
                        color: 'var(--color-dark-gray)',
                        textAlign: 'center',
                    }}>
                        Technical Architecture
                    </h2>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: 'var(--spacing-xl)',
                    }}>
                        {[
                            {
                                title: 'Smart Contracts',
                                tech: 'Solidity on Flare',
                                description: 'ComplianceEngine, SmartAccountFactory, FDCVerifier contracts deployed on Coston2 testnet',
                            },
                            {
                                title: 'Backend API',
                                tech: 'Go + Gin Framework',
                                description: 'High-performance REST API with WebSocket support for real-time updates',
                            },
                            {
                                title: 'AI Risk Engine',
                                tech: 'Node.js + Express',
                                description: 'Multi-factor risk scoring algorithm with 5+ analysis dimensions',
                            },
                            {
                                title: 'Frontend',
                                tech: 'React + Vite',
                                description: 'Modern, responsive UI with MetaMask integration and real-time updates',
                            },
                        ].map((component, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="card"
                            >
                                <div style={{
                                    fontSize: 'var(--font-size-xs)',
                                    color: 'var(--color-red)',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    marginBottom: 'var(--spacing-xs)',
                                }}>
                                    {component.tech}
                                </div>
                                <h3 style={{
                                    fontSize: 'var(--font-size-xl)',
                                    fontWeight: 700,
                                    marginBottom: 'var(--spacing-sm)',
                                    color: 'var(--color-dark-gray)',
                                }}>
                                    {component.title}
                                </h3>
                                <p style={{
                                    fontSize: 'var(--font-size-sm)',
                                    color: 'var(--color-gray)',
                                    lineHeight: 1.6,
                                }}>
                                    {component.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Performance Metrics */}
            <section style={{ padding: 'var(--spacing-3xl) 0' }}>
                <div className="container">
                    <h2 style={{
                        fontSize: 'var(--font-size-2xl)',
                        fontWeight: 700,
                        marginBottom: 'var(--spacing-xl)',
                        color: 'var(--color-dark-gray)',
                        textAlign: 'center',
                    }}>
                        Performance Metrics
                    </h2>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 'var(--spacing-lg)',
                        textAlign: 'center',
                    }}>
                        {[
                            { metric: '< 2s', label: 'End-to-End Processing' },
                            { metric: '99%', label: 'Accuracy Rate' },
                            { metric: '< 500ms', label: 'AI Analysis Time' },
                            { metric: '24/7', label: 'Uptime' },
                            { metric: '100+', label: 'Assets Supported' },
                            { metric: '< $1', label: 'Cost per Check' },
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="stat-card"
                            >
                                <div className="stat-value" style={{ color: 'var(--color-red)' }}>
                                    {item.metric}
                                </div>
                                <div className="stat-label">{item.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HowItWorks;
