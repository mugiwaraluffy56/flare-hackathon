import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useWeb3 } from '../hooks/useWeb3';
import { useWebSocket } from '../hooks/useWebSocket';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const AssetSubmission = () => {
    const { account, isConnected, isCorrectNetwork } = useWeb3();
    const [formData, setFormData] = useState({
        assetType: 'BTC',
        amount: '',
        txHash: '',
        sourceChain: 'BTC',
        blockNumber: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const assetOptions = ['BTC', 'ETH', 'XRP', 'FLR', 'USDT', 'USDC'];
    const chainOptions = ['BTC', 'ETH', 'XRP', 'DOGE', 'LTC'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isConnected || !isCorrectNetwork) {
            setError('Please connect your wallet to Coston2 network');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setResult(null);

        try {
            const response = await axios.post(`${API_URL}/submit-asset`, {
                ...formData,
                amount: parseFloat(formData.amount),
                blockNumber: parseInt(formData.blockNumber),
                userAddress: account,
            });

            setResult(response.data);

            // Reset form on success
            setFormData({
                assetType: 'BTC',
                amount: '',
                txHash: '',
                sourceChain: 'BTC',
                blockNumber: '',
            });
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit asset');
        } finally {
            setIsSubmitting(false);
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

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="text-center mb-xl">
                    <h2 className="text-4xl font-extrabold mb-md">
                        Submit Asset for <span className="text-red">Compliance Check</span>
                    </h2>
                    <p className="text-lg text-gray-300">
                        Automated risk assessment powered by Flare's FDC, FTSO, and AI
                    </p>
                </div>

                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '2rem' }}>
                        {/* Asset Type */}
                        <div className="mb-lg">
                            <label className="text-sm font-semibold text-gray-200 mb-sm" style={{ display: 'block' }}>
                                Asset Type
                            </label>
                            <select
                                name="assetType"
                                value={formData.assetType}
                                onChange={handleChange}
                                className="input"
                                required
                            >
                                {assetOptions.map(asset => (
                                    <option key={asset} value={asset}>{asset}</option>
                                ))}
                            </select>
                        </div>

                        {/* Amount */}
                        <div className="mb-lg">
                            <label className="text-sm font-semibold text-gray-200 mb-sm" style={{ display: 'block' }}>
                                Amount
                            </label>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                placeholder="0.00"
                                step="0.000001"
                                className="input"
                                required
                            />
                        </div>

                        {/* Source Chain */}
                        <div className="mb-lg">
                            <label className="text-sm font-semibold text-gray-200 mb-sm" style={{ display: 'block' }}>
                                Source Chain
                            </label>
                            <select
                                name="sourceChain"
                                value={formData.sourceChain}
                                onChange={handleChange}
                                className="input"
                                required
                            >
                                {chainOptions.map(chain => (
                                    <option key={chain} value={chain}>{chain}</option>
                                ))}
                            </select>
                        </div>

                        {/* Transaction Hash */}
                        <div className="mb-lg">
                            <label className="text-sm font-semibold text-gray-200 mb-sm" style={{ display: 'block' }}>
                                Transaction Hash
                            </label>
                            <input
                                type="text"
                                name="txHash"
                                value={formData.txHash}
                                onChange={handleChange}
                                placeholder="0x..."
                                className="input"
                                required
                            />
                        </div>

                        {/* Block Number */}
                        <div className="mb-lg">
                            <label className="text-sm font-semibold text-gray-200 mb-sm" style={{ display: 'block' }}>
                                Block Number
                            </label>
                            <input
                                type="number"
                                name="blockNumber"
                                value={formData.blockNumber}
                                onChange={handleChange}
                                placeholder="123456"
                                className="input"
                                required
                            />
                        </div>

                        {/* Error Message */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-lg"
                                    style={{
                                        padding: '1rem',
                                        background: 'rgba(255, 59, 48, 0.1)',
                                        border: '1px solid rgba(255, 59, 48, 0.3)',
                                        borderRadius: 'var(--radius-md)',
                                        color: 'var(--color-error)',
                                    }}
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Submit Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isSubmitting || !isConnected || !isCorrectNetwork}
                            className="btn btn-primary"
                            style={{ width: '100%', fontSize: 'var(--font-size-lg)' }}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-sm">
                                    <span className="animate-pulse">●</span> Analyzing...
                                </span>
                            ) : (
                                'Submit for Compliance Check'
                            )}
                        </motion.button>
                    </form>

                    {/* Result Card */}
                    <AnimatePresence>
                        {result && (
                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                className="glass-card mt-xl animate-glow"
                                style={{ padding: '2rem' }}
                            >
                                <div className="text-center mb-lg">
                                    <h3 className="text-2xl font-bold mb-md">Compliance Result</h3>
                                    <span className={`badge ${getStatusBadge(result.status)}`} style={{ fontSize: 'var(--font-size-base)', padding: '0.5rem 1.5rem' }}>
                                        {result.status}
                                    </span>
                                </div>

                                <div className="grid" style={{ gap: '1rem' }}>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Record ID</span>
                                        <span className="font-semibold">#{result.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Risk Score</span>
                                        <span className="font-semibold text-red">{result.risk_score}/100</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">FDC Verified</span>
                                        <span className={result.fdc_verified ? 'text-green' : 'text-red'}>
                                            {result.fdc_verified ? '✓ Yes' : '✗ No'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Asset Price</span>
                                        <span className="font-semibold">${result.asset_price?.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Volatility</span>
                                        <span className="font-semibold">{(result.volatility * 100)?.toFixed(1)}%</span>
                                    </div>
                                </div>

                                <div className="mt-lg" style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--radius-md)' }}>
                                    <p className="text-sm text-gray-300">
                                        <strong>Recommendation:</strong> {result.recommendation}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default AssetSubmission;
