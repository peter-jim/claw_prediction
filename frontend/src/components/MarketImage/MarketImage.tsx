import { useState, useCallback } from 'react';
import styles from './MarketImage.module.css';

interface MarketImageProps {
    src?: string;
    alt?: string;
    category?: string;
    size?: number;
    className?: string;
}

/**
 * Category → emoji/icon mapping for fallback display
 */
const CATEGORY_ICONS: Record<string, string> = {
    crypto: '₿',
    politics: '🏛',
    tech: '🤖',
    sports: '⚽',
    'pop culture': '🎬',
    default: '📊',
};

const CATEGORY_COLORS: Record<string, [string, string]> = {
    crypto: ['#f7931a', '#e2761b'],
    politics: ['#3b82f6', '#1d4ed8'],
    tech: ['#8b5cf6', '#6d28d9'],
    sports: ['#10b981', '#059669'],
    'pop culture': ['#ec4899', '#db2777'],
    default: ['#6366f1', '#4f46e5'],
};

const MarketImage = ({ src, alt = '', category = '', size = 60, className = '' }: MarketImageProps) => {
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const handleError = useCallback(() => {
        setHasError(true);
        setIsLoading(false);
    }, []);

    const handleLoad = useCallback(() => {
        setIsLoading(false);
    }, []);

    const catKey = category.toLowerCase();
    const icon = CATEGORY_ICONS[catKey] || CATEGORY_ICONS.default;
    const [colorFrom, colorTo] = CATEGORY_COLORS[catKey] || CATEGORY_COLORS.default;

    const showFallback = hasError || !src;

    return (
        <div
            className={`${styles.container} ${className}`}
            style={{ width: size, height: size }}
        >
            {/* Loading shimmer */}
            {isLoading && !showFallback && (
                <div className={styles.shimmer} style={{ width: size, height: size }} />
            )}

            {/* Actual image */}
            {!showFallback && (
                <img
                    src={src}
                    alt={alt}
                    className={`${styles.image} ${isLoading ? styles.imageHidden : ''}`}
                    onError={handleError}
                    onLoad={handleLoad}
                    loading="lazy"
                    decoding="async"
                />
            )}

            {/* Fallback: category-colored gradient with icon */}
            {showFallback && (
                <div
                    className={styles.fallback}
                    style={{
                        background: `linear-gradient(135deg, ${colorFrom} 0%, ${colorTo} 100%)`,
                        width: size,
                        height: size,
                        fontSize: size * 0.4,
                    }}
                >
                    <span className={styles.fallbackIcon}>{icon}</span>
                </div>
            )}
        </div>
    );
};

export default MarketImage;
