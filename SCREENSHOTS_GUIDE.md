# Screenshots Guide

This document describes the recommended screenshots to capture for the README.md file.

## Required Screenshots

### 1. Dashboard Overview (`docs/screenshots/dashboard.png`)
**What to capture:**
- Full dashboard view showing:
  - All 4 circular progress charts (CPU, RAM, Disk, Swap)
  - Activity cards (Xray Status, System Uptime, Traffic Speed)
  - Recent activity feed
  - Dark theme with premium coal-black background

**How to capture:**
1. Navigate to `/admin` (Dashboard page)
2. Wait for real-time data to load
3. Capture full viewport (recommended: 1920×1080 desktop view)
4. Save as `docs/screenshots/dashboard.png`

### 2. Xray Management (`docs/screenshots/xray-management.png`)
**What to capture:**
- One of the Xray management pages (Inbounds, Clients, Nodes, or Routing)
- Should show:
  - Expanded Xray Management submenu in sidebar
  - Data table with sample entries
  - Action buttons (view, edit, delete)
  - Dark theme styling

**How to capture:**
1. Navigate to `/admin/xray/inbounds` (or any Xray page)
2. Ensure submenu is expanded showing all 4 items
3. Capture full viewport
4. Save as `docs/screenshots/xray-management.png`

### 3. Mobile Responsive Design (`docs/screenshots/mobile-view.png`)
**What to capture:**
- Mobile viewport showing:
  - Collapsed sidebar with hamburger menu
  - Dashboard with 2×2 grid layout for charts
  - Touch-friendly interface elements

**How to capture:**
1. Open browser developer tools (F12)
2. Switch to mobile device emulation (iPhone 12 Pro or similar)
3. Navigate to dashboard
4. Capture mobile viewport (375×812 or similar)
5. Save as `docs/screenshots/mobile-view.png`

### 4. Language Switching (`docs/screenshots/language-selector.png`)
**What to capture:**
- Language selector dropdown in action showing:
  - Both English and Russian options
  - Flag emojis (🇺🇸 🇷🇺)
  - Checkmark for selected language

**How to capture:**
1. Navigate to any admin page
2. Click language selector in header
3. Capture the opened dropdown menu
4. Save as `docs/screenshots/language-selector.png`

## Directory Structure

Create the following directory structure:
```
suproxy-admin/
└── docs/
    └── screenshots/
        ├── dashboard.png
        ├── xray-management.png
        ├── mobile-view.png
        └── language-selector.png
```

## Screenshot Guidelines

- **Resolution**: Desktop screenshots at 1920×1080, mobile at 375×812
- **Format**: PNG for lossless quality
- **File size**: Optimize images (target <500KB each)
- **Content**: Use real or realistic sample data (no sensitive information)
- **Theme**: Ensure dark theme is active for all screenshots
- **Timing**: Capture when data is fully loaded (no loading skeletons)

## Optimization

After capturing screenshots, optimize them:

```bash
# Using ImageOptim (macOS) or similar tool
# Or online: https://tinypng.com

# Target file sizes:
# - dashboard.png: <500KB
# - xray-management.png: <400KB
# - mobile-view.png: <300KB
# - language-selector.png: <200KB
```

## Update README

Once screenshots are captured and placed in `docs/screenshots/`, the README.md already references them correctly:

```markdown
### Dashboard Overview
![Dashboard](docs/screenshots/dashboard.png)
*Real-time system monitoring with circular progress charts and activity cards*
```

Simply remove the note "Screenshots will be added once the UI implementation is complete" from the README once all screenshots are in place.
