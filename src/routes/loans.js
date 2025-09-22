const express = require('express');
const dataStore = require('../utils/dataStore');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    const { status, customerId, limit = 50 } = req.query;
    let loans = dataStore.getAllLoans();
    
    if (status) {
      loans = loans.filter(loan => loan.status.toLowerCase() === status.toLowerCase());
    }
    
    if (customerId) {
      loans = loans.filter(loan => loan.customerId === parseInt(customerId));
    }
    
    const limitNum = Math.min(parseInt(limit), 100);
    const paginatedLoans = loans.slice(0, limitNum);
    
    res.json({
      success: true,
      data: paginatedLoans,
      total: loans.length,
      returned: paginatedLoans.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch loans',
      details: error.message
    });
  }
});

router.get('/:id', (req, res) => {
  try {
    const loan = dataStore.getLoanById(req.params.id);
    
    if (!loan) {
      return res.status(404).json({
        success: false,
        error: 'Loan not found'
      });
    }
    
    const customer = dataStore.getCustomerById(loan.customerId);
    
    res.json({
      success: true,
      data: {
        loan,
        customer
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch loan',
      details: error.message
    });
  }
});

router.get('/stats/summary', (req, res) => {
  try {
    const loans = dataStore.getAllLoans();
    
    const stats = {
      totalLoans: loans.length,
      activeLoans: loans.filter(l => l.status === 'ACTIVE').length,
      completedLoans: loans.filter(l => l.status === 'COMPLETED').length,
      defaultedLoans: loans.filter(l => l.status === 'DEFAULTED').length,
      totalAmountDisbursed: loans.reduce((sum, l) => sum + l.loanAmount, 0),
      totalAmountCollected: loans.reduce((sum, l) => sum + l.totalAmountPaid, 0),
      averageInterestRate: loans.reduce((sum, l) => sum + l.interestRate, 0) / loans.length
    };
    
    stats.collectionRatio = stats.totalAmountDisbursed > 0 ? 
      stats.totalAmountCollected / stats.totalAmountDisbursed : 0;
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch loan statistics',
      details: error.message
    });
  }
});

module.exports = router;