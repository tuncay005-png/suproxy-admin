/**
 * DataTable Component Tests
 * 
 * Tests for the reusable DataTable component functionality.
 * 
 * @module components/admin/common/data-table.test
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { DataTable, DataTableColumn } from './data-table';

// Test data
const mockData = [
  { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active', age: 30 },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'inactive', age: 25 },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', status: 'active', age: 35 },
];

const columns: DataTableColumn[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'status', label: 'Status' },
  { key: 'age', label: 'Age', sortable: true },
];

describe('DataTable', () => {
  describe('Basic Rendering', () => {
    it('renders table with data', () => {
      render(<DataTable columns={columns} data={mockData} />);
      
      // Check column headers are present (will appear in both desktop and mobile)
      expect(screen.getAllByText('Name').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Email').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Status').length).toBeGreaterThan(0);
      
      // Check data is rendered (will appear in both desktop and mobile views)
      expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
      expect(screen.getAllByText('jane@example.com').length).toBeGreaterThan(0);
    });

    it('renders empty state when no data', () => {
      render(
        <DataTable
          columns={columns}
          data={[]}
          emptyMessage="No items found"
          emptyDescription="Please add some items"
        />
      );
      
      expect(screen.getByText('No items found')).toBeInTheDocument();
      expect(screen.getByText('Please add some items')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      const { container } = render(
        <DataTable columns={columns} data={mockData} className="custom-class" />
      );
      
      const wrapper = container.querySelector('.custom-class');
      expect(wrapper).toBeInTheDocument();
    });

    it('renders row numbers when enabled', () => {
      render(<DataTable columns={columns} data={mockData} showRowNumbers={true} />);
      
      // Check for row number header
      expect(screen.getByText('#')).toBeInTheDocument();
      // Check for row numbers in cells (will appear in both views)
      expect(screen.getAllByText('#1').length).toBeGreaterThan(0);
      expect(screen.getAllByText('#2').length).toBeGreaterThan(0);
      expect(screen.getAllByText('#3').length).toBeGreaterThan(0);
    });
  });

  describe('Search Functionality', () => {
    it('renders search input when searchable is true', () => {
      render(<DataTable columns={columns} data={mockData} searchable={true} />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      expect(searchInput).toBeInTheDocument();
    });

    it('filters data based on search query', () => {
      render(<DataTable columns={columns} data={mockData} searchable={true} />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      
      // Search for "Jane"
      fireEvent.change(searchInput, { target: { value: 'Jane' } });
      
      // Should show Jane's row (in both views)
      expect(screen.getAllByText('Jane Smith').length).toBeGreaterThan(0);
      // Should not show John's row
      expect(screen.queryAllByText('John Doe').length).toBe(0);
    });

    it('shows empty state when search has no results', () => {
      render(<DataTable columns={columns} data={mockData} searchable={true} />);
      
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
      
      expect(screen.getByText('No results found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search terms or filters.')).toBeInTheDocument();
    });

    it('uses custom search placeholder', () => {
      render(
        <DataTable
          columns={columns}
          data={mockData}
          searchable={true}
          searchPlaceholder="Search users..."
        />
      );
      
      expect(screen.getByPlaceholderText('Search users...')).toBeInTheDocument();
    });

    it('searches in specified keys only', () => {
      render(
        <DataTable
          columns={columns}
          data={mockData}
          searchable={true}
          searchKeys={['name']}
        />
      );
      
      const searchInput = screen.getByPlaceholderText('Search...');
      
      // Search for email (should not match since only 'name' is in searchKeys)
      fireEvent.change(searchInput, { target: { value: 'john@example.com' } });
      expect(screen.queryAllByText('John Doe').length).toBe(0);
      
      // Search for name (should match)
      fireEvent.change(searchInput, { target: { value: 'John' } });
      expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
    });
  });

  describe('Sorting Functionality', () => {
    it('sorts data ascending when column header is clicked', () => {
      const { container } = render(<DataTable columns={columns} data={mockData} sortable={true} />);
      
      // Get the desktop table container
      const desktopTable = container.querySelector('.hidden.md\\:block table');
      expect(desktopTable).toBeInTheDocument();
      
      // Click on Age column header
      const ageHeaders = screen.getAllByText('Age');
      fireEvent.click(ageHeaders[0]); // Click first one (desktop view)
      
      // Get all age cells from desktop table and verify ascending order
      const rows = within(desktopTable!).getAllByRole('row').slice(1); // Skip header row
      const ages = rows.map(row => {
        const cells = within(row).getAllByRole('cell');
        return cells[cells.length - 1].textContent; // Last cell is age
      });
      
      // Should be sorted: 25, 30, 35
      expect(ages).toEqual(['25', '30', '35']);
    });

    it('sorts data descending when column header is clicked twice', () => {
      const { container } = render(<DataTable columns={columns} data={mockData} sortable={true} />);
      
      const desktopTable = container.querySelector('.hidden.md\\:block table');
      const ageHeaders = screen.getAllByText('Age');
      
      // First click: ascending
      fireEvent.click(ageHeaders[0]);
      // Second click: descending
      fireEvent.click(ageHeaders[0]);
      
      const rows = within(desktopTable!).getAllByRole('row').slice(1);
      const ages = rows.map(row => {
        const cells = within(row).getAllByRole('cell');
        return cells[cells.length - 1].textContent;
      });
      
      // Should be sorted: 35, 30, 25
      expect(ages).toEqual(['35', '30', '25']);
    });

    it('clears sort when column header is clicked third time', () => {
      const { container } = render(<DataTable columns={columns} data={mockData} sortable={true} />);
      
      const desktopTable = container.querySelector('.hidden.md\\:block table');
      const ageHeaders = screen.getAllByText('Age');
      
      // Click three times
      fireEvent.click(ageHeaders[0]);
      fireEvent.click(ageHeaders[0]);
      fireEvent.click(ageHeaders[0]);
      
      const rows = within(desktopTable!).getAllByRole('row').slice(1);
      const ages = rows.map(row => {
        const cells = within(row).getAllByRole('cell');
        return cells[cells.length - 1].textContent;
      });
      
      // Should be back to original order: 30, 25, 35
      expect(ages).toEqual(['30', '25', '35']);
    });

    it('sorts string columns alphabetically', () => {
      const { container } = render(<DataTable columns={columns} data={mockData} sortable={true} />);
      
      const desktopTable = container.querySelector('.hidden.md\\:block table');
      const nameHeaders = screen.getAllByText('Name');
      fireEvent.click(nameHeaders[0]);
      
      const rows = within(desktopTable!).getAllByRole('row').slice(1);
      const names = rows.map(row => {
        const cells = within(row).getAllByRole('cell');
        return cells[0].textContent; // First cell is name
      });
      
      // Should be sorted alphabetically
      expect(names).toEqual(['Bob Johnson', 'Jane Smith', 'John Doe']);
    });
  });

  describe('Actions', () => {
    it('renders action dropdown when actions are provided', () => {
      const actions = {
        view: vi.fn(),
        edit: vi.fn(),
        delete: vi.fn(),
      };
      
      render(<DataTable columns={columns} data={mockData} actions={actions} />);
      
      // Check for Actions column header
      expect(screen.getByText('Actions')).toBeInTheDocument();
      
      // Check for action menu buttons in desktop view (there should be 3, one per row)
      const actionButtons = screen.getAllByLabelText('Actions menu');
      expect(actionButtons).toHaveLength(3);
    });

    it('calls view action when View is clicked', async () => {
      const viewMock = vi.fn();
      const actions = { view: viewMock };
      
      render(<DataTable columns={columns} data={mockData} actions={actions} />);
      
      // Click first action menu (desktop view)
      const actionButtons = screen.getAllByLabelText('Actions menu');
      fireEvent.click(actionButtons[0]);
      
      // Wait for menu to open and click View option
      const viewOptions = await screen.findAllByText('View');
      fireEvent.click(viewOptions[0]); // First one is from desktop dropdown
      
      expect(viewMock).toHaveBeenCalledWith(mockData[0]);
    });

    it('calls edit action when Edit is clicked', async () => {
      const editMock = vi.fn();
      const actions = { edit: editMock };
      
      render(<DataTable columns={columns} data={mockData} actions={actions} />);
      
      const actionButtons = screen.getAllByLabelText('Actions menu');
      fireEvent.click(actionButtons[0]); // Click first row (John Doe)
      
      const editOptions = await screen.findAllByText('Edit');
      fireEvent.click(editOptions[0]);
      
      expect(editMock).toHaveBeenCalledWith(mockData[0]); // Should be John (index 0)
    });

    it('calls delete action when Delete is clicked', async () => {
      const deleteMock = vi.fn();
      const actions = { delete: deleteMock };
      
      render(<DataTable columns={columns} data={mockData} actions={actions} />);
      
      const actionButtons = screen.getAllByLabelText('Actions menu');
      fireEvent.click(actionButtons[0]); // Click first row (John Doe)
      
      const deleteOptions = await screen.findAllByText('Delete');
      fireEvent.click(deleteOptions[0]);
      
      expect(deleteMock).toHaveBeenCalledWith(mockData[0]); // Should be John (index 0)
    });

    it('only renders provided actions', async () => {
      const actions = { view: vi.fn() }; // Only view action
      
      render(<DataTable columns={columns} data={mockData} actions={actions} />);
      
      const actionButtons = screen.getAllByLabelText('Actions menu');
      fireEvent.click(actionButtons[0]);
      
      // Should show View (will appear in dropdown)
      const viewOptions = await screen.findAllByText('View');
      expect(viewOptions.length).toBeGreaterThan(0);
      // Should not show Edit or Delete in dropdown
      expect(screen.queryByRole('menuitem', { name: /Edit/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('menuitem', { name: /Delete/i })).not.toBeInTheDocument();
    });
  });

  describe('Custom Rendering', () => {
    it('uses custom render function for columns', () => {
      const columnsWithRender: DataTableColumn[] = [
        {
          key: 'name',
          label: 'Name',
          render: (value) => <strong data-testid="custom-name">{value}</strong>,
        },
        { key: 'email', label: 'Email' },
      ];
      
      render(<DataTable columns={columnsWithRender} data={mockData} />);
      
      // Check custom render is applied (will appear in both views)
      const customElements = screen.getAllByTestId('custom-name');
      expect(customElements.length).toBeGreaterThan(0);
      expect(customElements[0].tagName).toBe('STRONG');
      expect(customElements[0]).toHaveTextContent('John Doe');
    });

    it('renders "—" for null/undefined values', () => {
      const dataWithNulls = [
        { id: '1', name: 'John', email: null, status: undefined },
      ];
      
      render(<DataTable columns={columns} data={dataWithNulls} />);
      
      // Check that null and undefined are rendered as "—"
      const cells = screen.getAllByText('—');
      expect(cells.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Behavior', () => {
    it('hides columns on tablet when hiddenOnTablet is true', () => {
      const responsiveColumns: DataTableColumn[] = [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email', hiddenOnTablet: true },
      ];
      
      const { container } = render(
        <DataTable columns={responsiveColumns} data={mockData} />
      );
      
      // Email column header should have hidden class on tablet
      const desktopTable = container.querySelector('.hidden.md\\:block table');
      const emailHeader = within(desktopTable!).getByText('Email');
      expect(emailHeader.parentElement).toHaveClass('hidden', 'lg:table-cell');
    });

    it('renders mobile card layout on small screens', () => {
      render(<DataTable columns={columns} data={mockData} />);
      
      // Check for mobile-specific structure
      // The mobile view has a space-y-4 md:hidden container
      const { container } = render(<DataTable columns={columns} data={mockData} />);
      const mobileContainer = container.querySelector('.md\\:hidden');
      expect(mobileContainer).toBeInTheDocument();
    });
  });

  describe('Nested Data Access', () => {
    it('accesses nested properties using dot notation', () => {
      const nestedData = [
        { id: '1', user: { name: 'John', address: { city: 'NYC' } } },
      ];
      
      const nestedColumns: DataTableColumn[] = [
        { key: 'user.name', label: 'Name' },
        { key: 'user.address.city', label: 'City' },
      ];
      
      render(<DataTable columns={nestedColumns} data={nestedData} />);
      
      // Values will appear in both desktop and mobile views
      expect(screen.getAllByText('John').length).toBeGreaterThan(0);
      expect(screen.getAllByText('NYC').length).toBeGreaterThan(0);
    });
  });
});
