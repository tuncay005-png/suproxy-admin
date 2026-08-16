/**
 * Authentication utilities
 * 
 * This module exports session management and authentication utilities.
 * 
 * @module lib/auth
 */

export {
  // Session cookie constants
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_CONFIG,
  
  // Session validation utilities
  hasSessionCookie,
  isSessionExpired,
  isValidSessionStructure,
  
  // Session data extraction
  getSessionUser,
  getSessionExpiration,
  getSessionTimeRemaining,
  
  // Session helpers
  createSession,
  formatSessionExpiration,
} from './session';
