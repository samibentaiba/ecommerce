# Ecommerce Setup Guide

This project is optimized for **TypeScript** and **Bun** for the best development experience.

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh) (recommended) or Node.js 18+
- PostgreSQL database

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ecommerce
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Setup environment**

   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Setup database**

   ```bash
   bun db:generate
   bun db:reset
   ```

5. **Start development server**
   ```bash
   bun dev
   ```

## 🛠️ Available Scripts

### Development

- `bun dev` - Start development server with Turbopack
- `bun build` - Build for production
- `bun start` - Start production server
- `bun lint` - Run ESLint

### Testing

- `bun test` - Run all tests
- `bun test:watch` - Run tests in watch mode
- `bun test:coverage` - Run tests with coverage
- `bun test prisma/__tests__/` - Run database tests only

### Database

- `bun db:generate` - Generate Prisma client
- `bun db:push` - Push schema to database
- `bun db:migrate` - Run database migrations
- `bun db:reset` - Reset database and run migrations
- `bun db:seed` - Seed database with sample data
- `bun db:studio` - Open Prisma Studio

## 📁 Project Structure

```
ecommerce/
├── src/                    # Application source code
│   ├── app/               # Next.js app directory
│   ├── components/        # Reusable UI components
│   └── lib/              # Utility functions and configurations
├── prisma/               # Database schema and migrations
│   ├── schema.prisma     # Database schema
│   ├── migrations/       # Database migrations
│   ├── seeders/         # Data seeding scripts
│   └── data/            # CSV data files
├── jest.config.ts        # Jest configuration (TypeScript)
├── jest.setup.ts         # Jest setup (TypeScript)
├── next.config.ts        # Next.js configuration (TypeScript)
└── package.json          # Dependencies and scripts
```

## 🔧 Technology Stack

- **Runtime**: Bun (fast JavaScript runtime)
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Testing**: Jest with Testing Library
- **UI Components**: Radix UI + shadcn/ui

## 🎯 Key Features

- **TypeScript First**: All configuration files and scripts use TypeScript
- **Bun Optimized**: Fast package management and runtime
- **Phone Number Orders**: Customer orders use phone numbers instead of emails
- **Comprehensive Testing**: Unit, integration, and database tests
- **Database Seeding**: Sample data for development and testing
- **Modern UI**: Beautiful, accessible components with Tailwind CSS

## 🧪 Testing

The project includes comprehensive testing:

- **Unit Tests**: Component and hook testing
- **Integration Tests**: API route testing
- **Database Tests**: Schema and seeding validation
- **E2E Ready**: Setup for end-to-end testing

Run tests with:

```bash
bun test              # All tests
bun test:watch        # Watch mode
bun test:coverage     # With coverage
```

## 🗄️ Database

The database uses PostgreSQL with Prisma ORM:

- **Schema**: Defined in `prisma/schema.prisma`
- **Migrations**: Automatic migration management
- **Seeding**: Sample data for development
- **Studio**: Visual database browser

Key models:

- **Orders**: Customer orders with phone numbers
- **Products**: Product catalog with variants
- **Users**: Admin user management
- **Landing Pages**: Marketing page templates

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set environment variables
3. Deploy automatically on push

### Manual Deployment

```bash
bun build
bun start
```

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection**

   ```bash
   bun db:generate
   bun db:push
   ```

2. **TypeScript Errors**

   ```bash
   bun install
   bun run build
   ```

3. **Test Failures**
   ```bash
   bun db:reset
   bun test
   ```

### Getting Help

- Check the [TESTING.md](./TESTING.md) for detailed testing information
- Review [Next.js documentation](https://nextjs.org/docs)
- Check [Bun documentation](https://bun.sh/docs)
- Review [Prisma documentation](https://www.prisma.io/docs)

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
