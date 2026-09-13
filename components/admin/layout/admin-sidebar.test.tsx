/**
 * Admin Sidebar Component Tests
 * 
 * Tests for the AdminSidebar component, focusing on i18n integration.
 * 
 * Validates: Requirements 3.5, 3.6
 */

import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { AdminSidebar } from './admin-sidebar';

// Mock AdminNav component
vi.mock('./admin-nav', () => ({
  AdminNav: ({ onItemClick }: any) => (
    <nav data-testid="admin-nav">Mock Nav</nav>
  ),
}));

describe('AdminSidebar i18n Integration', () => {
  it('should display app name from translation', () => {
    render(<AdminSidebar />);
    
    // The app name should be displayed (using t('common.app_name'))
    expect(screen.getByText('Suproxy Admin')).toBeInTheDocument();
  });

  it('should display version text from translation', () => {
    render(<AdminSidebar />);
    
    // The version text should include the translation key value (using t('common.version'))
    // Pattern matches "Version v0.1.0" in English
    expect(screen.getByText(/Version v0\.1\.0/)).toBeInTheDocument();
  });

  it('should have proper structure with logo and navigation', () => {
    render(<AdminSidebar />);
    
    // Check for navigation landmark
    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(nav).toBeInTheDocument();
    
    // Check for AdminNav component
    expect(screen.getByTestId('admin-nav')).toBeInTheDocument();
  });

  it('should render close button on mobile when open', () => {
    render(<AdminSidebar isOpen={true} onClose={vi.fn()} />);
    
    const closeButton = screen.getByRole('button', { name: 'Close menu' });
    expect(closeButton).toBeInTheDocument();
  });

  it('should link to admin dashboard from logo', () => {
    render(<AdminSidebar />);
    
    const logoLink = screen.getByText('Suproxy Admin').closest('a');
    expect(logoLink).toHaveAttribute('href', '/admin');
  });
});
