'use client';

/**
 * Inbound Settings Fields Component
 * 
 * Dynamically renders protocol-specific configuration fields for Xray inbounds.
 * Different protocols require different settings, and this component adapts
 * based on the selected protocol.
 * 
 * ## Features
 * 
 * - Dynamic fields based on protocol selection
 * - VLESS: encryption, flow settings
 * - VMess: alterId, security settings
 * - Trojan: password configuration
 * - Shadowsocks: cipher method, password
 * 
 * Validates: Requirements 5.10, 9.2
 * 
 * @module components/admin/xray/inbounds/inbound-settings-fields
 */

import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreateInboundFormData } from '@/lib/validations/xray';

/**
 * Props for InboundSettingsFields component
 */
interface InboundSettingsFieldsProps {
  /** The protocol currently selected */
  protocol: 'vless' | 'vmess' | 'trojan' | 'shadowsocks';
  /** React Hook Form instance */
  form: UseFormReturn<CreateInboundFormData>;
  /** Whether the fields are disabled */
  disabled?: boolean;
}

/**
 * InboundSettingsFields Component
 * 
 * Renders protocol-specific configuration fields.
 * The fields displayed adapt based on the selected protocol.
 * 
 * @example
 * ```tsx
 * <InboundSettingsFields
 *   protocol="vless"
 *   form={form}
 *   disabled={isSubmitting}
 * />
 * ```
 */
export function InboundSettingsFields({
  protocol,
  form,
  disabled = false,
}: InboundSettingsFieldsProps) {
  // VLESS protocol settings
  if (protocol === 'vless') {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border p-4">
          <h3 className="mb-4 text-sm font-medium">VLESS Protocol Settings</h3>
          
          <div className="space-y-4">
            {/* Encryption setting */}
            <FormField
              control={form.control}
              name="settings.encryption"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Encryption</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value as string || 'none'}
                    disabled={disabled}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select encryption" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    VLESS typically uses no encryption (TLS handles encryption)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Flow control */}
            <FormField
              control={form.control}
              name="settings.flow"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Flow Control (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="e.g., xtls-rprx-direct"
                      disabled={disabled}
                      {...field}
                      value={field.value as string || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Flow control for XTLS (leave empty for standard VLESS)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    );
  }

  // VMess protocol settings
  if (protocol === 'vmess') {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border p-4">
          <h3 className="mb-4 text-sm font-medium">VMess Protocol Settings</h3>
          
          <div className="space-y-4">
            {/* AlterID */}
            <FormField
              control={form.control}
              name="settings.alterId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alter ID</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      disabled={disabled}
                      {...field}
                      value={field.value as number || 0}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Number of alternative IDs (0 for modern VMess)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Security */}
            <FormField
              control={form.control}
              name="settings.security"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Security</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value as string || 'auto'}
                    disabled={disabled}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select security" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="aes-128-gcm">AES-128-GCM</SelectItem>
                      <SelectItem value="chacha20-poly1305">ChaCha20-Poly1305</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Encryption method for VMess protocol
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    );
  }

  // Trojan protocol settings
  if (protocol === 'trojan') {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border p-4">
          <h3 className="mb-4 text-sm font-medium">Trojan Protocol Settings</h3>
          
          <div className="space-y-4">
            {/* Password */}
            <FormField
              control={form.control}
              name="settings.password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter trojan password"
                      disabled={disabled}
                      {...field}
                      value={field.value as string || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Password for Trojan authentication
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fallback */}
            <FormField
              control={form.control}
              name="settings.fallback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fallback Address (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="e.g., 127.0.0.1:8080"
                      disabled={disabled}
                      {...field}
                      value={field.value as string || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Fallback destination for invalid requests
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    );
  }

  // Shadowsocks protocol settings
  if (protocol === 'shadowsocks') {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border p-4">
          <h3 className="mb-4 text-sm font-medium">Shadowsocks Protocol Settings</h3>
          
          <div className="space-y-4">
            {/* Method/Cipher */}
            <FormField
              control={form.control}
              name="settings.method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cipher Method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value as string || 'aes-256-gcm'}
                    disabled={disabled}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cipher method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="aes-256-gcm">AES-256-GCM</SelectItem>
                      <SelectItem value="aes-128-gcm">AES-128-GCM</SelectItem>
                      <SelectItem value="chacha20-ietf-poly1305">ChaCha20-IETF-Poly1305</SelectItem>
                      <SelectItem value="2022-blake3-aes-256-gcm">2022-Blake3-AES-256-GCM</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Encryption cipher for Shadowsocks
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="settings.password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter shadowsocks password"
                      disabled={disabled}
                      {...field}
                      value={field.value as string || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Password for Shadowsocks encryption
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Network */}
            <FormField
              control={form.control}
              name="settings.network"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Network</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value as string || 'tcp'}
                    disabled={disabled}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select network" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="tcp">TCP</SelectItem>
                      <SelectItem value="udp">UDP</SelectItem>
                      <SelectItem value="tcp,udp">TCP & UDP</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Network protocol for Shadowsocks
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    );
  }

  // Fallback: no settings for unknown protocol
  return null;
}
