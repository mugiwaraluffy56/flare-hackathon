import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useWeb3 } from '../hooks/useWeb3';
import { useWebSocket } from '../hooks/useWebSocket';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const Dashboard = () => {
    const { account, isConnected } = useWeb3();
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        approved: 0,
        rejected: 0,
        underReview: 0,
    });
    const [loading, setLoading] = useState(true);

    // WebSocket for real-time updates
    useWebSocket((message) => {
        if (message.type === 'compliance_submitted') {
            fetchTransactions();
        }
    });

    useEffect(() => {
        if (isConnected && account) {
            fetchTransactions();
        }
    }, [isConnected, account]);

    const fetchTransactions = async () => {
        try {
            const response = await axios.get(`${API_URL}/transactions`, {
                params: { user: account, limit: 10 }
            });

            const txs = response.data || [];
            setTransactions(txs);

            const stats = {
                total: txs.length,
                approved: txs.filter(t => t.status === 'APPROVED').length,
                rejected: txs.filter(t => t.status === 'REJECTED').length,
                underReview: txs.filter(t => t.status === 'UNDER_REVIEW').length,
            };
            setStats(stats);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'APPROVED': 'badge-success',
            'REJECTED': 'badge-error',
            'UNDER_REVIEW': 'badge-warning',
            'PENDING': 'badge-neutral',
        };
        return statusMap[status] || 'badge-neutral';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!isConnected) {
        return (
            <div className="hero">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="hero-title">
                        Welcome to <span style={{ color: 'var(--color-red)' }}>FACE</span>
                    </h1>
                    <p className="hero-subtitle">
                        Connect your wallet to access the Flare Autonomous Compliance Engine
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: 'var(--spacing-2xl)', paddingBottom: 'var(--spacing-3xl)' }}>
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: 'var(--spacing-2xl)' }}
            >
                <h1 className="section-title">Compliance Dashboard</h1>
                <p className="section-subtitle">
                    Real-time overview of your compliance checks
                </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="stat-card"
                >
                    <div className="stat-value" style={{ color: 'var(--color-dark-gray)' }}>
                        {stats.total}
                    </div>
                    <div className="stat-label">Total Checks</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="stat-card"
                >
                    <div className="stat-value" style={{ color: 'var(--color-success)' }}>
                        {stats.approved}
                    </div>
                    <div className="stat-label">Approved</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="stat-card"
                >
                    <div className="stat-value" style={{ color: 'var(--color-error)' }}>
                        {stats.rejected}
                    </div>
                    <div className="stat-label">Rejected</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="stat-card"
                >
                    <div className="stat-value" style={{ color: 'var(--color-warning)' }}>
                        {stats.underReview}
                    </div>
                    <div className="stat-label">Under Review</div>
                </motion.div>
            </div>

            {/* Transactions Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <h2 style={{
                    fontSize: 'var(--font-size-2xl)',
                    fontWeight: 700,
                    marginBottom: 'var(--spacing-lg)',
                    color: 'var(--color-dark-gray)',
                }}>
                    Recent Transactions
                </h2>

                {loading ? (
                    <div className="card" style={{ padding: 'var(--spacing-3xl)', textAlign: 'center' }}>
                        <div style={{ color: 'var(--color-gray)' }}>Loading...</div>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="card" style={{ padding: 'var(--spacing-3xl)', textAlign: 'center' }}>
                        <p style={{ color: 'var(--color-gray)', marginBottom: 'var(--spacing-sm)' }}>
                            No transactions yet
                        </p>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray)' }}>
                            Submit your first asset for compliance check
                        </p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Asset</th>
                                    <th>Amount</th>
                                    <th>Risk Score</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx, index) => (
                                    <motion.tr
                                        key={tx.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <td>
                                            <span style={{ fontWeight: 600, color: 'var(--color-medium-gray)' }}>
                                                #{tx.id}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 600 }}>{tx.asset_type}</span>
                                        </td>
                                        <td>{tx.amount.toFixed(4)}</td>
                                        <td>
                                            <span style={{
                                                fontWeight: 600,
                                                color: tx.risk_score < 30 ? 'var(--color-success)' :
                                                    tx.risk_score < 60 ? 'var(--color-warning)' :
                                                        'var(--color-error)',
                                            }}>
                                                {tx.risk_score}/100
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(tx.status)}`}>
                                                {tx.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--color-gray)' }}>
                                            {formatDate(tx.created_at)}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default Dashboard;
