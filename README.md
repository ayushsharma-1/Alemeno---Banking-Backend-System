# Credit Approval System - Banking Backend

A Node.js backend system for credit approval and loan management with sophisticated risk assessment.

**Author:** Ayush Sharma

## Features

- **Credit Approval System**: Advanced scoring algorithm with risk assessment
- **Customer Registration**: Automatic approved limit calculation (36 × monthly income)
- **Loan Eligibility Check**: Multi-factor credit evaluation with interest rate correction
- **Loan Processing**: Automated loan creation with compound interest EMI calculation
- **Comprehensive Validation**: Input sanitization and error handling
- **Excel Data Integration**: Seamless processing of customer_data.xlsx and loan_data.xlsx
- **High Performance**: O(1) data access using optimized Map structures

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
`http://localhost:3000`

### Credit Approval System

- `POST /register` - Register new customer with approved limit calculation
  - **Input**: first_name, last_name, age, monthly_income, phone_number
  - **Output**: customer_id, name, approved_limit, etc.

- `POST /check-eligibility` - Check loan eligibility with credit scoring
  - **Input**: customer_id, loan_amount, interest_rate, tenure
  - **Output**: approval status, corrected_interest_rate, monthly_installment

- `POST /create-loan` - Process and create approved loans
  - **Input**: customer_id, loan_amount, interest_rate, tenure
  - **Output**: loan_id, approval status, monthly_installment

- `GET /view-loan/:loan_id` - View detailed loan information
  - **Output**: loan details with customer information

- `GET /view-loans/:customer_id` - View all loans for specific customer
  - **Output**: Array of customer's loans with repayment details

### System Health

- `GET /api/health` - System health and uptime status

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

## Environment Variables

See `.env.example` for available configuration options.

## System Architecture

### Data Flow Architecture

#### Credit Approval System Flow
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   Excel Files   │    │   Data Loading   │    │   In-Memory Store   │
├─────────────────┤    ├──────────────────┤    ├─────────────────────┤
│customer_data.xlsx│───▶│   DataParser     │───▶│   customers Map     │
│loan_data.xlsx   │    │   (XLSX → JSON)  │    │   loans Map         │
│(300 + 782 recs) │    │                  │    │   customerLoans Map │
└─────────────────┘    └──────────────────┘    └─────────────────────┘
                                                           │
                                                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CREDIT APPROVAL ENDPOINTS                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  POST /register           POST /check-eligibility    POST /create-loan      │
│  ┌─────────────┐          ┌─────────────────────┐    ┌─────────────────┐   │
│  │Customer Info│          │Credit Assessment    │    │Loan Processing  │   │
│  │     ↓       │          │        ↓            │    │       ↓         │   │
│  │Approved Limit│         │Credit Score (0-100) │    │EMI Calculation  │   │
│  │= 36×Income  │          │Interest Rate Check  │    │Loan Creation    │   │
│  └─────────────┘          └─────────────────────┘    └─────────────────┘   │
│                                                                             │
│  GET /view-loan/:id                    GET /view-loans/:customer_id         │
│  ┌─────────────────┐                   ┌──────────────────────────┐        │
│  │Loan Details     │                   │Customer Loan Portfolio   │        │
│  │+ Customer Info  │                   │All Loans + Repayments    │        │
│  └─────────────────┘                   └──────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            BUSINESS LOGIC FLOW                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. Input Validation (Joi)  →  2. Credit Service  →  3. JSON Response      │
│     ┌─────────────────┐           ┌─────────────────┐    ┌─────────────┐   │
│     │Schema Check     │           │Credit Algorithm │    │Success/Error│   │
│     │Error Handling   │           │EMI Calculation  │    │HTTP Status  │   │
│     │Data Sanitization│           │Risk Assessment  │    │Structured   │   │
│     └─────────────────┘           └─────────────────┘    │Response     │   │
│                                                          └─────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Overview

#### **1. Data Layer**
- **Excel Files**: Source data (300 customers, 782 loans)
- **DataParser**: Converts Excel to JavaScript objects
- **DataStore**: In-memory Maps for O(1) lookups

#### **2. Business Logic Layer**
- **Models**: Customer & Loan entities with business methods
- **Services**: Credit scoring algorithm & financial calculations
- **Validation**: Input sanitization & error handling

#### **3. API Layer**
- **Routes**: RESTful endpoints for credit operations
- **Controllers**: Request/response handling
- **Middleware**: CORS, JSON parsing, error handling

### Key Performance Features

- **O(1) Data Access**: HashMap-based customer/loan lookups
- **Efficient Relationships**: Pre-built customer-loan mapping
- **Memory Optimization**: Single data load with persistent storage
- **Compound Interest**: Accurate EMI calculations
- **Credit Scoring**: Multi-factor risk assessment algorithm

### Credit Approval Algorithm

1. **Credit Score Calculation** (0-100 scale):
   - Payment History: 25 points
   - Loan Count: 15 points  
   - Current Year Activity: 20 points
   - Loan Volume Ratio: 25 points
   - Current Debt Ratio: 15 points

2. **Approval Tiers**:
   - Score > 50: Any interest rate
   - Score 30-50: Minimum 12% interest
   - Score 10-30: Minimum 16% interest  
   - Score < 10: Rejected

3. **Additional Checks**:
   - EMI sum < 50% of monthly income
   - Current debt < approved limit

### Technical Specifications

- **Runtime**: Node.js with Express.js framework
- **Data Processing**: XLSX library for Excel parsing
- **Validation**: Joi schema validation
- **Architecture**: MVC pattern with service layer
- **Storage**: In-memory with Map data structures
- **Response Format**: JSON with standardized error handling