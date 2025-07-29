# Ecommerce Platform

A modern, full-featured ecommerce platform built with Next.js, TypeScript, and Prisma.

## Features

### Core Ecommerce Features

- **Product Management**: Full CRUD operations for products with variants and images
- **Order Management**: Complete order lifecycle with status tracking
- **Landing Pages**: Customizable landing pages with drag-and-drop builder
- **Product Pages**: SEO-optimized product detail pages
- **Shopping Cart**: Persistent cart functionality
- **Wishlist**: User wishlist management
- **Admin Dashboard**: Comprehensive admin interface

### User Management & Permissions

- **Super User System**: Single admin user with full system access
- **Sub-User Management**: Create and manage sub-users with granular permissions
- **Permission System**: Resource-level access control (View, Create, Edit, Delete)
- **Resource Types**: Orders, Products, Landing Pages, Product Pages, Cart, Wishlist, Settings

### Technical Features

- **TypeScript**: Full type safety throughout the application
- **Prisma ORM**: Type-safe database operations
- **Next.js 14**: App Router with server components
- **PostgreSQL**: Robust database backend
- **Responsive Design**: Mobile-first UI with Tailwind CSS
- **Testing**: Comprehensive test suite with Jest and React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ecommerce
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your database connection:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce"
   ```

4. **Set up the database**

   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin
   - Default admin credentials: admin@store.com / admin1234

## Sub-User Management

### Overview

The platform supports a hierarchical user system where a super user (admin) can create and manage sub-users with specific permissions.

### Creating Sub-Users

1. Navigate to Admin → Settings → Users
2. Click "Add Sub-User"
3. Fill in user details (name, email, password)
4. Set permissions for each resource type:
   - **Orders**: View, create, edit, delete orders
   - **Products**: Manage product catalog
   - **Landing Pages**: Create and manage landing pages
   - **Product Pages**: Manage product detail pages
   - **Cart**: View cart data
   - **Wishlist**: View wishlist data
   - **Settings**: Access system settings

### Permission Levels

- **View**: Can see the resource but cannot modify
- **Create**: Can create new items
- **Edit**: Can modify existing items
- **Delete**: Can remove items

### Example Sub-User Roles

- **Product Manager**: Full product access, view-only order access
- **Order Manager**: Order management, limited product access
- **Marketing Manager**: Landing page and product page management

## API Endpoints

### Admin APIs

- `GET /api/admin/products` - List products (requires PRODUCT view permission)
- `POST /api/admin/products` - Create product (requires PRODUCT create permission)
- `PUT /api/admin/products` - Update product (requires PRODUCT edit permission)
- `DELETE /api/admin/products` - Delete product (requires PRODUCT delete permission)

- `GET /api/admin/orders` - List orders (requires ORDER view permission)
- `POST /api/admin/orders` - Create order (requires ORDER create permission)
- `PUT /api/admin/orders` - Update order (requires ORDER edit permission)
- `DELETE /api/admin/orders` - Delete order (requires ORDER delete permission)

- `GET /api/admin/landing-pages` - List landing pages (requires LANDING_PAGE view permission)
- `POST /api/admin/landing-pages` - Create landing page (requires LANDING_PAGE create permission)
- `PUT /api/admin/landing-pages` - Update landing page (requires LANDING_PAGE edit permission)
- `DELETE /api/admin/landing-pages` - Delete landing page (requires LANDING_PAGE delete permission)

### User Management APIs

- `GET /api/admin/users` - List sub-users (super user only)
- `POST /api/admin/users` - Create sub-user (super user only)
- `PUT /api/admin/users` - Update sub-user (super user only)
- `DELETE /api/admin/users` - Delete sub-user (super user only)

## Database Schema

### Core Models

- **User**: Main user model with sub-user relationships
- **Product**: Product catalog with variants and images
- **Order**: Order management with items
- **LandingPage**: Custom landing pages
- **ProductPage**: SEO-optimized product pages
- **Cart**: Shopping cart functionality
- **Wishlist**: User wishlists

### Permission System

- **Permission**: Granular permissions for each user and resource
- **ResourceType**: Enum defining available resources (ORDER, PRODUCT, etc.)

## Testing

Run the test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

## Development

### Code Structure

```
src/
├── app/                    # Next.js app router
│   ├── admin/             # Admin panel routes
│   ├── api/               # API routes
│   └── ...                # Public routes
├── components/            # Reusable components
│   ├── admin/            # Admin-specific components
│   ├── ui/               # UI components
│   └── functional/       # Functional components
├── lib/                  # Utility libraries
│   ├── permissions.ts    # Permission management
│   └── prisma.ts         # Database client
└── hooks/                # Custom React hooks
```

### Key Components

- **PermissionGuard**: React component for permission-based UI rendering
- **SubUserManagement**: Complete sub-user management interface
- **PermissionChecker**: Utility class for permission validation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.
