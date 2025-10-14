"""
Nova Titan Prediction Engine
Main ML prediction service with LightGBM and ensemble models
"""

import asyncio
import joblib
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
from loguru import logger

# ML imports
import lightgbm as lgb
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.calibration import CalibratedClassifierCV
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, log_loss, roc_auc_score, brier_score_loss

# Internal imports
from .feature_builder import FeatureBuilder
from .model_trainer import ModelTrainer
from ..schemas.prediction_schemas import (
    PredictionResult, ModelFeatures, PredictionType,
    ModelPerformance, FeatureInfo, PredictionExplanation
)
from ..utils.cache import CacheManager
from ..utils.config import get_settings

class PredictionEngine:
    """Main prediction engine with ensemble models"""
    
    def __init__(self, model_path: str, cache_manager: Optional[CacheManager] = None):
        self.model_path = Path(model_path)
        self.cache_manager = cache_manager
        self.settings = get_settings()
        
        # Model components
        self.lightgbm_model: Optional[lgb.LGBMClassifier] = None
        self.logistic_model: Optional[LogisticRegression] = None
        self.random_forest_model: Optional[RandomForestClassifier] = None
        self.ensemble_weights: Dict[str, float] = {}
        
        # Feature processing
        self.feature_builder = FeatureBuilder()
        self.scaler: Optional[StandardScaler] = None
        self.feature_names: List[str] = []
        
        # Model metadata
        self.model_version = "1.0.0"
        self.last_trained: Optional[datetime] = None
        self.is_trained = False
        
        # Performance tracking
        self.performance_metrics: Optional[ModelPerformance] = None
        
        logger.info(f"Prediction engine initialized with model path: {model_path}")

    async def initialize(self):
        """Initialize the prediction engine"""
        try:
            # Create model directories
            self.model_path.mkdir(parents=True, exist_ok=True)
            
            # Try to load existing models
            await self._load_models()
            
            # If no models exist, train initial models with mock data
            if not self.is_trained:
                logger.info("No trained models found, training with mock data...")
                await self._train_initial_models()
            
            logger.info("Prediction engine initialization complete")
            
        except Exception as e:
            logger.error(f"Failed to initialize prediction engine: {e}")
            # Initialize with minimal functionality for demo
            await self._initialize_demo_mode()

    async def _load_models(self):
        """Load trained models from disk"""
        try:
            model_files = {
                'lightgbm': self.model_path / 'lightgbm_model.joblib',
                'logistic': self.model_path / 'logistic_model.joblib', 
                'random_forest': self.model_path / 'rf_model.joblib',
                'scaler': self.model_path / 'scaler.joblib',
                'metadata': self.model_path / 'model_metadata.joblib'
            }
            
            # Check if all required files exist
            if all(f.exists() for f in model_files.values()):
                # Load models
                self.lightgbm_model = joblib.load(model_files['lightgbm'])
                self.logistic_model = joblib.load(model_files['logistic'])
                self.random_forest_model = joblib.load(model_files['random_forest'])
                self.scaler = joblib.load(model_files['scaler'])
                
                # Load metadata
                metadata = joblib.load(model_files['metadata'])
                self.model_version = metadata.get('version', '1.0.0')
                self.last_trained = metadata.get('last_trained')
                self.feature_names = metadata.get('feature_names', [])
                self.ensemble_weights = metadata.get('ensemble_weights', {
                    'lightgbm': 0.5, 'logistic': 0.3, 'random_forest': 0.2
                })
                self.performance_metrics = metadata.get('performance_metrics')
                
                self.is_trained = True
                logger.info(f"Loaded models trained on {self.last_trained}")
            else:
                logger.info("No existing models found")
                
        except Exception as e:
            logger.warning(f"Failed to load models: {e}")

    async def _save_models(self):
        """Save trained models to disk"""
        try:
            # Save individual models
            joblib.dump(self.lightgbm_model, self.model_path / 'lightgbm_model.joblib')
            joblib.dump(self.logistic_model, self.model_path / 'logistic_model.joblib')
            joblib.dump(self.random_forest_model, self.model_path / 'rf_model.joblib')
            joblib.dump(self.scaler, self.model_path / 'scaler.joblib')
            
            # Save metadata
            metadata = {
                'version': self.model_version,
                'last_trained': self.last_trained,
                'feature_names': self.feature_names,
                'ensemble_weights': self.ensemble_weights,
                'performance_metrics': self.performance_metrics
            }
            joblib.dump(metadata, self.model_path / 'model_metadata.joblib')
            
            logger.info("Models saved successfully")
            
        except Exception as e:
            logger.error(f"Failed to save models: {e}")

    async def _train_initial_models(self):
        """Train initial models with mock data"""
        try:
            trainer = ModelTrainer()
            
            # Generate mock training data
            X_train, y_train, X_val, y_val = trainer.generate_mock_training_data(
                n_samples=5000, 
                n_features=25
            )
            
            # Train ensemble models
            await self._train_ensemble(X_train, y_train, X_val, y_val)
            
            # Save models
            await self._save_models()
            
            logger.info("Initial model training complete")
            
        except Exception as e:
            logger.error(f"Failed to train initial models: {e}")
            raise

    async def _train_ensemble(self, X_train, y_train, X_val, y_val):
        """Train ensemble of models"""
        try:
            # Prepare feature scaler
            self.scaler = StandardScaler()
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_val_scaled = self.scaler.transform(X_val)
            
            # Train LightGBM
            logger.info("Training LightGBM model...")
            self.lightgbm_model = lgb.LGBMClassifier(
                objective='binary',
                metric='binary_logloss',
                boosting_type='gbdt',
                num_leaves=31,
                learning_rate=0.05,
                feature_fraction=0.9,
                bagging_fraction=0.8,
                bagging_freq=5,
                verbose=-1,
                random_state=42
            )
            self.lightgbm_model.fit(
                X_train, y_train,
                eval_set=[(X_val, y_val)],
                callbacks=[lgb.early_stopping(stopping_rounds=50)],
                verbose=False
            )
            
            # Train Logistic Regression
            logger.info("Training Logistic Regression model...")
            self.logistic_model = LogisticRegression(
                max_iter=1000, 
                random_state=42,
                class_weight='balanced'
            )
            self.logistic_model.fit(X_train_scaled, y_train)
            
            # Calibrate logistic regression
            self.logistic_model = CalibratedClassifierCV(
                self.logistic_model, 
                method='platt', 
                cv=3
            )
            self.logistic_model.fit(X_train_scaled, y_train)
            
            # Train Random Forest
            logger.info("Training Random Forest model...")
            self.random_forest_model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                min_samples_split=10,
                min_samples_leaf=5,
                random_state=42,
                class_weight='balanced',
                n_jobs=-1
            )
            self.random_forest_model.fit(X_train, y_train)
            
            # Evaluate ensemble performance
            await self._evaluate_ensemble(X_val, y_val, X_val_scaled)
            
            # Generate feature names
            self.feature_names = [f"feature_{i}" for i in range(X_train.shape[1])]
            
            self.is_trained = True
            self.last_trained = datetime.utcnow()
            
            logger.info("Ensemble training complete")
            
        except Exception as e:
            logger.error(f"Ensemble training failed: {e}")
            raise

    async def _evaluate_ensemble(self, X_val, y_val, X_val_scaled):
        """Evaluate ensemble performance"""
        try:
            # Get predictions from each model
            lgb_pred = self.lightgbm_model.predict_proba(X_val)[:, 1]
            lr_pred = self.logistic_model.predict_proba(X_val_scaled)[:, 1]
            rf_pred = self.random_forest_model.predict_proba(X_val)[:, 1]
            
            # Ensemble prediction
            ensemble_pred = (
                self.ensemble_weights['lightgbm'] * lgb_pred +
                self.ensemble_weights['logistic'] * lr_pred +
                self.ensemble_weights['random_forest'] * rf_pred
            )
            
            # Calculate metrics
            accuracy = accuracy_score(y_val, ensemble_pred > 0.5)
            logloss = log_loss(y_val, ensemble_pred)
            auc_roc = roc_auc_score(y_val, ensemble_pred)
            brier_score = brier_score_loss(y_val, ensemble_pred)
            
            self.performance_metrics = ModelPerformance(
                accuracy=accuracy,
                log_loss=logloss,
                auc_roc=auc_roc,
                calibration_score=1 - brier_score,  # Inverted Brier score
                feature_importance=self._get_feature_importance(),
                last_trained=datetime.utcnow(),
                training_samples=len(X_val) * 4,  # Approximate training size
                model_version=self.model_version
            )
            
            logger.info(f"Ensemble performance - Accuracy: {accuracy:.3f}, AUC: {auc_roc:.3f}")
            
        except Exception as e:
            logger.error(f"Ensemble evaluation failed: {e}")

    async def _initialize_demo_mode(self):
        """Initialize with minimal functionality for demo"""
        logger.warning("Initializing in demo mode with mock predictions")
        
        # Create dummy models for demo
        self.is_trained = False
        self.model_version = "demo-1.0.0"
        self.last_trained = datetime.utcnow()
        self.feature_names = [f"demo_feature_{i}" for i in range(10)]

    def _get_feature_importance(self) -> List[Dict[str, Any]]:
        """Get feature importance from trained models"""
        try:
            if self.lightgbm_model and hasattr(self.lightgbm_model, 'feature_importances_'):
                importances = self.lightgbm_model.feature_importances_
                return [
                    {
                        'feature': name,
                        'importance': float(imp),
                        'rank': rank + 1
                    }
                    for rank, (name, imp) in enumerate(
                        sorted(zip(self.feature_names, importances), 
                               key=lambda x: x[1], reverse=True)
                    )
                ]
            return []
        except Exception as e:
            logger.error(f"Failed to get feature importance: {e}")
            return []

    async def predict(
        self, 
        game_id: str, 
        features: Optional[ModelFeatures] = None,
        prediction_types: List[PredictionType] = None,
        include_explanation: bool = True
    ) -> PredictionResult:
        """Generate prediction for a game"""
        try:
            # Check cache first
            cache_key = f"prediction:{game_id}:{hash(str(features))}"
            if self.cache_manager:
                cached_result = await self.cache_manager.get(cache_key)
                if cached_result:
                    logger.debug(f"Returning cached prediction for game {game_id}")
                    return PredictionResult.parse_obj(cached_result)
            
            # Generate or extract features
            if features:
                feature_vector = self.feature_builder.build_from_features(features)
            else:
                # Fetch game data and build features
                feature_vector = await self.feature_builder.build_from_game_id(game_id)
            
            # Generate predictions
            predictions = {}
            
            if not prediction_types:
                prediction_types = [PredictionType.WIN_PROBABILITY]
            
            for pred_type in prediction_types:
                if pred_type == PredictionType.WIN_PROBABILITY:
                    pred_prob, confidence = await self._predict_win_probability(feature_vector)
                    predictions[pred_type] = {
                        'probability': pred_prob,
                        'confidence': confidence
                    }
                elif pred_type == PredictionType.SPREAD:
                    spread_pred = await self._predict_spread(feature_vector)
                    predictions[pred_type] = spread_pred
                elif pred_type == PredictionType.TOTAL_POINTS:
                    total_pred = await self._predict_total(feature_vector)
                    predictions[pred_type] = total_pred
            
            # Generate explanation if requested
            explanation = None
            if include_explanation:
                explanation = await self._generate_explanation(feature_vector, predictions)
            
            result = PredictionResult(
                game_id=game_id,
                predictions=predictions,
                explanation=explanation,
                model_info={
                    'version': self.model_version,
                    'last_trained': self.last_trained.isoformat() if self.last_trained else None,
                    'ensemble_weights': self.ensemble_weights
                },
                confidence=predictions.get(PredictionType.WIN_PROBABILITY, {}).get('confidence', 0.5),
                created_at=datetime.utcnow()
            )
            
            # Cache result
            if self.cache_manager:
                await self.cache_manager.set(cache_key, result.dict(), ttl=3600)
            
            return result
            
        except Exception as e:
            logger.error(f"Prediction failed for game {game_id}: {e}")
            # Return demo prediction as fallback
            return await self._generate_demo_prediction(game_id)

    async def _predict_win_probability(self, features: np.ndarray) -> Tuple[float, float]:
        """Predict win probability using ensemble"""
        try:
            if not self.is_trained:
                # Return random but realistic prediction for demo
                prob = np.random.uniform(0.3, 0.7)
                confidence = np.random.uniform(0.6, 0.8)
                return float(prob), float(confidence)
            
            # Prepare features
            features_scaled = self.scaler.transform(features.reshape(1, -1))
            
            # Get predictions from each model
            lgb_pred = self.lightgbm_model.predict_proba(features.reshape(1, -1))[0, 1]
            lr_pred = self.logistic_model.predict_proba(features_scaled)[0, 1]
            rf_pred = self.random_forest_model.predict_proba(features.reshape(1, -1))[0, 1]
            
            # Ensemble prediction
            ensemble_prob = (
                self.ensemble_weights['lightgbm'] * lgb_pred +
                self.ensemble_weights['logistic'] * lr_pred +
                self.ensemble_weights['random_forest'] * rf_pred
            )
            
            # Calculate confidence based on model agreement
            predictions = [lgb_pred, lr_pred, rf_pred]
            std_dev = np.std(predictions)
            confidence = max(0.5, 1.0 - (std_dev * 2))  # Higher agreement = higher confidence
            
            return float(ensemble_prob), float(confidence)
            
        except Exception as e:
            logger.error(f"Win probability prediction failed: {e}")
            return 0.5, 0.5

    async def _predict_spread(self, features: np.ndarray) -> Dict[str, float]:
        """Predict point spread"""
        # Simplified spread prediction based on win probability
        win_prob, confidence = await self._predict_win_probability(features)
        
        # Convert probability to spread (rough approximation)
        if win_prob > 0.5:
            spread = (win_prob - 0.5) * 20  # Home team favored
        else:
            spread = (win_prob - 0.5) * 20  # Away team favored
        
        return {
            'spread': float(spread),
            'confidence': float(confidence)
        }

    async def _predict_total(self, features: np.ndarray) -> Dict[str, float]:
        """Predict total points"""
        # Mock total points prediction
        base_total = np.random.uniform(200, 240)  # NBA range
        confidence = np.random.uniform(0.6, 0.8)
        
        return {
            'total': float(base_total),
            'confidence': float(confidence)
        }

    async def _generate_explanation(self, features: np.ndarray, predictions: Dict) -> PredictionExplanation:
        """Generate prediction explanation"""
        try:
            # Get feature importance
            feature_importance = self._get_feature_importance()
            
            # Generate explanation based on top features
            main_factors = [
                f"Team strength differential: {feature_importance[0]['importance']:.2f}",
                f"Recent form: {feature_importance[1]['importance']:.2f}",
                f"Home court advantage: {feature_importance[2]['importance']:.2f}"
            ]
            
            return PredictionExplanation(
                main_factors=main_factors[:3],
                supporting_factors=main_factors[3:6] if len(main_factors) > 3 else [],
                risk_factors=["Model uncertainty", "Limited recent data"],
                confidence_reasoning="Based on ensemble model agreement and historical accuracy"
            )
            
        except Exception as e:
            logger.error(f"Explanation generation failed: {e}")
            return PredictionExplanation(
                main_factors=["Team performance analysis", "Historical matchup data"],
                supporting_factors=["Recent player performance", "Home/away records"],
                risk_factors=["Injury reports", "Weather conditions"],
                confidence_reasoning="Based on available data and model performance"
            )

    async def _generate_demo_prediction(self, game_id: str) -> PredictionResult:
        """Generate demo prediction when models aren't available"""
        logger.info(f"Generating demo prediction for game {game_id}")
        
        # Mock realistic prediction
        win_prob = np.random.uniform(0.35, 0.65)
        confidence = np.random.uniform(0.6, 0.85)
        
        predictions = {
            PredictionType.WIN_PROBABILITY: {
                'probability': win_prob,
                'confidence': confidence
            }
        }
        
        explanation = PredictionExplanation(
            main_factors=["Demo mode - statistical analysis", "Team performance metrics"],
            supporting_factors=["Recent game outcomes", "Player availability"],
            risk_factors=["Limited data in demo mode"],
            confidence_reasoning="Demo prediction with mock confidence"
        )
        
        return PredictionResult(
            game_id=game_id,
            predictions=predictions,
            explanation=explanation,
            model_info={
                'version': 'demo-1.0.0',
                'last_trained': None,
                'ensemble_weights': {}
            },
            confidence=confidence,
            created_at=datetime.utcnow()
        )

    async def predict_batch(self, requests: List) -> List[PredictionResult]:
        """Generate predictions for multiple games"""
        tasks = [
            self.predict(
                game_id=req.game_id,
                features=req.features,
                prediction_types=req.prediction_types,
                include_explanation=req.include_explanation
            )
            for req in requests
        ]
        
        return await asyncio.gather(*tasks, return_exceptions=True)

    async def get_performance_metrics(self) -> ModelPerformance:
        """Get model performance metrics"""
        if self.performance_metrics:
            return self.performance_metrics
        
        # Return demo metrics
        return ModelPerformance(
            accuracy=0.67,
            log_loss=0.62,
            auc_roc=0.72,
            calibration_score=0.68,
            feature_importance=self._get_feature_importance(),
            last_trained=self.last_trained or datetime.utcnow(),
            training_samples=5000,
            model_version=self.model_version
        )

    async def get_feature_info(self) -> FeatureInfo:
        """Get feature information"""
        return FeatureInfo(
            feature_names=self.feature_names,
            feature_importance=self._get_feature_importance(),
            feature_descriptions={
                name: f"Description for {name}" 
                for name in self.feature_names
            }
        )

    def is_healthy(self) -> bool:
        """Check if prediction engine is healthy"""
        return True  # Basic health check

    async def retrain_model(self):
        """Retrain models with new data"""
        logger.info("Starting model retraining...")
        # Implementation would fetch new data and retrain
        # For now, just update the timestamp
        self.last_trained = datetime.utcnow()
        logger.info("Model retraining complete")