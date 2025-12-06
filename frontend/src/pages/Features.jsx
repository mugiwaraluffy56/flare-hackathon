import { motion } from 'framer-motion';

const Features = () => {
    const features = [
        {
            category: 'Flare Integration',
            items: [
                {
                    icon: '🔗',
                    title: 'Flare Data Connector (FDC)',
                    description: 'Verify transactions from external blockchains with cryptographic proof. FDC enables trustless cross-chain verification without relying on centralized oracles.',
                    benefits: ['Trustless verification', 'Cross-chain support', 'Cryptographic security'],
                },
                {
                    icon: '📊',
                    title: 'FTSO Price Feeds',
                    description: 'Access real-time, decentralized price data for accurate asset valuation and risk assessment. FTSO provides reliable price feeds without single points of failure.',
                    benefits: ['Decentralized pricing', 'Real-time updates', 'High accuracy'],
                },
                {
                    icon: '🤖',
                    title: 'Smart Accounts',
                    description: 'Enable autonomous transaction execution based on compliance status. Smart Accounts can automatically approve or reject transactions without manual intervention.',
                    benefits: ['Autonomous execution', 'Programmable logic', 'Gas optimization'],
                },
            ],
        },
        {
            category: 'AI & Analytics',
            items: [
                {
                    icon: '🧠',
                    title: 'Multi-Factor Risk Analysis',
                    description: 'Our AI engine analyzes 5+ risk factors including asset type, volatility, transaction size, FDC verification, and user history for comprehensive risk assessment.',
                    benefits: ['99% accuracy', 'Multi-dimensional analysis', 'Continuous learning'],
                },
                {
                    icon: '⚡',
                    title: 'Real-Time Processing',
                    description: 'Get compliance results in under 2 seconds. Our optimized pipeline processes FDC verification, FTSO price fetching, and AI analysis concurrently.',
                    benefits: ['< 2s response time', 'Concurrent processing', 'Scalable architecture'],
                },
                {
                    icon: '📈',
                    title: 'Historical Analytics',
                    description: 'Track compliance trends, risk patterns, and approval rates over time. Gain insights into your transaction history and compliance performance.',
                    benefits: ['Trend analysis', 'Performance metrics', 'Exportable reports'],
                },
            ],
        },
        {
            category: 'Security & Compliance',
            items: [
                {
                    icon: '🔒',
                    title: 'Cryptographic Security',
                    description: 'All transactions are verified using cryptographic proofs and stored on-chain for immutable audit trails. Your data is secure and tamper-proof.',
                    benefits: ['Immutable records', 'Cryptographic proofs', 'On-chain storage'],
                },
                {
                    icon: '✅',
                    title: 'Automated Compliance',
                    description: 'Reduce manual review time by 90% with automated compliance checks. Our system handles routine approvals while flagging high-risk transactions for review.',
                    benefits: ['90% time savings', 'Reduced errors', '24/7 availability'],
                },
                {
                    icon: '🌍',
                    title: 'Multi-Chain Support',
                    description: 'Support for 100+ assets across Bitcoin, Ethereum, XRP, Dogecoin, Litecoin, and more. Seamlessly verify transactions from any supported blockchain.',
                    benefits: ['100+ assets', '5+ blockchains', 'Expanding coverage'],
                },
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
                            Powerful Features for <span style={{ color: 'var(--color-red)' }}>Modern Compliance</span>
                        </h1>
                        <p className="hero-subtitle">
                            Everything you need to automate compliance checks and reduce risk
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            {features.map((category, categoryIndex) => (
                <section
                    key={categoryIndex}
                    style={{
                        padding: 'var(--spacing-3xl) 0',
                        background: categoryIndex % 2 === 0 ? 'var(--color-white)' : 'var(--color-off-white)',
                    }}
                >
                    <div className="container">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: categoryIndex * 0.1 }}
                        >
                            <h2 style={{
                                fontSize: 'var(--font-size-2xl)',
                                fontWeight: 700,
                                marginBottom: 'var(--spacing-xl)',
                                color: 'var(--color-dark-gray)',
                                textAlign: 'center',
                            }}>
                                {category.category}
                            </h2>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                                gap: 'var(--spacing-xl)',
                            }}>
                                {category.items.map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: (categoryIndex * 0.1) + (index * 0.1) }}
                                        className="card"
                                    >
                                        <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>
                                            {feature.icon}
                                        </div>
                                        <h3 style={{
                                            fontSize: 'var(--font-size-xl)',
                                            fontWeight: 700,
                                            marginBottom: 'var(--spacing-sm)',
                                            color: 'var(--color-dark-gray)',
                                        }}>
                                            {feature.title}
                                        </h3>
                                        <p style={{
                                            fontSize: 'var(--font-size-sm)',
                                            color: 'var(--color-gray)',
                                            lineHeight: 1.6,
                                            marginBottom: 'var(--spacing-md)',
                                        }}>
                                            {feature.description}
                                        </p>
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 'var(--spacing-xs)',
                                        }}>
                                            {feature.benefits.map((benefit, i) => (
                                                <div
                                                    key={i}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 'var(--spacing-xs)',
                                                        fontSize: 'var(--font-size-sm)',
                                                        color: 'var(--color-medium-gray)',
                                                    }}
                                                >
                                                    <span style={{ color: 'var(--color-red)' }}>✓</span>
                                                    {benefit}
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </section>
            ))}

            {/* Comparison Table */}
            <section style={{ padding: 'var(--spacing-3xl) 0' }}>
                <div className="container">
                    <h2 style={{
                        fontSize: 'var(--font-size-2xl)',
                        fontWeight: 700,
                        marginBottom: 'var(--spacing-xl)',
                        color: 'var(--color-dark-gray)',
                        textAlign: 'center',
                    }}>
                        FACE vs Traditional Compliance
                    </h2>

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Feature</th>
                                    <th>Traditional</th>
                                    <th style={{ color: 'var(--color-red)' }}>FACE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { feature: 'Processing Time', traditional: '24-48 hours', face: '< 2 seconds' },
                                    { feature: 'Cost per Check', traditional: '$50-200', face: '< $1' },
                                    { feature: 'Accuracy', traditional: '85-90%', face: '99%+' },
                                    { feature: 'Availability', traditional: 'Business hours', face: '24/7' },
                                    { feature: 'Cross-Chain', traditional: 'Limited', face: '100+ assets' },
                                    { feature: 'Automation', traditional: 'Manual review', face: 'Fully automated' },
                                    { feature: 'Transparency', traditional: 'Opaque', face: 'On-chain audit trail' },
                                ].map((row, index) => (
                                    <motion.tr
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <td style={{ fontWeight: 600 }}>{row.feature}</td>
                                        <td style={{ color: 'var(--color-gray)' }}>{row.traditional}</td>
                                        <td style={{ color: 'var(--color-red)', fontWeight: 600 }}>{row.face}</td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Features;
