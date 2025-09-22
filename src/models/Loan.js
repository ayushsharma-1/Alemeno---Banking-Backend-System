class Loan {
  constructor(data) {
    this.customerId = data['Customer ID'];
    this.loanId = data['Loan ID'];
    this.loanAmount = data['Loan Amount'];
    this.tenure = data['Tenure'];
    this.interestRate = data['Interest Rate'];
    this.monthlyPayment = data['Monthly payment'];
    this.emisPaidOnTime = data['EMIs paid on Time'];
    this.dateOfApproval = this.parseExcelDate(data['Date of Approval']);
    this.endDate = this.parseExcelDate(data['End Date']);
  }

  parseExcelDate(excelDate) {
    if (!excelDate) return null;
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    return date.toISOString().split('T')[0];
  }

  static fromExcelData(data) {
    return new Loan(data);
  }

  getStatus() {
    const currentDate = new Date();
    const endDate = new Date(this.endDate);
    
    if (currentDate > endDate) {
      return this.emisPaidOnTime >= this.tenure ? 'COMPLETED' : 'DEFAULTED';
    }
    
    return 'ACTIVE';
  }

  getPaymentRatio() {
    return this.tenure > 0 ? (this.emisPaidOnTime / this.tenure) : 0;
  }

  getTotalAmountPaid() {
    return this.emisPaidOnTime * this.monthlyPayment;
  }

  getRemainingAmount() {
    const totalInterest = (this.loanAmount * this.interestRate * this.tenure) / (12 * 100);
    const totalAmount = this.loanAmount + totalInterest;
    return Math.max(0, totalAmount - this.getTotalAmountPaid());
  }

  toJSON() {
    return {
      customerId: this.customerId,
      loanId: this.loanId,
      loanAmount: this.loanAmount,
      tenure: this.tenure,
      interestRate: this.interestRate,
      monthlyPayment: this.monthlyPayment,
      emisPaidOnTime: this.emisPaidOnTime,
      dateOfApproval: this.dateOfApproval,
      endDate: this.endDate,
      status: this.getStatus(),
      paymentRatio: this.getPaymentRatio(),
      totalAmountPaid: this.getTotalAmountPaid(),
      remainingAmount: this.getRemainingAmount()
    };
  }
}

module.exports = Loan;