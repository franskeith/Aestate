class ImageCache {
    constructor() {
        this.cacheName = 'aestate-img-cache-v1';
        this.maxSize = 50 * 1024 * 1024; // 50MB
    }

    // Pre-load dan cache gambar thumbnail (non-blocking)
    async preloadThumbnails(imageUrls) {
        // Don't wait for cache open, do it async
        caches.open(this.cacheName).then(cache => {
            imageUrls.forEach(url => {
                fetch(url, { priority: 'low' })
                    .then(response => {
                        if (response.ok) {
                            cache.put(url, response.clone());
                        }
                    })
                    .catch(err => console.log(`Failed to cache: ${url}`));
            });
        });
        
        console.log(`✅ Pre-caching ${imageUrls.length} images in background`);
    }

    // Compress image sebelum cache (optional)
    async compressAndCache(imageUrl, quality = 0.7) {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            
            // Create canvas untuk resize
            const img = await createImageBitmap(blob);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Resize ke max 800px width (untuk thumbnail)
            const maxWidth = 800;
            const scale = maxWidth / img.width;
            canvas.width = maxWidth;
            canvas.height = img.height * scale;
            
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Convert ke blob dengan kompresi
            const compressedBlob = await new Promise(resolve => {
                canvas.toBlob(resolve, 'image/webp', quality);
            });
            
            // Cache compressed image
            const cache = await caches.open(this.cacheName);
            const compressedResponse = new Response(compressedBlob, {
                headers: { 'Content-Type': 'image/webp' }
            });
            
            await cache.put(imageUrl, compressedResponse);
            
        } catch (err) {
            console.error('Compression failed:', err);
        }
    }

    // Check cache size
    async getCacheSize() {
        const cache = await caches.open(this.cacheName);
        const keys = await cache.keys();
        let totalSize = 0;

        for (const request of keys) {
            const response = await cache.match(request);
            const blob = await response.blob();
            totalSize += blob.size;
        }

        return totalSize;
    }

    // Clear cache jika melebihi limit
    async clearIfOverLimit() {
        const size = await this.getCacheSize();
        if (size > this.maxSize) {
            await caches.delete(this.cacheName);
            console.log('🗑️ Cache cleared due to size limit');
        }
    }

    // Get cache info untuk debugging
    async getCacheInfo() {
        const cache = await caches.open(this.cacheName);
        const keys = await cache.keys();
        const size = await this.getCacheSize();
        
        return {
            count: keys.length,
            size: size,
            sizeFormatted: (size / 1024 / 1024).toFixed(2) + ' MB'
        };
    }
}

// Export instance
const imageCache = new ImageCache();
