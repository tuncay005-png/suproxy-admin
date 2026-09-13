# I18n (Internationalization) System

## Overview

This directory contains a lightweight custom i18n implementation for the Suproxy Admin panel, supporting English and Russian languages with localStorage persistence.

## Features

✅ **React Context-based** - Uses React Context API for state management  
✅ **localStorage Persistence** - Remembers user's language choice across sessions  
✅ **Automatic Locale Detection** - Loads persisted locale on mount  
✅ **Dot Notation Support** - Access nested translations with `t('nav.xray.inbounds')`  
✅ **Type-Safe** - Full TypeScript support with type definitions  
✅ **Client-Side** - Marked with 'use client' for Next.js App Router compatibility  
✅ **Lightweight** - No external dependencies, just JSON translation files

## Files Structure

```
lib/i18n/
├── context.tsx          # I18nProvider and useTranslations hook
├── types.ts            # TypeScript type definitions
├── index.ts            # Main export file
├── locales/
│   ├── en.json        # English translations
│   └── ru.json        # Russian translations
├── example.tsx         # Usage example
└── README.md          # This file
```

## Installation & Setup

### 1. Wrap Your App with I18nProvider

In your `app/admin/layout.tsx` (or root layout):

```tsx
'use client';

import { I18nProvider } from '@/lib/i18n';

export default function AdminLayout({ children }) {
  return (
    <I18nProvider>
      {children}
    </I18nProvider>
  );
}
```

### 2. Use Translations in Components

```tsx
'use client';

import { useTranslations } from '@/lib/i18n';

export function MyComponent() {
  const { t, locale, changeLanguage } = useTranslations();
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.description')}</p>
      
      <button onClick={() => changeLanguage('ru')}>
        Русский
      </button>
    </div>
  );
}
```

## API Reference

### I18nProvider

React context provider that manages locale state and translations.

**Props:**
- `children` (ReactNode) - Child components to wrap
- `initialLocale?` (Locale) - Initial locale, default: 'en'

**Example:**
```tsx
<I18nProvider initialLocale="en">
  <App />
</I18nProvider>
```

### useTranslations()

Hook to access i18n context. Must be used within `I18nProvider`.

**Returns:**
```typescript
{
  locale: 'en' | 'ru',           // Current active locale
  translations: Translations,     // Loaded translation dictionary
  changeLanguage: (locale) => void, // Function to change language
  t: (key: string) => string     // Translation function
}
```

**Throws:** Error if used outside `I18nProvider`

### t(key: string)

Translation helper function with dot notation support.

**Parameters:**
- `key` (string) - Translation key in dot notation

**Returns:** Translated string or the key itself if translation not found

**Examples:**
```typescript
t('nav.dashboard')        // "Dashboard" or "Панель управления"
t('nav.xray.inbounds')    // "Inbounds" or "Входящие"
t('dashboard.title')      // "Dashboard" or "Панель управления"
t('nonexistent.key')      // "nonexistent.key" (fallback)
```

### changeLanguage(locale: Locale)

Changes the active language and persists to localStorage.

**Parameters:**
- `locale` ('en' | 'ru') - New locale to activate

**Example:**
```typescript
const { changeLanguage } = useTranslations();

<button onClick={() => changeLanguage('ru')}>Русский</button>
<button onClick={() => changeLanguage('en')}>English</button>
```

## Translation Keys

### Navigation (nav)

```typescript
nav.dashboard          // "Dashboard" | "Панель управления"
nav.users              // "Users" | "Пользователи"
nav.sessions           // "Sessions" | "Сессии"
nav.xray_management    // "Xray Management" | "Управление Xray"
nav.xray.inbounds      // "Inbounds" | "Входящие"
nav.xray.clients       // "Clients" | "Клиенты"
nav.xray.nodes         // "Nodes" | "Узлы"
nav.xray.routing       // "Routing" | "Маршрутизация"
nav.plans              // "Plans" | "Тарифы"
nav.logs               // "Logs" | "Логи"
nav.monitoring         // "Monitoring" | "Мониторинг"
```

### Dashboard

```typescript
dashboard.title                // "Dashboard" | "Панель управления"
dashboard.description          // "Welcome..." | "Добро пожаловать..."
dashboard.total_users          // "Total Users" | "Всего пользователей"
dashboard.active_users         // "active" | "активных"
dashboard.xray_instances       // "Xray Instances" | "Экземпляры Xray"
dashboard.xray_status          // "Xray Status" | "Статус Xray"
dashboard.running              // "Running" | "Работает"
dashboard.stopped              // "Stopped" | "Остановлен"
dashboard.system_uptime        // "System Uptime" | "Время работы"
dashboard.traffic_speed        // "Traffic Speed" | "Скорость трафика"
dashboard.total_traffic        // "Total Traffic" | "Общий трафик"
dashboard.data_unavailable     // "Data unavailable" | "Данные недоступны"
dashboard.loading              // "Loading..." | "Загрузка..."
```

### Monitoring

```typescript
monitoring.cpu_usage     // "CPU Usage" | "Использование CPU"
monitoring.ram_usage     // "RAM Usage" | "Использование RAM"
monitoring.disk_usage    // "Disk Usage" | "Использование диска"
monitoring.swap_usage    // "Swap Usage" | "Использование Swap"
```

### Common

```typescript
common.loading     // "Loading..." | "Загрузка..."
common.error       // "Error" | "Ошибка"
common.retry       // "Retry" | "Повторить"
```

