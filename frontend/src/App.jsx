import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './components/Header';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import AssetSubmission from './pages/AssetSubmission';
import Features from './pages/Features';
import HowItWorks from './pages/HowItWorks';
import About from './pages/About';
import './styles/index.css';

const Navigation = () => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/', label: 'Home' },
        { path: '/features', label: 'Features' },
        { path: '/how-it-works', label: 'How It Works' },
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/submit', label: 'Submit Asset' },
        { path: '/about', label: 'About' },
    ];

    return (
        <nav style={{
            borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
            background: 'var(--color-white)',
            overflowX: 'auto',
        }}>
            <div className="container" style={{
                display: 'flex',
                gap: '2rem',
                paddingTop: 'var(--spacing-sm)',
                paddingBottom: 0,
                minWidth: 'max-content',
            }}>
                {navItems.map(item => (
                    <Link
                        key={item.path}
                        to={item.path}
                        style={{ textDecoration: 'none' }}
                    >
                        <motion.div
                            whileHover={{ y: -2 }}
                            style={{
                                padding: 'var(--spacing-sm) 0',
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: 600,
                                color: isActive(item.path) ? 'var(--color-red)' : 'var(--color-gray)',
                                borderBottom: isActive(item.path) ? '2px solid var(--color-red)' : '2px solid transparent',
                                transition: 'all var(--transition-fast)',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {item.label}
                        </motion.div>
                    </Link>
                ))}
            </div>
        </nav>
    );
};

function App() {
    return (
        <Router>
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Header />
                <Navigation />

                <main style={{ flex: 1 }}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/features" element={<Features />} />
                        <Route path="/how-it-works" element={<HowItWorks />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/submit" element={<AssetSubmission />} />
                        <Route path="/about" element={<About />} />
                    </Routes>
                </main>

                {/* Footer */}
                <footer style={{
                    borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                    padding: 'var(--spacing-2xl) 0',
                    background: 'var(--color-off-white)',
                }}>
                    <div className="container">
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: 'var(--spacing-xl)',
                            marginBottom: 'var(--spacing-xl)',
                        }}>
                            {/* Column 1 */}
                            <div>
                                <h4 style={{ fontWeight: 700, marginBottom: 'var(--spacing-md)', color: 'var(--color-dark-gray)' }}>
                                    FACE
                                </h4>
                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray)', lineHeight: 1.6 }}>
                                    Flare Autonomous Compliance Engine - The future of decentralized compliance.
                                </p>
                            </div>

                            {/* Column 2 */}
                            <div>
                                <h4 style={{ fontWeight: 700, marginBottom: 'var(--spacing-md)', color: 'var(--color-dark-gray)', fontSize: 'var(--font-size-sm)' }}>
                                    Product
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                    <Link to="/features" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray)', textDecoration: 'none' }}>Features</Link>
                                    <Link to="/how-it-works" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray)', textDecoration: 'none' }}>How It Works</Link>
                                    <Link to="/dashboard" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray)', textDecoration: 'none' }}>Dashboard</Link>
                                </div>
                            </div>

                            {/* Column 3 */}
                            <div>
                                <h4 style={{ fontWeight: 700, marginBottom: 'var(--spacing-md)', color: 'var(--color-dark-gray)', fontSize: 'var(--font-size-sm)' }}>
                                    Technology
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                    <a href="https://flare.network" target="_blank" rel="noopener noreferrer" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray)', textDecoration: 'none' }}>Flare Network</a>
                                    <a href="https://docs.flare.network" target="_blank" rel="noopener noreferrer" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray)', textDecoration: 'none' }}>Documentation</a>
                                    <Link to="/about" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray)', textDecoration: 'none' }}>About</Link>
                                </div>
                            </div>

                            {/* Column 4 */}
                            <div>
                                <h4 style={{ fontWeight: 700, marginBottom: 'var(--spacing-md)', color: 'var(--color-dark-gray)', fontSize: 'var(--font-size-sm)' }}>
                                    Connect
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray)', textDecoration: 'none' }}>GitHub</a>
                                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray)', textDecoration: 'none' }}>Twitter</a>
                                    <a href="https://discord.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray)', textDecoration: 'none' }}>Discord</a>
                                </div>
                            </div>
                        </div>

                        <div style={{
                            paddingTop: 'var(--spacing-lg)',
                            borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                            textAlign: 'center',
                        }}>
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray)' }}>
                                © 2024 FACE. Powered by Flare's FDC, FTSO, and Smart Accounts.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </Router>
    );
}

export default App;
