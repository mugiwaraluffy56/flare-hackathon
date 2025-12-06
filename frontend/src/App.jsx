import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import AssetSubmission from './pages/AssetSubmission';
import './styles/index.css';

const Navigation = () => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <div className="container" style={{ marginTop: '1rem' }}>
            <nav className="flex gap-md justify-center">
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={isActive('/') ? 'btn btn-primary' : 'btn btn-ghost'}
                    >
                        Dashboard
                    </motion.div>
                </Link>
                <Link to="/submit" style={{ textDecoration: 'none' }}>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={isActive('/submit') ? 'btn btn-primary' : 'btn btn-ghost'}
                    >
                        Submit Asset
                    </motion.div>
                </Link>
            </nav>
        </div>
    );
};

function App() {
    return (
        <Router>
            <div style={{ minHeight: '100vh', paddingBottom: '2rem' }}>
                <Header />
                <Navigation />
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/submit" element={<AssetSubmission />} />
                </Routes>

                {/* Footer */}
                <footer style={{
                    marginTop: '4rem',
                    padding: '2rem',
                    textAlign: 'center',
                    color: 'var(--color-gray-400)',
                    fontSize: 'var(--font-size-sm)',
                }}>
                    <p>FACE - Flare Autonomous Compliance Engine</p>
                    <p style={{ marginTop: '0.5rem', fontSize: 'var(--font-size-xs)' }}>
                        Powered by Flare's FDC, FTSO, and Smart Accounts
                    </p>
                </footer>
            </div>
        </Router>
    );
}

export default App;
