import { motion } from 'framer-motion';

const About = () => {
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
                            About <span style={{ color: 'var(--color-red)' }}>FACE</span>
                        </h1>
                        <p className="hero-subtitle">
                            Building the future of decentralized compliance
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Mission */}
            <section style={{ padding: 'var(--spacing-3xl) 0' }}>
                <div className="container">
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <h2 style={{
                                fontSize: 'var(--font-size-2xl)',
                                fontWeight: 700,
                                marginBottom: 'var(--spacing-lg)',
                                color: 'var(--color-dark-gray)',
                            }}>
                                Our Mission
                            </h2>
                            <p style={{
                                fontSize: 'var(--font-size-lg)',
                                color: 'var(--color-gray)',
                                lineHeight: 1.8,
                                marginBottom: 'var(--spacing-md)',
                            }}>
                                FACE (Flare Autonomous Compliance Engine) was built to solve one of the biggest challenges in decentralized finance: <strong style={{ color: 'var(--color-dark-gray)' }}>automated, trustless compliance</strong>.
                            </p>
                            <p style={{
                                fontSize: 'var(--font-size-lg)',
                                color: 'var(--color-gray)',
                                lineHeight: 1.8,
                                marginBottom: 'var(--spacing-md)',
                            }}>
                                Traditional compliance systems are slow, expensive, and centralized. They rely on manual review, opaque processes, and single points of failure. We believe there's a better way.
                            </p>
                            <p style={{
                                fontSize: 'var(--font-size-lg)',
                                color: 'var(--color-gray)',
                                lineHeight: 1.8,
                            }}>
                                By leveraging Flare's unique capabilities—FDC for cross-chain verification, FTSO for decentralized pricing, and Smart Accounts for autonomous execution—we've created a compliance system that is <strong style={{ color: 'var(--color-dark-gray)' }}>fast, transparent, and trustless</strong>.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Why Flare */}
            <section style={{ padding: 'var(--spacing-3xl) 0', background: 'var(--color-off-white)' }}>
                <div className="container">
                    <h2 style={{
                        fontSize: 'var(--font-size-2xl)',
                        fontWeight: 700,
                        marginBottom: 'var(--spacing-xl)',
                        color: 'var(--color-dark-gray)',
                        textAlign: 'center',
                    }}>
                        Why We Chose Flare
                    </h2>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: 'var(--spacing-xl)',
                    }}>
                        {[
                            {
                                title: 'Flare Data Connector',
                                reason: 'The only way to trustlessly verify external chain transactions without centralized oracles',
                            },
                            {
                                title: 'FTSO',
                                reason: 'Decentralized price feeds that provide reliable, real-time asset pricing',
                            },
                            {
                                title: 'Smart Accounts',
                                reason: 'Enable autonomous transaction execution based on compliance status',
                            },
                            {
                                title: 'EVM Compatibility',
                                reason: 'Familiar Solidity development with access to unique Flare features',
                            },
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="card"
                            >
                                <h3 style={{
                                    fontSize: 'var(--font-size-xl)',
                                    fontWeight: 700,
                                    marginBottom: 'var(--spacing-sm)',
                                    color: 'var(--color-red)',
                                }}>
                                    {item.title}
                                </h3>
                                <p style={{
                                    fontSize: 'var(--font-size-sm)',
                                    color: 'var(--color-gray)',
                                    lineHeight: 1.6,
                                }}>
                                    {item.reason}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tech Stack */}
            <section style={{ padding: 'var(--spacing-3xl) 0' }}>
                <div className="container">
                    <h2 style={{
                        fontSize: 'var(--font-size-2xl)',
                        fontWeight: 700,
                        marginBottom: 'var(--spacing-xl)',
                        color: 'var(--color-dark-gray)',
                        textAlign: 'center',
                    }}>
                        Technology Stack
                    </h2>

                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Layer</th>
                                        <th>Technology</th>
                                        <th>Purpose</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { layer: 'Blockchain', tech: 'Flare (Coston2)', purpose: 'Smart contract deployment and execution' },
                                        { layer: 'Smart Contracts', tech: 'Solidity + OpenZeppelin', purpose: 'Compliance logic, Smart Accounts, FDC integration' },
                                        { layer: 'Backend', tech: 'Go + Gin', purpose: 'High-performance API and WebSocket server' },
                                        { layer: 'AI Engine', tech: 'Node.js + Express', purpose: 'Multi-factor risk analysis' },
                                        { layer: 'Frontend', tech: 'React + Vite', purpose: 'Modern, responsive user interface' },
                                        { layer: 'Web3', tech: 'Ethers.js', purpose: 'Blockchain interaction and wallet connection' },
                                        { layer: 'Database', tech: 'SQLite + GORM', purpose: 'Transaction and compliance record storage' },
                                        { layer: 'Animations', tech: 'Framer Motion', purpose: 'Smooth, premium UI transitions' },
                                    ].map((row, index) => (
                                        <motion.tr
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <td style={{ fontWeight: 600 }}>{row.layer}</td>
                                            <td style={{ color: 'var(--color-red)' }}>{row.tech}</td>
                                            <td style={{ color: 'var(--color-gray)' }}>{row.purpose}</td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* Project Stats */}
            <section style={{ padding: 'var(--spacing-3xl) 0', background: 'var(--color-off-white)' }}>
                <div className="container">
                    <h2 style={{
                        fontSize: 'var(--font-size-2xl)',
                        fontWeight: 700,
                        marginBottom: 'var(--spacing-xl)',
                        color: 'var(--color-dark-gray)',
                        textAlign: 'center',
                    }}>
                        Project Statistics
                    </h2>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 'var(--spacing-lg)',
                        textAlign: 'center',
                    }}>
                        {[
                            { value: '42', label: 'Files Created' },
                            { value: '4', label: 'Programming Languages' },
                            { value: '3', label: 'Smart Contracts' },
                            { value: '6', label: 'API Endpoints' },
                            { value: '100%', label: 'Flare Native' },
                            { value: '583KB', label: 'Frontend Bundle (gzipped: 203KB)' },
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="stat-card"
                            >
                                <div className="stat-value" style={{ color: 'var(--color-red)' }}>
                                    {stat.value}
                                </div>
                                <div className="stat-label">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Built For */}
            <section style={{ padding: 'var(--spacing-3xl) 0' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <h2 style={{
                                fontSize: 'var(--font-size-2xl)',
                                fontWeight: 700,
                                marginBottom: 'var(--spacing-md)',
                                color: 'var(--color-dark-gray)',
                            }}>
                                Built for Flare Hackathon
                            </h2>
                            <p style={{
                                fontSize: 'var(--font-size-lg)',
                                color: 'var(--color-gray)',
                                lineHeight: 1.8,
                                marginBottom: 'var(--spacing-md)',
                            }}>
                                FACE was created as a comprehensive demonstration of Flare's unique capabilities. It showcases how FDC, FTSO, FAssets, and Smart Accounts can work together to solve real-world problems.
                            </p>
                            <p style={{
                                fontSize: 'var(--font-size-lg)',
                                color: 'var(--color-gray)',
                                lineHeight: 1.8,
                            }}>
                                This project represents the future of decentralized compliance—fast, transparent, and fully autonomous.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
