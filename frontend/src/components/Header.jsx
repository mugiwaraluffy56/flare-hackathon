import { motion } from 'framer-motion';
import { useWeb3 } from '../hooks/useWeb3';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
    const { account, isConnected, isCorrectNetwork, connectWallet, switchToCoston2, disconnectWallet } = useWeb3();
    const location = useLocation();

    const formatAddress = (address) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/', label: 'Home' },
        { path: '/features', label: 'Features' },
        { path: '/how-it-works', label: 'How It Works' },
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/submit', label: 'Submit' },
        { path: '/about', label: 'About' },
    ];

    return (
        <header style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
        }}>
            <div className="container" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: '72px',
                gap: 'var(--spacing-lg)',
            }}>
                {/* Logo */}
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <motion.div
                        whileHover={{ opacity: 0.8 }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer',
                        }}
                    >
                        <div style={{
                            width: '36px',
                            height: '36px',
                            background: 'linear-gradient(135deg, #ff3b30 0%, #ff6b5e 100%)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '1.25rem',
                        }}>
                            F
                        </div>
                        <span style={{
                            fontSize: '1.375rem',
                            fontWeight: 600,
                            color: '#666',
                            letterSpacing: '-0.01em',
                        }}>
                            FACE
                        </span>
                    </motion.div>
                </Link>

                {/* Navigation - Desktop */}
                <nav style={{
                    display: 'flex',
                    gap: '1.5rem',
                    alignItems: 'center',
                    flex: 1,
                    justifyContent: 'center',
                }}>
                    {navItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            style={{ textDecoration: 'none' }}
                        >
                            <motion.div
                                whileHover={{ color: 'var(--color-red)' }}
                                style={{
                                    fontSize: 'var(--font-size-sm)',
                                    fontWeight: 600,
                                    color: isActive(item.path) ? 'var(--color-red)' : 'var(--color-gray)',
                                    transition: 'all var(--transition-fast)',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {item.label}
                            </motion.div>
                        </Link>
                    ))}
                </nav>

                {/* Wallet Connection */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {isConnected && !isCorrectNetwork && (
                        <motion.button
                            whileHover={{ opacity: 0.8 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={switchToCoston2}
                            style={{
                                fontSize: '0.875rem',
                                padding: '0.5rem 1rem',
                                background: 'transparent',
                                color: '#ff3b30',
                                border: '1.5px solid #ff3b30',
                                borderRadius: '8px',
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            Switch Network
                        </motion.button>
                    )}

                    {isConnected ? (
                        <>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                background: '#f8f8f8',
                                borderRadius: '8px',
                            }}>
                                <div style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    background: isCorrectNetwork ? '#30d158' : '#ff9f0a',
                                }} />
                                <span style={{
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    color: '#666',
                                }}>
                                    {formatAddress(account)}
                                </span>
                            </div>
                            <motion.button
                                whileHover={{ opacity: 0.7 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={disconnectWallet}
                                style={{
                                    fontSize: '0.875rem',
                                    padding: '0.5rem 1rem',
                                    background: 'transparent',
                                    color: '#666',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                Disconnect
                            </motion.button>
                        </>
                    ) : (
                        <motion.button
                            whileHover={{ opacity: 0.9 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={connectWallet}
                            style={{
                                fontSize: '0.9375rem',
                                padding: '0.625rem 1.5rem',
                                background: '#ff3b30',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: '0 2px 8px rgba(255, 59, 48, 0.2)',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            Connect Wallet
                        </motion.button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
