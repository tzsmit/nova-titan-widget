"""
Nova Titan ML Service
AI-powered sports prediction engine
"""

import os
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import uvicorn
from loguru import logger

# Import our ML modules
from models.prediction_engine import PredictionEngine
from models.feature_builder import FeatureBuilder  
from models.model_trainer import ModelTrainer
from utils.cache import CacheManager
from utils.config import get_settings
from schemas.prediction_schemas import (
    PredictionRequest, 
    PredictionResponse,
    BatchPredictionRequest,
    BatchPredictionResponse,
    ModelPerformanceResponse,
    HealthResponse
)

# Global variables
prediction_engine: Optional[PredictionEngine] = None
cache_manager: Optional[CacheManager] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    global prediction_engine, cache_manager
    
    try:
        logger.info("Starting Nova Titan ML Service...")
        
        settings = get_settings()
        
        # Initialize cache
        cache_manager = CacheManager(settings.REDIS_URL)
        await cache_manager.initialize()
        logger.info("Cache manager initialized")
        
        # Initialize prediction engine
        prediction_engine = PredictionEngine(
            model_path=settings.MODEL_PATH,
            cache_manager=cache_manager
        )
        await prediction_engine.initialize()
        logger.info("Prediction engine initialized")
        
        logger.info("ML Service startup complete")
        yield
        
    except Exception as e:
        logger.error(f"Startup error: {e}")
        raise
    finally:
        logger.info("Shutting down ML Service...")
        if cache_manager:
            await cache_manager.close()

# Create FastAPI app
app = FastAPI(
    title="Nova Titan ML Service",
    description="AI-powered sports prediction engine with LightGBM and ensemble models",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_prediction_engine() -> PredictionEngine:
    """Dependency to get prediction engine"""
    if prediction_engine is None:
        raise HTTPException(status_code=503, detail="Prediction engine not initialized")
    return prediction_engine

def get_cache_manager() -> CacheManager:
    """Dependency to get cache manager"""
    if cache_manager is None:
        raise HTTPException(status_code=503, detail="Cache manager not initialized")
    return cache_manager

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    try:
        engine_status = "up" if prediction_engine and prediction_engine.is_healthy() else "down"
        cache_status = "up" if cache_manager and await cache_manager.is_healthy() else "down"
        
        overall_status = "healthy" if engine_status == "up" and cache_status == "up" else "degraded"
        
        return HealthResponse(
            status=overall_status,
            version="1.0.0",
            model_version=prediction_engine.model_version if prediction_engine else "unknown",
            services={
                "prediction_engine": engine_status,
                "cache": cache_status
            }
        )
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return HealthResponse(
            status="unhealthy",
            version="1.0.0",
            error=str(e)
        )

@app.post("/predict", response_model=PredictionResponse)
async def predict_game(
    request: PredictionRequest,
    engine: PredictionEngine = Depends(get_prediction_engine)
):
    """Generate prediction for a single game"""
    try:
        logger.info(f"Prediction request for game {request.game_id}")
        
        # Generate prediction
        prediction = await engine.predict(
            game_id=request.game_id,
            features=request.features,
            prediction_types=request.prediction_types,
            include_explanation=request.include_explanation
        )
        
        return PredictionResponse(
            game_id=request.game_id,
            predictions=prediction.predictions,
            explanation=prediction.explanation,
            model_info=prediction.model_info,
            confidence=prediction.confidence,
            created_at=prediction.created_at
        )
        
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/predict/batch", response_model=BatchPredictionResponse)
async def predict_batch(
    request: BatchPredictionRequest,
    engine: PredictionEngine = Depends(get_prediction_engine)
):
    """Generate predictions for multiple games"""
    try:
        logger.info(f"Batch prediction request for {len(request.game_requests)} games")
        
        # Process predictions concurrently
        predictions = await engine.predict_batch(request.game_requests)
        
        return BatchPredictionResponse(
            predictions=predictions,
            total_games=len(request.game_requests),
            successful_predictions=len([p for p in predictions if p.predictions]),
            batch_id=f"batch_{asyncio.current_task().get_name()}"
        )
        
    except Exception as e:
        logger.error(f"Batch prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Batch prediction failed: {str(e)}")

@app.get("/model/performance", response_model=ModelPerformanceResponse)
async def get_model_performance(
    engine: PredictionEngine = Depends(get_prediction_engine)
):
    """Get model performance metrics"""
    try:
        performance = await engine.get_performance_metrics()
        
        return ModelPerformanceResponse(
            accuracy=performance.accuracy,
            log_loss=performance.log_loss,
            auc_roc=performance.auc_roc,
            calibration_score=performance.calibration_score,
            feature_importance=performance.feature_importance,
            last_trained=performance.last_trained,
            training_samples=performance.training_samples,
            model_version=performance.model_version
        )
        
    except Exception as e:
        logger.error(f"Performance metrics error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get performance metrics: {str(e)}")

@app.post("/model/retrain")
async def retrain_model(
    engine: PredictionEngine = Depends(get_prediction_engine)
):
    """Trigger model retraining"""
    try:
        logger.info("Manual model retraining triggered")
        
        # Start retraining in background
        asyncio.create_task(engine.retrain_model())
        
        return {
            "message": "Model retraining started",
            "status": "in_progress"
        }
        
    except Exception as e:
        logger.error(f"Retraining error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to start retraining: {str(e)}")

@app.get("/model/features")
async def get_feature_info(
    engine: PredictionEngine = Depends(get_prediction_engine)
):
    """Get information about model features"""
    try:
        feature_info = await engine.get_feature_info()
        
        return {
            "features": feature_info.feature_names,
            "feature_importance": feature_info.feature_importance,
            "feature_descriptions": feature_info.feature_descriptions,
            "total_features": len(feature_info.feature_names)
        }
        
    except Exception as e:
        logger.error(f"Feature info error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get feature info: {str(e)}")

@app.get("/cache/stats")
async def get_cache_stats(
    cache: CacheManager = Depends(get_cache_manager)
):
    """Get cache statistics"""
    try:
        stats = await cache.get_stats()
        return stats
    except Exception as e:
        logger.error(f"Cache stats error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get cache stats: {str(e)}")

@app.delete("/cache/clear")
async def clear_cache(
    cache: CacheManager = Depends(get_cache_manager)
):
    """Clear prediction cache"""
    try:
        cleared_count = await cache.clear_predictions()
        return {
            "message": "Cache cleared successfully",
            "cleared_items": cleared_count
        }
    except Exception as e:
        logger.error(f"Cache clear error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to clear cache: {str(e)}")

if __name__ == "__main__":
    # Run the server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=3002,
        reload=os.getenv("ENVIRONMENT") == "development",
        log_level="info"
    )