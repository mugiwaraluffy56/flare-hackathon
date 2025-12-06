import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useWeb3 } from '../hooks/useWeb3';
import { useWebSocket } from '../hooks/useWebSocket';
import { FiTrendingUp, FiCheckCircle, FiXCircle, FiClock, FiActivity, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import { HiOutlineChartBar, HiOutlineShieldCheck } from 'react-icons/hi';
import { Link } from 'react-router-dom';

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

    const getStatusIcon = (status) => {
        const iconMap = {
            'APPROVED': <FiCheckCircle size={16} />,
            'REJECTED': <FiXCircle size={16} />,
            'UNDER_REVIEW': <FiClock size={16} />,
            'PENDING': <FiActivity size={16} />,
        };
        return iconMap[status] || <FiActivity size={16} />;
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

    const approvalRate = stats.total > 0 ? ((stats.approved / stats.total) * 100).toFixed(1) : 0;
    const avgRiskScore = transactions.length > 0
        ? (transactions.reduce((sum, tx) => sum + tx.risk_score, 0) / transactions.length).toFixed(1)
        : 0;

    if (!isConnected) {
        return (
            <div className="hero">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <HiOutlineShieldCheck size={64} style={{ color: 'var(--color-red)', opacity: 0.2 }} />
                    </div>
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
        <div style={{ background: 'var(--color-off-white)', minHeight: 'calc(100vh - 72px)' }}>
            <div className="container" style={{ paddingTop: 'var(--spacing-2xl)', paddingBottom: 'var(--spacing-3xl)' }}>
                {/* Page Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 'var(--spacing-xl)' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                        <div>
                            <h1 className="section-title" style={{ marginBottom: 'var(--spacing-xs)' }}>Compliance Dashboard</h1>
                            <p className="section-subtitle" style={{ marginBottom: 0 }}>
                                Real-time overview of your compliance checks
                            </p>
                        </div>
                        <Link to="/submit" style={{ textDecoration: 'none' }}>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="btn btn-primary"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                Submit Asset <FiArrowRight />
                            </motion.button>
                        </Link>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: 'var(--spacing-lg)',
                    marginBottom: 'var(--spacing-xl)',
                }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="card"
                        style={{ background: 'white' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-md)' }}>
                            <div>
                                <div style={{
                                    fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                                    fontWeight: 700,
                                    lineHeight: 1,
                                    marginBottom: 'var(--spacing-xs)',
                                    color: 'var(--color-dark-gray)',
                                }}>
                                    {stats.total}
                                </div>
                                <div className="stat-label">Total Checks</div>
                            </div>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'rgba(0, 0, 0, 0.03)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <HiOutlineChartBar size={24} style={{ color: 'var(--color-gray)' }} />
                            </div>
                        </div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray)' }}>
                            All time compliance checks
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="card"
                        style={{ background: 'white' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-md)' }}>
                            <div>
                                <div style={{
                                    fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                                    fontWeight: 700,
                                    lineHeight: 1,
                                    marginBottom: 'var(--spacing-xs)',
                                    color: 'var(--color-success)',
                                }}>
                                    {stats.approved}
                                </div>
                                <div className="stat-label">Approved</div>
                            </div>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'rgba(52, 199, 89, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <FiCheckCircle size={24} style={{ color: 'var(--color-success)' }} />
                            </div>
                        </div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray)' }}>
                            {approvalRate}% approval rate
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="card"
                        style={{ background: 'white' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-md)' }}>
                            <div>
                                <div style={{
                                    fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                                    fontWeight: 700,
                                    lineHeight: 1,
                                    marginBottom: 'var(--spacing-xs)',
                                    color: 'var(--color-error)',
                                }}>
                                    {stats.rejected}
                                </div>
                                <div className="stat-label">Rejected</div>
                            </div>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'rgba(255, 59, 48, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <FiXCircle size={24} style={{ color: 'var(--color-error)' }} />
                            </div>
                        </div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray)' }}>
                            High-risk transactions
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="card"
                        style={{ background: 'white' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-md)' }}>
                            <div>
                                <div style={{
                                    fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                                    fontWeight: 700,
                                    lineHeight: 1,
                                    marginBottom: 'var(--spacing-xs)',
                                    color: 'var(--color-warning)',
                                }}>
                                    {stats.underReview}
                                </div>
                                <div className="stat-label">Under Review</div>
                            </div>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'rgba(255, 149, 0, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <FiClock size={24} style={{ color: 'var(--color-warning)' }} />
                            </div>
                        </div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray)' }}>
                            Awaiting manual review
                        </div>
                    </motion.div>
                </div>

                {/* Insights Row */}
                {stats.total > 0 && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: 'var(--spacing-lg)',
                        marginBottom: 'var(--spacing-xl)',
                    }}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="card"
                            style={{ background: 'white' }}
                        >
                            <h3 style={{
                                fontSize: 'var(--font-size-lg)',
                                fontWeight: 700,
                                marginBottom: 'var(--spacing-md)',
                                color: 'var(--color-dark-gray)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-sm)',
                            }}>
                                <FiTrendingUp style={{ color: 'var(--color-red)' }} /> Performance Metrics
                            </h3>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: 'var(--spacing-md)',
                            }}>
                                <div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray)', marginBottom: 'var(--spacing-xs)' }}>
                                        Approval Rate
                                    </div>
                                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-success)' }}>
                                        {approvalRate}%
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray)', marginBottom: 'var(--spacing-xs)' }}>
                                        Avg Risk Score
                                    </div>
                                    <div style={{
                                        fontSize: 'var(--font-size-2xl)',
                                        fontWeight: 700,
                                        color: avgRiskScore < 30 ? 'var(--color-success)' : avgRiskScore < 60 ? 'var(--color-warning)' : 'var(--color-error)'
                                    }}>
                                        {avgRiskScore}/100
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="card"
                            style={{ background: 'linear-gradient(135deg, #ff3b30 0%, #ff6b5e 100%)', color: 'white' }}
                        >
                            <h3 style={{
                                fontSize: 'var(--font-size-lg)',
                                fontWeight: 700,
                                marginBottom: 'var(--spacing-sm)',
                                color: 'white',
                            }}>
                                Quick Stats
                            </h3>
                            <div style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-md)', opacity: 0.9 }}>
                                Your compliance overview at a glance
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--spacing-lg)', flexWrap: 'wrap' }}>
                                <div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.8, marginBottom: 'var(--spacing-xs)' }}>
                                        Success Rate
                                    </div>
                                    <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>
                                        {stats.total > 0 ? (((stats.approved + stats.underReview) / stats.total) * 100).toFixed(0) : 0}%
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.8, marginBottom: 'var(--spacing-xs)' }}>
                                        Total Volume
                                    </div>
                                    <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>
                                        {stats.total} txs
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Transactions Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
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
                        <div className="card" style={{ padding: 'var(--spacing-3xl)', textAlign: 'center', background: 'white' }}>
                            <div style={{ color: 'var(--color-gray)' }}>Loading...</div>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="card" style={{ padding: 'var(--spacing-3xl)', textAlign: 'center', background: 'white' }}>
                            <FiActivity size={48} style={{ color: 'var(--color-gray)', opacity: 0.3, marginBottom: 'var(--spacing-md)' }} />
                            <p style={{ color: 'var(--color-dark-gray)', marginBottom: 'var(--spacing-sm)', fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>
                                No transactions yet
                            </p>
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray)', marginBottom: 'var(--spacing-lg)' }}>
                                Submit your first asset for compliance check
                            </p>
                            <Link to="/submit" style={{ textDecoration: 'none' }}>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="btn btn-primary"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    Submit Asset <FiArrowRight />
                                </motion.button>
                            </Link>
                        </div>
                    ) : (
                        <div className="table-container" style={{ background: 'white' }}>
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
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                                                    <div style={{
                                                        width: '40px',
                                                        height: '6px',
                                                        borderRadius: '3px',
                                                        background: 'var(--color-light-gray)',
                                                        overflow: 'hidden',
                                                    }}>
                                                        <div style={{
                                                            width: `${tx.risk_score}%`,
                                                            height: '100%',
                                                            background: tx.risk_score < 30 ? 'var(--color-success)' :
                                                                tx.risk_score < 60 ? 'var(--color-warning)' :
                                                                    'var(--color-error)',
                                                        }} />
                                                    </div>
                                                    <span style={{
                                                        fontWeight: 600,
                                                        fontSize: 'var(--font-size-sm)',
                                                        color: tx.risk_score < 30 ? 'var(--color-success)' :
                                                            tx.risk_score < 60 ? 'var(--color-warning)' :
                                                                'var(--color-error)',
                                                    }}>
                                                        {tx.risk_score}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge ${getStatusBadge(tx.status)}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    {getStatusIcon(tx.status)}
                                                    {tx.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--color-gray)', fontSize: 'var(--font-size-sm)' }}>
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
        </div>
    );
};

export default Dashboard;
