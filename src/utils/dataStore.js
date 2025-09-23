const DataParser = require('./dataParser');
const Customer = require('../models/Customer');
const Loan = require('../models/Loan');

class DataStore {
  constructor() {
    this.customers = new Map();
    this.loans = new Map();
    this.customerLoans = new Map();
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) return;

    try {
      const customerData = DataParser.loadCustomerData();
      const loanData = DataParser.loadLoanData();

      customerData.Sheet1.forEach(data => {
        const customer = Customer.fromExcelData(data);
        this.customers.set(customer.customer_id, customer);
        this.customerLoans.set(customer.customer_id, []);
      });

      loanData.Sheet1.forEach(data => {
        const loan = Loan.fromExcelData(data);
        this.loans.set(loan.loan_id, loan);
        
        if (this.customerLoans.has(loan.customer_id)) {
          this.customerLoans.get(loan.customer_id).push(loan.loan_id);
        }
      });

      this.initialized = true;
      console.log(`Loaded ${this.customers.size} customers and ${this.loans.size} loans`);
    } catch (error) {
      console.error('Error initializing data store:', error.message);
      throw error;
    }
  }

  getAllCustomers() {
    this.initialize();
    return Array.from(this.customers.values()).map(customer => customer.toJSON());
  }

  getCustomerById(id) {
    this.initialize();
    const customer = this.customers.get(parseInt(id));
    return customer ? customer.toJSON() : null;
  }

  getAllLoans() {
    this.initialize();
    return Array.from(this.loans.values()).map(loan => loan.toJSON());
  }

  getLoanById(id) {
    this.initialize();
    const loan = this.loans.get(parseInt(id));
    return loan ? loan.toJSON() : null;
  }

  getLoansByCustomerId(customerId) {
    this.initialize();
    const loanIds = this.customerLoans.get(parseInt(customerId)) || [];
    return loanIds.map(loanId => this.loans.get(loanId).toJSON());
  }

  searchCustomers(query) {
    this.initialize();
    const searchTerm = query.toLowerCase();
    return Array.from(this.customers.values())
      .filter(customer => 
        customer.first_name.toLowerCase().includes(searchTerm) ||
        customer.last_name.toLowerCase().includes(searchTerm) ||
        customer.customer_id.toString().includes(searchTerm)
      )
      .map(customer => customer.toJSON());
  }

  getCustomerStats(customerId) {
    this.initialize();
    const customer = this.customers.get(parseInt(customerId));
    if (!customer) return null;

    const loans = this.getLoansByCustomerId(customerId);
    const activeLoans = loans.filter(loan => loan.status === 'ACTIVE');
    const completedLoans = loans.filter(loan => loan.status === 'COMPLETED');
    
    const totalBorrowed = loans.reduce((sum, loan) => sum + loan.loanAmount, 0);
    const totalPaid = loans.reduce((sum, loan) => sum + loan.totalAmountPaid, 0);
    const avgPaymentRatio = loans.length > 0 ? 
      loans.reduce((sum, loan) => sum + loan.paymentRatio, 0) / loans.length : 0;

    return {
      customer: customer.toJSON(),
      loanStats: {
        totalLoans: loans.length,
        activeLoans: activeLoans.length,
        completedLoans: completedLoans.length,
        totalBorrowed,
        totalPaid,
        avgPaymentRatio: Math.round(avgPaymentRatio * 100) / 100
      }
    };
  }

  // New methods for credit system
  async createCustomer(customerData) {
    this.initialize();
    
    // Generate new customer ID
    const maxId = Math.max(...Array.from(this.customers.keys()), 0);
    const newCustomerId = maxId + 1;
    
    customerData.customer_id = newCustomerId;
    const customer = new Customer(customerData);
    
    this.customers.set(newCustomerId, customer);
    this.customerLoans.set(newCustomerId, []);
    
    return customer;
  }

  async createLoan(loanData) {
    this.initialize();
    
    // Generate new loan ID
    const maxId = Math.max(...Array.from(this.loans.keys()), 0);
    const newLoanId = maxId + 1;
    
    loanData.loan_id = newLoanId;
    loanData.date_of_approval = new Date().toISOString().split('T')[0];
    loanData.emis_paid_on_time = 0;
    
    const loan = new Loan(loanData);
    
    this.loans.set(newLoanId, loan);
    
    if (this.customerLoans.has(loan.customer_id)) {
      this.customerLoans.get(loan.customer_id).push(newLoanId);
    }
    
    return loan;
  }

  async getLoanWithCustomer(loanId) {
    this.initialize();
    const loan = this.loans.get(parseInt(loanId));
    if (!loan) return null;
    
    const customer = this.customers.get(loan.customer_id);
    
    return {
      ...loan.toJSON(),
      customer: customer ? customer.toJSON() : null
    };
  }

  async getCustomerLoans(customerId) {
    this.initialize();
    const loanIds = this.customerLoans.get(parseInt(customerId)) || [];
    return loanIds.map(loanId => this.loans.get(loanId)).filter(loan => loan).map(loan => loan.toJSON());
  }
}

module.exports = new DataStore();