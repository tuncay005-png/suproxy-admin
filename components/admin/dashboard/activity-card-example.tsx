/**
 * ActivityCard Component Usage Examples
 * 
 * This file demonstrates various use cases for the ActivityCard component.
 * These examples match the requirements from the 3X-UI transformation spec.
 */

import React from 'react';
import { Activity, Clock, ArrowDownUp, HardDrive } from 'lucide-react';
import { ActivityCard } from './activity-card';

/**
 * Example 1: Xray Status Card with Success Indicator
 * Requirements: 5.1, 5.2
 */
export function XrayStatusCardExample() {
  return (
    <ActivityCard
      icon={Activity}
      title="Xray Status"
      value="Running"
      status="success"
      statusDot={true}
    />
  );
}

/**
 * Example 2: Xray Stopped State with Error Indicator
 * Requirements: 5.2
 */
export function XrayStoppedCardExample() {
  return (
    <ActivityCard
      icon={Activity}
      title="Xray Status"
      value="Stopped"
      status="error"
      statusDot={true}
    />
  );
}

/**
 * Example 3: System Uptime Card
 * Requirements: 5.3, 5.4
 */
export function SystemUptimeCardExample() {
  return (
    <ActivityCard
      icon={Clock}
      title="System Uptime"
      value="5d 12h 30m"
      description="Last restart: Jan 15, 2024"
    />
  );
}

/**
 * Example 4: Traffic Speed Card
 * Requirements: 5.5, 5.8
 */
export function TrafficSpeedCardExample() {
  return (
    <ActivityCard
      icon={ArrowDownUp}
      title="Traffic Speed"
      value="125 MB/s"
      description="↓ 85 MB/s | ↑ 40 MB/s"
      status="neutral"
    />
  );
}

/**
 * Example 5: Total Traffic Card
 * Requirements: 5.6, 5.9
 */
export function TotalTrafficCardExample() {
  return (
    <ActivityCard
      icon={HardDrive}
      title="Total Traffic"
      value="2.5 TB"
      description="This month"
      status="neutral"
    />
  );
}

/**
 * Example 6: Clickable Warning Card
 * Shows how to make a card interactive
 */
export function InteractiveWarningCardExample() {
  const handleClick = () => {
    console.log('Card clicked - navigate to details page');
  };

  return (
    <ActivityCard
      icon={Activity}
      title="System Alerts"
      value={3}
      description="Requires attention"
      status="warning"
      statusDot={true}
      onClick={handleClick}
      className="cursor-pointer"
    />
  );
}

/**
 * Example 7: Dashboard Grid Layout
 * Shows all activity cards in a responsive grid
 */
export function ActivityCardGridExample() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <ActivityCard
        icon={Activity}
        title="Xray Status"
        value="Running"
        status="success"
        statusDot={true}
      />
      <ActivityCard
        icon={Clock}
        title="System Uptime"
        value="5d 12h 30m"
      />
      <ActivityCard
        icon={ArrowDownUp}
        title="Traffic Speed"
        value="125 MB/s"
      />
      <ActivityCard
        icon={HardDrive}
        title="Total Traffic"
        value="2.5 TB"
      />
    </div>
  );
}
