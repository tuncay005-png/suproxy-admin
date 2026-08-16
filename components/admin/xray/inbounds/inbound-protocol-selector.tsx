'use client';

/**
 * Inbound Protocol Selector Component
 * 
 * A reusable dropdown selector for Xray inbound protocols.
 * Supports vless, vmess, trojan, and shadowsocks protocols.
 * 
 * ## Features
 * 
 * - Protocol dropdown with clear labels
 * - Support for vless, vmess, trojan, shadowsocks
 * - Disabled state handling
 * - Form integration with react-hook-form
 * 
 * Validates: Requirements 5.3, 5.10, 9.2
 * 
 * @module components/admin/xray/inbounds/inbound-protocol-selector
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * Protocol option type
 */
interface ProtocolOption {
  value: 'vless' | 'vmess' | 'trojan' | 'shadowsocks';
  label: string;
  description: string;
}

/**
 * Available protocol options with descriptions
 */
const PROTOCOL_OPTIONS: ProtocolOption[] = [
  {
    value: 'vless',
    label: 'VLESS',
    description: 'Lightweight protocol with better performance',
  },
  {
    value: 'vmess',
    label: 'VMess',
    description: 'Traditional V2Ray protocol with encryption',
  },
  {
    value: 'trojan',
    label: 'Trojan',
    description: 'Protocol that mimics HTTPS traffic',
  },
  {
    value: 'shadowsocks',
    label: 'Shadowsocks',
    description: 'Fast and simple proxy protocol',
  },
];

/**
 * Props for InboundProtocolSelector component
 */
interface InboundProtocolSelectorProps {
  /** Current selected protocol value */
  value: string;
  /** Callback when protocol changes */
  onValueChange: (value: string) => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
}

/**
 * InboundProtocolSelector Component
 * 
 * Renders a protocol selection dropdown for Xray inbound configuration.
 * Integrates with react-hook-form for validation and state management.
 * 
 * @example
 * ```tsx
 * <InboundProtocolSelector
 *   value={protocol}
 *   onValueChange={setProtocol}
 *   disabled={isSubmitting}
 * />
 * ```
 */
export function InboundProtocolSelector({
  value,
  onValueChange,
  disabled = false,
}: InboundProtocolSelectorProps) {
  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select a protocol" />
      </SelectTrigger>
      <SelectContent>
        {PROTOCOL_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex flex-col">
              <span className="font-medium">{option.label}</span>
              <span className="text-xs text-muted-foreground">
                {option.description}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
