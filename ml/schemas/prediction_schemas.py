"""
Pydantic schemas for ML service API
"""

from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Any, Union
from pydantic import BaseModel, Field

# Enums
class PredictionType(str, Enum):
    WIN_PROBABILITY = "win_probability"
    SPREAD = "spread" 
    TOTAL_POINTS = "total_points"
    PLAYER_PERFORMANCE = "player_performance"

class ModelType(str, Enum):
    LIGHTGBM = "lightgbm"
    LOGISTIC_REGRESSION = "logistic_regression"
    RANDOM_FOREST = "random_forest"
    ENSEMBLE = "ensemble"

# Feature Models
class ModelFeatures(BaseModel):
    """Game features for ML prediction"""
    # Team-level features
    home_team_elo: float = Field(..., description="Home team Elo rating")
    away_team_elo: float = Field(..., description="Away team Elo rating")
    elo_spread: float = Field(..., description="Difference in Elo ratings")
    
    # Recent form (last 5 games)
    home_team_form: float = Field(..., description="Home team wins in last 5 games")
    away_team_form: float = Field(..., description="Away team wins in last 5 games")
    
    # Rest and travel
    home_team_rest_days: int = Field(..., description="Days since home team's last game")
    away_team_rest_days: int = Field(..., description="Days since away team's last game")
    
    # Season context
    home_team_wins: int = Field(..., description="Home team season wins")
    home_team_losses: int = Field(..., description="Home team season losses")
    away_team_wins: int = Field(..., description="Away team season wins")
    away_team_losses: int = Field(..., description="Away team season losses")
    
    # Advanced metrics (optional)
    home_team_off_rating: Optional[float] = Field(None, description="Home team offensive rating")
    home_team_def_rating: Optional[float] = Field(None, description="Home team defensive rating")
    away_team_off_rating: Optional[float] = Field(None, description="Away team offensive rating")
    away_team_def_rating: Optional[float] = Field(None, description="Away team defensive rating")
    
    # Situational
    is_playoff: bool = Field(False, description="Is playoff game")
    is_back_to_back: bool = Field(False, description="Is back-to-back game for either team")
    venue_advantage: float = Field(0.0, description="Home venue advantage factor")
    
    # Weather (for outdoor sports)
    temperature: Optional[float] = Field(None, description="Temperature in Fahrenheit")
    wind_speed: Optional[float] = Field(None, description="Wind speed in mph")
    precipitation: bool = Field(False, description="Is precipitation expected")
    
    # Injuries/availability
    home_team_injury_impact: float = Field(0.0, description="Injury impact factor (0-1)")
    away_team_injury_impact: float = Field(0.0, description="Injury impact factor (0-1)")

# Request Models
class PredictionRequest(BaseModel):
    """Single game prediction request"""
    game_id: str = Field(..., description="Unique game identifier")
    features: Optional[ModelFeatures] = Field(None, description="Game features for prediction")
    prediction_types: List[PredictionType] = Field(
        default=[PredictionType.WIN_PROBABILITY], 
        description="Types of predictions to generate"
    )
    include_explanation: bool = Field(True, description="Include prediction explanation")

class BatchPredictionRequest(BaseModel):
    """Batch prediction request"""
    game_requests: List[PredictionRequest] = Field(..., description="List of game prediction requests")
    max_concurrent: int = Field(10, description="Maximum concurrent predictions")

# Response Models
class PredictionExplanation(BaseModel):
    """Explanation of prediction reasoning"""
    main_factors: List[str] = Field(..., description="Primary factors influencing prediction")
    supporting_factors: List[str] = Field(default=[], description="Supporting factors")
    risk_factors: List[str] = Field(default=[], description="Risk factors that could affect outcome")
    confidence_reasoning: str = Field(..., description="Explanation of confidence level")
    historical_comparison: Optional[Dict[str, Any]] = Field(None, description="Comparison to similar historical games")

class PredictionResult(BaseModel):
    """Individual prediction result"""
    game_id: str = Field(..., description="Game identifier")
    predictions: Dict[PredictionType, Dict[str, Any]] = Field(..., description="Prediction results by type")
    explanation: Optional[PredictionExplanation] = Field(None, description="Prediction explanation")
    model_info: Dict[str, Any] = Field(..., description="Model metadata")
    confidence: float = Field(..., description="Overall prediction confidence (0-1)")
    created_at: datetime = Field(..., description="Prediction timestamp")

