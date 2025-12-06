import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.neural_network import MLPClassifier
import xgboost as xgb
from typing import Dict, List, Tuple
import joblib
import os
from datetime import datetime

from app.utils.logger import logger
from app.utils.config import get_settings

settings = get_settings()


class FeatureEngineer:
    """Advanced feature engineering for risk prediction"""
    
    @staticmethod
    def create_features(data: Dict) -> np.ndarray:
        """Create feature vector from input data"""
        
        features = []
        
        # Basic features
        features.append(data['amount'])
        features.append(data['price'])
        features.append(data['volatility'])
        features.append(1 if data['fdc_verified'] else 0)
        features.append(data['user_history'])
        
        # Derived features
        transaction_value = data['amount'] * data['price']
        features.append(transaction_value)
        
        # Volatility risk (higher volatility = higher risk)
        volatility_risk = min(data['volatility'] / 100.0, 1.0)
        features.append(volatility_risk)
        
        # User trust score (more history = more trust)
        user_trust = min(data['user_history'] / 100.0, 1.0)
        features.append(user_trust)
        
        # FDC weight
        fdc_weight = 0.8 if data['fdc_verified'] else 0.2
        features.append(fdc_weight)
        
        # Transaction size risk (very large or very small = higher risk)
        if transaction_value < 1000:
            size_risk = 0.3
        elif transaction_value > 100000:
            size_risk = 0.7
        else:
            size_risk = 0.1
        features.append(size_risk)
        
        return np.array(features).reshape(1, -1)


class EnsembleRiskModel:
    """Ensemble model combining multiple ML algorithms"""
    
    def __init__(self):
        self.model = None
        self.feature_engineer = FeatureEngineer()
        self.version = settings.model_version
        self.trained_at = None
        self.accuracy = None
        
    def build_model(self) -> VotingClassifier:
        """Build ensemble model"""
        
        # Random Forest
        rf = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=5,
            random_state=42,
            n_jobs=-1
        )
        
        # XGBoost
        xgb_model = xgb.XGBClassifier(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            random_state=42,
            n_jobs=-1
        )
        
        # Neural Network
        nn = MLPClassifier(
            hidden_layer_sizes=(64, 32),
            activation='relu',
            solver='adam',
            max_iter=500,
            random_state=42
        )
        
        # Voting Ensemble
        ensemble = VotingClassifier(
            estimators=[
                ('rf', rf),
                ('xgb', xgb_model),
                ('nn', nn)
            ],
            voting='soft',  # Use probability voting
            n_jobs=-1
        )
        
        return ensemble
    
    def train(self, X: np.ndarray, y: np.ndarray):
        """Train the ensemble model"""
        
        logger.info("Training ensemble model...")
        
        self.model = self.build_model()
        self.model.fit(X, y)
        self.trained_at = datetime.utcnow().isoformat()
        
        # Calculate training accuracy
        self.accuracy = self.model.score(X, y)
        
        logger.info(f"Model trained with accuracy: {self.accuracy:.4f}")
        
        return self
    
    def predict_risk_score(self, data: Dict) -> Tuple[int, float, List[str]]:
        """
        Predict risk score from input data
        
        Returns:
            risk_score: int (0-100)
            confidence: float (0-1)
            factors: List[str]
        """
        
        # Create features
        features = self.feature_engineer.create_features(data)
        
        # Get prediction probabilities
        if self.model is None:
            # Fallback to rule-based if model not loaded
            return self._rule_based_prediction(data)
        
        try:
            # Predict probabilities [low_risk, medium_risk, high_risk]
            proba = self.model.predict_proba(features)[0]
            
            # Calculate risk score (0-100)
            # Weighted average: low=0, medium=50, high=100
            risk_score = int(proba[0] * 0 + proba[1] * 50 + proba[2] * 100)
            
            # Confidence is the max probability
            confidence = float(max(proba))
            
            # Determine risk factors
            factors = self._analyze_factors(data, risk_score)
            
            return risk_score, confidence, factors
            
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return self._rule_based_prediction(data)
    
    def _rule_based_prediction(self, data: Dict) -> Tuple[int, float, List[str]]:
        """Fallback rule-based prediction"""
        
        risk_score = 50  # Start at medium
        factors = []
        
        # FDC verification
        if not data['fdc_verified']:
            risk_score += 30
            factors.append("FDC verification failed")
        else:
            risk_score -= 10
            factors.append("FDC verified")
        
        # Volatility
        if data['volatility'] > 20:
            risk_score += 15
            factors.append("High volatility")
        elif data['volatility'] < 5:
            risk_score -= 10
            factors.append("Low volatility")
        
        # User history
        if data['user_history'] > 10:
            risk_score -= 15
            factors.append("Good user history")
        elif data['user_history'] == 0:
            risk_score += 10
            factors.append("New user")
        
        # Transaction size
        tx_value = data['amount'] * data['price']
        if tx_value > 100000:
            risk_score += 10
            factors.append("Large transaction")
        
        # Clamp to 0-100
        risk_score = max(0, min(100, risk_score))
        
        return risk_score, 0.7, factors
    
    def _analyze_factors(self, data: Dict, risk_score: int) -> List[str]:
        """Analyze and return risk factors"""
        
        factors = []
        
        if data['fdc_verified']:
            factors.append("FDC verified")
        else:
            factors.append("FDC verification failed")
        
        if data['volatility'] < 10:
            factors.append("Low volatility")
        elif data['volatility'] > 20:
            factors.append("High volatility")
        
        if data['user_history'] > 10:
            factors.append("Good user history")
        elif data['user_history'] == 0:
            factors.append("New user")
        
        tx_value = data['amount'] * data['price']
        if tx_value > 100000:
            factors.append("Large transaction value")
        elif tx_value < 1000:
            factors.append("Small transaction value")
        
        return factors
    
    def save(self, path: str = None):
        """Save model to disk"""
        
        if path is None:
            path = os.path.join(settings.model_path, f"ensemble_{self.version}.pkl")
        
        os.makedirs(os.path.dirname(path), exist_ok=True)
        
        joblib.dump({
            'model': self.model,
            'version': self.version,
            'trained_at': self.trained_at,
            'accuracy': self.accuracy
        }, path)
        
        logger.info(f"Model saved to {path}")
    
    def load(self, path: str = None):
        """Load model from disk"""
        
        if path is None:
            path = os.path.join(settings.model_path, f"ensemble_{self.version}.pkl")
        
        if not os.path.exists(path):
            logger.warning(f"Model file not found: {path}")
            return self
        
        data = joblib.load(path)
        self.model = data['model']
        self.version = data['version']
        self.trained_at = data['trained_at']
        self.accuracy = data['accuracy']
        
        logger.info(f"Model loaded from {path} (accuracy: {self.accuracy:.4f})")
        
        return self
    
    def get_recommendation(self, risk_score: int) -> str:
        """Get recommendation based on risk score"""
        
        if risk_score < settings.low_risk_threshold:
            return "APPROVE"
        elif risk_score >= settings.high_risk_threshold:
            return "REJECT"
        else:
            return "REVIEW"
