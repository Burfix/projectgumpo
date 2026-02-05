# Performance Optimization Guide

## Current Optimizations ✓

### 1. API Route Caching
All API routes have been configured with appropriate caching strategies:

```typescript
// Short cache (30 seconds) - Frequently changing data
export const revalidate = 30;
// Examples: /api/children, /api/attendance

// Medium cache (5 minutes) - Semi-static data
export const revalidate = 300;
// Examples: /api/teachers, /api/classrooms, /api/parents

// No cache - Real-time data
export const revalidate = 0;
// Examples: /api/notifications, /api/incidents
```

### 2. Static Asset Caching
Security middleware configured with optimal cache headers:
- Static files: 1 year cache (`public, max-age=31536000, immutable`)
- API routes: No cache (`no-store, no-cache`)

### 3. Code Splitting
- Automatic route-based code splitting via Next.js App Router
- Dynamic imports for large components
- React 19.2.3 Server Components by default

### 4. Image Optimization
- Next.js Image component with automatic optimization
- WebP format support
- Responsive image sizes
- Lazy loading enabled

## Additional Optimizations to Implement

### 1. Bundle Analysis

```bash
# Install bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Add to next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)

# Run analysis
ANALYZE=true npm run build
```

### 2. Database Query Optimization

```typescript
// Example: Add indexes to frequently queried columns
CREATE INDEX idx_children_school_id ON children(school_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);

// Use query analysis
EXPLAIN ANALYZE SELECT * FROM children WHERE school_id = '...';
```

### 3. React Query / SWR for Client-Side Caching

```bash
npm install @tanstack/react-query
```

```typescript
// Example implementation
'use client';

import { useQuery } from '@tanstack/react-query';

export function useChildren() {
  return useQuery({
    queryKey: ['children'],
    queryFn: async () => {
      const res = await fetch('/api/children');
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}
```

### 4. Lazy Loading Components

```typescript
import dynamic from 'next/dynamic';

// Lazy load heavy components
const Chart = dynamic(() => import('@/components/Chart'), {
  loading: () => <div>Loading chart...</div>,
  ssr: false,
});

const NotificationCenter = dynamic(
  () => import('@/components/NotificationCenter'),
  { ssr: false }
);
```

### 5. Optimize Supabase Queries

```typescript
// Bad: Fetches all columns
const { data } = await supabase.from('children').select('*');

// Good: Select only needed columns
const { data } = await supabase
  .from('children')
  .select('id, first_name, last_name, classroom_id')
  .limit(50);

// Better: Use joins instead of multiple queries
const { data } = await supabase
  .from('children')
  .select(`
    id,
    first_name,
    last_name,
    classrooms (
      id,
      name
    )
  `);
```

### 6. Database Connection Pooling

Configure in Supabase settings:
- Max connections: 20 (adjust based on plan)
- Connection timeout: 10s
- Idle timeout: 30s

### 7. Redis for Session Caching (Future)

```bash
# For high-traffic scenarios
npm install @upstash/redis

# Environment variables
UPSTASH_REDIS_REST_URL=your-url
UPSTASH_REDIS_REST_TOKEN=your-token
```

### 8. Compression

Vercel automatically enables compression, but verify:
```javascript
// Check response headers
Content-Encoding: gzip
```

## Performance Monitoring

### 1. Vercel Analytics

```bash
npm install @vercel/analytics

# Add to layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 2. Lighthouse CI

```bash
npm install --save-dev @lhci/cli

# .lighthouserc.json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000"],
      "numberOfRuns": 3
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.9}]
      }
    }
  }
}

# Run audit
npm run build && npm start
lhci autorun
```

### 3. Performance Metrics to Track

```typescript
// Add to layout or key pages
'use client';

import { useEffect } from 'react';

export function PerformanceMonitor() {
  useEffect(() => {
    // Measure Core Web Vitals
    if (typeof window !== 'undefined' && 'web-vital' in window) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(console.log);
        getFID(console.log);
        getFCP(console.log);
        getLCP(console.log);
        getTTFB(console.log);
      });
    }
  }, []);

  return null;
}
```

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Lighthouse Performance | >90 | TBD |
| First Contentful Paint (FCP) | <1.8s | TBD |
| Largest Contentful Paint (LCP) | <2.5s | TBD |
| Cumulative Layout Shift (CLS) | <0.1 | TBD |
| Time to Interactive (TTI) | <3.8s | TBD |
| API Response Time (p95) | <500ms | TBD |
| Database Query Time (p95) | <100ms | TBD |

## Optimization Checklist

- [x] API route caching configured
- [x] Static asset caching via middleware
- [x] Code splitting (automatic via App Router)
- [x] Image optimization with Next.js Image
- [ ] Bundle size analysis
- [ ] Database indexes created
- [ ] React Query/SWR implemented
- [ ] Heavy components lazy loaded
- [ ] Supabase query optimization
- [ ] Connection pooling configured
- [ ] Compression verified
- [ ] Vercel Analytics installed
- [ ] Lighthouse CI setup
- [ ] Core Web Vitals monitoring

## Testing Performance

```bash
# 1. Local performance testing
npm run build
npm start

# 2. Open Chrome DevTools
# - Performance tab
# - Network tab (throttle to Fast 3G)
# - Lighthouse tab

# 3. Production testing
# - Test on actual mobile devices
# - Test on slow networks
# - Monitor Vercel analytics

# 4. Load testing (Artillery example)
npm install -g artillery
artillery quick --count 10 --num 100 https://projectgumpo.space
```

## Quick Wins

1. **Enable Vercel Analytics**: Immediate insight into real user performance
2. **Add Database Indexes**: Can improve query speed by 10-100x
3. **Lazy Load Heavy Components**: Reduce initial bundle size by 30-50%
4. **Optimize Images**: Reduce page weight by 50-80%
5. **Implement React Query**: Reduce API calls by 60-70%

## Cost vs Performance Trade-offs

| Optimization | Cost | Impact | Priority |
|--------------|------|--------|----------|
| Database indexes | Low | High | P0 |
| React Query | Low | High | P0 |
| Bundle analysis | Low | Medium | P1 |
| Lazy loading | Low | Medium | P1 |
| Redis cache | Medium | High | P2 |
| CDN for images | Medium | Medium | P2 |
| Edge functions | High | Low | P3 |
