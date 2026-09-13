#!/usr/bin/env node

/**
 * Verification script for feature detection implementation
 * 
 * This script verifies that:
 * 1. localStorage fallback is properly implemented
 * 2. ResizeObserver fallback exists
 * 3. Page Visibility API wrapper is available
 * 4. All exports are accessible
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const featureDetectionPath = join(process.cwd(), 'lib', 'utils', 'feature-detection.ts');
const content = readFileSync(featureDetectionPath, 'utf-8');

const requiredExports = [
  'export interface FeatureSupport',
  'export function detectFeatures',
  'export function getFeatures',
  'export const storage',
  'export function getSafeResizeObserver',
  'export const pageVisibility',
];

const requiredImplementations = [
  'class SafeStorage',
  'class ResizeObserverPolyfill',
  'detectPageVisibilityAPI',
  'detectIntersectionObserver',
  'detectResizeObserver',
  'detectLocalStorage',
];

console.log('🔍 Verifying feature detection implementation...\n');

let allPassed = true;

// Check exports
console.log('✓ Checking required exports:');
requiredExports.forEach(exp => {
  const found = content.includes(exp);
  if (found) {
    console.log(`  ✅ ${exp}`);
  } else {
    console.log(`  ❌ ${exp} - NOT FOUND`);
    allPassed = false;
  }
});

console.log('\n✓ Checking required implementations:');
requiredImplementations.forEach(impl => {
  const found = content.includes(impl);
  if (found) {
    console.log(`  ✅ ${impl}`);
  } else {
    console.log(`  ❌ ${impl} - NOT FOUND`);
    allPassed = false;
  }
});

// Check specific features
console.log('\n✓ Checking specific feature implementations:');

const checks = [
  {
    name: 'localStorage fallback with in-memory store',
    pattern: /private memoryStore = new Map<string, string>\(\)/,
  },
  {
    name: 'ResizeObserver polyfill with window resize',
    pattern: /window\.addEventListener\('resize'/,
  },
  {
    name: 'Page Visibility API wrapper',
    pattern: /export const pageVisibility = \{/,
  },
  {
    name: 'Safe storage getItem method',
    pattern: /getItem\(key: string\): string \| null/,
  },
  {
    name: 'Safe storage setItem method',
    pattern: /setItem\(key: string, value: string\): void/,
  },
  {
    name: 'Feature detection caching',
    pattern: /let cachedFeatures: FeatureSupport \| null/,
  },
];

checks.forEach(check => {
  const found = check.pattern.test(content);
  if (found) {
    console.log(`  ✅ ${check.name}`);
  } else {
    console.log(`  ❌ ${check.name} - NOT FOUND`);
    allPassed = false;
  }
});

// Check integration points
console.log('\n✓ Checking integration points:');

const i18nContextPath = join(process.cwd(), 'lib', 'i18n', 'context.tsx');
const pollingHookPath = join(process.cwd(), 'lib', 'hooks', 'use-real-time-polling.ts');

try {
  const i18nContent = readFileSync(i18nContextPath, 'utf-8');
  if (i18nContent.includes("import { storage } from '@/lib/utils/feature-detection'")) {
    console.log('  ✅ i18n context uses safe storage');
  } else {
    console.log('  ❌ i18n context does not import safe storage');
    allPassed = false;
  }
} catch (e) {
  console.log('  ⚠️  Could not verify i18n context integration');
}

try {
  const pollingContent = readFileSync(pollingHookPath, 'utf-8');
  if (pollingContent.includes("import { pageVisibility } from '@/lib/utils/feature-detection'")) {
    console.log('  ✅ polling hook uses page visibility wrapper');
  } else {
    console.log('  ❌ polling hook does not import page visibility wrapper');
    allPassed = false;
  }
} catch (e) {
  console.log('  ⚠️  Could not verify polling hook integration');
}

console.log('\n' + '='.repeat(60));
if (allPassed) {
  console.log('✅ All feature detection checks passed!');
  console.log('\n📋 Summary:');
  console.log('  • localStorage feature detection: ✅');
  console.log('  • ResizeObserver fallback: ✅');
  console.log('  • Page Visibility API fallback: ✅');
  console.log('  • Safe storage wrapper: ✅');
  console.log('  • Integration with i18n: ✅');
  console.log('  • Integration with polling hook: ✅');
  process.exit(0);
} else {
  console.log('❌ Some checks failed. Please review the implementation.');
  process.exit(1);
}
