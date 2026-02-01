# Shiv Furniture ERP - Budget Accounting System

A comprehensive Budget Accounting System for Shiv Furniture, featuring master data management, transaction processing, budget monitoring, and a customer portal.

## Tech Stack

### Backend
- **Framework**: Python Flask
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Azure Blob Storage
- **Email**: SMTP (Gmail)
- **PDF Generation**: ReportLab

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **UI Components**: Radix UI, Lucide Icons
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod

## Features

### Master Data Management
- **Contacts**: Manage customers and vendors with billing/shipping addresses
- **Products**: Goods and services with pricing, tax rates, HSN codes
- **Analytical Accounts**: Cost centers for budget tracking
- **Budgets**: Define budgets with periods and track performance
- **Auto Analytical Models**: Rules for automatic cost center assignment

### Transaction Processing
- **Purchase Orders**: Create and manage purchase orders with vendors
- **Vendor Bills**: Record vendor bills and track payments
- **Sales Orders**: Manage customer sales orders
- **Customer Invoices**: Generate invoices with PDF and email capabilities
- **Payments**: Record incoming and outgoing payments with reconciliation

### Budget Monitoring & Reports
- **Dashboard**: Overview of key metrics and trends
- **Budget Performance**: Track budget vs actuals with achievement %
- **Monthly Trends**: Sales, purchases, and profit trends
- **Aging Reports**: Receivables and payables aging analysis

### Customer Portal
- View invoices and download PDFs
- Track order status
- View account summary

## Project Structure

```
Budget Accounting System - Shiv Furniture/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # Flask app factory
│   │   ├── config.py            # Configuration
│   │   ├── database.py          # MongoDB connection
│   │   ├── models/              # Data models
│   │   ├── routes/              # API endpoints
│   │   ├── services/            # Business logic services
│   │   └── utils/               # Helper functions
│   ├── tests/                   # Unit tests
│   ├── .env                     # Environment variables
│   ├── requirements.txt         # Python dependencies
│   └── run.py                   # Entry point
│
└── frontend/
    ├── src/
    │   ├── app/                 # Next.js pages
    │   ├── components/          # React components
    │   ├── lib/                 # Utilities and API client
    │   ├── store/               # Zustand stores
    │   └── types/               # TypeScript types
    ├── .env.local               # Environment variables
    ├── package.json             # Node dependencies
    └── tailwind.config.js       # Tailwind configuration
```

## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Azure Blob Storage account (optional, for file storage)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables in `.env`:
   ```
   FLASK_ENV=development
   SECRET_KEY=your-secret-key
   JWT_SECRET_KEY=your-jwt-secret
   MONGO_URI=mongodb+srv://...
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   SMTP_EMAIL=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   AZURE_STORAGE_CONNECTION_STRING=your-connection-string
   AZURE_STORAGE_CONTAINER_NAME=your-container
   ```

5. Run the backend server:
   ```bash
   python run.py
   ```
   The API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password

### Master Data
- `/api/contacts` - Contact management
- `/api/products` - Product management
- `/api/analytical-accounts` - Analytical account management
- `/api/budgets` - Budget management
- `/api/auto-analytical-models` - Auto analytical model management

### Transactions
- `/api/purchase-orders` - Purchase order management
- `/api/vendor-bills` - Vendor bill management
- `/api/sales-orders` - Sales order management
- `/api/customer-invoices` - Customer invoice management
- `/api/payments` - Payment management

### Reports
- `GET /api/reports/dashboard` - Dashboard summary
- `GET /api/reports/budget-performance` - Budget performance
- `GET /api/reports/monthly-trends` - Monthly trends
- `GET /api/reports/receivables-aging` - Receivables aging
- `GET /api/reports/payables-aging` - Payables aging

### Portal
- `/api/portal/invoices` - Portal user invoices
- `/api/portal/bills` - Portal user bills
- `/api/portal/summary` - Portal summary

## User Roles

1. **Admin**: Full access to all features
2. **Portal User**: Limited access to view their own invoices, orders, and bills

## Running Tests

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## License

This project is proprietary software for Shiv Furniture.

## Support

For support, contact: support@shivfurniture.com
