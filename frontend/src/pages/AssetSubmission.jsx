import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useWeb3 } from '../hooks/useWeb3';

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

            // Reset form
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

    const getStatusColor = (status) => {
        const colorMap = {
            'APPROVED': 'var(--color-success)',
            'REJECTED': 'var(--color-error)',
            'UNDER_REVIEW': 'var(--color-warning)',
            'PENDING': 'var(--color-gray)',
        };
        return colorMap[status] || 'var(--color-gray)';
    };

    return (
        <div className="container" style={{ paddingTop: 'var(--spacing-2xl)', paddingBottom: 'var(--spacing-3xl)' }}>
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="hero"
                style={{ paddingTop: 0 }}
            >
                <h1 className="hero-title">
                    Submit Asset for <span style={{ color: 'var(--color-red)' }}>Compliance</span>
                </h1>
                <p className="hero-subtitle">
                    Automated risk assessment powered by Flare's FDC, FTSO, and AI
                </p>
            </motion.div>

            <div style={{ maxWidth: '640px', margin: '0 auto' }}>
                {/* Form */}
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    onSubmit={handleSubmit}
                    className="card"
                >
                    <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
                        {/* Asset Type */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: 600,
                                color: 'var(--color-dark-gray)',
                                marginBottom: 'var(--spacing-xs)',
                            }}>
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
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: 600,
                                color: 'var(--color-dark-gray)',
                                marginBottom: 'var(--spacing-xs)',
                            }}>
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
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: 600,
                                color: 'var(--color-dark-gray)',
                                marginBottom: 'var(--spacing-xs)',
                            }}>
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
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: 600,
                                color: 'var(--color-dark-gray)',
                                marginBottom: 'var(--spacing-xs)',
                            }}>
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
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: 600,
                                color: 'var(--color-dark-gray)',
                                marginBottom: 'var(--spacing-xs)',
                            }}>
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
                                    style={{
                                        padding: 'var(--spacing-md)',
                                        background: 'rgba(255, 59, 48, 0.1)',
                                        borderRadius: 'var(--radius-lg)',
                                        color: 'var(--color-error)',
                                        fontSize: 'var(--font-size-sm)',
                                    }}
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Submit Button */}
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="submit"
                            disabled={isSubmitting || !isConnected || !isCorrectNetwork}
                            className="btn btn-primary btn-large"
                            style={{ width: '100%', marginTop: 'var(--spacing-sm)' }}
                        >
                            {isSubmitting ? 'Analyzing...' : 'Submit for Compliance Check'}
                        </motion.button>
                    </div>
                </motion.form>

                {/* Result Card */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="card"
                            style={{ marginTop: 'var(--spacing-xl)' }}
                        >
                            <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
                                <h3 style={{
                                    fontSize: 'var(--font-size-2xl)',
                                    fontWeight: 700,
                                    marginBottom: 'var(--spacing-md)',
                                    color: 'var(--color-dark-gray)',
                                }}>
                                    Compliance Result
                                </h3>
                                <div style={{
                                    fontSize: 'var(--font-size-3xl)',
                                    fontWeight: 700,
                                    color: getStatusColor(result.status),
                                    marginBottom: 'var(--spacing-sm)',
                                }}>
                                    {result.status.replace('_', ' ')}
                                </div>
                                <div style={{
                                    fontSize: 'var(--font-size-sm)',
                                    color: 'var(--color-gray)',
                                }}>
                                    Record #{result.id}
                                </div>
                            </div>

                            <div style={{
                                display: 'grid',
                                gap: 'var(--spacing-md)',
                                padding: 'var(--spacing-lg)',
                                background: 'var(--color-off-white)',
                                borderRadius: 'var(--radius-lg)',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--color-gray)', fontSize: 'var(--font-size-sm)' }}>
                                        Risk Score
                                    </span>
                                    <span style={{
                                        fontWeight: 700,
                                        fontSize: 'var(--font-size-lg)',
                                        color: result.risk_score < 30 ? 'var(--color-success)' :
                                            result.risk_score < 60 ? 'var(--color-warning)' :
                                                'var(--color-error)',
                                    }}>
                                        {result.risk_score}/100
                                    </span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--color-gray)', fontSize: 'var(--font-size-sm)' }}>
                                        FDC Verified
                                    </span>
                                    <span style={{
                                        fontWeight: 600,
                                        color: result.fdc_verified ? 'var(--color-success)' : 'var(--color-error)',
                                    }}>
                                        {result.fdc_verified ? '✓ Yes' : '✗ No'}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--color-gray)', fontSize: 'var(--font-size-sm)' }}>
                                        Asset Price
                                    </span>
                                    <span style={{ fontWeight: 600 }}>
                                        ${result.asset_price?.toFixed(2)}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--color-gray)', fontSize: 'var(--font-size-sm)' }}>
                                        Volatility
                                    </span>
                                    <span style={{ fontWeight: 600 }}>
                                        {(result.volatility * 100)?.toFixed(1)}%
                                    </span>
                                </div>
                            </div>

                            <div style={{
                                marginTop: 'var(--spacing-lg)',
                                padding: 'var(--spacing-md)',
                                background: 'var(--color-red-light)',
                                borderRadius: 'var(--radius-lg)',
                            }}>
                                <p style={{
                                    fontSize: 'var(--font-size-sm)',
                                    color: 'var(--color-medium-gray)',
                                    lineHeight: 1.6,
                                }}>
                                    <strong>Recommendation:</strong> {result.recommendation}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AssetSubmission;
