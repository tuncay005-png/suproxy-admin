import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Users } from 'lucide-react';
import { PageHeader } from './page-header';
import { EmptyState } from '../ui/empty-state';
import { ErrorState } from './error-state';

describe('PageHeader', () => {
  it('renders heading correctly', () => {
    render(<PageHeader heading="Test Page" />);
    expect(screen.getByText('Test Page')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <PageHeader heading="Test Page" description="This is a test description" />
    );
    expect(screen.getByText('This is a test description')).toBeInTheDocument();
  });

  it('renders actions when provided', () => {
    render(
      <PageHeader
        heading="Test Page"
        actions={<button>Action Button</button>}
      />
    );
    expect(screen.getByText('Action Button')).toBeInTheDocument();
  });
});

describe('EmptyState', () => {
  it('renders title and icon', () => {
    render(<EmptyState icon={Users} title="No data found" />);
    expect(screen.getByText('No data found')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <EmptyState
        icon={Users}
        title="No data"
        description="No items to display"
      />
    );
    expect(screen.getByText('No items to display')).toBeInTheDocument();
  });

  it('renders action when provided', () => {
    render(
      <EmptyState
        icon={Users}
        title="No data"
        action={<button>Create New</button>}
      />
    );
    expect(screen.getByText('Create New')).toBeInTheDocument();
  });
});

describe('ErrorState', () => {
  it('renders error message', () => {
    render(<ErrorState message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <ErrorState
        message="Error occurred"
        description="Please check your connection"
      />
    );
    expect(screen.getByText('Please check your connection')).toBeInTheDocument();
  });

  it('renders retry button when onRetry is provided', () => {
    const onRetry = () => {};
    render(<ErrorState message="Error" onRetry={onRetry} />);
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('renders custom retry text', () => {
    const onRetry = () => {};
    render(
      <ErrorState message="Error" onRetry={onRetry} retryText="Reload" />
    );
    expect(screen.getByText('Reload')).toBeInTheDocument();
  });

  it('does not render retry button when onRetry is not provided', () => {
    render(<ErrorState message="Error" />);
    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
  });
});
