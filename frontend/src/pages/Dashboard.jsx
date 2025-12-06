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

            // Calculate stats
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
            'PENDING': 'badge-info',
        };
        return statusMap[status] || 'badge-info';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const StatCard = ({ title, value, color, icon }) => (
        <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            className="glass-card"
            style={{ padding: '1.5rem', flex: 1 }}
        >
            <div className="flex justify-between items-start mb-md">
                <div>
                    <p className="text-sm text-gray-400 mb-sm">{title}</p>
                    <h3 className="text-3xl font-bold" style={{ color }}>{value}</h3>
                </div>
                <div style={{
                    fontSize: '2rem',
                    opacity: 0.3,
                }}>
                    {icon}
                </div>
            </div>
        </motion.div>
    );

    if (!isConnected) {
        return (
            <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card"
                    style={{ padding: '3rem', maxWidth: '500px', margin: '0 auto' }}
                >
                    <h2 className="text-2xl font-bold mb-md">Connect Your Wallet</h2>
                    <p className="text-gray-300">
                        Please connect your wallet to view your compliance dashboard
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header */}
                <div className="mb-xl">
                    <h2 className="text-4xl font-extrabold mb-sm">
                        Compliance <span className="text-red">Dashboard</span>
                    </h2>
                    <p className="text-lg text-gray-300">
                        Real-time overview of your compliance checks
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="flex gap-md mb-xl" style={{ flexWrap: 'wrap' }}>
                    <StatCard
                        title="Total Checks"
                        value={stats.total}
                        color="var(--color-white)"
                        icon="📊"
                    />
                    <StatCard
                        title="Approved"
                        value={stats.approved}
                        color="var(--color-success)"
                        icon="✓"
                    />
                    <StatCard
                        title="Rejected"
                        value={stats.rejected}
                        color="var(--color-error)"
                        icon="✗"
                    />
                    <StatCard
                        title="Under Review"
                        value={stats.underReview}
                        color="var(--color-warning)"
                        icon="⏳"
                    />
                </div>

                {/* Transactions Table */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 className="text-2xl font-bold mb-lg">Recent Transactions</h3>

                    {loading ? (
                        <div className="text-center" style={{ padding: '3rem' }}>
                            <div className="animate-pulse text-gray-400">Loading...</div>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center" style={{ padding: '3rem' }}>
                            <p className="text-gray-400">No transactions yet</p>
                            <p className="text-sm text-gray-500 mt-sm">Submit your first asset for compliance check</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--color-gray-400)', fontWeight: 600 }}>ID</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--color-gray-400)', fontWeight: 600 }}>Asset</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--color-gray-400)', fontWeight: 600 }}>Amount</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--color-gray-400)', fontWeight: 600 }}>Risk Score</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--color-gray-400)', fontWeight: 600 }}>Status</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--color-gray-400)', fontWeight: 600 }}>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((tx, index) => (
                                        <motion.tr
                                            key={tx.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            style={{
                                                borderBottom: '1px solid var(--glass-border)',
                                            }}
                                            whileHover={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                            }}
                                        >
                                            <td style={{ padding: '1rem' }}>
                                                <span className="font-medium">#{tx.id}</span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span className="font-semibold">{tx.asset_type}</span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {tx.amount.toFixed(4)}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    color: tx.risk_score < 30 ? 'var(--color-success)' :
                                                        tx.risk_score < 60 ? 'var(--color-warning)' :
                                                            'var(--color-error)',
                                                    fontWeight: 600,
                                                }}>
                                                    {tx.risk_score}/100
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span className={`badge ${getStatusBadge(tx.status)}`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', color: 'var(--color-gray-400)', fontSize: 'var(--font-size-sm)' }}>
                                                {formatDate(tx.created_at)}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default Dashboard;
