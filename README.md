# Banking Backend System

A Node.js backend system for managing customer and loan data.

**Author:** Ayush Sharma

## Features

- Customer management with credit scoring
- Loan management and tracking
- RESTful API endpoints
- Data validation and error handling
- Excel data parsing from customer_data.xlsx and loan_data.xlsx

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env.local
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Base URL
`http://localhost:3000/api`

### Customers

- `GET /customers` - Get all customers
  - Query params: `search`, `limit`
- `GET /customers/:id` - Get customer by ID
- `GET /customers/:id/loans` - Get customer's loans
- `GET /customers/:id/stats` - Get customer statistics

### Loans

- `GET /loans` - Get all loans
  - Query params: `status`, `customerId`, `limit`
- `GET /loans/:id` - Get loan by ID
- `GET /loans/stats/summary` - Get loan statistics

### Health Check

- `GET /health` - System health status

## Data Models

### Customer
- Customer ID, Name, Age, Phone
- Monthly Salary, Approved Limit
- Credit Score (calculated)

### Loan
- Loan ID, Customer ID, Amount
- Tenure, Interest Rate, Monthly Payment
- Payment status and calculations

## Example Requests

Get all customers:
```bash
curl http://localhost:3000/api/customers
```

Search customers:
```bash
curl "http://localhost:3000/api/customers?search=john&limit=10"
```

Get customer loans:
```bash
curl http://localhost:3000/api/customers/1/loans
```

Get active loans:
```bash
curl "http://localhost:3000/api/loans?status=active"
```

## Testing

```bash
npm test
```

## Environment Variables

See `.env.example` for available configuration options.