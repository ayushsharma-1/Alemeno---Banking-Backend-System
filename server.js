require('dotenv').config({ path: '.env.local' });
const express = require('express');
const cors = require('cors');
const creditRoutes = require('./src/routes/credit');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Credit Approval System - Banking Backend',
    author: 'Ayush Sharma',
    version: '1.0.0',
    endpoints: {
      register: '/register',
      checkEligibility: '/check-eligibility',
      createLoan: '/create-loan',
      viewLoan: '/view-loan/:loan_id',
      viewLoans: '/view-loans/:customer_id'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Credit system endpoints
app.post('/register', creditRoutes.register);
app.post('/check-eligibility', creditRoutes.checkEligibility);
app.post('/create-loan', creditRoutes.createLoan);
app.get('/view-loan/:loan_id', creditRoutes.viewLoan);
app.get('/view-loans/:customer_id', creditRoutes.viewLoans);

app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.listen(PORT, () => {
  console.log(`Banking Backend Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});