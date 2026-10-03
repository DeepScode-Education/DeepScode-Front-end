// src/components/OptimizedImage.tsx
import { useState, useEffect } from 'react';

export const OptimizedImage = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.onload = () => setIsLoaded(true);
        img.src = src;
    }, [src]);

    return (
        <div className="relative overflow-hidden">
            {!isLoaded && (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
            )}
            <img
                src={src}
                alt={alt}
                className={`${className ?? ''} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                loading="lazy"
                decoding="async"
                onLoad={() => setIsLoaded(true)}
            />
        </div>
    );
};