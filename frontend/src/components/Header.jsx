import { motion } from 'framer-motion';
import { useWeb3 } from '../hooks/useWeb3';

const Header = () => {
    const { account, isConnected, isCorrectNetwork, connectWallet, switchToCoston2, disconnectWallet } = useWeb3();

    const formatAddress = (address) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass-card"
            style={{
                position: 'sticky',
                top: '1rem',
                zIndex: 50,
                margin: '1rem auto',
                maxWidth: '1280px',
                padding: '1rem 2rem',
            }}
        >
            <div className="flex justify-between items-center">
                {/* Logo */}
                <div className="flex items-center gap-md">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-sm"
                    >
                        <div
                            style={{
                                width: '40px',
                                height: '40px',
                                background: 'linear-gradient(135deg, var(--color-red-primary), var(--color-red-dark))',
                                borderRadius: 'var(--radius-lg)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '1.25rem',
                            }}
                        >
                            F
                        </div>
                        <div>
                            <h1 className="text-xl font-bold" style={{ lineHeight: 1.2 }}>
                                FACE
                            </h1>
                            <p className="text-sm text-gray-400" style={{ lineHeight: 1 }}>
                                Flare Compliance Engine
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Wallet Connection */}
                <div className="flex items-center gap-md">
                    {isConnected && !isCorrectNetwork && (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={switchToCoston2}
                            className="btn btn-secondary"
                            style={{ fontSize: 'var(--font-size-sm)' }}
                        >
                            Switch to Coston2
                        </motion.button>
                    )}

                    {isConnected ? (
                        <div className="flex items-center gap-sm">
                            <div
                                className="glass-card"
                                style={{
                                    padding: '0.5rem 1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                }}
                            >
                                <div
                                    style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        background: isCorrectNetwork ? 'var(--color-success)' : 'var(--color-warning)',
                                        boxShadow: isCorrectNetwork
                                            ? '0 0 10px var(--color-success)'
                                            : '0 0 10px var(--color-warning)',
                                    }}
                                    className="animate-pulse"
                                />
                                <span className="text-sm font-medium">{formatAddress(account)}</span>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={disconnectWallet}
                                className="btn btn-ghost"
                                style={{ fontSize: 'var(--font-size-sm)', padding: '0.5rem 1rem' }}
                            >
                                Disconnect
                            </motion.button>
                        </div>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={connectWallet}
                            className="btn btn-primary"
                        >
                            Connect Wallet
                        </motion.button>
                    )}
                </div>
            </div>
        </motion.header>
    );
};

export default Header;