class PredictionResponse(BaseModel):
    """Single prediction API response"""
    game_id: str = Field(..., description="Game identifier")
    predictions: Dict[PredictionType, Dict[str, Any]] = Field(..., description="Prediction results")
    explanation: Optional[PredictionExplanation] = Field(None, description="Prediction explanation")
    model_info: Dict[str, Any] = Field(..., description="Model information")
    confidence: float = Field(..., description="Prediction confidence")
    created_at: datetime = Field(..., description="Response timestamp")

class BatchPredictionResponse(BaseModel):
    """Batch prediction API response"""
    predictions: List[Union[PredictionResult, Dict[str, str]]] = Field(..., description="Batch prediction results")
    total_games: int = Field(..., description="Total games requested")
    successful_predictions: int = Field(..., description="Number of successful predictions")
    batch_id: str = Field(..., description="Batch identifier")

# Model Performance Models
class FeatureImportance(BaseModel):
    """Feature importance information"""
    feature: str = Field(..., description="Feature name")
    importance: float = Field(..., description="Importance score")
    rank: int = Field(..., description="Importance rank")

class ModelPerformance(BaseModel):
    """Model performance metrics"""
    accuracy: float = Field(..., description="Model accuracy")
    log_loss: float = Field(..., description="Logarithmic loss")
    auc_roc: float = Field(..., description="Area under ROC curve")
    calibration_score: float = Field(..., description="Calibration score (1 - Brier score)")
    feature_importance: List[FeatureImportance] = Field(default=[], description="Feature importance ranking")
    last_trained: datetime = Field(..., description="Last training timestamp")
    training_samples: int = Field(..., description="Number of training samples")
    model_version: str = Field(..., description="Model version")

class ModelPerformanceResponse(BaseModel):
    """Model performance API response"""
    accuracy: float = Field(..., description="Model accuracy")
    log_loss: float = Field(..., description="Logarithmic loss")
    auc_roc: float = Field(..., description="Area under ROC curve")
    calibration_score: float = Field(..., description="Calibration score")
    feature_importance: List[FeatureImportance] = Field(..., description="Feature importance")
    last_trained: datetime = Field(..., description="Last training date")
    training_samples: int = Field(..., description="Training sample count")
    model_version: str = Field(..., description="Model version")

class FeatureInfo(BaseModel):
    """Feature information"""
    feature_names: List[str] = Field(..., description="List of feature names")
    feature_importance: List[FeatureImportance] = Field(..., description="Feature importance scores")
    feature_descriptions: Dict[str, str] = Field(..., description="Feature descriptions")

# Health Check Model
class HealthResponse(BaseModel):
    """Health check response"""
    status: str = Field(..., description="Service status")
    version: str = Field(..., description="Service version")
    model_version: Optional[str] = Field(None, description="ML model version")
    services: Dict[str, str] = Field(default={}, description="Dependent service status")
    error: Optional[str] = Field(None, description="Error message if unhealthy")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Health check timestamp")

# Training Models
class TrainingRequest(BaseModel):
    """Model training request"""
    data_source: str = Field(..., description="Training data source")
    model_types: List[ModelType] = Field(default=[ModelType.ENSEMBLE], description="Models to train")
    hyperparameter_tuning: bool = Field(False, description="Enable hyperparameter tuning")
    validation_split: float = Field(0.2, description="Validation data split ratio")
    force_retrain: bool = Field(False, description="Force retrain even if recent model exists")

class TrainingStatus(BaseModel):
    """Training status response"""
    status: str = Field(..., description="Training status")
    progress: float = Field(..., description="Training progress (0-1)")
    current_model: Optional[str] = Field(None, description="Currently training model")
    estimated_completion: Optional[datetime] = Field(None, description="Estimated completion time")
    error: Optional[str] = Field(None, description="Error message if failed")

# Cache Models
class CacheStats(BaseModel):
    """Cache statistics"""
    total_keys: int = Field(..., description="Total cached keys")
    hit_rate: float = Field(..., description="Cache hit rate")
    memory_usage: str = Field(..., description="Memory usage")
    prediction_cache_size: int = Field(..., description="Number of cached predictions")
    last_cleared: Optional[datetime] = Field(None, description="Last cache clear timestamp")

# Error Models
class MLServiceError(BaseModel):
    """ML service error response"""
    error_code: str = Field(..., description="Error code")
    message: str = Field(..., description="Error message")
    details: Optional[Dict[str, Any]] = Field(None, description="Error details")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Error timestamp")