const dataStore = require('../utils/dataStore');

class CreditService {
  
  // Calculate credit score based on assignment requirements
  static async calculateCreditScore(customerId) {
    try {
      const customer = await dataStore.getCustomerById(customerId);
      const loans = await dataStore.getCustomerLoans(customerId);
      
      if (!customer) {
        return 0;
      }

      // Check if sum of current loans > approved limit (credit score = 0)
      const currentLoans = loans.filter(loan => loan.status === 'ACTIVE');
      const totalCurrentDebt = currentLoans.reduce((sum, loan) => sum + loan.loan_amount, 0);
      
      if (totalCurrentDebt > customer.approved_limit) {
        return 0;
      }

      let score = 0;
      
      // Component 1: Past Loans paid on time (25 points max)
      const completedLoans = loans.filter(loan => loan.status === 'COMPLETED');
      const totalLoans = loans.length;
      if (totalLoans > 0) {
        const paymentRatio = completedLoans.reduce((sum, loan) => 
          sum + (loan.emis_paid_on_time / loan.tenure), 0) / totalLoans;
        score += Math.min(25, paymentRatio * 25);
      }

      // Component 2: Number of loans taken in past (15 points max, inverse relationship)
      if (totalLoans === 0) {
        score += 15;
      } else if (totalLoans <= 2) {
        score += 15;
      } else if (totalLoans <= 5) {
        score += 10;
      } else if (totalLoans <= 10) {
        score += 5;
      }

      // Component 3: Loan activity in current year (20 points max)
      const currentYear = new Date().getFullYear();
      const currentYearLoans = loans.filter(loan => {
        const approvalYear = new Date(loan.date_of_approval).getFullYear();
        return approvalYear === currentYear;
      });
      
      if (currentYearLoans.length === 0) {
        score += 20;
      } else if (currentYearLoans.length <= 2) {
        score += 15;
      } else if (currentYearLoans.length <= 4) {
        score += 10;
      } else {
        score += 5;
      }

      // Component 4: Loan approved volume (25 points max)
      const totalLoanAmount = loans.reduce((sum, loan) => sum + loan.loan_amount, 0);
      if (totalLoanAmount === 0) {
        score += 25;
      } else if (totalLoanAmount <= customer.approved_limit * 0.5) {
        score += 25;
      } else if (totalLoanAmount <= customer.approved_limit * 0.75) {
        score += 20;
      } else if (totalLoanAmount <= customer.approved_limit) {
        score += 15;
      } else {
        score += 5;
      }

      // Component 5: Current debt ratio (15 points max)
      const debtRatio = totalCurrentDebt / customer.approved_limit;
      if (debtRatio === 0) {
        score += 15;
      } else if (debtRatio <= 0.3) {
        score += 15;
      } else if (debtRatio <= 0.5) {
        score += 10;
      } else if (debtRatio <= 0.7) {
        score += 5;
      }

      return Math.min(100, Math.round(score));
      
    } catch (error) {
      console.error('Error calculating credit score:', error);
      return 0;
    }
  }

  // Check loan eligibility based on credit score
  static async checkEligibility(customerId, loanAmount, interestRate, tenure) {
    try {
      const customer = await dataStore.getCustomerById(customerId);
      if (!customer) {
        return {
          approval: false,
          corrected_interest_rate: interestRate,
          message: "Customer not found"
        };
      }

      const creditScore = await this.calculateCreditScore(customerId);
      const currentLoans = await dataStore.getCustomerLoans(customerId);
      const activeLoans = currentLoans.filter(loan => loan.status === 'ACTIVE');
      
      // Check if sum of all current EMIs > 50% of monthly salary
      const totalEMI = activeLoans.reduce((sum, loan) => {
        const emi = this.calculateMonthlyInstallment(loan.loan_amount, loan.interest_rate, loan.tenure);
        return sum + emi;
      }, 0);
      
      const newEMI = this.calculateMonthlyInstallment(loanAmount, interestRate, tenure);
      const totalEMIWithNew = totalEMI + newEMI;
      
      if (totalEMIWithNew > (customer.monthly_income * 0.5)) {
        return {
          approval: false,
          corrected_interest_rate: interestRate,
          message: "Sum of all EMIs exceeds 50% of monthly salary"
        };
      }

      // Credit score based approval logic
      let correctedRate = interestRate;
      let approval = false;
      let message = "";

      if (creditScore > 50) {
        approval = true;
        message = "Loan approved";
      } else if (creditScore > 30 && creditScore <= 50) {
        if (interestRate >= 12) {
          approval = true;
          message = "Loan approved";
        } else {
          correctedRate = 12;
          approval = true;
          message = "Loan approved with corrected interest rate";
        }
      } else if (creditScore > 10 && creditScore <= 30) {
        if (interestRate >= 16) {
          approval = true;
          message = "Loan approved";
        } else {
          correctedRate = 16;
          approval = true;
          message = "Loan approved with corrected interest rate";
        }
      } else {
        approval = false;
        message = "Loan rejected due to low credit score";
      }

      return {
        approval,
        corrected_interest_rate: correctedRate,
        message,
        credit_score: creditScore
      };

    } catch (error) {
      console.error('Error checking eligibility:', error);
      return {
        approval: false,
        corrected_interest_rate: interestRate,
        message: "Error processing eligibility check"
      };
    }
  }

  // Calculate monthly installment using compound interest
  static calculateMonthlyInstallment(principal, annualRate, tenureMonths) {
    const monthlyRate = annualRate / (12 * 100);
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
                (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    return Math.round(emi * 100) / 100; // Round to 2 decimal places
  }

  // Get interest rate tier based on credit score
  static getMinimumInterestRate(creditScore) {
    if (creditScore > 50) return 0;
    if (creditScore > 30) return 12;
    if (creditScore > 10) return 16;
    return Infinity; // No approval
  }
}

module.exports = CreditService;