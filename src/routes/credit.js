const dataStore = require('../utils/dataStore');
const CreditService = require('../services/CreditService');

// POST /register - Add new customer
const register = async (req, res) => {
  try {
    const { first_name, last_name, age, monthly_income, phone_number } = req.body;
    
    // Validation
    if (!first_name || !last_name || !age || !monthly_income || !phone_number) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required: first_name, last_name, age, monthly_income, phone_number'
      });
    }

    // Calculate approved limit: 36 * monthly_salary rounded to nearest lakh
    const approved_limit = Math.round((36 * monthly_income) / 100000) * 100000;
    
    const customer = await dataStore.createCustomer({
      first_name,
      last_name,
      age,
      monthly_income,
      phone_number,
      approved_limit,
      current_debt: 0
    });

    res.status(201).json({
      customer_id: customer.customer_id,
      name: `${customer.first_name} ${customer.last_name}`,
      age: customer.age,
      monthly_income: customer.monthly_income,
      approved_limit: customer.approved_limit,
      phone_number: customer.phone_number
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to register customer',
      details: error.message
    });
  }
};

// POST /check-eligibility - Check loan eligibility
const checkEligibility = async (req, res) => {
  try {
    const { customer_id, loan_amount, interest_rate, tenure } = req.body;
    
    // Validation
    if (!customer_id || !loan_amount || !interest_rate || !tenure) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required: customer_id, loan_amount, interest_rate, tenure'
      });
    }

    const eligibility = await CreditService.checkEligibility(
      customer_id, 
      loan_amount, 
      interest_rate, 
      tenure
    );

    // Calculate monthly installment using compound interest
    const monthlyInstallment = CreditService.calculateMonthlyInstallment(
      loan_amount, 
      eligibility.corrected_interest_rate, 
      tenure
    );

    res.json({
      customer_id: parseInt(customer_id),
      approval: eligibility.approval,
      interest_rate: parseFloat(interest_rate),
      corrected_interest_rate: eligibility.corrected_interest_rate,
      tenure: parseInt(tenure),
      monthly_installment: monthlyInstallment
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to check eligibility',
      details: error.message
    });
  }
};

// POST /create-loan - Process new loan
const createLoan = async (req, res) => {
  try {
    const { customer_id, loan_amount, interest_rate, tenure } = req.body;
    
    // Validation
    if (!customer_id || !loan_amount || !interest_rate || !tenure) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required: customer_id, loan_amount, interest_rate, tenure'
      });
    }

    const eligibility = await CreditService.checkEligibility(
      customer_id, 
      loan_amount, 
      interest_rate, 
      tenure
    );

    if (!eligibility.approval) {
      return res.json({
        loan_id: null,
        customer_id: parseInt(customer_id),
        loan_approved: false,
        message: eligibility.message,
        monthly_installment: 0
      });
    }

    const loan = await dataStore.createLoan({
      customer_id: parseInt(customer_id),
      loan_amount: parseFloat(loan_amount),
      interest_rate: eligibility.corrected_interest_rate,
      tenure: parseInt(tenure)
    });

    const monthlyInstallment = CreditService.calculateMonthlyInstallment(
      loan_amount, 
      eligibility.corrected_interest_rate, 
      tenure
    );

    res.status(201).json({
      loan_id: loan.loan_id,
      customer_id: parseInt(customer_id),
      loan_approved: true,
      message: "Loan approved successfully",
      monthly_installment: monthlyInstallment
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create loan',
      details: error.message
    });
  }
};

// GET /view-loan/:loan_id - View loan details
const viewLoan = async (req, res) => {
  try {
    const loan_id = parseInt(req.params.loan_id);
    
    if (isNaN(loan_id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid loan_id'
      });
    }

    const loanDetails = await dataStore.getLoanWithCustomer(loan_id);
    
    if (!loanDetails) {
      return res.status(404).json({
        success: false,
        error: 'Loan not found'
      });
    }

    const monthlyInstallment = CreditService.calculateMonthlyInstallment(
      loanDetails.loan_amount,
      loanDetails.interest_rate,
      loanDetails.tenure
    );

    res.json({
      loan_id: loanDetails.loan_id,
      customer: {
        id: loanDetails.customer.customer_id,
        first_name: loanDetails.customer.first_name,
        last_name: loanDetails.customer.last_name,
        phone_number: loanDetails.customer.phone_number,
        age: loanDetails.customer.age
      },
      loan_amount: loanDetails.loan_amount,
      interest_rate: loanDetails.interest_rate,
      monthly_installment: monthlyInstallment,
      tenure: loanDetails.tenure
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch loan details',
      details: error.message
    });
  }
};

// GET /view-loans/:customer_id - View all loans for customer
const viewLoans = async (req, res) => {
  try {
    const customer_id = parseInt(req.params.customer_id);
    
    if (isNaN(customer_id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid customer_id'
      });
    }

    const loans = await dataStore.getCustomerLoans(customer_id);
    
    const loanDetails = loans.map(loan => {
      const monthlyInstallment = CreditService.calculateMonthlyInstallment(
        loan.loan_amount,
        loan.interest_rate,
        loan.tenure
      );
      
      const repaymentsLeft = Math.max(0, loan.tenure - (loan.emis_paid_on_time || 0));

      return {
        loan_id: loan.loan_id,
        loan_amount: loan.loan_amount,
        interest_rate: loan.interest_rate,
        monthly_installment: monthlyInstallment,
        repayments_left: repaymentsLeft
      };
    });

    res.json(loanDetails);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customer loans',
      details: error.message
    });
  }
};

module.exports = {
  register,
  checkEligibility,
  createLoan,
  viewLoan,
  viewLoans
};