/**
 * Unit Tests for User Creation Page
 * 
 * Tests the rendering and structure of the user creation page component.
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NewUserPage from './page';

// Mock the components
vi.mock('@/components/admin/page-header', () => ({
  PageHeader: ({ heading, description }: { heading: string; description: string }) => (
    <div data-testid="page-header">
      <h1>{heading}</h1>
      <p>{description}</p>
    </div>
  ),
}));

vi.mock('@/components/admin/users/user-creation-form', () => ({
  UserCreationForm: () => <div data-testid="user-creation-form">User Creation Form</div>,
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <h2 data-testid="card-title">{children}</h2>
  ),
  CardDescription: ({ children }: { children: React.ReactNode }) => (
    <p data-testid="card-description">{children}</p>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-content">{children}</div>
  ),
}));

describe('NewUserPage', () => {
  it('renders the page header with correct title and description', () => {
    render(<NewUserPage />);
    
    expect(screen.getByText('Create User')).toBeInTheDocument();
    expect(screen.getByText('Add a new user to the system')).toBeInTheDocument();
  });

  it('renders the card with user details section', () => {
    render(<NewUserPage />);
    
    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByText('User Details')).toBeInTheDocument();
    expect(screen.getByText('Enter the information for the new user account')).toBeInTheDocument();
  });

  it('renders the UserCreationForm component', () => {
    render(<NewUserPage />);
    
    expect(screen.getByTestId('user-creation-form')).toBeInTheDocument();
  });

  it('applies max-width styling to the card', () => {
    render(<NewUserPage />);
    
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('max-w-2xl');
  });
});
