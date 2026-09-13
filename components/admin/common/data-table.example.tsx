/**
 * DataTable Component Usage Examples
 * 
 * This file shows various ways to use the DataTable component.
 * 
 * @module components/admin/common/data-table.example
 */

import { DataTable, DataTableColumn } from './data-table';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/utils/format';

// Example 1: Basic Table
// ----------------------

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const users: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin', createdAt: '2024-01-15' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user', createdAt: '2024-01-20' },
];

const basicColumns: DataTableColumn<User>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Role' },
];

export function BasicTableExample() {
  return (
    <DataTable
      columns={basicColumns}
      data={users}
    />
  );
}

// Example 2: Table with Search
// -----------------------------

export function SearchableTableExample() {
  return (
    <DataTable
      columns={basicColumns}
      data={users}
      searchable={true}
      searchPlaceholder="Search users by name or email..."
      searchKeys={['name', 'email']} // Only search in these fields
    />
  );
}

// Example 3: Table with Custom Rendering
// ---------------------------------------

const customColumns: DataTableColumn<User>[] = [
  { 
    key: 'name', 
    label: 'Name', 
    sortable: true,
    render: (value) => <span className="font-semibold">{value}</span>
  },
  { 
    key: 'email', 
    label: 'Email',
    hiddenOnMobile: false, // Show on mobile
  },
  { 
    key: 'role', 
    label: 'Role',
    render: (value) => (
      <Badge variant={value === 'admin' ? 'default' : 'secondary'}>
        {value}
      </Badge>
    )
  },
  {
    key: 'createdAt',
    label: 'Created',
    hiddenOnTablet: true, // Hide on tablet screens
    render: (value) => formatDateTime(value)
  },
];

export function CustomRenderExample() {
  return (
    <DataTable
      columns={customColumns}
      data={users}
      searchable={true}
    />
  );
}

// Example 4: Table with Actions
// ------------------------------

export function ActionsTableExample() {
  const handleView = (user: User) => {
    console.log('Viewing user:', user);
    // Navigate to user detail page or open modal
  };

  const handleEdit = (user: User) => {
    console.log('Editing user:', user);
    // Navigate to edit page or open edit dialog
  };

  const handleDelete = async (user: User) => {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      console.log('Deleting user:', user);
      // Call API to delete user
      // await deleteUser(user.id);
    }
  };

  return (
    <DataTable
      columns={basicColumns}
      data={users}
      actions={{
        view: handleView,
        edit: handleEdit,
        delete: handleDelete,
      }}
    />
  );
}

// Example 5: Table with Row Numbers
// ----------------------------------

export function RowNumbersExample() {
  return (
    <DataTable
      columns={basicColumns}
      data={users}
      showRowNumbers={true}
    />
  );
}

// Example 6: Table with Nested Data
// ----------------------------------

interface Order {
  id: string;
  customer: {
    name: string;
    email: string;
  };
  product: {
    name: string;
    price: number;
  };
  status: string;
}

const orders: Order[] = [
  {
    id: '1',
    customer: { name: 'John Doe', email: 'john@example.com' },
    product: { name: 'Product A', price: 29.99 },
    status: 'pending',
  },
];

const nestedColumns: DataTableColumn<Order>[] = [
  { key: 'customer.name', label: 'Customer', sortable: true },
  { key: 'product.name', label: 'Product', sortable: true },
  { 
    key: 'product.price', 
    label: 'Price',
    render: (value) => `$${value.toFixed(2)}`
  },
  { key: 'status', label: 'Status' },
];

export function NestedDataExample() {
  return (
    <DataTable
      columns={nestedColumns}
      data={orders}
      searchable={true}
    />
  );
}

// Example 7: Complete Feature-Rich Table
// ---------------------------------------

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive';
  lastUpdated: string;
}

const products: Product[] = [
  {
    id: '1',
    name: 'Laptop',
    category: 'Electronics',
    price: 999.99,
    stock: 15,
    status: 'active',
    lastUpdated: '2024-01-20T10:30:00Z',
  },
];

const productColumns: DataTableColumn<Product>[] = [
  { 
    key: 'name', 
    label: 'Product Name', 
    sortable: true,
    className: 'font-medium'
  },
  { 
    key: 'category', 
    label: 'Category', 
    sortable: true,
    hiddenOnMobile: true
  },
  { 
    key: 'price', 
    label: 'Price',
    sortable: true,
    render: (value) => `$${value.toFixed(2)}`
  },
  { 
    key: 'stock', 
    label: 'Stock',
    sortable: true,
    hiddenOnTablet: true,
    render: (value) => (
      <Badge variant={value > 10 ? 'default' : value > 0 ? 'secondary' : 'destructive'}>
        {value} units
      </Badge>
    )
  },
  { 
    key: 'status', 
    label: 'Status',
    render: (value) => (
      <Badge variant={value === 'active' ? 'default' : 'secondary'}>
        {value}
      </Badge>
    )
  },
  { 
    key: 'lastUpdated', 
    label: 'Last Updated',
    sortable: true,
    hiddenOnTablet: true,
    render: (value) => formatDateTime(value)
  },
];

export function FullFeaturedExample() {
  const handleView = (product: Product) => {
    window.location.href = `/admin/products/${product.id}`;
  };

  const handleEdit = (product: Product) => {
    window.location.href = `/admin/products/${product.id}/edit`;
  };

  const handleDelete = async (product: Product) => {
    if (confirm(`Delete ${product.name}?`)) {
      // await deleteProduct(product.id);
      console.log('Deleted:', product);
    }
  };

  return (
    <DataTable
      columns={productColumns}
      data={products}
      searchable={true}
      searchPlaceholder="Search products..."
      searchKeys={['name', 'category']}
      sortable={true}
      showRowNumbers={false}
      actions={{
        view: handleView,
        edit: handleEdit,
        delete: handleDelete,
      }}
      emptyMessage="No products found"
      emptyDescription="Try adjusting your search or filters to find what you're looking for."
      className="my-4"
    />
  );
}

// Example 8: Custom Row Key
// --------------------------

interface Item {
  sku: string; // Using SKU instead of id
  name: string;
  quantity: number;
}

const items: Item[] = [
  { sku: 'SKU-001', name: 'Item A', quantity: 10 },
  { sku: 'SKU-002', name: 'Item B', quantity: 5 },
];

const itemColumns: DataTableColumn<Item>[] = [
  { key: 'sku', label: 'SKU', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'quantity', label: 'Quantity' },
];

export function CustomRowKeyExample() {
  return (
    <DataTable
      columns={itemColumns}
      data={items}
      getRowKey={(item) => item.sku} // Use SKU as the unique key
    />
  );
}
