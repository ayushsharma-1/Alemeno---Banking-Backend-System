class Loan {
  constructor(data) {
    // Handle both Excel data format and API format
    this.customer_id = data['Customer ID'] || data.customer_id;
    this.customerId = this.customer_id; // For backward compatibility
    this.loan_id = data['Loan ID'] || data.loan_id;
    this.loanId = this.loan_id; // For backward compatibility
    this.loan_amount = data['Loan Amount'] || data.loan_amount;
    this.loanAmount = this.loan_amount; // For backward compatibility
    this.tenure = data['Tenure'] || data.tenure;
    this.interest_rate = data['Interest Rate'] || data.interest_rate;
    this.interestRate = this.interest_rate; // For backward compatibility
    this.monthly_payment = data['Monthly payment'] || data.monthly_payment;
    this.monthlyPayment = this.monthly_payment; // For backward compatibility
    this.emis_paid_on_time = data['EMIs paid on Time'] || data.emis_paid_on_time || 0;
    this.emisPaidOnTime = this.emis_paid_on_time; // For backward compatibility
    this.date_of_approval = data['Date of Approval'] ? this.parseExcelDate(data['Date of Approval']) : (data.date_of_approval || new Date().toISOString().split('T')[0]);
    this.dateOfApproval = this.date_of_approval; // For backward compatibility
    this.end_date = data['End Date'] ? this.parseExcelDate(data['End Date']) : (data.end_date || this.calculateEndDate());
    this.endDate = this.end_date; // For backward compatibility
  }

  parseExcelDate(excelDate) {
    if (!excelDate) return null;
    if (typeof excelDate === 'string') return excelDate;
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    return date.toISOString().split('T')[0];
  }

  calculateEndDate() {
    if (!this.date_of_approval) return null;
    const startDate = new Date(this.date_of_approval);
    startDate.setMonth(startDate.getMonth() + this.tenure);
    return startDate.toISOString().split('T')[0];
  }

  static fromExcelData(data) {
    return new Loan(data);
  }

  getStatus() {
    const currentDate = new Date();
    const endDate = new Date(this.end_date);
    
    if (currentDate > endDate) {
      return this.emis_paid_on_time >= this.tenure ? 'COMPLETED' : 'DEFAULTED';
    }
    
    return 'ACTIVE';
  }

  getPaymentRatio() {
    return this.tenure > 0 ? (this.emis_paid_on_time / this.tenure) : 0;
  }

  getTotalAmountPaid() {
    return this.emis_paid_on_time * (this.monthly_payment || 0);
  }

  getRemainingAmount() {
    const totalInterest = (this.loan_amount * this.interest_rate * this.tenure) / (12 * 100);
    const totalAmount = this.loan_amount + totalInterest;
    return Math.max(0, totalAmount - this.getTotalAmountPaid());
  }

  toJSON() {
    return {
      customer_id: this.customer_id,
      customerId: this.customer_id, // For backward compatibility
      loan_id: this.loan_id,
      loanId: this.loan_id, // For backward compatibility
      loan_amount: this.loan_amount,
      loanAmount: this.loan_amount, // For backward compatibility
      tenure: this.tenure,
      interest_rate: this.interest_rate,
      interestRate: this.interest_rate, // For backward compatibility
      monthly_payment: this.monthly_payment,
      monthlyPayment: this.monthly_payment, // For backward compatibility
      emis_paid_on_time: this.emis_paid_on_time,
      emisPaidOnTime: this.emis_paid_on_time, // For backward compatibility
      date_of_approval: this.date_of_approval,
      dateOfApproval: this.date_of_approval, // For backward compatibility
      end_date: this.end_date,
      endDate: this.end_date, // For backward compatibility
      status: this.getStatus(),
      paymentRatio: this.getPaymentRatio(),
      totalAmountPaid: this.getTotalAmountPaid(),
      remainingAmount: this.getRemainingAmount()
    };
  }
}

module.exports = Loan;