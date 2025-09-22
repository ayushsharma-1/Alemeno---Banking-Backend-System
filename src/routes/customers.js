const express = require('express');
const dataStore = require('../utils/dataStore');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    const { search, limit = 50 } = req.query;
    
    let customers;
    if (search) {
      customers = dataStore.searchCustomers(search);
    } else {
      customers = dataStore.getAllCustomers();
    }
    
    const limitNum = Math.min(parseInt(limit), 100);
    const paginatedCustomers = customers.slice(0, limitNum);
    
    res.json({
      success: true,
      data: paginatedCustomers,
      total: customers.length,
      returned: paginatedCustomers.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customers',
      details: error.message
    });
  }
});

router.get('/:id', (req, res) => {
  try {
    const customer = dataStore.getCustomerById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }
    
    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customer',
      details: error.message
    });
  }
});

router.get('/:id/loans', (req, res) => {
  try {
    const customer = dataStore.getCustomerById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }
    
    const loans = dataStore.getLoansByCustomerId(req.params.id);
    
    res.json({
      success: true,
      data: {
        customer,
        loans,
        loanCount: loans.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customer loans',
      details: error.message
    });
  }
});

router.get('/:id/stats', (req, res) => {
  try {
    const stats = dataStore.getCustomerStats(req.params.id);
    
    if (!stats) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customer statistics',
      details: error.message
    });
  }
});

module.exports = router;