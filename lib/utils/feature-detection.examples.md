# Feature Detection - Usage Examples

This document provides practical examples of using the feature detection and graceful fallback utilities.

## Table of Contents

1. [Safe localStorage Usage](#safe-localstorage-usage)
2. [Safe ResizeObserver Usage](#safe-resizeobserver-usage)
3. [Page Visibility API Usage](#page-visibility-api-usage)
4. [Feature Detection](#feature-detection)

---

## Safe localStorage Usage

The `storage` wrapper provides localStorage with automatic fallback to in-memory storage.

### Basic Usage

```typescript
import { storage } from '@/lib/utils/feature-detection';

// Set a value (works even if localStorage is blocked)
storage.setItem('user_preference', 'dark_mode');

// Get a value
const preference = storage.getItem('user_preference'); // 'dark_mode'

// Remove a value
storage.removeItem('user_preference');

// Clear all values
storage.clear();
```

### Real-World Example: Language Preference

```typescript
import { storage } from '@/lib/utils/feature-detection';

export function useLanguagePersistence() {
  const saveLanguage = (locale: 'en' | 'ru') => {
    storage.setItem('preferred_locale', locale);
  };

  const loadLanguage = (): 'en' | 'ru' => {
    const stored = storage.getItem('preferred_locale');
    return (stored === 'en' || stored === 'ru') ? stored : 'en';
  };

  return { saveLanguage, loadLanguage };
}
```

### Handling Private Mode

When localStorage is unavailable (private mode, blocked by browser):
- ✅ No errors thrown
- ✅ Data stored in memory (lost on page refresh)
- ⚠️ Console warning logged once

```typescript
// This works everywhere, even in private browsing mode
storage.setItem('temp_data', 'value');
const data = storage.getItem('temp_data'); // 'value'

// After page refresh in private mode: data will be null
// But no errors occur - graceful degradation!
```

---

## Safe ResizeObserver Usage

The `getSafeResizeObserver()` function returns ResizeObserver with automatic fallback.

### Basic Usage

```typescript
import { getSafeResizeObserver } from '@/lib/utils/feature-detection';

// Get ResizeObserver (native or polyfill)
const ResizeObserver = getSafeResizeObserver();

// Use it like normal ResizeObserver
const observer = new ResizeObserver((entries) => {
  entries.forEach(entry => {
    console.log('Element resized:', {
      width: entry.contentRect.width,
      height: entry.contentRect.height,
    });
  });
});

// Observe an element
const element = document.getElementById('my-element');
observer.observe(element);

// Stop observing
observer.unobserve(element);

// Disconnect all
observer.disconnect();
```

### Real-World Example: Responsive Component

```typescript
'use client';

import { useEffect, useRef, useState } from 'react';
import { getSafeResizeObserver } from '@/lib/utils/feature-detection';

export function ResponsiveCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!cardRef.current) return;

    const ResizeObserver = getSafeResizeObserver();
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setWidth(entry.contentRect.width);
      }
    });

    observer.observe(cardRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={cardRef} className="responsive-card">
      <p>Card width: {width}px</p>
      {width < 400 && <p>Mobile layout</p>}
      {width >= 400 && width < 768 && <p>Tablet layout</p>}
      {width >= 768 && <p>Desktop layout</p>}
    </div>
  );
}
```

### Fallback Behavior

When ResizeObserver is not supported:
- ✅ Polyfill automatically used
- ✅ Observes window resize events instead
- ✅ Debounced (150ms) to prevent excessive callbacks
- ⚠️ Less precise than native (monitors window, not individual elements)

---

## Page Visibility API Usage

The `pageVisibility` wrapper provides safe access to the Page Visibility API.

### Basic Usage

```typescript
import { pageVisibility } from '@/lib/utils/feature-detection';

// Check if page is currently hidden
if (pageVisibility.isHidden()) {
  console.log('Tab is inactive');
} else {
  console.log('Tab is active');
}

// Listen for visibility changes
const handleVisibilityChange = () => {
  if (pageVisibility.isHidden()) {
    console.log('Tab became inactive');
  } else {
    console.log('Tab became active');
  }
};

pageVisibility.addListener(handleVisibilityChange);

// Remove listener when done
pageVisibility.removeListener(handleVisibilityChange);
```

### Real-World Example: Pause Polling When Inactive

```typescript
'use client';

import { useEffect, useRef } from 'react';
import { pageVisibility } from '@/lib/utils/feature-detection';

export function useAutoPolling(
  fetchFunction: () => Promise<void>,
  intervalMs: number
) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startPolling = () => {
    if (intervalRef.current) return;
    
    intervalRef.current = setInterval(() => {
      fetchFunction();
    }, intervalMs);
  };

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    // Start polling initially
    startPolling();

    // Pause/resume based on visibility
    const handleVisibilityChange = () => {
      if (pageVisibility.isHidden()) {
        console.log('Tab inactive - pausing polling');
        stopPolling();
      } else {
        console.log('Tab active - resuming polling');
        startPolling();
      }
    };

    pageVisibility.addListener(handleVisibilityChange);

    return () => {
      stopPolling();
      pageVisibility.removeListener(handleVisibilityChange);
    };
  }, [fetchFunction, intervalMs]);

  return { startPolling, stopPolling };
}
```

### Real-World Example: Video Player

```typescript
'use client';

import { useEffect, useRef } from 'react';
import { pageVisibility } from '@/lib/utils/feature-detection';

export function AutoPauseVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVisibilityChange = () => {
      if (pageVisibility.isHidden()) {
        // Pause video when tab is inactive
        if (!video.paused) {
          video.pause();
        }
      }
      // Optionally resume when tab becomes active
      // (commented out - let user control playback)
      // else {
      //   video.play();
      // }
    };

    pageVisibility.addListener(handleVisibilityChange);

    return () => {
      pageVisibility.removeListener(handleVisibilityChange);
    };
  }, []);

  return (
    <video ref={videoRef} src={src} controls>
      Your browser does not support video.
    </video>
  );
}
```

### Fallback Behavior

When Page Visibility API is not supported:
- ✅ `isHidden()` always returns `false` (assumes visible)
- ✅ Listeners can be added but will never be called
- ⚠️ Polling/video will continue when tab is inactive

---

## Feature Detection

Check which features are supported in the current browser.

### Get All Features

```typescript
import { getFeatures } from '@/lib/utils/feature-detection';

const features = getFeatures();

console.log('Browser Support:', {
  pageVisibility: features.pageVisibilityAPI,
  intersectionObserver: features.intersectionObserver,
  resizeObserver: features.resizeObserver,
  localStorage: features.localStorage,
  cssGrid: features.cssGrid,
  cssFlexbox: features.cssFlexbox,
});
```

### Conditional Feature Usage

```typescript
import { getFeatures } from '@/lib/utils/feature-detection';

export function OptimizedComponent() {
  const features = getFeatures();

  useEffect(() => {
    if (features.intersectionObserver) {
      // Use IntersectionObserver for lazy loading
      setupLazyLoading();
    } else {
      // Load all content immediately
      loadAllContent();
    }
  }, [features]);

  return <div>Content</div>;
}
```

### Display Browser Compatibility Message

```typescript
import { getFeatures, BROWSER_SUPPORT } from '@/lib/utils/feature-detection';

export function BrowserCompatibilityWarning() {
  const features = getFeatures();
  
  const unsupportedFeatures = [];
  if (!features.pageVisibilityAPI) unsupportedFeatures.push('Page Visibility');
  if (!features.resizeObserver) unsupportedFeatures.push('Resize Observer');
  if (!features.localStorage) unsupportedFeatures.push('Local Storage');
  
  if (unsupportedFeatures.length === 0) {
    return null; // Browser fully supported
  }

  return (
    <div className="browser-warning">
      <p>⚠️ Your browser doesn't support some features:</p>
      <ul>
        {unsupportedFeatures.map(feature => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      <p>
        For the best experience, please use one of these browsers:
        {BROWSER_SUPPORT.recommended.chrome}, {BROWSER_SUPPORT.recommended.firefox}, 
        {BROWSER_SUPPORT.recommended.safari}
      </p>
    </div>
  );
}
```

---

## Summary

All feature detection utilities provide:
- ✅ **Zero errors** - Graceful fallbacks prevent crashes
- ✅ **Same API** - Works identically whether native or polyfilled
- ✅ **Automatic** - Detection and fallback selection is automatic
- ✅ **Efficient** - Detection cached on first use
- ✅ **SSR-safe** - Works in server-side rendering environments

### When to Use Each Utility

| Utility | Use When | Fallback Behavior |
|---------|----------|-------------------|
| `storage` | Persisting user preferences | In-memory storage (lost on refresh) |
| `getSafeResizeObserver()` | Monitoring element size changes | Window resize events with debouncing |
| `pageVisibility` | Pausing activity when tab inactive | Assumes tab is always visible |
| `getFeatures()` | Conditional feature logic | Returns boolean for each feature |

---

## Integration Examples in Suproxy Admin

### 1. Language Persistence (i18n)

**File**: `lib/i18n/context.tsx`

```typescript
import { storage } from '@/lib/utils/feature-detection';

// Save language preference
storage.setItem('preferred_locale', 'ru');

// Load language preference
const stored = storage.getItem('preferred_locale');
```

### 2. Real-Time Polling

**File**: `lib/hooks/use-real-time-polling.ts`

```typescript
import { pageVisibility } from '@/lib/utils/feature-detection';

// Pause polling when tab is inactive
if (pageVisibility.isHidden()) {
  stopPolling();
}

// Listen for visibility changes
pageVisibility.addListener(handleVisibilityChange);
```

---

## Browser Support

### Fully Supported Browsers (Native APIs)

- Chrome/Edge 88+ (Jan 2021)
- Firefox 84+ (Dec 2020)
- Safari 14+ (Sep 2020)

**Recommended**: Latest 2 versions of each browser

### Partially Supported Browsers (Polyfills)

Older browsers use fallback implementations:
- localStorage → In-memory Map
- ResizeObserver → Window resize events
- Page Visibility → Assumes visible

### No Support Needed

Modern CSS features are universally supported:
- CSS Grid (since 2017)
- CSS Flexbox (since 2015)

---

## Performance Considerations

- **Feature detection**: Run once, cached for entire session
- **Storage fallback**: In-memory Map is faster than localStorage
- **ResizeObserver polyfill**: Debounced (150ms) to reduce overhead
- **Page Visibility**: No overhead when API is supported

---

## Testing

All utilities have comprehensive unit tests:

**File**: `lib/utils/feature-detection.test.ts`

Run tests:
```bash
npm test lib/utils/feature-detection.test.ts
```

---

**Last Updated**: 2025-01-XX  
**Author**: Kiro AI Agent  
**Related**: Task 13.4 - Feature Detection and Graceful Fallbacks
