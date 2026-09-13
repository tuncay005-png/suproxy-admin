/**
 * Verification script for custom Tailwind classes
 * Checks that all custom classes are properly defined in globals.css
 */

const fs = require('fs');
const path = require('path');

const globalsPath = path.join(__dirname, 'app', 'globals.css');
const globalsContent = fs.readFileSync(globalsPath, 'utf8');

// List of custom classes that should be defined
const requiredClasses = [
  // Premium Card Styles
  '.premium-card',
  '.premium-card-hover',
  
  // Hover State Classes
  '.hover-lighten',
  '.hover-lighten-bg',
  
  // Focus Ring Styles
  '.focus-ring',
  '.focus-ring-primary',
  
  // Chart Container Styles
  '.chart-container',
  '.chart-container-hover',
  
  // Navigation Item Styles
  '.nav-item',
  '.nav-item-active',
  '.nav-item-submenu',
  
  // Sidebar Styles
  '.sidebar',
  
  // Interactive Element Styles
  '.interactive-hover',
  '.card-interactive',
  
  // Status Indicator Dots
  '.status-dot',
  '.status-dot-success',
  '.status-dot-warning',
  '.status-dot-error',
  '.status-dot-neutral',
];

console.log('🔍 Verifying custom Tailwind classes in globals.css...\n');

let allClassesFound = true;
let missingClasses = [];

requiredClasses.forEach(className => {
  if (globalsContent.includes(className)) {
    console.log(`✅ ${className}`);
  } else {
    console.log(`❌ ${className} - NOT FOUND`);
    allClassesFound = false;
    missingClasses.push(className);
  }
});

console.log('\n' + '='.repeat(50));

if (allClassesFound) {
  console.log('✅ SUCCESS: All custom classes are defined!');
  console.log(`\nTotal classes verified: ${requiredClasses.length}`);
  process.exit(0);
} else {
  console.log(`❌ FAILURE: ${missingClasses.length} classes missing!`);
  console.log('\nMissing classes:');
  missingClasses.forEach(className => console.log(`  - ${className}`));
  process.exit(1);
}
