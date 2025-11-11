/**
 * Lazy Image Component
 * 
 * Optimized image component with lazy loading, WebP support, and placeholders
 * 
 * Phase 5: Security & Performance
 */

import React, { useState, useEffect, useRef } from 'react';
import { optimizeImageUrl, LazyLoader } from '../../utils/performance';

export interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  threshold?: number;
  onLoad?: () => void;
  onError?: () => void;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23e0e0e0" width="400" height="300"/%3E%3C/svg%3E',
  threshold = 0.1,
  onLoad,
  onError,
  className = '',
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const observerRef = useRef<LazyLoader | null>(null);

  useEffect(() => {
    if (!imageRef) return;

    // Initialize IntersectionObserver
    observerRef.current = new LazyLoader({
      threshold,
      rootMargin: '50px',
    });

    // Set data attributes for lazy loading
    imageRef.dataset.src = src;

    // Optimize image URL for WebP
    optimizeImageUrl(src).then((optimizedSrc) => {
      imageRef.dataset.src = optimizedSrc;
    });

    // Start observing
    observerRef.current.observe(imageRef);

    // Handle image load
    const handleLoad = () => {
      setIsLoaded(true);
      if (onLoad) onLoad();
    };

    // Handle image error
    const handleError = () => {
      setHasError(true);
      if (onError) onError();
    };

    imageRef.addEventListener('load', handleLoad);
    imageRef.addEventListener('error', handleError);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      imageRef.removeEventListener('load', handleLoad);
      imageRef.removeEventListener('error', handleError);
    };
  }, [imageRef, src, threshold, onLoad, onError]);

  // Update src when image enters viewport
  useEffect(() => {
    if (isLoaded && imageRef?.dataset.src) {
      setImageSrc(imageRef.dataset.src);
    }
  }, [isLoaded, imageRef]);

  return (
    <img
      ref={setImageRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${isLoaded ? 'loaded' : 'loading'} ${hasError ? 'error' : ''}`}
      loading="lazy"
      {...props}
    />
  );
};

export default LazyImage;
