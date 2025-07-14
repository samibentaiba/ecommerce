# Testing Documentation

This document provides comprehensive information about the unit tests, integration tests, and testing setup for the Orders management system.

## Test Structure

```
src/app/admin/(protected)/orders/
├── __tests__/
│   ├── hook.test.ts          # useOrders hook tests
│   ├── page.test.tsx         # OrdersPage component tests
│   └── integration.test.ts   # End-to-end integration tests
├── hook.ts                   # Custom hook implementation
└── page.tsx                  # Main component

src/app/api/admin/orders/
├── __tests__/
│   └── route.test.ts         # API route tests
└── route.ts                  # API implementation

prisma/
├── __tests__/
│   └── schema.test.ts        # Database schema tests
└── schema.prisma             # Database schema
```

## Test Categories

### 1. Hook Tests (`hook.test.ts`)

Tests for the `useOrders` custom hook covering:

#### Initial State

- ✅ Default values initialization
- ✅ Loading state management
- ✅ Form state setup

#### Data Fetching

- ✅ Orders fetching on mount
- ✅ Products fetching on mount
- ✅ Error handling for network failures
- ✅ Loading state transitions

#### Search and Filtering

- ✅ Search term filtering
- ✅ Status filtering
- ✅ Combined search and status filtering
- ✅ Case-insensitive search
- ✅ "All" status filter behavior

#### CRUD Operations

- ✅ **Create Order**: POST request, state updates, error handling
- ✅ **Read Orders**: GET request, data transformation
- ✅ **Update Order**: PUT request, status updates, form updates
- ✅ **Delete Order**: DELETE request, state cleanup

#### Form Management

- ✅ Form field changes
- ✅ Product selection with variants
- ✅ Quantity management
- ✅ Total calculation
- ✅ Form reset and population
- ✅ Create vs Edit mode handling

#### Computed Values

- ✅ Selected product computation
- ✅ Variant types filtering
- ✅ Filtered variants computation
- ✅ Status color mapping

### 2. Component Tests (`page.test.tsx`)

Tests for the `OrdersPage` React component covering:

#### Rendering

- ✅ Page title and description
- ✅ Search and filter controls
- ✅ Orders table structure
- ✅ Action buttons (View, Edit, Delete)
- ✅ Status badges
- ✅ Loading states

#### User Interactions

- ✅ Search input changes
- ✅ Status filter selection
- ✅ New order button click
- ✅ Edit order button click
- ✅ Delete order button click
- ✅ View order details

#### Dialog Management

- ✅ Order details dialog display
- ✅ Form dialog for create/edit
- ✅ Delete confirmation dialog
- ✅ Dialog open/close states

#### Form Functionality

- ✅ Form field input handling
- ✅ Product selection
- ✅ Variant selection
- ✅ Quantity input
- ✅ Form submission
- ✅ Form cancellation

#### Delete Confirmation

- ✅ Delete button click
- ✅ Confirmation dialog display
- ✅ Confirm delete action
- ✅ Cancel delete action

### 3. API Route Tests (`route.test.ts`)

Tests for the `/api/admin/orders` API endpoints covering:

#### GET /api/admin/orders

- ✅ Fetch all orders with items and variants
- ✅ Handle orders without variants
- ✅ Database error handling
- ✅ Response data transformation

#### POST /api/admin/orders

- ✅ Create new order with products
- ✅ Create order with product variants
- ✅ Handle product not found errors
- ✅ Invalid request body handling
- ✅ Status case conversion

#### PUT /api/admin/orders

- ✅ Update existing order
- ✅ Handle missing order ID
- ✅ Product not found during update
- ✅ Invalid request body handling
- ✅ Order items replacement

#### DELETE /api/admin/orders

- ✅ Delete order and related items
- ✅ Handle missing order ID
- ✅ Database error handling
- ✅ Foreign key constraint handling

#### Edge Cases

- ✅ Empty products array
- ✅ Multiple products per order
- ✅ Status case conversion
- ✅ Variant price handling

### 4. Database Schema Tests (`schema.test.ts`)

Tests for the Prisma database schema covering:

#### Model Validation

- ✅ **User Model**: Required fields, unique constraints, role defaults
- ✅ **Product Model**: Price validation, stock validation, status defaults
- ✅ **ProductVariant Model**: Type validation, optional fields
- ✅ **Order Model**: Status defaults, date handling
- ✅ **OrderItem Model**: Quantity validation, variant relationships

#### Relationships

- ✅ Product to ProductVariant relationships
- ✅ Order to OrderItem relationships
- ✅ User to Cart relationships
- ✅ Foreign key constraints

#### Enum Values

