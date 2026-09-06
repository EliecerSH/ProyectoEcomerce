// src/components/ProductImage.jsx
import React, { useState } from 'react';

// Muestra la imagen del producto; si no existe o falla la carga, cae a un
// placeholder ilustrado en SVG (sin depender de recursos externos).
export default function ProductImage({ src, alt, className = '' }) {
    const [failed, setFailed] = useState(false);

    if (!src || failed) {
        return (
            <div className={`product-image placeholder ${className}`} role="img" aria-label={alt}>
                <svg viewBox="0 0 64 64" width="40%" height="40%" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="8" y="14" width="48" height="36" rx="3" stroke="currentColor" strokeWidth="2.5" />
                    <circle cx="20" cy="24" r="4" stroke="currentColor" strokeWidth="2.5" />
                    <path d="M8 42L22 30L34 40L44 32L56 44" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        );
    }

    return (
        <div className={`product-image ${className}`}>
            <img src={src} alt={alt} onError={() => setFailed(true)} loading="lazy" />
        </div>
    );
}
