import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../hooks/useWeb3';

const Home = () => {
    const { connectWallet, isConnected } = useWeb3();

    return (
        <div>
            {/* Hero Section */}
            <section style={{
                background: 'linear-gradient(180deg, #fff 0%, #f5f5f7 100%)',
                padding: 'var(--spacing-3xl) 0',
            }}>
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}
                    >
                        <h1 style={{
                            fontSize: 'var(--font-size-5xl)',
                            fontWeight: 700,
                            lineHeight: 1.1,
                            marginBottom: 'var(--spacing-lg)',
                            color: 'var(--color-dark-gray)',
                            letterSpacing: '-0.03em',
                        }}>
                            The Future of <span style={{ color: 'var(--color-red)' }}>Compliance</span> is Here
                        </h1>
                        <p style={{
                            fontSize: 'var(--font-size-xl)',
                            color: 'var(--color-gray)',
                            marginBottom: 'var(--spacing-xl)',
                            lineHeight: 1.6,
                        }}>
                            FACE leverages Flare's FDC, FTSO, and Smart Accounts to provide real-time, autonomous compliance checks for cross-chain transactions.
                        </p>
                        <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {isConnected ? (
                                <Link to="/submit">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="btn btn-primary btn-large"
                                    >
                                        Submit Asset →
                                    </motion.button>
                                </Link>
                            ) : (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={connectWallet}
                                    className="btn btn-primary btn-large"
                                >
                                    Get Started
                                </motion.button>
                            )}
                            <Link to="/how-it-works">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="btn btn-outline btn-large"
                                >
                                    Learn More
                                </motion.button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section style={{ padding: 'var(--spacing-3xl) 0' }}>
                <div className="container">
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 'var(--spacing-xl)',
                        textAlign: 'center',
                    }}>
                        {[
                            { value: '< 2s', label: 'Processing Time' },
                            { value: '99%', label: 'Accuracy Rate' },
                            { value: '24/7', label: 'Availability' },
                            { value: '100+', label: 'Assets Supported' },
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div style={{
                                    fontSize: 'var(--font-size-4xl)',
                                    fontWeight: 700,
                                    color: 'var(--color-red)',
                                    marginBottom: 'var(--spacing-xs)',
                                }}>
                                    {stat.value}
                                </div>
                                <div style={{
                                    fontSize: 'var(--font-size-sm)',
                                    color: 'var(--color-gray)',
                                    fontWeight: 500,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                }}>
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section style={{ padding: 'var(--spacing-3xl) 0', background: 'var(--color-off-white)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
                        <h2 className="section-title">Powered by Flare</h2>
                        <p className="section-subtitle">
                            Leveraging cutting-edge blockchain technology for unparalleled compliance
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: 'var(--spacing-xl)',
                    }}>
                        {[
                            {
                                icon: '🔗',
                                title: 'Flare Data Connector',
                                description: 'Verify external chain transactions with cryptographic proof',
                            },
                            {
                                icon: '📊',
                                title: 'FTSO Price Feeds',
                                description: 'Real-time decentralized price data for accurate risk assessment',
                            },
                            {
                                icon: '🤖',
                                title: 'Smart Accounts',
                                description: 'Autonomous transaction execution based on compliance status',
                            },
                            {
                                icon: '🧠',
                                title: 'AI Risk Engine',
                                description: 'Multi-factor analysis for intelligent compliance decisions',
                            },
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 + 0.3 }}
                                className="card"
                                style={{ textAlign: 'center' }}
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
                                }}>
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Preview */}
            <section style={{ padding: 'var(--spacing-3xl) 0' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
                        <h2 className="section-title">Simple, Fast, Secure</h2>
                        <p className="section-subtitle">
                            Compliance checks in three easy steps
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: 'var(--spacing-xl)',
                    }}>
                        {[
                            { step: '01', title: 'Submit Transaction', description: 'Provide transaction details from any supported blockchain' },
                            { step: '02', title: 'AI Analysis', description: 'Our engine analyzes risk using FDC, FTSO, and AI' },
                            { step: '03', title: 'Get Result', description: 'Receive instant approval, rejection, or review status' },
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.2 }}
                                style={{ position: 'relative' }}
                            >
                                <div style={{
                                    fontSize: 'var(--font-size-4xl)',
                                    fontWeight: 700,
                                    color: 'rgba(255, 59, 48, 0.1)',
                                    marginBottom: 'var(--spacing-sm)',
                                }}>
                                    {item.step}
                                </div>
                                <h3 style={{
                                    fontSize: 'var(--font-size-xl)',
                                    fontWeight: 700,
                                    marginBottom: 'var(--spacing-sm)',
                                    color: 'var(--color-dark-gray)',
                                }}>
                                    {item.title}
                                </h3>
                                <p style={{
                                    fontSize: 'var(--font-size-sm)',
                                    color: 'var(--color-gray)',
                                    lineHeight: 1.6,
                                }}>
                                    {item.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    <div style={{ textAlign: 'center', marginTop: 'var(--spacing-2xl)' }}>
                        <Link to="/how-it-works">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="btn btn-secondary"
                            >
                                View Full Process →
                            </motion.button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{
                padding: 'var(--spacing-3xl) 0',
                background: 'linear-gradient(135deg, #ff3b30 0%, #ff6b5e 100%)',
            }}>
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}
                    >
                        <h2 style={{
                            fontSize: 'var(--font-size-3xl)',
                            fontWeight: 700,
                            color: 'white',
                            marginBottom: 'var(--spacing-md)',
                        }}>
                            Ready to Transform Compliance?
                        </h2>
                        <p style={{
                            fontSize: 'var(--font-size-lg)',
                            color: 'rgba(255, 255, 255, 0.9)',
                            marginBottom: 'var(--spacing-xl)',
                        }}>
                            Join the future of decentralized compliance with FACE
                        </p>
                        {isConnected ? (
                            <Link to="/submit">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{
                                        padding: '1rem 2.5rem',
                                        background: 'white',
                                        color: 'var(--color-red)',
                                        border: 'none',
                                        borderRadius: 'var(--radius-full)',
                                        fontSize: 'var(--font-size-lg)',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                    }}
                                >
                                    Submit Your First Asset
                                </motion.button>
                            </Link>
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={connectWallet}
                                style={{
                                    padding: '1rem 2.5rem',
                                    background: 'white',
                                    color: 'var(--color-red)',
                                    border: 'none',
                                    borderRadius: 'var(--radius-full)',
                                    fontSize: 'var(--font-size-lg)',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                Connect Wallet to Start
                            </motion.button>
                        )}
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Home;
