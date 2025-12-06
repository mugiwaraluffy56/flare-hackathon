const express = require('express');
const cors = require('cors');
const { analyzeRisk } = require('./risk_engine');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'FACE AI Risk Engine',
        timestamp: new Date().toISOString()
    });
});

// Risk analysis endpoint
app.post('/analyze', async (req, res) => {
    try {
        const {
            assetType,
            amount,
            price,
            volatility,
            fdcVerified,
            userHistory
        } = req.body;

        // Validate input
        if (!assetType || amount === undefined || price === undefined) {
            return res.status(400).json({
                error: 'Missing required fields: assetType, amount, price'
            });
        }

        // Perform risk analysis
        const result = analyzeRisk({
            assetType,
            amount,
            price,
            volatility: volatility || 0,
            fdcVerified: fdcVerified !== false,
            userHistory: userHistory || 0
        });

        res.json(result);
    } catch (error) {
        console.error('Risk analysis error:', error);
        res.status(500).json({
            error: 'Risk analysis failed',
            message: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🤖 AI Risk Engine running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
