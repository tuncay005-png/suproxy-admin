#!/usr/bin/env node

/**
 * Chrome/Edge Compatibility Verification Script
 * Task 13.1 - Manual verification helper
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('='.repeat(70));
console.log('Task 13.1: Chrome/Edge Compatibility Verification');
console.log('='.repeat(70));
console.log('');

let allChecks = true;

// Check 1: Core components exist
console.log('📦 Checking Core Components...');
const componentsToCheck = [
  'components/admin/dashboard/circular-progress-chart.tsx',
  'components/admin/dashboard/activity-card.tsx',
  'components/admin/dashboard/system-monitors.tsx',
  'components/admin/dashboard/activity-section.tsx',
  'components/admin/layout/language-selector.tsx',
  'components/admin/layout/admin-sidebar.tsx',
  'components/admin/layout/admin-header.tsx',
];

componentsToCheck.forEach(component => {
  if (existsSync(component)) {
    console.log(`  ✅ ${component}`);
  } else {
    console.log(`  ❌ ${component} - MISSING`);
    allChecks = false;
  }
});

// Check 2: i18n infrastructure
console.log('');
console.log('🌐 Checking Internationalization...');
const i18nFiles = [
  'lib/i18n/context.tsx',
  'lib/i18n/locales/en.json',
  'lib/i18n/locales/ru.json',
];

i18nFiles.forEach(file => {
  if (existsSync(file)) {
    console.log(`  ✅ ${file}`);
    
    // Validate JSON files
    if (file.endsWith('.json')) {
      try {
        const content = readFileSync(file, 'utf8');
        JSON.parse(content);
        console.log(`     └─ Valid JSON`);
      } catch (e) {
        console.log(`     └─ ⚠️  Invalid JSON: ${e.message}`);
        allChecks = false;
      }
    }
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    allChecks = false;
  }
});

// Check 3: Dashboard page
console.log('');
console.log('📊 Checking Dashboard Implementation...');
const dashboardFile = 'app/admin/page.tsx';
if (existsSync(dashboardFile)) {
  console.log(`  ✅ ${dashboardFile}`);
  const content = readFileSync(dashboardFile, 'utf8');
  
  // Check for key features
  const features = [
    { name: 'SystemMonitors', pattern: /<SystemMonitors/ },
    { name: 'ActivitySection', pattern: /<ActivitySection/ },
    { name: 'I18nProvider', pattern: /I18nProvider|useTranslations/ },
  ];
  
  features.forEach(({ name, pattern }) => {
    if (pattern.test(content)) {
      console.log(`     ✅ Uses ${name}`);
    } else {
      console.log(`     ⚠️  Missing ${name}`);
    }
  });
} else {
  console.log(`  ❌ ${dashboardFile} - MISSING`);
  allChecks = false;
}

// Check 4: Real-time polling hook
console.log('');
console.log('⏱️  Checking Real-Time Polling...');
const pollingHook = 'lib/hooks/use-real-time-polling.ts';
if (existsSync(pollingHook)) {
  console.log(`  ✅ ${pollingHook}`);
  const content = readFileSync(pollingHook, 'utf8');
  
  // Check for exponential backoff
  if (/backoff|Math\.pow|2 \*\* |calculateBackoff/i.test(content)) {
    console.log(`     ✅ Implements exponential backoff`);
  } else {
    console.log(`     ⚠️  Exponential backoff not found`);
  }
  
  // Check for Page Visibility API
  if (/visibilitychange|document\.hidden/i.test(content)) {
    console.log(`     ✅ Uses Page Visibility API`);
  } else {
    console.log(`     ⚠️  Page Visibility API not found`);
  }
} else {
  console.log(`  ❌ ${pollingHook} - MISSING`);
  allChecks = false;
}

// Check 5: Dark theme configuration
console.log('');
console.log('🎨 Checking Dark Theme...');
const globalsCss = 'app/globals.css';
if (existsSync(globalsCss)) {
  console.log(`  ✅ ${globalsCss}`);
  const content = readFileSync(globalsCss, 'utf8');
  
  // Check for dark theme colors
  const darkThemeColors = [
    '--color-background',
    '--color-card',
    '--color-chart-green',
    '--color-chart-yellow',
    '--color-chart-red',
  ];
  
  darkThemeColors.forEach(color => {
    if (content.includes(color)) {
      console.log(`     ✅ Defines ${color}`);
    } else {
      console.log(`     ⚠️  Missing ${color}`);
    }
  });
} else {
  console.log(`  ❌ ${globalsCss} - MISSING`);
  allChecks = false;
}

// Check 6: Test files
console.log('');
console.log('🧪 Checking Test Coverage...');
const testFiles = [
  'app/admin/browser-compatibility.test.tsx',
  'components/admin/dashboard/circular-progress-chart.test.tsx',
  'components/admin/dashboard/activity-card.test.tsx',
];

testFiles.forEach(test => {
  if (existsSync(test)) {
    console.log(`  ✅ ${test}`);
  } else {
    console.log(`  ⚠️  ${test} - Not found (optional)`);
  }
});

// Summary
console.log('');
console.log('='.repeat(70));
if (allChecks) {
  console.log('✅ All critical checks passed!');
  console.log('');
  console.log('Next Steps:');
  console.log('1. Start development server: npm run dev');
  console.log('2. Open http://localhost:3000/admin in Chrome or Edge');
  console.log('3. Test real-time polling by observing chart updates');
  console.log('4. Test language switching (English ↔ Russian)');
  console.log('5. Verify dark theme renders correctly');
  console.log('6. Check animations are smooth (60fps)');
  console.log('7. Test responsive layout at different viewport sizes');
} else {
  console.log('❌ Some checks failed. Review output above.');
  process.exit(1);
}
console.log('='.repeat(70));
