
import React from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    width?: number;
    quality?: number;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
    src,
    width,
    quality = 80,
    className,
    alt = "",
    ...props
}) => {
    if (!src) return null;

    let optimizedSrc = src;

    // 1. Handle Unsplash
    if (src.includes('images.unsplash.com')) {
        const url = new URL(src);
        if (width) url.searchParams.set('w', width.toString());
        url.searchParams.set('q', quality.toString());
        url.searchParams.set('fm', 'webp');
        url.searchParams.set('fit', 'crop');
        optimizedSrc = url.toString();
    }
    // 2. Handle Supabase Storage (assuming typical public URL structure)
    else if (src.includes('supabase.co/storage/v1/object/public/')) {
        // If it's a public URL, we can use the 'render' endpoint for transformation
        // Note: This requires Supabase Pro or enabled Image Transformation
        // Pattern: [project-url]/storage/v1/render/image/public/[bucket]/[path]?width=[width]&quality=[quality]
        if (src.includes('/object/public/')) {
            optimizedSrc = src.replace('/object/public/', '/render/image/public/');
            const url = new URL(optimizedSrc);
            if (width) url.searchParams.set('width', width.toString());
            url.searchParams.set('quality', quality.toString());
            url.searchParams.set('format', 'webp');
            optimizedSrc = url.toString();
        }
    }

    return (
        <img
            src={optimizedSrc}
            className={className}
            alt={alt}
            loading="lazy"
            decoding="async"
            {...props}
        />
    );
};
