/**
 * CircularProgressChart Usage Examples
 * 
 * This file demonstrates various ways to use the CircularProgressChart component
 * for the 3X-UI Style Transformation feature.
 */

import { CircularProgressChart } from './circular-progress-chart';

export function CircularProgressChartExamples() {
  return (
    <div className="space-y-8 p-8">
      <h1 className="text-2xl font-bold">CircularProgressChart Examples</h1>

      {/* Example 1: CPU Usage (Green - Below 70%) */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Example 1: CPU Usage (Green)</h2>
        <div className="flex gap-4">
          <CircularProgressChart
            value={45}
            max={100}
            label="CPU"
            unit="%"
          />
        </div>
      </section>

      {/* Example 2: RAM Usage (Yellow - 70-89%) */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Example 2: RAM Usage (Yellow)</h2>
        <div className="flex gap-4">
          <CircularProgressChart
            value={3072}
            max={4096}
            label="RAM"
            unit="MB"
          />
        </div>
      </section>

      {/* Example 3: Disk Usage (Red - 90%+) */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Example 3: Disk Usage (Red)</h2>
        <div className="flex gap-4">
          <CircularProgressChart
            value={920}
            max={1000}
            label="Disk"
            unit="GB"
          />
        </div>
      </section>

      {/* Example 4: Multiple Charts in Grid (Dashboard Layout) */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Example 4: Dashboard Layout</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CircularProgressChart
            value={65}
            max={100}
            label="CPU"
            unit="%"
          />
          <CircularProgressChart
            value={2560}
            max={4096}
            label="RAM"
            unit="MB"
          />
          <CircularProgressChart
            value={450}
            max={1000}
            label="Disk"
            unit="GB"
          />
          <CircularProgressChart
            value={512}
            max={2048}
            label="Swap"
            unit="MB"
          />
        </div>
      </section>

      {/* Example 5: Custom Size and Stroke Width */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Example 5: Custom Sizing</h2>
        <div className="flex gap-8">
          <CircularProgressChart
            value={75}
            max={100}
            label="Small"
            unit="%"
            size={100}
            strokeWidth={6}
          />
          <CircularProgressChart
            value={75}
            max={100}
            label="Default"
            unit="%"
          />
          <CircularProgressChart
            value={75}
            max={100}
            label="Large"
            unit="%"
            size={160}
            strokeWidth={12}
          />
        </div>
      </section>

      {/* Example 6: Color Override */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Example 6: Manual Color Override</h2>
        <div className="flex gap-4">
          <CircularProgressChart
            value={30}
            max={100}
            label="Force Red"
            unit="%"
            color="red"
          />
          <CircularProgressChart
            value={30}
            max={100}
            label="Force Yellow"
            unit="%"
            color="yellow"
          />
          <CircularProgressChart
            value={95}
            max={100}
            label="Force Green"
            unit="%"
            color="green"
          />
        </div>
      </section>

      {/* Example 7: Edge Cases */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Example 7: Edge Cases</h2>
        <div className="flex gap-4">
          <CircularProgressChart
            value={0}
            max={100}
            label="Empty"
            unit="%"
          />
          <CircularProgressChart
            value={100}
            max={100}
            label="Full"
            unit="%"
          />
          <CircularProgressChart
            value={69}
            max={100}
            label="69% (Green)"
            unit="%"
          />
          <CircularProgressChart
            value={70}
            max={100}
            label="70% (Yellow)"
            unit="%"
          />
          <CircularProgressChart
            value={90}
            max={100}
            label="90% (Red)"
            unit="%"
          />
        </div>
      </section>

      {/* Example 8: With Custom ARIA Labels */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Example 8: Accessibility (Custom ARIA)</h2>
        <div className="flex gap-4">
          <CircularProgressChart
            value={2048}
            max={4096}
            label="Memory"
            unit="MB"
            ariaLabel="Memory usage: 2048 out of 4096 megabytes, 50 percent used"
          />
        </div>
      </section>
    </div>
  );
}