## Adding New Translations

### 1. Update Type Definition

Edit `lib/i18n/types.ts`:

```typescript
export interface Translations {
  // ... existing translations
  myNewSection: {
    title: string;
    subtitle: string;
  };
}
```

### 2. Add to English Translation File

Edit `lib/i18n/locales/en.json`:

```json
{
  "myNewSection": {
    "title": "My Title",
    "subtitle": "My Subtitle"
  }
}
```

### 3. Add to Russian Translation File

Edit `lib/i18n/locales/ru.json`:

```json
{
  "myNewSection": {
    "title": "Мой заголовок",
    "subtitle": "Мой подзаголовок"
  }
}
```

### 4. Use in Component

```tsx
const { t } = useTranslations();
<h1>{t('myNewSection.title')}</h1>
```

## localStorage Behavior

### Storage Key
`preferred_locale`

### Stored Values
- `"en"` - English
- `"ru"` - Russian

### Lifecycle

1. **On Mount:** Provider reads `localStorage.getItem('preferred_locale')`
2. **On Language Change:** Provider calls `localStorage.setItem('preferred_locale', newLocale)`
3. **On Reload:** Previous selection is automatically restored

### Browser Compatibility

localStorage is available in all modern browsers. The implementation includes checks for `typeof window !== 'undefined'` to ensure SSR compatibility.

## Error Handling

### Missing Translation Keys

When a translation key is not found, the `t()` function returns the key itself:

```typescript
t('nonexistent.key')  // Returns: "nonexistent.key"
```

This prevents UI breakage and makes missing translations visible during development.

### Invalid Locale in localStorage

If localStorage contains an invalid locale value (not 'en' or 'ru'), the provider ignores it and uses the `initialLocale` prop:

```typescript
// localStorage has "invalid"
<I18nProvider initialLocale="en">  // Will use "en"
```

### Hook Used Outside Provider

If `useTranslations()` is called outside of `I18nProvider`, it throws an error:

```
Error: useTranslations must be used within I18nProvider
```

**Solution:** Wrap your component tree with `<I18nProvider>`.

## Testing

### Manual Testing Checklist

1. ✅ Language selector changes locale
2. ✅ Locale persists after page reload
3. ✅ All translations display correctly in English
4. ✅ All translations display correctly in Russian
5. ✅ Dot notation works for nested keys
6. ✅ Missing keys return the key itself
7. ✅ Hook throws error when used outside provider

### Example Test

```tsx
// In browser console
localStorage.setItem('preferred_locale', 'ru');
location.reload();
// Page should load with Russian translations
```

## Performance Considerations

### Translation Loading

Translations are loaded dynamically using `import()` which enables:
- Code splitting (smaller initial bundle)
- Lazy loading (only load when needed)
- Better caching (translations can be cached separately)

### Re-render Optimization

The provider uses React Context, which means:
- Components only re-render when they use values that changed
- Changing locale triggers re-render of components using `t()` or `locale`
- Translation loading is async to avoid blocking

## Next.js Compatibility

### App Router Support

✅ Fully compatible with Next.js 15 App Router  
✅ Marked with `'use client'` directive  
✅ Works in Server and Client Components  
✅ SSR-safe (checks for `typeof window`)

### Server Components

For Server Components that need translations, you have two options:

**Option 1: Use Client Component**
```tsx
'use client';
import { useTranslations } from '@/lib/i18n';
```

**Option 2: Pass translations as props**
```tsx
// Server Component
import enTranslations from '@/lib/i18n/locales/en.json';

export default function ServerComponent() {
  return <ClientComponent translations={enTranslations} />;
}
```

## Migration from next-i18next

If migrating from next-i18next, here's a comparison:

| Feature | next-i18next | Custom i18n |
|---------|--------------|-------------|
| Framework | Next.js Pages Router | Next.js App Router |
| Size | ~100KB | ~5KB |
| Setup | Complex config | Single provider |
| Translation function | `t()` | `t()` |
| Locale detection | Automatic | localStorage-based |
| SSR | Built-in | Manual handling |

## Troubleshooting

### Translations not updating

**Issue:** Changed translation files but UI not updating  
**Solution:** Clear browser cache and localStorage, then reload

### Provider error in Server Component

**Issue:** `useTranslations must be used within I18nProvider`  
**Solution:** Move component to 'use client' or use client wrapper

### TypeScript errors on new keys

**Issue:** TypeScript complains about new translation keys  
**Solution:** Update `Translations` interface in `types.ts` first

## Future Enhancements

Potential improvements for future iterations:

1. **Plural Forms** - Handle pluralization (1 item vs 2 items)
2. **Interpolation** - Support variables in translations: `t('welcome', { name: 'John' })`
3. **Date/Number Formatting** - Locale-aware formatting
4. **RTL Support** - Right-to-left language support
5. **Language Detection** - Auto-detect from browser settings
6. **Translation Validation** - Build-time checking for missing keys

## Requirements Validation

This implementation satisfies the following requirements from the spec:

✅ **Requirement 3.22** - Multi-language support with English and Russian translations  
✅ **Requirement 3.24** - Load appropriate translation bundle based on selected language  

## License

Internal use only - Suproxy Admin Panel

---

**Created:** 2025-01-XX  
**Last Updated:** 2025-01-XX  
**Version:** 1.0.0
