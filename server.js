require('dotenv').config({ path: '.env.local' });
const express = require('express');
const cors = require('cors');
const customerRoutes = require('./src/routes/customers');
const loanRoutes = require('./src/routes/loans');
const { validate, schemas } = require('./src/utils/validation');

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
    message: 'Banking Backend System',
    author: 'Ayush Sharma',
    version: '1.0.0',
    endpoints: {
      customers: '/api/customers',
      loans: '/api/loans'
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

app.use('/api/customers', validate(schemas.customerSearch), customerRoutes);
app.use('/api/loans', validate(schemas.loanFilter), loanRoutes);

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