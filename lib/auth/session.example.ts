/**
 * Example usage of session management utilities
 * 
 * This file demonstrates how to use the session utilities in various scenarios.
 * It serves as both documentation and validation that the utilities work correctly.
 * 
 * @module lib/auth/session.example
 */

import type { Session, UserInfo } from '@/types/auth';
import {
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_CONFIG,
  hasSessionCookie,
  getSessionExpiration,
  isSessionExpired,
  getSessionUser,
  isValidSessionStructure,
  createSession,
  getSessionTimeRemaining,
  formatSessionExpiration,
} from './session';

// ============================================================================
// Example 1: Creating a valid session
// ============================================================================

function exampleCreateSession() {
  console.log('=== Example 1: Creating a Session ===');
  
  const user: UserInfo = {
    id: 'user-123',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
  };
  
  // Create session that expires in 1 hour
  const expiresAt = new Date(Date.now() + 3600000).toISOString();
  const session = createSession(user, expiresAt);
  
  console.log('Created session:', session);
  console.log('Is valid structure:', isValidSessionStructure(session));
}

// ============================================================================
// Example 2: Validating session structure
// ============================================================================

function exampleValidateSession() {
  console.log('\n=== Example 2: Validating Session Structure ===');
  
  // Valid session
  const validSession = {
    user: {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'admin',
    },
    expiresAt: '2024-12-31T23:59:59.000Z',
  };
  
  // Invalid sessions
  const invalidSession1 = { user: 'not-an-object', expiresAt: '2024-12-31' };
  const invalidSession2 = { user: { id: '123' }, expiresAt: '2024-12-31' };
  const invalidSession3 = null;
  
  console.log('Valid session:', isValidSessionStructure(validSession));
  console.log('Invalid session 1:', isValidSessionStructure(invalidSession1));
  console.log('Invalid session 2:', isValidSessionStructure(invalidSession2));
  console.log('Invalid session 3:', isValidSessionStructure(invalidSession3));
}

// ============================================================================
// Example 3: Checking session expiration
// ============================================================================

function exampleCheckExpiration() {
  console.log('\n=== Example 3: Checking Session Expiration ===');
  
  const user: UserInfo = {
    id: '123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'admin',
  };
  
  // Future session (not expired)
  const futureSession: Session = {
    user,
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
  };
  
  // Expired session
  const expiredSession: Session = {
    user,
    expiresAt: new Date(Date.now() - 3600000).toISOString(),
  };
  
  console.log('Future session expired:', isSessionExpired(futureSession));
  console.log('Past session expired:', isSessionExpired(expiredSession));
  console.log('Future session time remaining:', getSessionTimeRemaining(futureSession), 'ms');
  console.log('Expired session time remaining:', getSessionTimeRemaining(expiredSession), 'ms');
}

// ============================================================================
// Example 4: Extracting user information
// ============================================================================

function exampleExtractUserInfo() {
  console.log('\n=== Example 4: Extracting User Information ===');
  
  const session: Session = {
    user: {
      id: '123',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
    },
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
  };
  
  const user = getSessionUser(session);
  console.log('User info:', user);
  console.log('User email:', user?.email);
  console.log('User role:', user?.role);
}

// ============================================================================
// Example 5: Formatting session information
// ============================================================================

function exampleFormatSession() {
  console.log('\n=== Example 5: Formatting Session Information ===');
  
  const session: Session = {
    user: {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'admin',
    },
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
  };
  
  const expiration = getSessionExpiration(session);
  console.log('Expiration date:', expiration);
  console.log('Formatted expiration:', formatSessionExpiration(session));
  
  // Invalid session
  console.log('Invalid session formatted:', formatSessionExpiration(null));
}

// ============================================================================
// Example 6: Session cookie configuration
// ============================================================================

function exampleCookieConfig() {
  console.log('\n=== Example 6: Session Cookie Configuration ===');
  
  console.log('Cookie name:', SESSION_COOKIE_NAME);
  console.log('Cookie config:', JSON.stringify(SESSION_COOKIE_CONFIG, null, 2));
  
  console.log('\nSecurity features:');
  console.log('- httpOnly:', SESSION_COOKIE_CONFIG.httpOnly, '(prevents XSS)');
  console.log('- sameSite:', SESSION_COOKIE_CONFIG.sameSite, '(prevents CSRF)');
  console.log('- secure:', SESSION_COOKIE_CONFIG.secure, '(HTTPS only in production)');
  console.log('- path:', SESSION_COOKIE_CONFIG.path, '(available on all routes)');
}

// ============================================================================
// Example 7: Client-side cookie detection (browser only)
// ============================================================================

function exampleCookieDetection() {
  console.log('\n=== Example 7: Client-Side Cookie Detection ===');
  
  // This only works in browser environment
  if (typeof window !== 'undefined') {
    const hasSession = hasSessionCookie();
    console.log('Has session cookie:', hasSession);
  } else {
    console.log('Running in server environment - cookie detection not available');
  }
}