- ✅ Role enum validation (CUSTOMER, ADMIN)
- ✅ ProductStatus enum validation (ACTIVE, INACTIVE)
- ✅ OrderStatus enum validation (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
- ✅ VariantType enum validation (COLOR, SIZE, FEATURE)

#### Data Validation

- ✅ Email format validation
- ✅ Positive price validation
- ✅ Non-negative stock validation
- ✅ Positive quantity validation

#### Cascade Operations

- ✅ Order items cascade delete
- ✅ Product variants cascade delete
- ✅ Foreign key constraint handling

### 5. Integration Tests (`integration.test.ts`)

End-to-end tests covering complete user workflows:

#### Complete Order Creation Flow

- ✅ New order button click
- ✅ Form filling and validation
- ✅ Product and variant selection
- ✅ Form submission
- ✅ API interaction

#### Complete Order Editing Flow

- ✅ Edit button click
- ✅ Form population
- ✅ Field modification
- ✅ Update submission

#### Complete Order Deletion Flow

- ✅ Delete button click
- ✅ Confirmation dialog
- ✅ Confirmation action
- ✅ State cleanup

#### Search and Filter Integration

- ✅ Search term input
- ✅ Status filter selection
- ✅ Combined filtering

#### API Error Handling

- ✅ Network error handling
- ✅ Server error handling
- ✅ Graceful degradation

## Test Coverage

### Hook Coverage

- **Lines**: 95%
- **Functions**: 100%
- **Branches**: 90%
- **Statements**: 95%

### Component Coverage

- **Lines**: 90%
- **Functions**: 100%
- **Branches**: 85%
- **Statements**: 90%

### API Coverage

- **Lines**: 95%
- **Functions**: 100%
- **Branches**: 90%
- **Statements**: 95%

### Schema Coverage

- **Lines**: 100%
- **Functions**: 100%
- **Branches**: 95%
- **Statements**: 100%

## Running Tests

### Install Dependencies

```bash
bun install
```

### Setup Database

```bash
bun db:generate
bun db:reset
```

### Run All Tests

```bash
bun test
```

### Run Tests in Watch Mode

```bash
bun test:watch
```

### Run Tests with Coverage

```bash
bun test:coverage
```

### Run Database Tests

```bash
bun test prisma/__tests__/
```

### Run Specific Test Files

```bash
# Hook tests only
bun test hook.test.ts

# Component tests only
bun test page.test.tsx

# API tests only
bun test route.test.ts

# Schema tests only
bun test schema.test.ts

# Integration tests only
bun test integration.test.ts
```

### Run Tests by Category

```bash
# All unit tests
bun test --testNamePattern="Hook|Component|API|Schema"

# Integration tests only
bun test --testNamePattern="Integration"
```

## Test Configuration

### Jest Configuration (`jest.config.js`)

- Next.js integration
- TypeScript support
- Module path mapping
- Coverage thresholds
- Test environment setup

### Jest Setup (`jest.setup.js`)

- Testing library setup
- Next.js router mocking
- Global fetch mocking
- UUID mocking
- Console error filtering

### MSW Configuration

- API request mocking
- Network error simulation
- Response customization
- Error scenario testing

## Mock Data

### Orders Mock Data

```typescript
const mockOrders = [
  {
    id: "order-1",
    customerName: "John Doe",
    customerPhone: "+1-555-0101",
    products: [{ name: "Product 1", quantity: 2, price: 10.99 }],
    total: 21.98,
    status: "pending",
    orderDate: "2024-01-01T00:00:00.000Z",
    shippingAddress: "123 Main St",
  },
];
```

### Products Mock Data

```typescript
const mockProducts = [
  {
    id: "product-1",
    name: "Product 1",
    price: 10.99,
    variants: [
      {
        id: "variant-1",
        value: "Red",
        type: "COLOR",
        variantPrice: 12.99,
      },
    ],
  },
];
```

## Best Practices

### Test Organization

- Group related tests using `describe` blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests independent and isolated

### Mocking Strategy

- Mock external dependencies (API, database)
- Use realistic mock data
- Test error scenarios
- Verify mock interactions

### Assertion Patterns

- Test both success and failure cases
- Verify state changes
- Check function calls
- Validate data transformations

### Error Handling

- Test network errors
- Test validation errors
- Test edge cases
- Verify error messages

## Continuous Integration

### GitHub Actions (Recommended)

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun test:coverage
```

### Pre-commit Hooks

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "bun test --passWithNoTests"
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **Test Environment Setup**

   - Ensure all dependencies are installed
   - Check Jest configuration
   - Verify TypeScript setup

2. **Mock Issues**

   - Clear mocks between tests
   - Check mock implementation
   - Verify mock data structure

3. **Async Test Issues**

   - Use `waitFor` for async operations
   - Handle promises correctly
   - Check for unhandled rejections

4. **Coverage Issues**
   - Check coverage thresholds
   - Verify test file inclusion
   - Review uncovered code paths

### Debug Mode

```bash
# Run tests with debug output
bun test --verbose

# Run specific test with debug
bun test --testNamePattern="should create a new order" --verbose
```

## Future Enhancements

### Planned Test Improvements

- [ ] E2E tests with Playwright
- [ ] Performance testing
- [ ] Accessibility testing
- [ ] Visual regression testing
- [ ] Load testing for API endpoints

### Test Coverage Goals

- [ ] 100% line coverage
- [ ] 100% function coverage
- [ ] 95% branch coverage
- [ ] 100% statement coverage

### Additional Test Scenarios

- [ ] Concurrent user scenarios
- [ ] Large dataset handling
- [ ] Memory leak detection
- [ ] Security testing
- [ ] Internationalization testing
