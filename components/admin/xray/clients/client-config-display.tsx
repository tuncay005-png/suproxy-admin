'use client';

/**
 * Client Configuration Display Component
 * 
 * Client-side component for displaying Xray client configuration details
 * including connection URL with copy-to-clipboard functionality and QR code.
 * 
 * ## Features
 * 
 * - Displays connection URL with copy button
 * - Renders QR code from base64-encoded data
 * - Success feedback for copy operations
 * - Responsive layout for mobile and desktop
 * - Clean, card-based UI following existing patterns
 * 
 * ## Usage
 * 
 * This component is shown:
 * - After client creation (in ClientForm success state)
 * - In client detail view pages
 * 
 * Validates: Requirements 6.9
 * Task: 10.3 Create Client configuration display
 * 
 * @module components/admin/xray/clients/client-config-display
 */

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { XrayClientConfig } from '@/types/xray';
import { cn } from '@/lib/utils';

/**
 * Props for ClientConfigDisplay component
 */
interface ClientConfigDisplayProps {
  /** Client configuration data from backend */
  config: XrayClientConfig;
  /** Optional client email for display */
  clientEmail?: string;
  /** Optional title override */
  title?: string;
  /** Optional description override */
  description?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ClientConfigDisplay Component
 * 
 * Renders a card displaying Xray client configuration with connection URL
 * and QR code. Provides copy-to-clipboard functionality with success feedback.
 * 
 * ## Requirements
 * 
 * - Display connection URL with copy-to-clipboard button (Req 6.9)
 * - Display QR code using qr_code_data from backend (Req 6.9)
 * - Use QR code library (qrcode.react) to render QR code (Task 10.3)
 * - Add "Copy URL" button with success feedback (Task 10.3)
 * - Show after client creation and in client detail view (Task 10.3)
 * 
 * @example
 * ```tsx
 * <ClientConfigDisplay
 *   config={clientConfig}
 *   clientEmail="user@example.com"
 * />
 * ```
 */
export function ClientConfigDisplay({
  config,
  clientEmail,
  title = 'Client Configuration',
  description = 'Use the connection URL or scan the QR code to configure your client',
  className,
}: ClientConfigDisplayProps) {
  const [isCopied, setIsCopied] = useState(false);

  /**
   * Handle copying connection URL to clipboard
   * Provides visual feedback for 2 seconds after successful copy
   */
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(config.connection_url);
      setIsCopied(true);
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {clientEmail && (
            <span className="block mb-1 font-medium text-foreground">
              Client: {clientEmail}
            </span>
          )}
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection URL Section */}
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium mb-2">Connection URL</h4>
            <div className="relative">
              <div className="p-3 bg-muted rounded-md border break-all font-mono text-xs">
                {config.connection_url}
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyUrl}
            className="w-full sm:w-auto"
          >
            {isCopied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy URL
              </>
            )}
          </Button>
        </div>

        {/* QR Code Section */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">QR Code</h4>
          <div className="flex justify-center p-6 bg-white dark:bg-gray-50 rounded-lg border">
            <QRCodeSVG
              value={config.connection_url}
              size={200}
              level="H"
              includeMargin={true}
              className="w-full max-w-[200px] h-auto"
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Scan this QR code with your Xray client application
          </p>
        </div>

        {/* Configuration Details Section */}
        <div className="space-y-3 pt-3 border-t">
          <h4 className="text-sm font-medium">Configuration Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">Protocol</p>
              <p className="font-medium font-mono">{config.protocol}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Address</p>
              <p className="font-medium font-mono">{config.address}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Port</p>
              <p className="font-medium font-mono">{config.port}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">UUID</p>
              <p className="font-medium font-mono text-xs break-all">{config.uuid}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