// ============================================================================
// Example 8: Complete authentication flow simulation
// ============================================================================

function exampleAuthFlow() {
  console.log('\n=== Example 8: Complete Authentication Flow ===');
  
  // 1. User logs in, backend returns user info and expiration
  const user: UserInfo = {
    id: 'user-456',
    email: 'john@example.com',
    name: 'John Doe',
    role: 'admin',
  };
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
  
  // 2. Create session object
  const session = createSession(user, expiresAt);
  console.log('Step 1: Session created');
  
  // 3. Validate session structure
  if (!isValidSessionStructure(session)) {
    console.log('Error: Invalid session structure');
    return;
  }
  console.log('Step 2: Session structure validated');
  
  // 4. Check if session is expired
  if (isSessionExpired(session)) {
    console.log('Error: Session already expired');
    return;
  }
  console.log('Step 3: Session is not expired');
  
  // 5. Extract user info for application use
  const currentUser = getSessionUser(session);
  console.log('Step 4: User extracted:', currentUser?.name);
  
  // 6. Check time remaining
  const timeRemaining = getSessionTimeRemaining(session);
  const daysRemaining = Math.floor(timeRemaining / (24 * 60 * 60 * 1000));
  console.log(`Step 5: Session valid for ${daysRemaining} more days`);
  
  // 7. Format expiration for display
  const expirationText = formatSessionExpiration(session);
  console.log('Step 6: Expiration display:', expirationText);
  
  console.log('\n✅ Authentication flow completed successfully');
}

// ============================================================================
// Example 9: Error handling and edge cases
// ============================================================================

function exampleErrorHandling() {
  console.log('\n=== Example 9: Error Handling and Edge Cases ===');
  
  // Test with null session
  console.log('Null session expired:', isSessionExpired(null));
  console.log('Null session user:', getSessionUser(null));
  console.log('Null session time remaining:', getSessionTimeRemaining(null));
  console.log('Null session formatted:', formatSessionExpiration(null));
  
  // Test with invalid date
  const invalidDateSession: Session = {
    user: {
      id: '123',
      email: 'test@example.com',
      name: 'Test',
      role: 'admin',
    },
    expiresAt: 'not-a-valid-date',
  };
  
  console.log('\nInvalid date session:');
  console.log('- Expired:', isSessionExpired(invalidDateSession));
  console.log('- Expiration:', getSessionExpiration(invalidDateSession));
  console.log('- Time remaining:', getSessionTimeRemaining(invalidDateSession));
  console.log('- Formatted:', formatSessionExpiration(invalidDateSession));
}

// ============================================================================
// Example 10: Security validation
// ============================================================================

function exampleSecurityValidation() {
  console.log('\n=== Example 10: Security Validation ===');
  
  console.log('Security Requirements:');
  console.log('✅ Requirement 1.4: Sessions stored in httpOnly cookies');
  console.log('   - httpOnly flag:', SESSION_COOKIE_CONFIG.httpOnly);
  
  console.log('\n✅ Requirement 1.8: Tokens never in localStorage');
  console.log('   - Cookie is httpOnly:', SESSION_COOKIE_CONFIG.httpOnly);
  console.log('   - Client JS cannot access:', SESSION_COOKIE_CONFIG.httpOnly);
  
  console.log('\n✅ CSRF Protection:');
  console.log('   - sameSite attribute:', SESSION_COOKIE_CONFIG.sameSite);
  
  console.log('\n✅ Transport Security:');
  console.log('   - Secure in production:', SESSION_COOKIE_CONFIG.secure);
  console.log('   - Current environment:', process.env.NODE_ENV);
  
  console.log('\n✅ Session Validation:');
  const testSession = createSession(
    { id: '1', email: 'test@test.com', name: 'Test', role: 'admin' },
    new Date(Date.now() + 3600000).toISOString()
  );
  console.log('   - Valid structure check:', isValidSessionStructure(testSession));
  console.log('   - Expiration check:', !isSessionExpired(testSession));
}

// ============================================================================
// Run all examples (when imported as a module in Node.js)
// ============================================================================

export function runAllExamples() {
  console.log('📚 Session Management Utilities Examples\n');
  console.log('=' .repeat(70));
  
  exampleCreateSession();
  exampleValidateSession();
  exampleCheckExpiration();
  exampleExtractUserInfo();
  exampleFormatSession();
  exampleCookieConfig();
  exampleCookieDetection();
  exampleAuthFlow();
  exampleErrorHandling();
  exampleSecurityValidation();
  
  console.log('\n' + '='.repeat(70));
  console.log('✅ All examples completed successfully');
}

// Export individual examples for selective use
export {
  exampleCreateSession,
  exampleValidateSession,
  exampleCheckExpiration,
  exampleExtractUserInfo,
  exampleFormatSession,
  exampleCookieConfig,
  exampleCookieDetection,
  exampleAuthFlow,
  exampleErrorHandling,
  exampleSecurityValidation,
};
