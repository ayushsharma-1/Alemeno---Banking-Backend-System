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
        this.customers.set(customer.customerId, customer);
        this.customerLoans.set(customer.customerId, []);
      });

      loanData.Sheet1.forEach(data => {
        const loan = Loan.fromExcelData(data);
        this.loans.set(loan.loanId, loan);
        
        if (this.customerLoans.has(loan.customerId)) {
          this.customerLoans.get(loan.customerId).push(loan.loanId);
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
        customer.firstName.toLowerCase().includes(searchTerm) ||
        customer.lastName.toLowerCase().includes(searchTerm) ||
        customer.customerId.toString().includes(searchTerm)
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
}

module.exports = new DataStore();