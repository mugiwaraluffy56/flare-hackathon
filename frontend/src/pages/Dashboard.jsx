import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useWeb3 } from '../hooks/useWeb3';
import { useWebSocket } from '../hooks/useWebSocket';
import {
    FiTrendingUp, FiCheckCircle, FiXCircle, FiClock, FiActivity,
    FiAlertCircle, FiArrowRight, FiDollarSign, FiShield, FiZap,
    FiPieChart, FiBarChart2, FiTrendingDown
} from 'react-icons/fi';
import { HiOutlineChartBar, HiOutlineShieldCheck } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'];

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
    const [activityData, setActivityData] = useState([]);
    const [riskDistribution, setRiskDistribution] = useState([]);

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
                params: { user: account, limit: 20 }
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

            // Generate activity data (last 7 days)
            const activityMap = {};
            const today = new Date();
            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                activityMap[dateStr] = { date: dateStr, approved: 0, rejected: 0, review: 0 };
            }

            txs.forEach(tx => {
                const date = new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                if (activityMap[date]) {
                    if (tx.status === 'APPROVED') activityMap[date].approved++;
                    else if (tx.status === 'REJECTED') activityMap[date].rejected++;
                    else if (tx.status === 'UNDER_REVIEW') activityMap[date].review++;
                }
            });

            setActivityData(Object.values(activityMap));

            // Risk distribution
            const riskRanges = {
                'Low (0-30)': 0,
                'Medium (31-60)': 0,
                'High (61-85)': 0,
                'Critical (86-100)': 0
            };

            txs.forEach(tx => {
                const risk = tx.risk_score;
                if (risk <= 30) riskRanges['Low (0-30)']++;
                else if (risk <= 60) riskRanges['Medium (31-60)']++;
                else if (risk <= 85) riskRanges['High (61-85)']++;
                else riskRanges['Critical (86-100)']++;
            });

            setRiskDistribution(
                Object.entries(riskRanges).map(([name, value]) => ({ name, value }))
            );

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

    const totalValue = transactions.reduce((sum, tx) => sum + (tx.amount * tx.asset_price || 0), 0);

    if (!isConnected) {
        return (
            <div className="hero min-h-[80vh]">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hero-content text-center"
                >
                    <div className="max-w-md">
                        <HiOutlineShieldCheck className="mx-auto text-red-500" size={80} />
                        <h1 className="text-4xl font-bold mt-6">Connect Your Wallet</h1>
                        <p className="py-6 text-base-content/70">
                            Connect your wallet to view your compliance dashboard and transaction history.
                        </p>
                        <Link to="/submit" className="btn btn-primary">
                            Get Started <FiArrowRight className="ml-2" />
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[80vh]">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-200 py-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-4xl font-bold">Compliance Dashboard</h1>
                            <p className="text-base-content/70 mt-2">
                                Monitor your compliance status and transaction history
                            </p>
                        </div>
                        <Link to="/submit" className="btn btn-primary">
                            <FiZap className="mr-2" />
                            Submit New Asset
                        </Link>
                    </div>
                </motion.div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl"
                    >
                        <div className="card-body">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm">Total Checks</p>
                                    <h3 className="text-3xl font-bold mt-1">{stats.total}</h3>
                                </div>
                                <div className="bg-white/20 p-3 rounded-lg">
                                    <HiOutlineChartBar size={32} />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="card bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl"
                    >
                        <div className="card-body">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm">Approved</p>
                                    <h3 className="text-3xl font-bold mt-1">{stats.approved}</h3>
                                    <p className="text-green-100 text-xs mt-1">{approvalRate}% rate</p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-lg">
                                    <FiCheckCircle size={32} />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="card bg-gradient-to-br from-red-500 to-red-600 text-white shadow-xl"
                    >
                        <div className="card-body">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-red-100 text-sm">Rejected</p>
                                    <h3 className="text-3xl font-bold mt-1">{stats.rejected}</h3>
                                </div>
                                <div className="bg-white/20 p-3 rounded-lg">
                                    <FiXCircle size={32} />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="card bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-xl"
                    >
                        <div className="card-body">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-amber-100 text-sm">Under Review</p>
                                    <h3 className="text-3xl font-bold mt-1">{stats.underReview}</h3>
                                </div>
                                <div className="bg-white/20 p-3 rounded-lg">
                                    <FiClock size={32} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Activity Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="card bg-base-100 shadow-xl"
                    >
                        <div className="card-body">
                            <h2 className="card-title">
                                <FiBarChart2 className="text-primary" />
                                Activity Overview (7 Days)
                            </h2>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={activityData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Area type="monotone" dataKey="approved" stackId="1" stroke="#10b981" fill="#10b981" />
                                        <Area type="monotone" dataKey="rejected" stackId="1" stroke="#ef4444" fill="#ef4444" />
                                        <Area type="monotone" dataKey="review" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </motion.div>

                    {/* Risk Distribution */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="card bg-base-100 shadow-xl"
                    >
                        <div className="card-body">
                            <h2 className="card-title">
                                <FiPieChart className="text-primary" />
                                Risk Distribution
                            </h2>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={riskDistribution}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {riskDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Performance Metrics */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="card bg-base-100 shadow-xl mb-8"
                >
                    <div className="card-body">
                        <h2 className="card-title mb-4">
                            <FiTrendingUp className="text-primary" />
                            Performance Metrics
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="stat bg-base-200 rounded-lg">
                                <div className="stat-figure text-primary">
                                    <FiShield size={32} />
                                </div>
                                <div className="stat-title">Approval Rate</div>
                                <div className="stat-value text-primary">{approvalRate}%</div>
                                <div className="stat-desc">
                                    {stats.approved} of {stats.total} approved
                                </div>
                            </div>

                            <div className="stat bg-base-200 rounded-lg">
                                <div className="stat-figure text-secondary">
                                    <FiAlertCircle size={32} />
                                </div>
                                <div className="stat-title">Avg Risk Score</div>
                                <div className="stat-value text-secondary">{avgRiskScore}</div>
                                <div className="stat-desc">
                                    {avgRiskScore < 30 ? 'Low risk' : avgRiskScore < 60 ? 'Medium risk' : 'High risk'}
                                </div>
                            </div>

                            <div className="stat bg-base-200 rounded-lg">
                                <div className="stat-figure text-accent">
                                    <FiDollarSign size={32} />
                                </div>
                                <div className="stat-title">Total Value</div>
                                <div className="stat-value text-accent">${(totalValue / 1000).toFixed(1)}K</div>
                                <div className="stat-desc">Across all transactions</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Recent Transactions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="card bg-base-100 shadow-xl"
                >
                    <div className="card-body">
                        <h2 className="card-title mb-4">
                            <FiActivity className="text-primary" />
                            Recent Transactions
                        </h2>

                        {transactions.length === 0 ? (
                            <div className="text-center py-12">
                                <HiOutlineShieldCheck className="mx-auto text-base-content/30" size={64} />
                                <h3 className="text-xl font-semibold mt-4">No Transactions Yet</h3>
                                <p className="text-base-content/70 mt-2 mb-6">
                                    Submit your first asset for compliance checking
                                </p>
                                <Link to="/submit" className="btn btn-primary">
                                    Submit Asset <FiArrowRight className="ml-2" />
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Asset</th>
                                            <th>Amount</th>
                                            <th>Risk Score</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                            <th>Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.slice(0, 10).map((tx, index) => (
                                            <motion.tr
                                                key={tx.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.9 + index * 0.05 }}
                                                className="hover"
                                            >
                                                <td>
                                                    <div className="font-semibold">{tx.asset_type}</div>
                                                </td>
                                                <td>{tx.amount.toFixed(4)}</td>
                                                <td>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-24 bg-base-200 rounded-full h-2">
                                                            <div
                                                                className={`h-2 rounded-full ${tx.risk_score < 30 ? 'bg-green-500' :
                                                                        tx.risk_score < 60 ? 'bg-yellow-500' :
                                                                            tx.risk_score < 85 ? 'bg-orange-500' : 'bg-red-500'
                                                                    }`}
                                                                style={{ width: `${tx.risk_score}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-sm font-medium">{tx.risk_score}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className={`badge ${getStatusBadge(tx.status)} gap-2`}>
                                                        {getStatusIcon(tx.status)}
                                                        {tx.status}
                                                    </div>
                                                </td>
                                                <td className="text-sm text-base-content/70">
                                                    {formatDate(tx.created_at)}
                                                </td>
                                                <td className="font-semibold">
                                                    ${((tx.amount * tx.asset_price) || 0).toLocaleString()}
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
        </div>
    );
};

export default Dashboard;
