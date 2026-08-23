/**
 * Multi-Tab Synchronization for Authentication Events
 * 
 * Uses BroadcastChannel (modern browsers) with localStorage fallback (IE11, Safari < 15.4)
 * 
 * Events:
 * - token_refreshed: New tokens received, other tabs should know
 * - logout: User logged out, redirect all tabs to login
 * 
 * Usage:
 * ```typescript
 * import { multiTabSync } from '@/lib/auth/multi-tab-sync';
 * 
 * // After successful token refresh
 * multiTabSync.notifyTokenRefreshed();
 * 
 * // After logout
 * multiTabSync.notifyLogout('user_initiated');
 * ```
 */

type AuthEvent = 'token_refreshed' | 'logout';

interface AuthMessage {
  type: AuthEvent;
  timestamp: number;
  payload?: {
    reason?: string;
  };
}

class MultiTabSync {
  private channel: BroadcastChannel | null = null;
  private storageKey = 'suproxy_auth_event';
  private useBroadcastChannel = false;

  constructor() {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      return;
    }

    // Try to use BroadcastChannel (modern browsers)
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel('suproxy_auth_channel');
        this.useBroadcastChannel = true;
        console.log('[MULTI-TAB-SYNC] BroadcastChannel initialized');
        
        // Listen for messages from other tabs
        this.channel.onmessage = (event: MessageEvent<AuthMessage>) => {
          this.handleMessage(event.data);
        };
      } catch (error) {
        console.warn('[MULTI-TAB-SYNC] BroadcastChannel failed, falling back to localStorage:', error);
        this.useBroadcastChannel = false;
      }
    }

    // If BroadcastChannel not available, use localStorage
    if (!this.useBroadcastChannel) {
      console.log('[MULTI-TAB-SYNC] Using localStorage fallback');
      window.addEventListener('storage', this.handleStorageEvent.bind(this));
    }
  }

  /**
   * Handle message from BroadcastChannel
   */
  private handleMessage(message: AuthMessage): void {
    console.log('[MULTI-TAB-SYNC] Received message:', message.type);

    switch (message.type) {
      case 'token_refreshed':
        this.handleTokenRefreshed();
        break;
      case 'logout':
        this.handleLogout(message.payload?.reason);
        break;
    }
  }

  /**
   * Handle storage event (localStorage fallback)
   */
  private handleStorageEvent(event: StorageEvent): void {
    if (event.key !== this.storageKey || !event.newValue) {
      return;
    }

    try {
      const message: AuthMessage = JSON.parse(event.newValue);
      
      // Ignore old events (more than 5 seconds old)
      if (Date.now() - message.timestamp > 5000) {
        return;
      }

      this.handleMessage(message);
    } catch (error) {
      console.error('[MULTI-TAB-SYNC] Failed to parse storage event:', error);
    }
  }

  /**
   * Broadcast message to all tabs
   */
  private broadcast(message: AuthMessage): void {
    if (typeof window === 'undefined') {
      return;
    }

    if (this.useBroadcastChannel && this.channel) {
      // Use BroadcastChannel
      try {
        this.channel.postMessage(message);
      } catch (error) {
        console.error('[MULTI-TAB-SYNC] Failed to post message to BroadcastChannel:', error);
      }
    } else {
      // Use localStorage fallback
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(message));
        
        // Clean up after 1 second to prevent stale events
        setTimeout(() => {
          try {
            const current = localStorage.getItem(this.storageKey);
            if (current === JSON.stringify(message)) {
              localStorage.removeItem(this.storageKey);
            }
          } catch {
            // Ignore cleanup errors
          }
        }, 1000);
      } catch (error) {
        console.error('[MULTI-TAB-SYNC] Failed to write to localStorage:', error);
      }
    }
  }

  /**
   * Handle token refreshed event
   */
  private handleTokenRefreshed(): void {
    console.log('[MULTI-TAB-SYNC] Token refreshed in another tab');
    // In the future, could trigger UI update or notification
    // For now, just log (new tokens are in cookies, accessible automatically)
  }

  /**
   * Handle logout event
   */
  private handleLogout(reason?: string): void {
    console.log('[MULTI-TAB-SYNC] Logout detected in another tab, reason:', reason);
    
    // Redirect to login page
    if (typeof window !== 'undefined') {
      const reasonParam = reason ? `?reason=${encodeURIComponent(reason)}` : '';
      window.location.href = `/login${reasonParam}`;
    }
  }

  /**
   * Notify all tabs that token was refreshed
   */
  public notifyTokenRefreshed(): void {
    console.log('[MULTI-TAB-SYNC] Notifying other tabs: token_refreshed');
    this.broadcast({
      type: 'token_refreshed',
      timestamp: Date.now(),
    });
  }

  /**
   * Notify all tabs that user logged out
   */
  public notifyLogout(reason?: string): void {
    console.log('[MULTI-TAB-SYNC] Notifying other tabs: logout, reason:', reason);
    this.broadcast({
      type: 'logout',
      timestamp: Date.now(),
      payload: { reason },
    });
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }

    if (!this.useBroadcastChannel && typeof window !== 'undefined') {
      window.removeEventListener('storage', this.handleStorageEvent.bind(this));
    }
  }
}

// Singleton instance
export const multiTabSync = new MultiTabSync();
